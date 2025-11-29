import React, { createContext, useContext, useState, useEffect } from 'react';
import Papa from 'papaparse';
import randomForestPredictor from '../utils/RandomForestPredictor';

const EnergyDataContext = createContext();

export const useEnergyData = () => {
  const context = useContext(EnergyDataContext);
  if (!context) {
    throw new Error('useEnergyData debe ser usado dentro de EnergyDataProvider');
  }
  return context;
};

export const EnergyDataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentData, setDepartmentData] = useState({});
  const [mlReady, setMlReady] = useState(true); // Predictor simple siempre listo

  // Cargar datos CSV una sola vez
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/dataset_potencial_renovable_potencial.csv');
        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const processedData = result.data.map(row => ({
              departamento: row.departamento,
              municipio: row.municipio,
              codigo_dane: row.codigo_dane_municipio,
              lat: parseFloat(row.latitud),
              lon: parseFloat(row.longitud),
              altitud: parseFloat(row.altitud_msnm),
              radiacion: parseFloat(row.radiacion_kWhm2_dia),
              viento: parseFloat(row.viento_ms),
              temperatura: parseFloat(row.temperatura_C),
              humedad: parseFloat(row.humedad_relativa_pct),
              nubosidad: parseFloat(row.nubosidad_pct),
              tipo_red: row.tipo_red,
              demanda: parseFloat(row.demanda_kWh_mes),
              relieve: parseFloat(row.relieve_indice),
              potencial: row.potencial
            })).filter(row => !isNaN(row.lat) && !isNaN(row.lon));

            setData(processedData);
            
            // Agregar datos por departamento
            const deptAggregation = {};
            processedData.forEach(row => {
              if (!deptAggregation[row.departamento]) {
                deptAggregation[row.departamento] = {
                  municipios: [],
                  radiacion_promedio: 0,
                  viento_promedio: 0,
                  altitud_promedio: 0,
                  temperatura_promedio: 0,
                  count: 0
                };
              }
              const dept = deptAggregation[row.departamento];
              dept.municipios.push(row);
              dept.radiacion_promedio += row.radiacion;
              dept.viento_promedio += row.viento;
              dept.altitud_promedio += row.altitud;
              dept.temperatura_promedio += row.temperatura;
              dept.count++;
            });

            // Calcular promedios
            Object.keys(deptAggregation).forEach(dept => {
              const data = deptAggregation[dept];
              data.radiacion_promedio /= data.count;
              data.viento_promedio /= data.count;
              data.altitud_promedio /= data.count;
              data.temperatura_promedio /= data.count;
            });

            setDepartmentData(deptAggregation);
            
            // Entrenar Random Forest con datos cargados
            randomForestPredictor.train(processedData)
              .then(success => {
                setMlReady(success);
              })
              .catch(err => {
                console.error('❌ Error entrenando Random Forest:', err);
                setMlReady(false);
              });
            
            setLoading(false);
          },
          error: (error) => {
            setError(error);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Función para encontrar el punto más cercano
  const getClosestDataPoint = (lat, lon) => {
    if (!data.length) return null;

    let minDistance = Infinity;
    let closest = null;

    data.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(point.lat - lat, 2) + Math.pow(point.lon - lon, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = point;
      }
    });

    return closest;
  };

  // Función para validar coordenadas colombianas
  const validateColombianTerritory = (lat, lon) => {
    // Validación del territorio colombiano incluyendo San Andrés y Providencia
    if (lat < -5 || lat > 14 || lon < -85 || lon > -66) {
      return {
        valid: false,
        message: 'No es posible evaluar ubicaciones fuera del territorio colombiano.'
      };
    }
    return { valid: true };
  };

  // Función para interpolar parámetros ambientales usando datos reales del dataset (IDW)
  const estimateEnvironmentalParams = (lat, lon) => {
    // Validación territorial obligatoria
    const territoryCheck = validateColombianTerritory(lat, lon);
    if (!territoryCheck.valid) {
      throw new Error(territoryCheck.message);
    }

    if (!data || data.length === 0) {
      throw new Error('Dataset no disponible para interpolación IDW');
    }

    // 🔍 Buscar los K municipios más cercanos (IDW - Inverse Distance Weighting)
    const K_NEIGHBORS = 8; // Usar 8 vecinos para mejor interpolación
    const MIN_DISTANCE = 0.001; // Evitar división por cero (≈100m)

    // Calcular distancias a todos los puntos del dataset
    const distances = data.map(point => {
      const distanceGrados = Math.sqrt(
        Math.pow(point.lat - lat, 2) + Math.pow(point.lon - lon, 2)
      );
      // 1° ≈ 111 km (circunferencia terrestre ~40,075 km / 360°)
      const distanceKm = distanceGrados * 111;
      
      return {
        ...point,
        distance: distanceGrados,
        distanceKm: Number(distanceKm.toFixed(1))
      };
    })
    .filter(point => !isNaN(point.radiacion) && !isNaN(point.viento) && !isNaN(point.altitud) && !isNaN(point.temperatura))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, K_NEIGHBORS);

    if (distances.length === 0) {
      throw new Error('No se encontraron municipios válidos en el dataset para interpolación');
    }

    // 📊 Interpolación IDW (Inverse Distance Weighting)
    let weightedRadiacion = 0, weightedViento = 0, weightedAltitud = 0, weightedTemperatura = 0;
    let totalWeight = 0;

    distances.forEach(point => {
      // Peso inversamente proporcional a la distancia
      const weight = 1 / Math.max(point.distance, MIN_DISTANCE);
      
      weightedRadiacion += point.radiacion * weight;
      weightedViento += point.viento * weight;
      weightedAltitud += point.altitud * weight;
      weightedTemperatura += point.temperatura * weight;
      
      totalWeight += weight;
    });

    // Normalizar por el peso total
    const interpolatedParams = {
      radiacion: Number((weightedRadiacion / totalWeight).toFixed(2)),
      viento: Number((weightedViento / totalWeight).toFixed(2)),
      altitud: Math.round(weightedAltitud / totalWeight),
      temperatura: Number((weightedTemperatura / totalWeight).toFixed(1))
    };

    // 📍 Metadatos completos de la interpolación
    const municipiosUsados = distances.map(p => ({
      municipio: p.municipio,
      departamento: p.departamento,
      distanciaKm: p.distanceKm
    }));

    return {
      ...interpolatedParams,
      interpolationInfo: {
        method: 'IDW',
        neighbors: distances.length,
        nearestDistance: distances[0].distanceKm,
        nearestMunicipio: distances[0].municipio,
        nearestDepartamento: distances[0].departamento,
        municipiosUsados,
        origen: 'IDW'
      }
    };
  };



  // Función BIO para evaluar potencial energético
  const evaluateBIO = ({ radiacion, viento, altitud, potencial, temperatura = 25, lat = 0, lon = 0, interpolationInfo = null, isPersonalData = false }) => {
    // Validación territorial solo si NO son datos personalizados
    if (!isPersonalData) {
      const territoryCheck = validateColombianTerritory(lat, lon);
      if (!territoryCheck.valid) {
        throw new Error(territoryCheck.message);
      }
    }

    let tipoEnergiaRecomendada, explicacion, confianza, modeloUtilizado;

    // PRIMERA PRIORIDAD: RESPETAR EL DATASET siempre
    if (potencial && potencial.toLowerCase() !== 'desconocido' && potencial.toLowerCase() !== '' && potencial.toLowerCase() !== 'sin datos') {
      const potencialLower = potencial.toLowerCase();
      
      // Usar directamente lo que dice el dataset
      tipoEnergiaRecomendada = potencialLower;
      confianza = 0.95; // Alta confianza en datos del dataset
      modeloUtilizado = 'Dataset';
      explicacion = `📊 Dataset: ${potencialLower}. Radiación ${radiacion.toFixed(1)} kWh/m²/día, viento ${viento.toFixed(1)} m/s registrados.`;
    }
    // SEGUNDA PRIORIDAD: Intentar Random Forest, si no está disponible usar clasificación científica
    else {
      if (randomForestPredictor.isReady) {
        try {
          const mlResult = randomForestPredictor.predict({
            radiacion, viento, altitud, temperatura, lat, lon
          });
          
          tipoEnergiaRecomendada = mlResult.prediction;
          confianza = mlResult.confidence;
          modeloUtilizado = 'Random Forest';
          
          // Crear explicación más natural para Random Forest
          const porcentajeConfianza = (mlResult.confidence * 100).toFixed(0);
          explicacion = `Para esta zona se recomienda energía ${mlResult.prediction} basado en el análisis de patrones similares en el territorio colombiano. Los parámetros ambientales analizados representan un ${porcentajeConfianza}% de confiabilidad para esta recomendación en esta zona.`;
          
        } catch (error) {
          console.warn('Random Forest falló, usando clasificación científica:', error.message);
          // Fallback a clasificación científica
          const resultado = clasificacionCientifica(radiacion, viento, altitud, interpolationInfo);
          tipoEnergiaRecomendada = resultado.tipo;
          confianza = resultado.confianza;
          modeloUtilizado = 'Clasificación Científica';
          explicacion = resultado.explicacion;
        }
      } else {
        // Random Forest no disponible, usar clasificación científica
        const resultado = clasificacionCientifica(radiacion, viento, altitud, interpolationInfo);
        tipoEnergiaRecomendada = resultado.tipo;
        confianza = resultado.confianza;
        modeloUtilizado = 'Clasificación Científica';
        explicacion = resultado.explicacion;
      }
    }


    return {
      tipoEnergiaRecomendada,
      explicacion,
      confianza: Math.round(confianza * 100),
      modeloUtilizado,
      interpolationInfo: interpolationInfo || null
    };
  };

  // Función de clasificación científica como respaldo cuando Random Forest no está disponible
  const clasificacionCientifica = (radiacion, viento, altitud, interpolationInfo) => {
    // Umbrales científicos para Colombia
    const UMBRAL_SOLAR_MINIMO = 3.5; // kWh/m²/día
    const UMBRAL_SOLAR_BUENO = 4.5;   // kWh/m²/día
    const UMBRAL_EOLICO_MINIMO = 4.0; // m/s
    const UMBRAL_EOLICO_BUENO = 6.0;  // m/s

    // Calcular puntuaciones basadas en umbrales científicos
    let puntuacionSolar = 0;
    let puntuacionEolica = 0;

    // Puntuación solar
    if (radiacion >= UMBRAL_SOLAR_MINIMO) {
      puntuacionSolar = 50 + ((radiacion - UMBRAL_SOLAR_MINIMO) / (6.0 - UMBRAL_SOLAR_MINIMO)) * 35;
      if (radiacion >= UMBRAL_SOLAR_BUENO) puntuacionSolar += 15;
      puntuacionSolar = Math.min(100, puntuacionSolar);
    }

    // Puntuación eólica
    if (viento >= UMBRAL_EOLICO_MINIMO) {
      puntuacionEolica = 50 + ((viento - UMBRAL_EOLICO_MINIMO) / (8.0 - UMBRAL_EOLICO_MINIMO)) * 35;
      if (viento >= UMBRAL_EOLICO_BUENO) puntuacionEolica += 15;
      // Bonificación por altitud
      if (altitud > 500) puntuacionEolica += 5;
      if (altitud > 1500) puntuacionEolica += 10;
      puntuacionEolica = Math.min(100, puntuacionEolica);
    }

    // Determinar tipo de energía recomendada
    let tipo, confianza, explicacion;

    const esSolarViable = radiacion >= UMBRAL_SOLAR_MINIMO;
    const esEolicaViable = viento >= UMBRAL_EOLICO_MINIMO;

    if (esSolarViable && esEolicaViable && Math.abs(puntuacionSolar - puntuacionEolica) < 20) {
      // Sistema híbrido si ambos son viables y están equilibrados
      tipo = 'hibrida';
      confianza = (puntuacionSolar + puntuacionEolica) / 200 + 0.1; // Bonus híbrido
      const promedio = ((puntuacionSolar + puntuacionEolica) / 2).toFixed(0);
      explicacion = `Para esta zona se recomienda energía híbrida porque presenta condiciones equilibradas tanto para generación solar como eólica. La radiación solar de ${radiacion.toFixed(1)} kWh/m²/día y velocidad del viento de ${viento.toFixed(1)} m/s representan un ${promedio}% de viabilidad para esta zona.`;
    } else if (puntuacionSolar >= puntuacionEolica && esSolarViable) {
      // Solar predominante
      tipo = 'solar';
      confianza = puntuacionSolar / 100;
      explicacion = `Para esta zona se recomienda energía solar porque presenta excelentes condiciones de radiación. Los ${radiacion.toFixed(1)} kWh/m²/día de radiación solar representan un ${puntuacionSolar.toFixed(0)}% de viabilidad para esta zona.`;
    } else if (esEolicaViable) {
      // Eólica predominante
      tipo = 'eolica';
      confianza = puntuacionEolica / 100;
      const altitudBonus = altitud > 1500 ? ' La altitud elevada favorece la generación eólica.' : altitud > 500 ? ' La altitud moderada es favorable para el viento.' : '';
      explicacion = `Para esta zona se recomienda energía eólica porque presenta buenas condiciones de viento. La velocidad de ${viento.toFixed(1)} m/s representa un ${puntuacionEolica.toFixed(0)}% de viabilidad para esta zona.${altitudBonus}`;
    } else {
      // Ninguno viable, recomendar solar por defecto (más común en Colombia)
      tipo = 'solar';
      confianza = 0.3; // Baja confianza
      explicacion = `Para esta zona se recomienda energía solar como opción básica, aunque las condiciones no son óptimas. La radiación de ${radiacion.toFixed(1)} kWh/m²/día y viento de ${viento.toFixed(1)} m/s representan condiciones limitadas pero viables para generación solar a pequeña escala.`;
    }

    // La información de interpolación se mostrará por separado en la UI

    return {
      tipo,
      confianza: Math.max(0.2, Math.min(0.95, confianza)), // Entre 20% y 95%
      explicacion
    };
  };

  const value = {
    data,
    loading,
    error,
    departmentData,
    mlReady,
    getClosestDataPoint,
    evaluateBIO,
    estimateEnvironmentalParams,
    validateColombianTerritory,
    clasificacionCientifica
  };

  return (
    <EnergyDataContext.Provider value={value}>
      {children}
    </EnergyDataContext.Provider>
  );
};