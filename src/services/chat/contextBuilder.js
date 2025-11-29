/**
 * Constructor de contexto técnico para consultas al LLM
 * ======================================================
 * Enriquece las consultas con datos del modelo de clasificación
 * y contexto geográfico de Colombia
 * 
 * @module contextBuilder
 * @author Atlas Energético
 */

/**
 * Construir contexto técnico detallado para un departamento
 * @param {Object} departmentData - Datos agregados del departamento
 * @param {string} departmentName - Nombre del departamento consultado
 * @returns {string} - Contexto técnico formateado
 */
export function buildDepartmentContext(departmentData, departmentName) {
  if (!departmentData) {
    return `Departamento consultado: ${departmentName}
Estado: No se encontraron datos en la base de datos del modelo.
Recomendación: Solicitar estudios de campo para caracterizar el potencial energético.`;
  }

  const {
    departamento,
    num_municipios,
    dominant_class,
    solar_pct,
    eolica_pct,
    hibrida_pct,
    zni_pct,
    unknown_pct,
    high_confidence_pct,
    avg_solar_prob,
    avg_eolica_prob,
    avg_hibrida_prob,
    geographic_info
  } = departmentData;

  // === SECCIÓN 1: Identificación del Departamento ===
  let context = `DEPARTAMENTO: ${departamento}\n`;
  context += `Municipios analizados: ${num_municipios}\n\n`;

  // === SECCIÓN 2: Clasificación Energética ===
  context += `CLASIFICACIÓN ENERGÉTICA DOMINANTE:\n`;
  context += `- Tipo predominante: ${dominant_class.toUpperCase()}\n`;
  context += `- Distribución por potencial:\n`;
  context += `  • Solar: ${(solar_pct * 100).toFixed(1)}% de municipios (probabilidad promedio: ${(avg_solar_prob * 100).toFixed(1)}%)\n`;
  context += `  • Eólico: ${(eolica_pct * 100).toFixed(1)}% de municipios (probabilidad promedio: ${(avg_eolica_prob * 100).toFixed(1)}%)\n`;
  context += `  • Híbrido: ${(hibrida_pct * 100).toFixed(1)}% de municipios (probabilidad promedio: ${(avg_hibrida_prob * 100).toFixed(1)}%)\n\n`;

  // === SECCIÓN 3: Nivel de Confianza de los Datos ===
  context += `CONFIABILIDAD DE LOS DATOS:\n`;
  
  const dataQuality = unknown_pct < 0.3 ? 'ALTA' : 
                       unknown_pct < 0.7 ? 'MEDIA' : 'BAJA';
  
  context += `- Calidad de datos: ${dataQuality}\n`;
  context += `- Datos validados: ${((1 - unknown_pct) * 100).toFixed(1)}%\n`;
  context += `- Datos estimados por IA: ${(unknown_pct * 100).toFixed(1)}%\n`;
  context += `- Predicciones de alta confianza: ${(high_confidence_pct * 100).toFixed(1)}%\n`;
  
  if (unknown_pct > 0.7) {
    context += `⚠️ ADVERTENCIA: Alta proporción de datos estimados. Recomendar estudios complementarios.\n`;
  } else if (unknown_pct > 0.3) {
    context += `📊 NOTA: Base de datos parcial. Considerar validaciones adicionales para proyectos grandes.\n`;
  }
  context += `\n`;

  // === SECCIÓN 4: Contexto Geográfico y Climático ===
  if (geographic_info && geographic_info.area_stats) {
    const { area_stats } = geographic_info;
    
    context += `INFORMACIÓN GEOGRÁFICA Y CLIMÁTICA:\n`;
    
    // Altitud
    if (area_stats.altitude && area_stats.altitude.count > 0) {
      const { min, max, avg } = area_stats.altitude;
      context += `- Altitud:\n`;
      context += `  • Rango: ${min} - ${max} metros sobre el nivel del mar (msnm)\n`;
      context += `  • Promedio: ${avg} msnm\n`;
      
      // Interpretación de altitud
      if (avg < 1000) {
        context += `  • Interpretación: Región de tierras bajas/cálidas\n`;
      } else if (avg < 2000) {
        context += `  • Interpretación: Región de tierras medias/templadas\n`;
      } else {
        context += `  • Interpretación: Región de tierras altas/frías\n`;
      }
    }
    
    // Radiación Solar
    if (area_stats.radiation && area_stats.radiation.count > 0) {
      const { min, max, avg } = area_stats.radiation;
      context += `- Radiación Solar:\n`;
      context += `  • Rango: ${min} - ${max} kWh/m²/día\n`;
      context += `  • Promedio: ${avg} kWh/m²/día\n`;
      
      // Interpretación de radiación
      if (avg >= 5.0) {
        context += `  • Interpretación: EXCELENTE potencial solar\n`;
      } else if (avg >= 4.5) {
        context += `  • Interpretación: MUY BUENO potencial solar\n`;
      } else if (avg >= 4.0) {
        context += `  • Interpretación: BUENO potencial solar\n`;
      } else {
        context += `  • Interpretación: MODERADO potencial solar\n`;
      }
    }
    
    // Velocidad del Viento
    if (area_stats.wind && area_stats.wind.count > 0) {
      const { min, max, avg } = area_stats.wind;
      context += `- Velocidad del Viento:\n`;
      context += `  • Rango: ${min} - ${max} m/s\n`;
      context += `  • Promedio: ${avg} m/s\n`;
      
      // Interpretación de viento
      if (avg >= 7.0) {
        context += `  • Interpretación: EXCELENTE potencial eólico (parques de gran escala)\n`;
      } else if (avg >= 5.5) {
        context += `  • Interpretación: BUENO potencial eólico (mini-eólica o complemento)\n`;
      } else if (avg >= 4.0) {
        context += `  • Interpretación: MODERADO potencial eólico (evaluar sitios específicos)\n`;
      } else {
        context += `  • Interpretación: BAJO potencial eólico (no recomendado como principal)\n`;
      }
    }
    
    // Temperatura
    if (area_stats.temperature && area_stats.temperature.count > 0) {
      const { min, max, avg } = area_stats.temperature;
      context += `- Temperatura:\n`;
      context += `  • Rango: ${min} - ${max} °C\n`;
      context += `  • Promedio: ${avg} °C\n`;
      context += `  • Nota: Temperaturas altas reducen eficiencia de paneles solares (~0.5%/°C sobre 25°C)\n`;
    }
    
    context += `\n`;
  }

  // === SECCIÓN 5: Zonas No Interconectadas (ZNI) ===
  if (zni_pct > 0) {
    context += `ZONAS NO INTERCONECTADAS (ZNI):\n`;
    context += `- Proporción ZNI: ${(zni_pct * 100).toFixed(1)}%\n`;
    
    if (zni_pct > 0.5) {
      context += `- Estado: Región PREDOMINANTEMENTE no interconectada\n`;
      context += `- Implicaciones:\n`;
      context += `  • Priorizar sistemas autónomos off-grid\n`;
      context += `  • Incluir almacenamiento en baterías\n`;
      context += `  • Considerar generación híbrida con respaldo\n`;
      context += `  • Evaluar costos de operación y mantenimiento remoto\n`;
    } else if (zni_pct > 0.2) {
      context += `- Estado: Región con presencia SIGNIFICATIVA de ZNI\n`;
      context += `- Implicaciones:\n`;
      context += `  • Diferenciar soluciones on-grid vs off-grid por municipio\n`;
      context += `  • Oportunidades de microgrids en comunidades aisladas\n`;
    } else {
      context += `- Estado: Región MAYORMENTE interconectada con áreas ZNI puntuales\n`;
      context += `- Implicaciones:\n`;
      context += `  • Enfoque principal en conexión a red\n`;
      context += `  • Soluciones aisladas para casos específicos\n`;
    }
    context += `\n`;
  }

  // === SECCIÓN 6: Recomendaciones Técnicas Generales ===
  context += `RECOMENDACIONES TÉCNICAS PRELIMINARES:\n`;
  
  // Basadas en el tipo dominante
  switch (dominant_class) {
    case 'solar':
      context += `- ENFOQUE: Energía solar fotovoltaica\n`;
      context += `- Tecnologías recomendadas:\n`;
      context += `  • Paneles monocristalinos o policristalinos\n`;
      context += `  • Inversores según escala (string/central para gran escala, micro para residencial)\n`;
      if (zni_pct > 0.3) {
        context += `  • Baterías de ciclo profundo para sistemas aislados\n`;
      }
      context += `- Escalas sugeridas:\n`;
      context += `  • Residencial: 3-10 kW\n`;
      context += `  • Comercial/Industrial: 50-500 kW\n`;
      context += `  • Gran escala (granjas solares): 1-50 MW+\n`;
      break;
      
    case 'eolica':
      context += `- ENFOQUE: Energía eólica\n`;
      context += `- Tecnologías recomendadas:\n`;
      context += `  • Aerogeneradores de eje horizontal\n`;
      context += `  • Estudios de viento detallados (mínimo 1 año de mediciones)\n`;
      context += `- Escalas sugeridas:\n`;
      context += `  • Mini-eólica: 1-20 kW\n`;
      context += `  • Mediana escala: 100-500 kW\n`;
      context += `  • Parques eólicos: 10-100 MW+\n`;
      context += `- Consideraciones:\n`;
      context += `  • Requiere vientos consistentes >5.5 m/s\n`;
      context += `  • Inversión inicial más alta que solar\n`;
      context += `  • Factor de capacidad típico: 25-40%\n`;
      break;
      
    case 'hibrida':
      context += `- ENFOQUE: Sistemas híbridos solar-eólico\n`;
      context += `- Ventajas:\n`;
      context += `  • Mayor estabilidad en generación (complementariedad día/noche)\n`;
      context += `  • Aprovechamiento de múltiples recursos\n`;
      context += `  • Reducción de necesidad de almacenamiento\n`;
      context += `- Configuraciones típicas:\n`;
      context += `  • 70% solar + 30% eólico (climas cálidos)\n`;
      context += `  • 50% solar + 50% eólico (balance óptimo)\n`;
      context += `  • Con almacenamiento en baterías para ZNI\n`;
      break;
  }

  return context;
}

/**
 * Construir un contexto resumido cuando no se encuentra departamento específico
 * @param {string} query - Consulta del usuario
 * @returns {string} - Contexto general
 */
export function buildGeneralContext(query) {
  return `CONTEXTO GENERAL DE COLOMBIA:
Consulta del usuario: "${query}"

Colombia cuenta con:
- 32 departamentos + Bogotá D.C.
- 1,122 municipios con datos de potencial energético
- Diversidad climática: costa caribeña, andina, pacífica, llanos, amazonía

Recursos energéticos renovables:
- Solar: Excelente en Costa Caribe (La Guajira, Atlántico, Magdalena, Cesar)
- Eólico: Destacado en La Guajira (vientos alisios constantes)
- Híbrido: Presente en regiones costeras con balance solar-eólico

Zonas No Interconectadas (ZNI):
- Principalmente en Amazonía y regiones apartadas
- Oportunidades para sistemas autónomos renovables

INSTRUCCIONES:
- Responder basándose en este contexto general
- Si el usuario pregunta por un departamento específico, solicitar que lo mencione claramente
- Proporcionar información educativa sobre energías renovables en Colombia`;
}

/**
 * Construir contexto cuando se detecta consulta de municipio específico
 * @param {Object} municipioData - Datos del municipio
 * @returns {string} - Contexto técnico del municipio
 */
export function buildMunicipioContext(municipioData) {
  if (!municipioData) {
    return 'No se encontraron datos para el municipio consultado.';
  }

  const {
    municipio,
    departamento,
    predicted_class,
    prob_solar,
    prob_eolica,
    prob_hibrida,
    latitud,
    longitud,
    altitud_msnm,
    radiacion_kWhm2_dia,
    viento_ms,
    temperatura_C
  } = municipioData;

  let context = `MUNICIPIO: ${municipio}\n`;
  context += `Departamento: ${departamento}\n`;
  context += `Ubicación: Lat ${latitud}, Lng ${longitud}\n\n`;

  context += `CLASIFICACIÓN:\n`;
  context += `- Potencial dominante: ${predicted_class.toUpperCase()}\n`;
  context += `- Probabilidades del modelo:\n`;
  context += `  • Solar: ${(prob_solar * 100).toFixed(1)}%\n`;
  context += `  • Eólico: ${(prob_eolica * 100).toFixed(1)}%\n`;
  context += `  • Híbrido: ${(prob_hibrida * 100).toFixed(1)}%\n\n`;

  context += `DATOS TÉCNICOS:\n`;
  if (altitud_msnm != null) context += `- Altitud: ${altitud_msnm} msnm\n`;
  if (radiacion_kWhm2_dia != null) context += `- Radiación: ${radiacion_kWhm2_dia} kWh/m²/día\n`;
  if (viento_ms != null) context += `- Viento: ${viento_ms} m/s\n`;
  if (temperatura_C != null) context += `- Temperatura: ${temperatura_C} °C\n`;

  return context;
}
