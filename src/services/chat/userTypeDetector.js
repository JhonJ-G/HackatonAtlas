/**
 * Detector de tipo de usuario para ajuste de tono de respuesta
 * =============================================================
 * Analiza el mensaje del usuario para inferir el perfil y ajustar
 * el lenguaje de las respuestas del LLM
 * 
 * @module userTypeDetector
 * @author Atlas Energético
 */

/**
 * Palabras clave por tipo de usuario
 */
const USER_TYPE_KEYWORDS = {
  ejecutivo: [
    'roi', 'retorno', 'inversion', 'inversión', 'capex', 'opex',
    'payback', 'rentabilidad', 'negocio', 'empresa', 'proyecto',
    'financiero', 'economico', 'económico', 'costo', 'precio',
    'presupuesto', 'viabilidad', 'factibilidad', 'mercado',
    'comercial', 'industrial', 'productividad', 'beneficio',
    'ganancia', 'lucro', 'profit', 'revenue', 'ingresos'
  ],
  
  tecnico: [
    'radiacion', 'radiación', 'irradiacion', 'irradiación',
    'kwh/m2', 'kwh/m²', 'kwhm2', 'velocidad del viento', 'viento',
    'm/s', 'ms', 'metros por segundo', 'factor de capacidad',
    'eficiencia', 'panel', 'modulo', 'módulo', 'inversor',
    'controlador', 'bateria', 'batería', 'almacenamiento',
    'voltaje', 'corriente', 'potencia', 'kw', 'mw', 'gw',
    'instalacion', 'instalación', 'diseño', 'dimensionamiento',
    'ingeniero', 'ingenieria', 'ingeniería', 'tecnico', 'técnico',
    'especificaciones', 'caracteristicas', 'características',
    'configuracion', 'configuración', 'topologia', 'topología',
    'array', 'string', 'microprocesador', 'celdas', 'celda',
    'temperatura', 'altitud', 'msnm', 'coordenadas', 'latitud',
    'longitud', 'ubicacion', 'ubicación', 'geográfico', 'geografico'
  ],
  
  ciudadano: [
    'casa', 'hogar', 'residencial', 'familia', 'vivienda',
    'domicilio', 'apartamento', 'finca', 'vereda', 'rural',
    'comunidad', 'vecindario', 'barrio', 'pueblo', 'municipio',
    'factura', 'recibo', 'luz', 'energia', 'energía',
    'servicio publico', 'servicio público', 'ahorro', 'ahorrar',
    'pagar', 'consumo', 'gasto', 'cuenta', 'sencillo',
    'facil', 'fácil', 'simple', 'basico', 'básico',
    'como funciona', 'cómo funciona', 'que es', 'qué es',
    'para que sirve', 'para qué sirve', 'necesito', 'quiero',
    'puedo', 'debo', 'tengo', 'ayuda', 'explicar',
    'entender', 'comprender'
  ]
};

/**
 * Detectar el tipo de usuario basado en el mensaje
 * @param {string} message - Mensaje del usuario
 * @returns {'ejecutivo' | 'tecnico' | 'ciudadano'} - Tipo de usuario detectado
 */
export function detectUserType(message) {
  if (!message || typeof message !== 'string') {
    return 'ciudadano'; // Default: lenguaje más accesible
  }

  // Normalizar el mensaje para comparación
  const normalizedMessage = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remover acentos para matching más robusto

  // Contar coincidencias por tipo
  const scores = {
    ejecutivo: 0,
    tecnico: 0,
    ciudadano: 0
  };

  // Calcular score para cada tipo
  for (const [type, keywords] of Object.entries(USER_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKeyword = keyword
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      // Buscar coincidencias exactas de palabras (evitar falsos positivos)
      // Ej: "inversión" no debe coincidir dentro de "diversión"
      const regex = new RegExp(`\\b${normalizedKeyword}\\b`, 'g');
      const matches = (normalizedMessage.match(regex) || []).length;
      
      scores[type] += matches;
    }
  }

  // Determinar el tipo con mayor score
  let maxScore = 0;
  let detectedType = 'ciudadano'; // Default

  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedType = type;
    }
  }

  // Si no hay coincidencias claras, mantener default ciudadano
  if (maxScore === 0) {
    return 'ciudadano';
  }

  // Log para debugging (opcional, remover en producción)
  console.log('[UserTypeDetector] Scores:', scores, '-> Tipo:', detectedType);

  return detectedType;
}

/**
 * Obtener descripción amigable del tipo de usuario detectado
 * @param {string} userType - Tipo de usuario
 * @returns {string} - Descripción del tipo
 */
export function getUserTypeDescription(userType) {
  const descriptions = {
    ejecutivo: 'Perfil Ejecutivo/Empresarial',
    tecnico: 'Perfil Técnico/Ingeniero',
    ciudadano: 'Perfil General/Ciudadano'
  };

  return descriptions[userType] || 'Perfil General';
}

/**
 * Validar si un mensaje contiene suficiente contenido para análisis
 * @param {string} message - Mensaje del usuario
 * @returns {boolean} - True si el mensaje tiene suficiente contenido
 */
export function hasEnoughContentForAnalysis(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }

  // Filtrar mensajes muy cortos o vacíos
  const trimmed = message.trim();
  
  // Debe tener al menos 5 caracteres y al menos 2 palabras
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  
  return trimmed.length >= 5 && words.length >= 2;
}
