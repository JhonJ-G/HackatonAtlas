# 🌍 Atlas Inteligente de Potencial Energético de Colombia

**Atlas Energético con Inteligencia Artificial - Hackathon TTC IA**

Una aplicación web interactiva que utiliza Machine Learning (Random Forest) para clasificar el potencial de energía renovable (solar, eólica o híbrida) por municipio y departamento en Colombia, proporcionando recomendaciones territorializadas para decisiones de inversión energética.

## 🎯 Objetivo del Proyecto

Desarrollar un "Atlas Inteligente de Potencial Energético" que combine:
- **Modelo de IA**: Random Forest para clasificación multiclase de potencial energético
- **Dataset real**: 1,122 municipios con variables climáticas y geográficas
- **Visualización interactiva**: Mapa de Colombia con predicciones del modelo
- **Herramientas prácticas**: Simulador de inversión y chat IA especializado

## 🚀 Características Principales

### 🧠 Modelo de Machine Learning
- **Algoritmo**: Random Forest Classifier
- **Objetivo**: Clasificación de potencial energético (Solar, Eólica, Híbrida)
- **Dataset**: 1,122 municipios con 9 variables predictoras
- **Precisión**: 100% en conjunto de prueba (con oversampling por desbalance de clases)

### 🗺️ Mapa Interactivo
- Visualización de Colombia con datos reales del modelo
- Colores por tipo de potencial energético dominante
- Zoom interactivo con marcadores de municipios
- Tooltips informativos con predicciones y probabilidades
- Identificación de Zonas No Interconectadas (ZNI)

### 💡 Simulador de Inversión
- Configuración de proyectos por municipio
- Análisis técnico: producción energética estimada
- Análisis económico: ROI, VPN, tiempo de recuperación
- Recomendaciones basadas en clasificación del modelo

### 🤖 Chat IA Especializado
- Consultas sobre potencial energético por región
- Recomendaciones personalizadas de inversión
- Análisis comparativo entre departamentos
- Información sobre incentivos y aspectos técnicos

### 📊 Documentación del Modelo
- Metodología de entrenamiento detallada
- Métricas de rendimiento y hiperparámetros
- Limitaciones y consideraciones
- Casos de uso recomendados

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** + **Vite** - Framework principal
- **TailwindCSS** - Estilos y diseño responsivo
- **react-simple-maps** - Visualización cartográfica
- **d3-scale** + **d3-geo** - Procesamiento de datos geográficos
- **react-router-dom** - Navegación

### Machine Learning
- **Python 3.x**
- **scikit-learn** - Random Forest y métricas
- **pandas** - Manipulación de datos
- **imbalanced-learn** - Técnicas de balanceo
- **NumPy** - Computación científica

### Datos
- **Dataset real**: `dataset_potencial_renovable_potencial.csv`
- **GeoJSON**: Límites departamentales de Colombia (`gadm41_COL_1.json`)
- **Predicciones**: Salida del modelo en formato JSON

## 📁 Estructura del Proyecto

```
atlas-energia/
├── 📁 ml/                          # Módulo Machine Learning
│   ├── train_random_forest.py      # Script entrenamiento
│   ├── requirements.txt             # Dependencias Python
│   ├── municipio_predictions.json   # Predicciones generadas
│   ├── metrics_random_forest.json   # Métricas del modelo
│   └── model_metadata.json         # Metadatos
│
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 📁 map/                  # Componentes del mapa
│   │   │   ├── ColombiaEnergyMap.jsx
│   │   │   ├── MapLegend.jsx
│   │   │   ├── MapModeTabs.jsx
│   │   │   └── MapTooltip.jsx
│   │   ├── 📁 layout/               # Layout general
│   │   └── 📁 common/               # Componentes reutilizables
│   │
│   ├── 📁 data/
│   │   └── predictions-by-region.js # API datos del modelo
│   │
│   ├── 📁 routes/                   # Páginas principales
│   │   ├── Landing.jsx              # Landing page
│   │   ├── MapPage.jsx              # Mapa interactivo
│   │   ├── SimulatorPage.jsx        # Simulador inversión
│   │   ├── ChatPage.jsx             # Chat IA
│   │   └── ModelInfoPage.jsx        # Documentación modelo
│   │
│   └── 📁 assets/
│
├── 📁 public/
│   └── 📁 data/
│       ├── gadm41_COL_1.json        # GeoJSON departamentos
│       └── municipio_predictions.json # Predicciones modelo
│
├── dataset_potencial_renovable_potencial.csv # Dataset original
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd atlas-energia
```

### 2. Instalar dependencias del frontend
```bash
npm install
```

### 3. Entrenar el modelo (opcional)
```bash
cd ml
pip install -r requirements.txt
python train_random_forest.py
```

### 4. Ejecutar la aplicación
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔬 Modelo de Machine Learning

### Variables de Entrada
- **Geográficas**: Latitud, Longitud, Altitud
- **Climáticas**: Radiación solar, Velocidad viento, Temperatura, Humedad, Nubosidad
- **Infraestructura**: Tipo de red eléctrica (SIN/ZNI)

### Clases de Salida
- **Solar**: Alto potencial fotovoltaico
- **Eólica**: Alto potencial para aerogeneradores  
- **Híbrida**: Potencial balanceado solar-eólico

### Metodología
1. **Preprocesamiento**: Limpieza datos, encoding categóricas
2. **Balanceo**: RandomOverSampler para clases minoritarias
3. **Entrenamiento**: GridSearchCV con validación cruzada
4. **Evaluación**: Métricas multiclase (F1-macro, precisión, recall)

### Resultados
- **Precisión**: 100% (conjunto de prueba)
- **F1-macro**: 100%
- **Desbalance original**: Solar (65%), Híbrida (2.5%), Eólica (0.3%)

## 🎮 Uso de la Aplicación

### 🏠 Landing Page
- Introducción al Atlas Energético
- Navegación a herramientas principales
- Información sobre beneficios de energías renovables

### 🗺️ Explorar Mapa
1. **Vista general**: Mapa de Colombia coloreado por potencial dominante
2. **Selección**: Click en departamento para ver detalles
3. **Zoom**: Ampliar para ver municipios individuales  
4. **Información**: Hover sobre regiones para tooltips informativos

### ⚙️ Simulador
1. **Configurar ubicación**: Seleccionar departamento y municipio
2. **Definir capacidad**: Ajustar tamaño del sistema (kW)
3. **Presupuesto**: Establecer monto de inversión
4. **Resultados**: Análisis técnico-económico automático

### 💬 Chat IA
- Preguntas sobre potencial por región
- Consultas técnicas sobre tecnologías
- Recomendaciones personalizadas
- Información sobre incentivos y normativas

## 🌍 Casos de Uso

### 🏛️ Sector Público
- **Planificación territorial**: Identificar zonas prioritarias
- **Política energética**: Diseñar incentivos regionales
- **Electrificación rural**: Soluciones para ZNI

### 💼 Sector Privado  
- **Análisis de inversión**: Evaluación preliminar de oportunidades
- **Selección de sitios**: Screening para estudios detallados
- **Desarrollo de proyectos**: Orientación tecnológica inicial

### 🎓 Investigación y Academia
- **Estudios energéticos**: Base de datos georreferenciada
- **Investigación territorial**: Patrones espaciales de potencial
- **Educación**: Herramienta didáctica sobre renovables

## ⚠️ Limitaciones

- **Desbalance de datos**: Predominio de clase "solar" en dataset original
- **Resolución temporal**: Datos promedio, no series temporales
- **Validación**: Se requiere verificación con mediciones in-situ
- **Microclima**: No captura variaciones locales específicas

## 🤝 Contribuciones

Este proyecto fue desarrollado para el **Hackathon TTC IA** en la categoría de Inteligencia Artificial. 

### Próximas mejoras
- [ ] Integración con APIs de datos climáticos en tiempo real
- [ ] Modelo de series temporales para variabilidad estacional
- [ ] Análisis de factibilidad económica más detallado
- [ ] Integración con sistemas GIS profesionales

## 📄 Licencia

Este proyecto es desarrollado para fines educativos y de investigación en el contexto del Hackathon TTC IA.

## 📞 Contacto

Para consultas sobre el modelo, metodología o casos de uso específicos, consulte la documentación técnica en la sección `/docs` de la aplicación.

---

**🌟 Atlas Inteligente de Potencial Energético de Colombia**  
*Transformando datos en decisiones energéticas inteligentes*