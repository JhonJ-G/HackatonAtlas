// Índices de ejemplo por departamento (0 a 1)
// Claves deben coincidir con properties.NAME_1 del dataset GADM (nivel 1)
export const energyByDepartment = {
  Amazonas: { solarIndex: 0.68, eolicoIndex: 0.25, hibridoIndex: 0.46 },
  Antioquia: { solarIndex: 0.52, eolicoIndex: 0.42, hibridoIndex: 0.47 },
  Arauca: { solarIndex: 0.64, eolicoIndex: 0.35, hibridoIndex: 0.50 },
  Atlántico: { solarIndex: 0.78, eolicoIndex: 0.62, hibridoIndex: 0.70 },
  Bolívar: { solarIndex: 0.73, eolicoIndex: 0.40, hibridoIndex: 0.58 },
  Boyacá: { solarIndex: 0.60, eolicoIndex: 0.38, hibridoIndex: 0.50 },
  Caldas: { solarIndex: 0.55, eolicoIndex: 0.33, hibridoIndex: 0.45 },
  Caquetá: { solarIndex: 0.66, eolicoIndex: 0.28, hibridoIndex: 0.47 },
  Casanare: { solarIndex: 0.67, eolicoIndex: 0.36, hibridoIndex: 0.53 },
  Cauca: { solarIndex: 0.59, eolicoIndex: 0.32, hibridoIndex: 0.46 },
  Cesar: { solarIndex: 0.74, eolicoIndex: 0.44, hibridoIndex: 0.60 },
  Chocó: { solarIndex: 0.45, eolicoIndex: 0.22, hibridoIndex: 0.34 },
  Córdoba: { solarIndex: 0.70, eolicoIndex: 0.40, hibridoIndex: 0.56 },
  Cundinamarca: { solarIndex: 0.58, eolicoIndex: 0.35, hibridoIndex: 0.47 },
  'Distrito Capital de Bogotá': { solarIndex: 0.57, eolicoIndex: 0.30, hibridoIndex: 0.44 },
  Guainía: { solarIndex: 0.65, eolicoIndex: 0.27, hibridoIndex: 0.46 },
  Guaviare: { solarIndex: 0.63, eolicoIndex: 0.29, hibridoIndex: 0.47 },
  Huila: { solarIndex: 0.62, eolicoIndex: 0.33, hibridoIndex: 0.48 },
  'La Guajira': { solarIndex: 0.85, eolicoIndex: 0.90, hibridoIndex: 0.88 },
  Magdalena: { solarIndex: 0.76, eolicoIndex: 0.50, hibridoIndex: 0.63 },
  Meta: { solarIndex: 0.66, eolicoIndex: 0.34, hibridoIndex: 0.50 },
  Nariño: { solarIndex: 0.56, eolicoIndex: 0.31, hibridoIndex: 0.44 },
  'Norte de Santander': { solarIndex: 0.61, eolicoIndex: 0.36, hibridoIndex: 0.49 },
  Putumayo: { solarIndex: 0.60, eolicoIndex: 0.26, hibridoIndex: 0.43 },
  Quindío: { solarIndex: 0.54, eolicoIndex: 0.30, hibridoIndex: 0.42 },
  Risaralda: { solarIndex: 0.55, eolicoIndex: 0.32, hibridoIndex: 0.44 },
  Santander: { solarIndex: 0.63, eolicoIndex: 0.38, hibridoIndex: 0.51 },
  Sucre: { solarIndex: 0.71, eolicoIndex: 0.41, hibridoIndex: 0.57 },
  Tolima: { solarIndex: 0.60, eolicoIndex: 0.34, hibridoIndex: 0.48 },
  Valle: { solarIndex: 0.62, eolicoIndex: 0.37, hibridoIndex: 0.50 },
  Vaupés: { solarIndex: 0.64, eolicoIndex: 0.24, hibridoIndex: 0.45 },
  Vichada: { solarIndex: 0.68, eolicoIndex: 0.28, hibridoIndex: 0.49 },
};

export function getEnergyValue(deptName, type) {
  const d = energyByDepartment[deptName];
  if (!d) return 0.2;
  if (type === 'solar') return d.solarIndex ?? 0.2;
  if (type === 'eolico') return d.eolicoIndex ?? 0.2;
  return d.hibridoIndex ?? 0.2;
}
