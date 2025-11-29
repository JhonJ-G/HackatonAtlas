# Integración LLM - Atlas Energético

## 📝 Descripción

Este directorio contiene los servicios de integración con el modelo de lenguaje (Gemini API) para el chat especializado en energías renovables de Colombia.

## 🏗️ Arquitectura

```
src/services/
├── llmClient.js              # Cliente principal para la API de Gemini
└── chat/
    ├── userTypeDetector.js   # Detector de tipo de usuario (ejecutivo/técnico/ciudadano)
    ├── contextBuilder.js     # Constructor de contexto técnico enriquecido
    └── index.js              # Exportaciones centralizadas
```

## 🔑 Configuración

### Variables de Entorno

El proyecto requiere configurar la API key de Gemini en el archivo `.env`:

```env
VITE_OPENAI_API_KEY="tu-api-key-aqui"
```

**Importante:** 
- No commitear el archivo `.env` con la API key real
- La variable se llama `VITE_OPENAI_API_KEY` por compatibilidad con el proyecto de referencia
- Debe tener el prefijo `VITE_` para ser accesible en Vite

## 📦 Servicios

### 1. `llmClient.js`

Cliente principal para interactuar con la API de Gemini.

**Funciones principales:**

```javascript
import { askEnergyLLM, buildSystemPrompt } from '../services/llmClient';

// Realizar consulta al LLM
const response = await askEnergyLLM({
  messages: [{ role: 'user', text: 'Pregunta del usuario' }],
  systemPrompt: 'Instrucciones del sistema...'
});

// Construir prompt del sistema con tono ajustado
const prompt = buildSystemPrompt('ejecutivo', 'Contexto técnico...');
```

**Características:**
- Manejo robusto de errores
- Construcción automática del formato de mensajes de Gemini
- Configuración de parámetros de generación (temperatura, tokens, etc.)
- Filtros de seguridad configurados
- No loguea API keys (seguridad)

### 2. `userTypeDetector.js`

Detecta el tipo de usuario basándose en palabras clave en su mensaje.

**Tipos de usuario:**
- `ejecutivo`: Enfocado en ROI, CAPEX, rentabilidad
- `tecnico`: Enfocado en especificaciones técnicas, radiación, viento
- `ciudadano`: Enfocado en ahorro, familia, explicaciones sencillas

**Uso:**

```javascript
import { detectUserType } from '../services/chat/userTypeDetector';

const userType = detectUserType('¿Cuál es el ROI de un proyecto solar?');
// Retorna: 'ejecutivo'
```

### 3. `contextBuilder.js`

Construye contexto técnico enriquecido para las consultas al LLM.

**Funciones:**

```javascript
import { buildDepartmentContext, buildGeneralContext } from '../services/chat/contextBuilder';

// Contexto para departamento específico
const context = buildDepartmentContext(departmentData, 'ANTIOQUIA');

// Contexto general
const generalContext = buildGeneralContext('¿Qué es energía solar?');
```

**El contexto incluye:**
- Clasificación energética (solar/eólico/híbrido)
- Datos climáticos (radiación, viento, temperatura)
- Información geográfica (altitud, ubicación)
- Nivel de confianza de los datos
- Presencia de zonas no interconectadas (ZNI)
- Recomendaciones técnicas preliminares

## 🔄 Flujo de Integración en ChatPage

```
1. Usuario envía mensaje
   ↓
2. Detectar tipo de usuario (ejecutivo/técnico/ciudadano)
   ↓
3. Detectar departamento mencionado (opcional)
   ↓
4. Construir contexto técnico enriquecido
   ↓
5. Construir system prompt con tono ajustado
   ↓
6. Llamar al LLM con contexto + prompt
   ↓
7. Retornar respuesta al usuario
   
   Si falla el LLM:
   ↓
   Fallback a respuestas predefinidas
```

## 🛡️ Manejo de Errores

El sistema implementa fallback en múltiples niveles:

1. **Error de API**: Si falla la conexión con Gemini
   - Usa datos del modelo de clasificación
   - Muestra recomendación basada en datos históricos

2. **Error de parsing**: Si la respuesta del LLM es inválida
   - Respuestas predefinidas por tema (solar, eólico, híbrido, etc.)

3. **Sin departamento detectado**: 
   - Contexto general sobre energías renovables en Colombia
   - Guía al usuario para hacer consultas más específicas

## 🎯 Ajuste de Tono

El sistema ajusta automáticamente el lenguaje de las respuestas:

### Tono Ejecutivo
- Conciso y orientado a negocio
- Enfoque en ROI, CAPEX, payback
- Menciona escalas de proyecto
- Resalta incentivos fiscales

### Tono Técnico
- Detalles técnicos específicos
- Valores numéricos (kWh/m²/día, m/s, °C)
- Terminología técnica
- Consideraciones de diseño

### Tono Ciudadano
- Explicaciones sencillas
- Ejemplos cotidianos
- Comparaciones familiares
- Lenguaje accesible

## 🚀 Uso en Desarrollo

### Instalación

```bash
cd atlas-energia
npm install
```

### Configurar .env

```bash
# Crear archivo .env en la raíz del proyecto
echo 'VITE_OPENAI_API_KEY="tu-api-key"' > .env
```

### Ejecutar en desarrollo

```bash
npm run dev
```

### Probar el chat

1. Navegar a la ruta `/chat`
2. Escribir consultas sobre departamentos: "¿Potencial solar en La Guajira?"
3. Probar diferentes tipos de consultas para verificar ajuste de tono

## 📊 Logging y Debug

El sistema incluye logs para debugging:

```javascript
console.log('[ChatPage] Tipo de usuario detectado:', userType);
console.log('[UserTypeDetector] Scores:', scores);
```

**Recomendación:** Remover estos logs en producción o usar una librería de logging con niveles.

## 🔒 Seguridad

- ✅ API key se carga desde variables de entorno
- ✅ Nunca se loguea la API key
- ✅ Filtros de seguridad de Gemini activados
- ✅ Validación de entrada del usuario
- ⚠️ **Importante:** Configurar rate limiting en producción

## 📈 Mejoras Futuras

- [ ] Caché de respuestas frecuentes
- [ ] Rate limiting por usuario
- [ ] Analytics de consultas más frecuentes
- [ ] Soporte para múltiples municipios en una consulta
- [ ] Historial de conversación persistente
- [ ] Exportar conversación como PDF
- [ ] Integración con otros LLMs (OpenAI, Claude)

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. Mantener separación de responsabilidades
2. Documentar funciones con JSDoc
3. Agregar manejo de errores robusto
4. Probar con diferentes tipos de consultas
5. Actualizar este README

## 📞 Soporte

Para dudas o problemas con la integración:
- Revisar logs en consola del navegador
- Verificar configuración de .env
- Comprobar que la API key sea válida
- Revisar documentación de Gemini API: https://ai.google.dev/docs

---

**Última actualización:** 29 de noviembre de 2025
