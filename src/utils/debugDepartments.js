/**
 * Script de debugging para verificar la normalización de departamentos
 * Ejecutar en la consola del navegador para verificar que la normalización funciona
 */

import { normalizeDepartmentName } from '../utils/normalizeDepartmentName.js';
import { debugDepartmentMappings, loadPredictions } from '../data/predictions-by-region.js';

// Función para probar en consola del navegador
window.testDepartmentNormalization = async () => {
  console.log('=== TESTING DEPARTMENT NORMALIZATION ===');
  
  // Casos de prueba específicos
  const testCases = [
    'La Guajira',
    'LA GUAJIRA', 
    'Boyacá',
    'BOYACÁ',
    'Nariño',
    'NARIÑO',
    'Bogotá, D.C.',
    'Valle del Cauca',
    'Norte de Santander',
    'Archipiélago de San Andrés, Providencia y Santa Catalina'
  ];
  
  testCases.forEach(name => {
    const normalized = normalizeDepartmentName(name);
    console.log(`"${name}" -> "${normalized}"`);
  });
  
  // Probar con datos reales
  console.log('\n=== TESTING WITH REAL DATA ===');
  await debugDepartmentMappings();
  
  console.log('\n=== TESTING SPECIFIC CASES ===');
  const predictions = await loadPredictions();
  
  // Verificar La Guajira específicamente
  const laGuajiraTest = normalizeDepartmentName('La Guajira');
  const laGuajiraInData = predictions.departamentos.find(d => 
    normalizeDepartmentName(d.departamento) === laGuajiraTest
  );
  
  console.log('La Guajira test:', {
    input: 'La Guajira',
    normalized: laGuajiraTest,
    foundInData: !!laGuajiraInData,
    dataEntry: laGuajiraInData
  });
  
  // Verificar todos los departamentos
  const missingDepartments = [];
  const availableDepartments = predictions.departamentos.map(d => normalizeDepartmentName(d.departamento));
  
  testCases.forEach(testCase => {
    const normalized = normalizeDepartmentName(testCase);
    if (!availableDepartments.includes(normalized)) {
      missingDepartments.push({ original: testCase, normalized });
    }
  });
  
  if (missingDepartments.length > 0) {
    console.error('Missing departments:', missingDepartments);
  } else {
    console.log('✅ All test cases found in data!');
  }
  
  return { testCases, availableDepartments, missingDepartments };
};

// También exportar para uso en desarrollo
export { testDepartmentNormalization };