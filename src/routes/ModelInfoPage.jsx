import React, { useState, useEffect } from 'react';
import SectionTitle from '../components/common/SectionTitle';
import { getDatasetStats } from '../data/predictions-by-region';

const ModelInfoPage = () => {
  const [modelMetadata, setModelMetadata] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);

  useEffect(() => {
    const loadModelInfo = async () => {
      try {
        // Cargar metadata del modelo desde el frontend
        const stats = await getDatasetStats();
        setModelMetadata(stats);

        // Cargar métricas si están disponibles
        try {
          const metricsResponse = await fetch('/ml/metrics_random_forest.json');
          if (metricsResponse.ok) {
            const metrics = await metricsResponse.json();
            setModelMetrics(metrics);
          }
        } catch (error) {
          console.log('Métricas no disponibles desde frontend');
        }
      } catch (error) {
        console.error('Error cargando información del modelo:', error);
      }
    };

    loadModelInfo();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container-width section-padding">
        <div className="text-center mb-10">
          <SectionTitle 
            title="Documentación del Modelo IA"
            subtitle="Random Forest para Clasificación de Potencial Energético Renovable"
          />
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Resumen del Modelo */}
          <div className="bg-main-dark rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-semibold mb-6">🧠 Resumen del Modelo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-accent-green mb-3">Algoritmo</h4>
                <p className="text-white/80 mb-4">Random Forest Classifier</p>
                <p className="text-sm text-white/70">
                  Ensemble de árboles de decisión que combina múltiples predictores 
                  para obtener clasificaciones robustas y precisas.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-accent-green mb-3">Objetivo</h4>
                <p className="text-white/80 mb-4">Clasificación Multiclase</p>
                <p className="text-sm text-white/70">
                  Determinar el potencial energético renovable óptimo para cada 
                  municipio: Solar, Eólica o Híbrida.
                </p>
              </div>
            </div>
          </div>

          {/* Dataset y Variables */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold mb-6 text-main-dark">📊 Dataset y Variables</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-main-dark mb-4">Variables de Entrada (Features)</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Latitud', desc: 'Coordenada geográfica norte-sur' },
                    { name: 'Longitud', desc: 'Coordenada geográfica este-oeste' },
                    { name: 'Altitud (msnm)', desc: 'Elevación sobre el nivel del mar' },
                    { name: 'Radiación (kWh/m²/día)', desc: 'Irradiación solar promedio' },
                    { name: 'Viento (m/s)', desc: 'Velocidad promedio del viento' },
                    { name: 'Temperatura (°C)', desc: 'Temperatura ambiente promedio' },
                    { name: 'Humedad (%)', desc: 'Humedad relativa promedio' },
                    { name: 'Nubosidad (%)', desc: 'Cobertura de nubes promedio' },
                    { name: 'Tipo de Red', desc: 'SIN (Sistema Interconectado) o ZNI (Zona No Interconectada)' }
                  ].map((feature, index) => (
                    <div key={index} className="border-l-4 border-accent-green pl-4">
                      <div className="font-medium text-main-dark">{feature.name}</div>
                      <div className="text-sm text-gray-600">{feature.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-main-dark mb-4">Clases de Salida</h4>
                <div className="space-y-4">
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
                    <div className="font-semibold text-yellow-800">☀️ Solar</div>
                    <div className="text-sm text-yellow-700">
                      Zonas con alto potencial para energía fotovoltaica.
                      Alta radiación solar y condiciones climáticas favorables.
                    </div>
                  </div>
                  <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
                    <div className="font-semibold text-blue-800">💨 Eólica</div>
                    <div className="text-sm text-blue-700">
                      Regiones con vientos consistentes y velocidades adecuadas 
                      para generación eólica.
                    </div>
                  </div>
                  <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
                    <div className="font-semibold text-green-800">⚡ Híbrida</div>
                    <div className="text-sm text-green-700">
                      Áreas balanceadas que permiten sistemas combinados 
                      solar-eólicos para mayor estabilidad.
                    </div>
                  </div>
                </div>

                {modelMetadata && (
                  <div className="mt-6 bg-white rounded-lg p-4 border">
                    <h5 className="font-semibold text-main-dark mb-2">Estadísticas del Dataset</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Total Municipios</div>
                        <div className="font-semibold">{modelMetadata.num_municipios || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Departamentos</div>
                        <div className="font-semibold">{modelMetadata.num_departamentos || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metodología */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-semibold mb-6 text-main-dark">🔬 Metodología</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-main-dark mb-3">1. Preprocesamiento de Datos</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Limpieza de valores faltantes en variables críticas</li>
                  <li>Codificación one-hot para variable categórica (tipo_red)</li>
                  <li>Filtrado de clases de interés (solar, eólica, híbrida)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-main-dark mb-3">2. Balanceo de Clases</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Oversampling con RandomOverSampler debido al desbalance extremo</li>
                  <li>Clase "solar" dominante (730 muestras) vs "eólica" (3 muestras)</li>
                  <li>class_weight="balanced" en el modelo para penalizar clases minoritarias</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-main-dark mb-3">3. Validación y Entrenamiento</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>División estratificada 70% entrenamiento / 30% prueba</li>
                  <li>Búsqueda de hiperparámetros con GridSearchCV</li>
                  <li>Validación cruzada estratificada (3-fold)</li>
                  <li>Optimización para F1-macro score</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rendimiento del Modelo */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
            <h3 className="text-2xl font-semibold mb-6 text-main-dark">📈 Rendimiento del Modelo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                <div className="text-3xl font-bold text-green-600">≥99%</div>
                <div className="text-sm text-gray-600">Precisión en Test</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">≥99%</div>
                <div className="text-sm text-gray-600">F1-Score Macro</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-purple-200">
                <div className="text-3xl font-bold text-purple-600">≥99%</div>
                <div className="text-sm text-gray-600">F1-Score Weighted</div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-amber-800">
                <strong>⚠️ Nota importante:</strong> Estas métricas corresponden al rendimiento del modelo en el conjunto de entrenamiento. 
                El rendimiento real puede variar al aplicarse a nuevas regiones o condiciones no representadas en los datos históricos.
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-main-dark mb-3">Hiperparámetros Óptimos</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">N Estimadores</div>
                  <div className="font-medium">300</div>
                </div>
                <div>
                  <div className="text-gray-600">Max Depth</div>
                  <div className="font-medium">8</div>
                </div>
                <div>
                  <div className="text-gray-600">Min Samples Split</div>
                  <div className="font-medium">5</div>
                </div>
                <div>
                  <div className="text-gray-600">Min Samples Leaf</div>
                  <div className="font-medium">2</div>
                </div>
                <div>
                  <div className="text-gray-600">Class Weight</div>
                  <div className="font-medium">Balanced</div>
                </div>
              </div>
            </div>
          </div>

          {/* Limitaciones y Consideraciones */}
          <div className="bg-orange-50 rounded-2xl p-8 border border-orange-200">
            <h3 className="text-2xl font-semibold mb-6 text-main-dark">⚠️ Limitaciones y Consideraciones</h3>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Desbalance de Clases</h4>
                <p className="text-sm text-orange-700">
                  El dataset presenta un fuerte desbalance hacia la clase "solar". 
                  Las predicciones para "eólica" e "híbrida" deben interpretarse con precaución.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Datos Geográficos</h4>
                <p className="text-sm text-orange-700">
                  Las predicciones se basan en promedios climáticos y pueden no reflejar 
                  variaciones microclimáticas locales importantes para proyectos específicos.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Validación en Campo</h4>
                <p className="text-sm text-orange-700">
                  Se recomienda validar las predicciones con estudios de factibilidad 
                  detallados antes de tomar decisiones de inversión.
                </p>
              </div>
            </div>
          </div>

          {/* Casos de Uso */}
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
            <h3 className="text-2xl font-semibold mb-6 text-main-dark">🎯 Casos de Uso</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800">📍 Planificación Territorial</h4>
                  <p className="text-sm text-blue-700 mt-2">
                    Identificación de zonas prioritarias para desarrollo de proyectos 
                    de energía renovable a nivel departamental y municipal.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800">💼 Análisis de Inversión</h4>
                  <p className="text-sm text-blue-700 mt-2">
                    Evaluación preliminar de oportunidades de inversión en 
                    tecnologías renovables específicas por región.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800">🏛️ Política Energética</h4>
                  <p className="text-sm text-blue-700 mt-2">
                    Soporte para diseño de políticas públicas y programas de 
                    incentivos diferenciados por tipo de tecnología y región.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800">🔍 Estudios Previos</h4>
                  <p className="text-sm text-blue-700 mt-2">
                    Herramienta de screening para identificar candidatos para 
                    estudios de prefactibilidad más detallados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelInfoPage;