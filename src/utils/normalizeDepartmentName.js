/**
 * Función de normalización de nombres de departamento única y reutilizable
 * Soluciona inconsistencias entre nombres del GeoJSON y datos del modelo ML
 */

/**
 * Normalizar nombre de departamento para matching consistente
 * @param {string} name - Nombre del departamento (puede venir del GeoJSON o datos)
 * @returns {string} - Nombre normalizado para búsquedas
 */
export function normalizeDepartmentName(name) {
  if (!name) return "";

  // Paso 1: Mappings específicos para nombres del GeoJSON que vienen concatenados
  const geoJsonMappings = {
    // GeoJSON -> Dataset normalized name
    "BOGOTAD C": "BOGOTA D C",    // "BogotáD.C." -> "BOGOTAD C" -> "BOGOTA D C"
    "BOGOTADC": "BOGOTA D C", 
    "LAGUAJIRA": "LA GUAJIRA",
    "NORTEDESANTANDER": "NORTE DE SANTANDER",
    "VALLEDELCAUCA": "VALLE DEL CAUCA",
    "SANANDRESYPROVIDENCIA": "ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA",
  };

  // Paso 2: Convertir a mayúsculas y normalizar caracteres especiales
  let normalized = name
    .toUpperCase()
    .normalize("NFD")                 // Descompone caracteres con tildes
    .replace(/[\u0300-\u036f]/g, "")  // Remueve diacríticos (tildes, acentos)
    .replace(/[^A-Z0-9]+/g, " ")      // Cualquier cosa que no sea A-Z/0-9 -> espacio
    .replace(/\s+/g, " ")             // Colapsa espacios múltiples en uno
    .trim();

  // Paso 3: Verificar mappings específicos del GeoJSON primero
  if (geoJsonMappings[normalized]) {
    return geoJsonMappings[normalized];
  }

  // Paso 4: Mapear nombres específicos según los datos reales del JSON
  // Basado en los nombres exactos encontrados en municipio_predictions.json
  const specificMappings = {
    // CASOS ESPECIALES con nombres reales de los datos (con tildes):
    
    // Datos: "BOGOTÁ, D.C." -> Normalizado para búsqueda: "BOGOTA D C"
    "BOGOTA D C": "BOGOTA D C",
    
    // Datos: "ARCHIPIÉLAGO DE SAN ANDRÉS, PROVIDENCIA Y SANTA CATALINA" 
    "ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA": "ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA",
    
    // Los demás departamentos mapean directamente por su nombre normalizado:
    "LA GUAJIRA": "LA GUAJIRA",
    "NORTE DE SANTANDER": "NORTE DE SANTANDER", 
    "VALLE DEL CAUCA": "VALLE DEL CAUCA",
    "ANTIOQUIA": "ANTIOQUIA",
    "ATLANTICO": "ATLANTICO",  // "ATLÁNTICO" -> "ATLANTICO"
    "BOLIVAR": "BOLIVAR",      // "BOLÍVAR" -> "BOLIVAR"
    "BOYACA": "BOYACA",        // "BOYACÁ" -> "BOYACA"
    "CALDAS": "CALDAS",
    "CAQUETA": "CAQUETA",      // "CAQUETÁ" -> "CAQUETA"
    "CAUCA": "CAUCA",
    "CESAR": "CESAR",
    "CORDOBA": "CORDOBA",      // "CÓRDOBA" -> "CORDOBA"
    "CUNDINAMARCA": "CUNDINAMARCA",
    "CHOCO": "CHOCO",          // "CHOCÓ" -> "CHOCO"
    "HUILA": "HUILA",
    "MAGDALENA": "MAGDALENA",
    "META": "META",
    "NARINO": "NARINO",        // "NARIÑO" -> "NARINO"
    "QUINDIO": "QUINDIO",      // "QUINDÍO" -> "QUINDIO"
    "META": "META",
    "NARINO": "NARINO",        // "NARIÑO" -> "NARINO"
    "QUINDIO": "QUINDIO",      // "QUINDÍO" -> "QUINDIO"
    "RISARALDA": "RISARALDA",
    "SANTANDER": "SANTANDER",
    "SUCRE": "SUCRE",
    "TOLIMA": "TOLIMA",
    "ARAUCA": "ARAUCA",
    "CASANARE": "CASANARE",
    "PUTUMAYO": "PUTUMAYO",
    "AMAZONAS": "AMAZONAS",
    "GUAINIA": "GUAINIA",      // "GUAINÍA" -> "GUAINIA"
    "GUAVIARE": "GUAVIARE",
    "VAUPES": "VAUPES",        // "VAUPÉS" -> "VAUPES"
    "VICHADA": "VICHADA"
  };

  // Aplicar mapeo específico si existe
  return specificMappings[normalized] || normalized;
}

/**
 * Crear mapeo inverso para debugging
 */
export function getDepartmentMappings() {
  // Ejemplos de nombres que pueden venir del GeoJSON
  const geoJsonNames = [
    "La Guajira",
    "Boyacá", 
    "Nariño",
    "Bogotá, D.C.",
    "Valle del Cauca",
    "Norte de Santander",
    "Archipiélago de San Andrés, Providencia y Santa Catalina"
  ];

  return geoJsonNames.map(name => ({
    original: name,
    normalized: normalizeDepartmentName(name)
  }));
}

/**
 * Validar si un nombre de departamento normalizado es válido
 */
export function isValidDepartment(normalizedName) {
  const validDepartments = [
    "ANTIOQUIA", "ATLANTICO", "BOGOTA D C", "BOLIVAR", "BOYACA", "CALDAS", 
    "CAQUETA", "CASANARE", "CAUCA", "CESAR", "CHOCO", "CORDOBA", 
    "CUNDINAMARCA", "GUAINIA", "GUAVIARE", "HUILA", "LA GUAJIRA", 
    "MAGDALENA", "META", "NARINO", "NORTE DE SANTANDER", "PUTUMAYO", 
    "QUINDIO", "RISARALDA", "ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA", "SANTANDER", 
    "SUCRE", "TOLIMA", "VALLE DEL CAUCA", "VAUPES", "VICHADA", "ARAUCA", "AMAZONAS"
  ];
  
  return validDepartments.includes(normalizedName);
}