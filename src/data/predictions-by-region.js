/**
 * Módulo para consumir las predicciones reales del modelo Random Forest
 * Reemplaza colombia-energy-sample.js con datos reales
 * 
 * SOLUCIÓN A PROBLEMAS DE NOMBRES DE DEPARTAMENTOS:
 * - Usa normalización robusta para matching consistente
 * - Índices precalculados para búsquedas rápidas
 */

import { normalizeDepartmentName } from '../utils/normalizeDepartmentName';

let predictionsCache = null;
let municipiosByDept = null;
let departmentStatsByDept = null;

/**
 * Cargar predicciones del modelo desde el archivo JSON
 * y crear índices normalizados para búsquedas eficientes
 */
export async function loadPredictions() {
  if (predictionsCache) return predictionsCache;
  
  try {
    const response = await fetch('/data/municipio_predictions.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    predictionsCache = await response.json();
    
    // Crear índices normalizados al cargar por primera vez
    createNormalizedIndexes();
    
    return predictionsCache;
  } catch (error) {
    console.error('Error cargando predicciones del modelo:', error);
    throw error;
  }
}

/**
 * Crear índices por departamento normalizado para búsquedas rápidas
 * y calcular información geográfica
 */
function createNormalizedIndexes() {
  if (!predictionsCache) return;
  
  municipiosByDept = {};
  departmentStatsByDept = {};
  
  console.log('🔧 Creando índices normalizados...');
  
  // Indexar municipios por departamento normalizado
  for (const municipio of predictionsCache.municipios) {
    const originalDept = municipio.departamento;
    const normalizedDept = normalizeDepartmentName(originalDept);
    
    if (!municipiosByDept[normalizedDept]) {
      municipiosByDept[normalizedDept] = [];
      console.log(`📁 Creando índice para: "${originalDept}" -> "${normalizedDept}"`);
    }
    municipiosByDept[normalizedDept].push(municipio);
  }
  
  // Indexar estadísticas de departamentos y enriquecer con datos geográficos
  for (const department of predictionsCache.departamentos || []) {
    const originalDept = department.departamento;
    const normalizedDept = normalizeDepartmentName(originalDept);
    
    // Enriquecer con información geográfica
    const enrichedDept = enrichDepartmentWithGeography(department, normalizedDept);
    
    departmentStatsByDept[normalizedDept] = enrichedDept;
    console.log(`📊 Estadísticas indexadas: "${originalDept}" -> "${normalizedDept}"`);
  }
  
  console.log('Índices normalizados creados:');
  console.log('- Departamentos con municipios:', Object.keys(municipiosByDept).length);
  console.log('- Departamentos con estadísticas:', Object.keys(departmentStatsByDept).length);
  console.log('🔑 Claves de índice de municipios:', Object.keys(municipiosByDept));
}

/**
 * Enriquecer datos de departamento con información geográfica calculada
 */
function enrichDepartmentWithGeography(department, normalizedDept) {
  const municipios = municipiosByDept[normalizedDept] || [];
  
  if (municipios.length === 0) {
    return {
      ...department,
      geographic_info: {
        bounds: null,
        center: null,
        area_stats: null,
        error: 'No se encontraron municipios para calcular geografía'
      }
    };
  }
  
  // Calcular bounds geográficos
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  let totalLat = 0, totalLng = 0;
  let validCoords = 0;
  
  // Estadísticas de altitud y condiciones climáticas
  let altitudes = [];
  let radiaciones = [];
  let vientos = [];
  let temperaturas = [];
  
  for (const municipio of municipios) {
    const lat = parseFloat(municipio.latitud);
    const lng = parseFloat(municipio.longitud);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      totalLat += lat;
      totalLng += lng;
      validCoords++;
    }
    
    // Recopilar datos climáticos
    if (!isNaN(municipio.altitud_msnm)) altitudes.push(municipio.altitud_msnm);
    if (!isNaN(municipio.radiacion_kWhm2_dia)) radiaciones.push(municipio.radiacion_kWhm2_dia);
    if (!isNaN(municipio.viento_ms)) vientos.push(municipio.viento_ms);
    if (!isNaN(municipio.temperatura_C)) temperaturas.push(municipio.temperatura_C);
  }
  
  const geographic_info = {
    bounds: validCoords > 0 ? {
      north: maxLat,
      south: minLat,
      east: maxLng,
      west: minLng
    } : null,
    center: validCoords > 0 ? {
      lat: totalLat / validCoords,
      lng: totalLng / validCoords
    } : null,
    area_stats: {
      altitude: calculateStats(altitudes),
      radiation: calculateStats(radiaciones),
      wind: calculateStats(vientos),
      temperature: calculateStats(temperaturas)
    }
  };
  
  return {
    ...department,
    geographic_info
  };
}

/**
 * Calcular estadísticas básicas de un array de números
 */
function calculateStats(values) {
  if (values.length === 0) return { min: null, max: null, avg: null, count: 0 };
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  return {
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    avg: Math.round(avg * 100) / 100,
    count: values.length
  };
}

/**
 * Obtener agregados por departamento
 */
export async function getDepartmentAggregates() {
  const predictions = await loadPredictions();
  return predictions.departamentos || [];
}

/**
 * Obtener municipios de un departamento específico
 * Usa normalización para matching robusto
 */
export async function getMunicipiosByDepartamento(departamentoRaw) {
  await loadPredictions(); // Asegurar que índices estén creados
  
  const normalizedDept = normalizeDepartmentName(departamentoRaw);
  const municipios = municipiosByDept[normalizedDept] || [];
  
  if (municipios.length === 0) {
    console.warn(`No se encontraron municipios para departamento: ${departamentoRaw} (normalizado: ${normalizedDept})`);
    console.warn('Departamentos disponibles:', Object.keys(municipiosByDept));
  }
  
  return municipios;
}

/**
 * Obtener predicción para un municipio específico por código DANE
 */
export async function getPredictionForMunicipio(codigoDane) {
  const predictions = await loadPredictions();
  return predictions.municipios.find(m => 
    m.codigo_dane_municipio === codigoDane
  );
}

/**
 * Obtener datos de un departamento específico
 * Usa normalización para matching robusto
 */
export async function getDepartmentData(departmentNameRaw) {
  await loadPredictions(); // Asegurar que índices estén creados
  
  const normalizedDept = normalizeDepartmentName(departmentNameRaw);
  const deptData = departmentStatsByDept[normalizedDept];
  
  if (!deptData) {
    console.warn(`No se encontraron datos para departamento: ${departmentNameRaw} (normalizado: ${normalizedDept})`);
    console.warn('Departamentos disponibles:', Object.keys(departmentStatsByDept));
  }
  
  return deptData || null;
}

/**
 * Obtener valor de energía para un departamento (compatibilidad con API anterior)
 * @param {string} deptName - Nombre del departamento (del GeoJSON)
 * @param {string} type - Tipo de energía ('solar', 'eolico', 'hibrido')
 */
export async function getEnergyValue(deptName, type) {
  try {
    const deptData = await getDepartmentData(deptName);
    if (!deptData) {
      console.warn(`getEnergyValue: No se encontró departamento: ${deptName} -> ${normalizeDepartmentName(deptName)}`);
      return 0.2; // Valor por defecto si no se encuentra
    }
    
    switch(type) {
      case 'solar':
        return deptData.solar_pct || 0.2;
      case 'eolico':
        return deptData.eolica_pct || 0.2;
      case 'hibrido':
        return deptData.hibrida_pct || 0.2;
      default:
        return 0.2;
    }
  } catch (error) {
    console.error('Error obteniendo valor energético:', error);
    return 0.2;
  }
}

/**
 * Obtener municipios con coordenadas para mostrar en el mapa
 */
export async function getMunicipiosForMap(departamento = null, zoom = 1) {
  const predictions = await loadPredictions();
  let municipios = predictions.municipios;
  
  // Filtrar por departamento si se especifica (usando normalización)
  if (departamento) {
    const normalizedDept = normalizeDepartmentName(departamento);
    const departmentMunicipios = municipiosByDept[normalizedDept] || [];
    municipios = departmentMunicipios;
    
    if (municipios.length === 0) {
      console.warn(`No se encontraron municipios para mostrar en mapa: ${departamento} (normalizado: ${normalizedDept})`);
    }
  }
  
  // Filtrar por zoom si es necesario (para performance)
  if (zoom < 2.5) {
    // En zoom bajo, mostrar solo capitales o ciudades principales
    municipios = municipios.filter(m => 
      m.municipio.includes('CAPITAL') || 
      ['MEDELLÍN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 'BUCARAMANGA'].includes(m.municipio)
    );
  }
  
  return municipios.map(m => ({
    ...m,
    // Mapear clases a colores
    color: getClassColor(m.predicted_class),
    probability: getPrimaryProbability(m)
  }));
}

/**
 * Obtener color para una clase de energía
 */
function getClassColor(predictedClass) {
  const colors = {
    'solar': '#F59E0B',
    'eolica': '#14B8A6', 
    'hibrida': '#34D399'
  };
  return colors[predictedClass] || '#6B7280';
}

/**
 * Obtener la probabilidad principal para un municipio
 */
function getPrimaryProbability(municipio) {
  const probCols = ['prob_solar', 'prob_eolica', 'prob_hibrida'];
  let maxProb = 0;
  
  probCols.forEach(col => {
    if (municipio[col] && municipio[col] > maxProb) {
      maxProb = municipio[col];
    }
  });
  
  return maxProb;
}

/**
 * Generar recomendación textual inteligente para un departamento
 * Considera métricas de incertidumbre para dar contexto sobre la confianza
 */
export async function getDepartmentRecommendation(departmentName) {
  const deptData = await getDepartmentData(departmentName);
  if (!deptData) return "No hay datos disponibles para este departamento.";
  
  const { 
    dominant_class, 
    solar_pct, 
    eolica_pct, 
    hibrida_pct, 
    zni_pct,
    unknown_pct = 0,
    high_confidence_pct = 1,
    avg_solar_prob = 0,
    avg_eolica_prob = 0,
    avg_hibrida_prob = 0
  } = deptData;
  
  let recommendation = "";
  
  // Evaluar nivel de incertidumbre
  const isHighUncertainty = unknown_pct > 0.7;  // >70% datos originales desconocidos
  const isLowConfidence = high_confidence_pct < 0.6; // <60% predicciones alta confianza
  const hasModerateUncertainty = unknown_pct > 0.3 && unknown_pct <= 0.7;
  
  // Indicador de confianza
  if (isHighUncertainty) {
    recommendation += "⚠️ **REGIÓN EN EVALUACIÓN** - ";
  } else if (hasModerateUncertainty || isLowConfidence) {
    recommendation += "📊 **ANÁLISIS PRELIMINAR** - ";
  } else {
    recommendation += "✅ **ANÁLISIS CONFIRMADO** - ";
  }
  
  // Recomendación principal basada en clase dominante
  switch(dominant_class) {
    case 'solar':
      recommendation += `Potencial solar identificado (${(solar_pct * 100).toFixed(1)}% de municipios, prob. promedio: ${(avg_solar_prob * 100).toFixed(1)}%). `;
      if (!isHighUncertainty) {
        recommendation += "Recomendado para proyectos de paneles solares y granjas fotovoltaicas. ";
      }
      break;
    case 'eolica':
      recommendation += `Potencial eólico detectado (${(eolica_pct * 100).toFixed(1)}% de municipios, prob. promedio: ${(avg_eolica_prob * 100).toFixed(1)}%). `;
      if (!isHighUncertainty) {
        recommendation += "Considerar para parques eólicos y aprovechamiento de vientos. ";
      }
      break;
    case 'hibrida':
      recommendation += `Potencial híbrido identificado (${(hibrida_pct * 100).toFixed(1)}% de municipios, prob. promedio: ${(avg_hibrida_prob * 100).toFixed(1)}%). `;
      if (!isHighUncertainty) {
        recommendation += "Evaluar para sistemas mixtos solar-eólicos. ";
      }
      break;
    default:
      recommendation += "Potencial energético en fase de caracterización. ";
  }
  
  // Contexto de incertidumbre responsable
  if (isHighUncertainty) {
    recommendation += `\n\n🔬 **Requiere estudios complementarios**: ${(unknown_pct * 100).toFixed(1)}% de los datos fueron estimados por IA. Se recomienda validación con mediciones locales antes de inversiones significativas.`;
  } else if (hasModerateUncertainty) {
    recommendation += `\n\n📈 **Base de datos parcial**: ${((1 - unknown_pct) * 100).toFixed(1)}% de datos confirmados. Considerar estudios adicionales para proyectos de gran escala.`;
  } else {
    const stabilityLevel = high_confidence_pct >= 0.9 ? 'muy alta' : 
                          high_confidence_pct >= 0.7 ? 'alta' : 'moderada';
    recommendation += `\n\n📊 **Predicciones estables**: ${((1 - unknown_pct) * 100).toFixed(1)}% de datos validados, estabilidad ${stabilityLevel} del modelo. Las recomendaciones tienen respaldo sólido pero requieren interpretación técnica.`;
  }
  
  // Consideraciones adicionales contextuales
  if (zni_pct > 0.5) {
    recommendation += "\n\n🏝️ **Zona No Interconectada**: Priorizar soluciones autónomas y sistemas de almacenamiento energético.";
  }
  
  if (solar_pct > 0.7 && !isHighUncertainty) {
    recommendation += "\n\n☀️ **Excelente para autoconsumo**: Radiación solar favorable para aplicaciones industriales y residenciales.";
  }
  
  if (eolica_pct > 0.3 && !isHighUncertainty) {
    recommendation += "\n\n💨 **Complemento eólico**: Vientos favorables para diversificación energética.";
  }
  
  return recommendation.trim();
}

/**
 * Obtener estadísticas generales del dataset
 */
export async function getDatasetStats() {
  const predictions = await loadPredictions();
  return predictions.metadata || {};
}

// Exportar función de normalización para uso externo
export { normalizeDepartmentName } from '../utils/normalizeDepartmentName';

/**
 * Función de debugging para verificar mappings de departamentos
 */
export async function debugDepartmentMappings() {
  await loadPredictions();
  
  console.log('=== DEBUGGING DEPARTMENT MAPPINGS ===');
  console.log('Departamentos en datos:', Object.keys(departmentStatsByDept));
  console.log('Municipios por departamento:', Object.keys(municipiosByDept));
  
  // Verificar casos problemáticos comunes
  const testNames = [
    'La Guajira', 'LA GUAJIRA', 'Boyacá', 'BOYACÁ', 
    'Nariño', 'NARIÑO', 'Bogotá, D.C.', 'BOGOTÁ, D.C.'
  ];
  
  testNames.forEach(name => {
    const normalized = normalizeDepartmentName(name);
    const hasData = !!departmentStatsByDept[normalized];
    console.log(`${name} -> ${normalized} (datos: ${hasData})`);
  });
}