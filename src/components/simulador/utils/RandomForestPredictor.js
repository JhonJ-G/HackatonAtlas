/**
 * Random Forest Predictor para Potencial Energético Renovable
 * Entrena con el dataset existente y predice el tipo de energía óptima
 * para ubicaciones sin datos precargados
 */

import { RandomForestClassifier as RFC } from 'ml-random-forest';

class RandomForestPredictor {
  constructor() {
    this.model = null;
    this.isReady = false;
    this.features = ['radiacion', 'viento', 'altitud', 'temperatura', 'lat', 'lon'];
    this.classes = ['solar', 'eolica', 'hibrida'];
    this.scaler = null;
  }

  /**
   * Prepara los datos de entrenamiento desde el dataset CSV con balanceo
   */
  prepareTrainingData(rawData) {
    const trainingData = [];
    const labels = [];

    // Normalizar datos y extraer características
    const stats = this.calculateStats(rawData);
    this.scaler = stats;

    // Separar datos por clase para balanceado
    const classDivision = { solar: [], eolica: [], hibrida: [] };

    rawData.forEach(point => {
      // Solo usar puntos con potencial definido para entrenamiento
      if (!point.potencial || point.potencial.trim() === '' || point.potencial.toLowerCase() === 'desconocido') return;

      // Normalizar características
      const features = [
        this.normalize(point.radiacion, stats.radiacion),
        this.normalize(point.viento, stats.viento),
        this.normalize(point.altitud, stats.altitud),
        this.normalize(point.temperatura, stats.temperatura),
        this.normalize(point.lat, stats.lat),
        this.normalize(point.lon, stats.lon)
      ];

      // Mapear potencial a clase
      let label = point.potencial.toLowerCase().trim();
      if (label === 'eolica') {
        classDivision.eolica.push({ features, label: 'eolica' });
      } else if (label === 'hibrida') {
        classDivision.hibrida.push({ features, label: 'hibrida' });
      } else {
        classDivision.solar.push({ features, label: 'solar' });
      }
    });

    // Encontrar la clase minoritaria para balancear
    const counts = {
      solar: classDivision.solar.length,
      eolica: classDivision.eolica.length,
      hibrida: classDivision.hibrida.length
    };

    // Balancear datos: usar subsampling para reducir clase mayoritaria
    const maxSamples = Math.min(200, Math.max(counts.eolica * 10, counts.hibrida * 5, 50));
    
    // Submuestrear solar (clase mayoritaria)
    const solarSampled = this.sampleArray(classDivision.solar, Math.min(maxSamples, counts.solar));
    
    // Sobremuestrear clases minoritarias si es necesario
    const eolicaBalanced = counts.eolica < 10 ? 
      this.oversampleArray(classDivision.eolica, Math.min(20, maxSamples / 4)) : 
      classDivision.eolica;
    
    const hibridaBalanced = counts.hibrida < 10 ? 
      this.oversampleArray(classDivision.hibrida, Math.min(40, maxSamples / 2)) : 
      classDivision.hibrida;

    // Combinar datos balanceados
    const allData = [...solarSampled, ...eolicaBalanced, ...hibridaBalanced];
    
    // Mezclar datos aleatoriamente
    for (let i = allData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allData[i], allData[j]] = [allData[j], allData[i]];
    }

    // Validar que haya datos balanceados
    if (allData.length === 0) {
      throw new Error('No se pudieron balancear los datos para el entrenamiento.');
    }

    // Separar características y etiquetas
    allData.forEach(item => {
      trainingData.push(item.features);
      labels.push(item.label);
    });

    const finalCounts = {
      solar: labels.filter(l => l === 'solar').length,
      eolica: labels.filter(l => l === 'eolica').length,
      hibrida: labels.filter(l => l === 'hibrida').length
    };

    return { features: trainingData, labels };
  }

  /**
   * Submuestrea un array a un tamaño específico
   */
  sampleArray(array, size) {
    if (array.length <= size) return [...array];
    
    const sampled = [];
    const indices = new Set();
    
    while (sampled.length < size) {
      const randomIndex = Math.floor(Math.random() * array.length);
      if (!indices.has(randomIndex)) {
        indices.add(randomIndex);
        sampled.push(array[randomIndex]);
      }
    }
    
    return sampled;
  }

  /**
   * Sobremuestrea un array duplicando elementos aleatoriamente
   */
  oversampleArray(array, targetSize) {
    if (array.length === 0) return [];
    if (array.length >= targetSize) return [...array];
    
    const oversampled = [...array];
    
    while (oversampled.length < targetSize) {
      const randomIndex = Math.floor(Math.random() * array.length);
      oversampled.push({ ...array[randomIndex] });
    }
    
    return oversampled;
  }

  /**
   * Calcula estadísticas para normalización
   */
  calculateStats(data) {
    const stats = {};
    
    ['radiacion', 'viento', 'altitud', 'temperatura', 'lat', 'lon'].forEach(field => {
      const values = data.map(d => d[field]).filter(v => !isNaN(v));
      stats[field] = {
        min: Math.min(...values),
        max: Math.max(...values),
        mean: values.reduce((a, b) => a + b, 0) / values.length
      };
    });

    return stats;
  }

  /**
   * Normaliza un valor usando min-max scaling
   */
  normalize(value, stats) {
    if (stats.max === stats.min) return 0.5; // Evitar división por cero
    return (value - stats.min) / (stats.max - stats.min);
  }

  /**
   * Entrena el modelo Random Forest
   */
  async train(rawData) {
    try {
      if (!rawData || rawData.length === 0) {
        throw new Error('El dataset de entrenamiento está vacío.');
      }

      const { features, labels } = this.prepareTrainingData(rawData);
      
      if (features.length < 50) {
      }

      // Configuración del Random Forest
      const options = {
        seed: 42,
        maxFeatures: 0.8,          // 80% de características por árbol
        replacement: true,          // Bootstrap sampling
        nEstimators: 100,          // 100 árboles
        maxDepth: 10,              // Profundidad máxima
        minSamplesSplit: 5,        // Mínimo para dividir nodo
        minSamplesLeaf: 2,         // Mínimo en hojas
        useSampleBagging: true     // Usar bagging
      };

      // Entrenar modelo
      this.model = new RFC(options);
      this.model.train(features, labels);
      
      this.isReady = true;
      
      // Validar modelo con datos de entrenamiento (básico)
      const predictions = this.model.predict(features.slice(0, 10));
      const accuracy = this.calculateAccuracy(predictions, labels.slice(0, 10));
      
      return true;
    } catch (error) {
      // console.error('❌ Error entrenando Random Forest:', error);
      this.isReady = false;
      return false;
    }
  }

  /**
   * Calcula precisión básica
   */
  calculateAccuracy(predictions, actual) {
    if (predictions.length !== actual.length) return 0;
    
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] === actual[i]) correct++;
    }
    
    return correct / predictions.length;
  }

  /**
   * Predice el tipo de energía para una ubicación específica
   */
  predict(location) {
    if (!this.isReady || !this.model) {
      console.warn('🚫 Modelo Random Forest no está listo');
      return {
        prediction: 'evaluacion_requerida',
        confidence: 0,
        probabilities: {},
        source: 'model_not_ready'
      };
    }

    try {
      // Normalizar características de entrada
      const features = [
        this.normalize(location.radiacion, this.scaler.radiacion),
        this.normalize(location.viento, this.scaler.viento),
        this.normalize(location.altitud, this.scaler.altitud),
        this.normalize(location.temperatura, this.scaler.temperatura),
        this.normalize(location.lat, this.scaler.lat),
        this.normalize(location.lon, this.scaler.lon)
      ];

      // Hacer predicción
      const prediction = this.model.predict([features])[0];
      
      // Calcular probabilidades (simulado - la librería no siempre las provee)
      const probabilities = this.estimateProbabilities(features);
      const confidence = Math.max(...Object.values(probabilities));

      console.log(`🎯 Random Forest predice: ${prediction} (confianza: ${(confidence * 100).toFixed(1)}%)`);

      return {
        prediction,
        confidence,
        probabilities,
        source: 'random_forest',
        details: {
          location: `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`,
          features: {
            radiacion: location.radiacion,
            viento: location.viento,
            altitud: location.altitud,
            temperatura: location.temperatura
          }
        }
      };

    } catch (error) {
      console.error('❌ Error en predicción Random Forest:', error);
      return {
        prediction: 'error',
        confidence: 0,
        probabilities: {},
        source: 'prediction_error'
      };
    }
  }

  /**
   * Estima probabilidades para cada clase (simulado)
   */
  estimateProbabilities(features) {
    // Lógica heurística simple para estimar probabilidades
    // En un caso real, usaríamos las probabilidades del ensemble
    
    const radiacion = features[0];
    const viento = features[1];
    const altitud = features[2];

    let probSolar = Math.max(0, radiacion * 0.8 + (1 - viento) * 0.2);
    let probEolica = Math.max(0, viento * 0.8 + altitud * 0.2);
    let probHibrida = Math.max(0, Math.min(radiacion, viento) * 1.2);

    // Normalizar para que sumen 1
    const total = probSolar + probEolica + probHibrida;
    if (total > 0) {
      probSolar /= total;
      probEolica /= total;
      probHibrida /= total;
    }

    return {
      solar: probSolar,
      eolica: probEolica,
      hibrida: probHibrida
    };
  }

  /**
   * Obtiene estadísticas del modelo
   */
  getModelStats() {
    return {
      isReady: this.isReady,
      features: this.features,
      classes: this.classes,
      hasScaler: !!this.scaler
    };
  }

  /**
   * Reinicia el modelo
   */
  reset() {
    this.model = null;
    this.isReady = false;
    this.scaler = null;
  }
}

// Instancia singleton
const randomForestPredictor = new RandomForestPredictor();
export default randomForestPredictor;