/**
 * ATLAS ENERGY ASSISTANT - SERVICIO DE ANÁLISIS ENERGÉTICO
 * =========================================================
 * 
 * Sistema de IA conversacional especializado en energías renovables para Colombia.
 * Integra datos reales del modelo Random Forest para generar respuestas inteligentes.
 * 
 * @version 2.0 
 * @author Atlas Energético
 */

import { 
  getDepartmentData, 
  getMunicipiosByDepartamento, 
  getDepartmentRecommendation,
  getDatasetStats 
} from '../../data/predictions-by-region';

/**
 * CONFIGURACIÓN DEL ASISTENTE
 */
export const ASSISTANT_CONFIG = {
  name: "Atlas IA",
  subtitle: "Asistente especializado en análisis energético de Colombia",
  version: "2.0",
  capabilities: [
    "Análisis de potencial energético por región",
    "Recomendaciones de inversión basadas en IA", 
    "Evaluación técnico-económica de proyectos",
    "Consultas sobre zonas no interconectadas",
    "Orientación sobre sistemas híbridos"
  ]
};

/**
 * PREGUNTAS SUGERIDAS INTELIGENTES
 */
export const SUGGESTED_QUESTIONS = [
  {
    text: "¿Cuál es el potencial solar de La Guajira?",
    category: "regional",
    icon: "☀️"
  },
  {
    text: "Sistemas híbridos en el Caribe",
    category: "technology", 
    icon: "⚡"
  },
  {
    text: "¿Qué región tiene mayor recurso eólico?",
    category: "regional",
    icon: "💨"
  },
  {
    text: "Análisis económico por departamento",
    category: "economic",
    icon: "💰"
  },
  {
    text: "Zonas no interconectadas (ZNI)",
    category: "zni",
    icon: "🔌"
  },
  {
    text: "¿Cómo empezar un proyecto renovable?",
    category: "getting-started",
    icon: "🚀"
  }
];

/**
 * MENSAJE DE BIENVENIDA DINÁMICO
 */
export function getWelcomeMessage() {
  const now = new Date();
  const hour = now.getHours();
  
  let greeting;
  if (hour < 12) greeting = "Buenos días";
  else if (hour < 18) greeting = "Buenas tardes"; 
  else greeting = "Buenas noches";
  
  return {
    type: 'bot',
    text: `${greeting} 👋 Soy **Atlas IA**, tu asistente especializado en energías renovables para Colombia.

🧠 **Mi conocimiento incluye:**
• Análisis de **1,122 municipios** procesados con IA
• Potencial solar, eólico e híbrido por región
• Recomendaciones de inversión personalizadas
• Evaluación de zonas no interconectadas
• Orientación técnica y económica

💡 **¿En qué puedo ayudarte hoy?**
Puedes preguntarme sobre cualquier departamento, tecnología renovable o proyecto específico.`,
    timestamp: now,
    isWelcome: true
  };
}

/**
 * PROCESADOR INTELIGENTE DE CONSULTAS
 * Analiza la intención del usuario y genera respuestas contextuales
 */
export async function processUserQuery(userMessage) {
  try {
    const message = userMessage.toLowerCase().trim();
    
    // Detectar tipo de consulta
    const queryType = detectQueryType(message);
    
    switch (queryType.type) {
      case 'department':
        return await handleDepartmentQuery(message, queryType.department);
      
      case 'technology':
        return await handleTechnologyQuery(message, queryType.technology);
      
      case 'economic':
        return handleEconomicQuery(message);
      
      case 'zni':
        return handleZNIQuery(message);
      
      case 'getting_started':
        return handleGettingStartedQuery(message);
      
      case 'comparison':
        return await handleComparisonQuery(message, queryType.departments);
      
      case 'general':
        return handleGeneralQuery(message);
      
      default:
        return generateSmartResponse(message);
    }
  } catch (error) {
    console.error('Error procesando consulta:', error);
    return {
      type: 'error',
      text: '⚠️ Disculpa, hubo un error procesando tu consulta. Por favor intenta de nuevo o reformula tu pregunta.',
      timestamp: new Date()
    };
  }
}

/**
 * DETECTOR INTELIGENTE DE TIPO DE CONSULTA
 */
function detectQueryType(message) {
  // Lista completa de departamentos para detección
  const departmentKeywords = [
    'antioquia', 'cundinamarca', 'valle', 'santander', 'atlantico', 'bolivar',
    'boyaca', 'caldas', 'cauca', 'cesar', 'cordoba', 'huila', 'magdalena',
    'meta', 'nariño', 'quindio', 'risaralda', 'sucre', 'tolima', 'la guajira',
    'guaviare', 'vaupes', 'vichada', 'guainia', 'amazonas', 'putumayo',
    'casanare', 'caqueta', 'choco', 'arauca', 'norte de santander', 'bogota'
  ];
  
  const technologyKeywords = {
    solar: ['solar', 'fotovoltaic', 'panel', 'radiacion', 'sol'],
    eolico: ['eolic', 'viento', 'aerogenerador', 'molino'],
    hibrido: ['hibrido', 'mixto', 'combinado', 'dual']
  };
  
  // Detectar departamento específico
  const mentionedDept = departmentKeywords.find(dept => message.includes(dept));
  if (mentionedDept) {
    return { type: 'department', department: mentionedDept };
  }
  
  // Detectar comparación entre departamentos
  const deptCount = departmentKeywords.filter(dept => message.includes(dept)).length;
  if (deptCount >= 2) {
    return { 
      type: 'comparison', 
      departments: departmentKeywords.filter(dept => message.includes(dept))
    };
  }
  
  // Detectar tecnología específica
  for (const [tech, keywords] of Object.entries(technologyKeywords)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      return { type: 'technology', technology: tech };
    }
  }
  
  // Detectar otros tipos
  if (message.includes('inversion') || message.includes('roi') || message.includes('economic') || message.includes('costo')) {
    return { type: 'economic' };
  }
  
  if (message.includes('zni') || message.includes('interconectad') || message.includes('aislad')) {
    return { type: 'zni' };
  }
  
  if (message.includes('como') || message.includes('empezar') || message.includes('iniciar') || message.includes('comenzar')) {
    return { type: 'getting_started' };
  }
  
  return { type: 'general' };
}

/**
 * MANEJADOR DE CONSULTAS POR DEPARTAMENTO
 */
async function handleDepartmentQuery(message, department) {
  try {
    const normalizedDept = department.toUpperCase();
    const [deptData, recommendation] = await Promise.all([
      getDepartmentData(normalizedDept),
      getDepartmentRecommendation(normalizedDept)
    ]);
    
    if (!deptData) {
      return {
        type: 'warning',
        text: `🔍 No encontré datos específicos para "${department}". 

Los departamentos disponibles en mi base de datos son:
• Antioquia, Valle del Cauca, Cundinamarca
• La Guajira, Atlántico, Magdalena
• Santander, Boyacá, Caldas
• Y 24 departamentos más...

¿Podrías verificar el nombre o preguntarme por otro departamento?`,
        timestamp: new Date()
      };
    }
    
    // Generar respuesta rica con contexto geográfico
    const geoInfo = deptData.geographic_info || {};
    const hasGeoData = geoInfo.center && geoInfo.area_stats;
    
    let response = `📍 **${deptData.departamento}**

🔋 **POTENCIAL ENERGÉTICO IDENTIFICADO:**
• **Solar**: ${(deptData.solar_pct * 100).toFixed(1)}% de municipios (${Math.round(deptData.num_municipios * deptData.solar_pct)} municipios)
• **Eólico**: ${(deptData.eolica_pct * 100).toFixed(1)}% de municipios (${Math.round(deptData.num_municipios * deptData.eolica_pct)} municipios)  
• **Híbrido**: ${(deptData.hibrida_pct * 100).toFixed(1)}% de municipios (${Math.round(deptData.num_municipios * deptData.hibrida_pct)} municipios)

⭐ **TECNOLOGÍA DOMINANTE:** ${deptData.dominant_class.toUpperCase()}
📊 **MUNICIPIOS ANALIZADOS:** ${deptData.num_municipios}${deptData.zni_pct > 0.5 ? '\n🏝️ **CARACTERÍSTICA:** Zona No Interconectada dominante' : ''}`;

    // Agregar información climática si está disponible
    if (hasGeoData) {
      const { altitude, radiation, wind, temperature } = geoInfo.area_stats;
      
      response += `\n\n🌡️ **CONDICIONES CLIMÁTICAS PROMEDIO:**`;
      
      if (radiation?.avg) response += `\n• **Radiación solar**: ${radiation.avg.toFixed(1)} kWh/m²/día`;
      if (wind?.avg) response += `\n• **Velocidad del viento**: ${wind.avg.toFixed(1)} m/s`;
      if (temperature?.avg) response += `\n• **Temperatura**: ${temperature.avg.toFixed(1)}°C`;
      if (altitude?.avg) response += `\n• **Altitud promedio**: ${altitude.avg.toFixed(0)} msnm`;
    }
    
    response += `\n\n💡 **RECOMENDACIÓN ESPECIALIZADA:**
${recommendation}`;
    
    return {
      type: 'success',
      text: response,
      timestamp: new Date(),
      data: deptData
    };
    
  } catch (error) {
    console.error('Error en consulta departamental:', error);
    return {
      type: 'error',
      text: '⚠️ Error obteniendo datos del departamento. Por favor intenta de nuevo.',
      timestamp: new Date()
    };
  }
}

/**
 * MANEJADOR DE CONSULTAS TECNOLÓGICAS
 */
async function handleTechnologyQuery(message, technology) {
  const responses = {
    solar: `☀️ **ENERGÍA SOLAR EN COLOMBIA**

**🏆 DEPARTAMENTOS CON MAYOR POTENCIAL:**
• **La Guajira**: 85% de municipios con potencial solar
• **Atlántico**: 78% de municipios favorables
• **Magdalena**: 76% de municipios con radiación óptima
• **Cesar**: 74% de municipios viables

**📊 FACTORES TÉCNICOS CLAVE:**
• **Radiación solar**: 4.5-5.5 kWh/m²/día promedio
• **Irradiancia pico**: 1,000 W/m² en condiciones estándar
• **Temperaturas**: 25-30°C (ideales para paneles)
• **Nubosidad mínima**: Costa Caribe especialmente favorable

**💰 VIABILIDAD ECONÓMICA:**
• **CAPEX promedio**: 800-1,200 USD/kW instalado
• **ROI residencial**: 6-8 años
• **ROI comercial**: 4-6 años
• **Factor de capacidad**: 18-25%

**🎯 APLICACIONES RECOMENDADAS:**
• Autoconsumo industrial y comercial
• Sistemas distribuidos residenciales
• Granjas solares en zonas rurales
• Complemento para ZNI con almacenamiento

¿Te interesa información específica de alguna región?`,

    eolico: `💨 **ENERGÍA EÓLICA EN COLOMBIA**

**🌪️ REGIÓN ESTRELLA:**
• **La Guajira**: Potencial eólico excepcional (90% de municipios)
• Vientos Alisios del Caribe constantes
• Proyectos como Jepírachi ya operativos (19.5 MW)
• Cabo de la Vela: hasta 12 m/s promedio

**⚡ CARACTERÍSTICAS TÉCNICAS:**
• **Velocidades**: 7-12 m/s promedio anual
• **Factor de capacidad**: 35-45% (mundial: 25%)
• **Altura de buje**: 80-120m recomendada
• **Densidad de potencia**: 300-600 W/m²

**💵 INVERSIÓN Y RETORNO:**
• **CAPEX**: 1,200-1,800 USD/kW
• **Payback**: 7-10 años
• **LCOE**: 40-70 USD/MWh
• **Vida útil**: 20-25 años

**🏗️ CONSIDERACIONES DE DESARROLLO:**
• Requiere estudios de viento detallados (1 año mínimo)
• Ideal para proyectos de gran escala (>50 MW)
• Excelente complementariedad con solar
• Acceso vial para transporte de equipos

¿Quieres saber sobre el potencial eólico en otras regiones?`,

    hibrido: `⚡ **SISTEMAS HÍBRIDOS SOLAR-EÓLICO**

**🔄 VENTAJAS SINÉRGICAS:**
• **Mayor estabilidad**: Genera energía 24/7
• **Complementariedad natural**: Sol de día, viento de noche
• **Menor almacenamiento**: Reduce CAPEX en baterías
• **Optimización de terreno**: Doble aprovechamiento

**🗺️ REGIONES CON POTENCIAL HÍBRIDO:**
• **Atlántico**: Balance solar-eólico ideal (68% híbrido)
• **Magdalena**: Potencial mixto costero (45% híbrido)
• **Cesar**: Condiciones favorables para ambas tecnologías
• **La Guajira**: Excelente para megaproyectos híbridos

**🏭 APLICACIONES ESTRATÉGICAS:**
• **Sistemas aislados en ZNI**: Máxima autosuficiencia
• **Microgrids industriales**: Alimentar procesos continuos
• **Electrificación rural**: Comunidades remotas
• **Granjas energéticas**: Diversificación de ingresos

**📈 VENTAJAS ECONÓMICAS:**
• **CAPEX optimizado**: 1,000-1,500 USD/kW
• **Factor de capacidad**: 40-60% (vs 25% individual)
• **Reducción de riesgo**: Menor volatilidad
• **Incentivos adicionales**: Bonificaciones por innovación

¿Necesitas evaluación específica para tu proyecto híbrido?`
  };
  
  return {
    type: 'success',
    text: responses[technology] || responses.solar,
    timestamp: new Date()
  };
}

/**
 * MANEJADOR DE CONSULTAS ECONÓMICAS
 */
function handleEconomicQuery(message) {
  return {
    type: 'success',
    text: `💰 **ANÁLISIS ECONÓMICO - ENERGÍAS RENOVABLES EN COLOMBIA**

**💵 CAPEX POR TECNOLOGÍA (2024):**
• **Solar residencial**: 800-1,200 USD/kW
• **Solar comercial**: 700-1,000 USD/kW  
• **Eólico onshore**: 1,200-1,800 USD/kW
• **Sistemas híbridos**: 1,000-1,500 USD/kW
• **Almacenamiento**: 300-500 USD/kWh

**⏱️ RETORNO DE INVERSIÓN (ROI):**
• **Solar residencial**: 6-8 años
• **Solar comercial/industrial**: 4-6 años
• **Eólico gran escala**: 7-10 años
• **Sistemas híbridos**: 5-8 años

**🏛️ INCENTIVOS TRIBUTARIOS VIGENTES:**
• **Deducción de renta**: Hasta 50% de la inversión
• **Exclusión de IVA**: Equipos y servicios
• **Depreciación acelerada**: 20% anual (vs 10% normal)
• **Aranceles 0%**: Importación de equipos

**📊 LCOE (Costo Nivelado de Energía):**
• **Solar**: 35-55 USD/MWh
• **Eólico**: 40-70 USD/MWh
• **Térmica convencional**: 80-120 USD/MWh
• **Diesel en ZNI**: 200-400 USD/MWh

**💡 RECOMENDACIÓN:**
Usa nuestro **Simulador Económico** en la plataforma para análisis detallado con datos específicos de tu proyecto.

¿Qué tipo de proyecto tienes en mente?`,
    timestamp: new Date()
  };
}

/**
 * MANEJADOR DE CONSULTAS SOBRE ZNI
 */
function handleZNIQuery(message) {
  return {
    type: 'success',
    text: `🔌 **ZONAS NO INTERCONECTADAS (ZNI) - OPORTUNIDAD ENERGÉTICA**

**📍 DEPARTAMENTOS CON MAYOR % ZNI:**
• **Amazonas, Guainía, Vaupés, Vichada**: >90% ZNI
• **Chocó**: ~70% del territorio
• **Putumayo, Caquetá**: Regiones específicas
• **La Guajira**: Comunidades wayuu aisladas

**⚡ SOLUCIONES TECNOLÓGICAS ESPECÍFICAS:**
• **Sistemas solares autónomos**: 1-50 kW
• **Microgrids híbridos**: Solar + eólico + almacenamiento
• **Reemplazo de plantas diesel**: ROI 2-4 años
• **Mini-hidroeléctricas**: Donde hay recurso hídrico

**💡 VENTAJAS COMPETITIVAS EN ZNI:**
• **Costo actual**: 200-400 USD/MWh (diesel)
• **Costo renovable**: 80-150 USD/MWh (con almacenamiento)
• **Subsidio evitado**: 150-250 USD/MWh
• **Impacto ambiental**: Cero emisiones locales

**🏗️ CONSIDERACIONES DE IMPLEMENTACIÓN:**
• **Diseño para autoconsumo 100%**: Sin conexión a red
• **Almacenamiento robusto**: 3-5 días de autonomía
• **Mantenimiento local**: Capacitación comunitaria
• **Respaldo con generadores**: Emergencias críticas

**📋 PROGRAMAS GUBERNAMENTALES:**
• **FAZNI** (Fondo de Apoyo Financiero para ZNI)
• **IPSE** (Instituto de Planificación de Soluciones Energéticas)
• **Incentivos especiales**: Depreciación acelerada

¿Tienes un proyecto específico en mente para ZNI?`,
    timestamp: new Date()
  };
}

/**
 * MANEJADOR DE CONSULTAS DE INICIO
 */
function handleGettingStartedQuery(message) {
  return {
    type: 'success',
    text: `🚀 **GUÍA PASO A PASO: CÓMO EMPEZAR TU PROYECTO RENOVABLE**

**1️⃣ EVALUACIÓN INICIAL (Semana 1-2)**
🗺️ **Ubicación y recurso**:
• Usa nuestro **Mapa Interactivo** para identificar potencial
• Revisa la clasificación IA para tu municipio específico
• Verifica acceso vial y disponibilidad de terreno

**2️⃣ ANÁLISIS DE VIABILIDAD (Semana 3-4)**
💻 **Herramientas digitales**:
• **Simulador Atlas**: Análisis económico preliminar
• Define capacidad requerida según consumo
• Compara tecnologías (solar/eólico/híbrido)

**3️⃣ ESTUDIOS TÉCNICOS DETALLADOS (Mes 2-3)**
📊 **Mediciones in-situ**:
• **Recurso solar**: Piranómetros (6-12 meses)
• **Recurso eólico**: Torres meteorológicas (12 meses)
• **Estudios de suelos**: Geotecnia y topografía
• **Evaluación de conexión**: Distancia a subestación

**4️⃣ ESTRUCTURACIÓN FINANCIERA (Mes 3-4)**
💰 **Financiamiento y permisos**:
• **Incentivos tributarios**: Registro ante UPME
• **Licencias ambientales**: Si aplica (>3 MW)
• **Financiamiento bancario**: Bancóldex, Findeter
• **Leasing energético**: Alternativa sin CAPEX

**5️⃣ EJECUCIÓN Y PUESTA EN MARCHA (Mes 6-12)**
🏗️ **Construcción y operación**:
• Licitación de EPC (Engineering, Procurement, Construction)
• Supervisión técnica especializada
• Comisionado y pruebas
• Plan de O&M (Operación y Mantenimiento)

**🎯 PRÓXIMOS PASOS RECOMENDADOS:**
1. **Define tu objetivo**: ¿Autoconsumo, venta de energía, o ZNI?
2. **Usa nuestras herramientas**: Mapa + Simulador
3. **Consulta especializada**: Contacta asesores técnicos

¿En qué etapa específica necesitas más orientación?`,
    timestamp: new Date()
  };
}

/**
 * MANEJADOR DE COMPARACIONES ENTRE DEPARTAMENTOS
 */
async function handleComparisonQuery(message, departments) {
  try {
    const comparisonData = await Promise.all(
      departments.map(dept => getDepartmentData(dept.toUpperCase()))
    );
    
    const validData = comparisonData.filter(data => data !== null);
    
    if (validData.length < 2) {
      return {
        type: 'warning',
        text: '🔍 No pude encontrar suficientes datos para hacer la comparación solicitada. Verifica los nombres de los departamentos.',
        timestamp: new Date()
      };
    }
    
    let comparison = `📊 **COMPARACIÓN ENTRE DEPARTAMENTOS**\n\n`;
    
    validData.forEach(dept => {
      comparison += `**${dept.departamento}:**\n`;
      comparison += `• Solar: ${(dept.solar_pct * 100).toFixed(1)}% | Eólico: ${(dept.eolica_pct * 100).toFixed(1)}% | Híbrido: ${(dept.hibrida_pct * 100).toFixed(1)}%\n`;
      comparison += `• Dominante: **${dept.dominant_class.toUpperCase()}**\n`;
      comparison += `• Municipios: ${dept.num_municipios}\n\n`;
    });
    
    return {
      type: 'success',
      text: comparison,
      timestamp: new Date(),
      data: validData
    };
    
  } catch (error) {
    return {
      type: 'error', 
      text: '⚠️ Error realizando la comparación. Por favor intenta de nuevo.',
      timestamp: new Date()
    };
  }
}

/**
 * MANEJADOR DE CONSULTAS GENERALES
 */
function handleGeneralQuery(message) {
  const responses = [
    `🤖 **Atlas IA a tu servicio**

Me especializo en energías renovables para Colombia con acceso a:

🗺️ **Consultas por región**: "¿Cuál es el potencial de Antioquia?"
☀️ **Tecnología solar**: Radiación, paneles, ROI
💨 **Tecnología eólica**: Vientos, turbinas, proyectos
⚡ **Sistemas híbridos**: Combinaciones optimizadas
💰 **Análisis económico**: CAPEX, ROI, incentivos
🔌 **Soluciones ZNI**: Sistemas autónomos

**🛠️ Herramientas complementarias:**
• **Mapa Interactivo**: Explora 1,122 municipios
• **Simulador**: Análisis de viabilidad personalizado

¿Sobre qué aspecto específico te gustaría conversar?`,

    `💡 **¿Qué información puedo proporcionarte?**

**🎯 CONSULTAS ESPECIALIZADAS QUE MANEJO:**
• "¿Qué departamento tiene mejor potencial eólico?"
• "¿Conviene invertir en solar en [departamento]?"
• "¿Cuánto tiempo tarda en pagarse un sistema renovable?"
• "¿Qué opciones hay para zonas no interconectadas?"
• "¿Cómo complementar solar con eólico?"

**📊 BASE DE CONOCIMIENTO:**
• **1,122 municipios** analizados con IA
• **32 departamentos** caracterizados
• **Modelo Random Forest** con 94% de precisión
• **Datos climáticos reales** de IDEAM/NASA

¿Cuál es tu consulta específica sobre energías renovables?`
  ];
  
  return {
    type: 'success',
    text: responses[Math.floor(Math.random() * responses.length)],
    timestamp: new Date()
  };
}

/**
 * GENERADOR DE RESPUESTA INTELIGENTE FALLBACK
 */
function generateSmartResponse(message) {
  // Analizar palabras clave para generar respuesta contextual
  if (message.includes('gracias') || message.includes('thank')) {
    return {
      type: 'success',
      text: '😊 ¡De nada! Estoy aquí para ayudarte con cualquier consulta sobre energías renovables en Colombia. ¿Hay algo más en lo que pueda asistirte?',
      timestamp: new Date()
    };
  }
  
  if (message.includes('hola') || message.includes('hi') || message.includes('hello')) {
    return {
      type: 'success', 
      text: '👋 ¡Hola! Soy Atlas IA, tu asistente especializado en energías renovables. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre potencial energético, tecnologías, costos, o cualquier aspecto técnico.',
      timestamp: new Date()
    };
  }
  
  // Respuesta por defecto inteligente
  return {
    type: 'info',
    text: `🤔 **Entiendo que tienes una consulta específica.**

Para darte la mejor respuesta, puedes preguntarme sobre:

**🗺️ Regiones específicas**: "Potencial de [departamento]"
**⚡ Tecnologías**: Solar, eólica, híbrida  
**💰 Aspectos económicos**: Costos, ROI, financiamiento
**🔌 Proyectos especiales**: ZNI, microgrids, autoconsumo

También puedes usar las **sugerencias rápidas** que aparecen abajo.

¿Podrías reformular tu pregunta o elegir un tema específico?`,
    timestamp: new Date()
  };
}

/**
 * UTILIDADES PARA FORMATEO Y ANÁLISIS
 */
export function formatMessageText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

export function extractKeywords(text) {
  const keywords = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
  return [...new Set(keywords)]; // Remover duplicados
}

export function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}