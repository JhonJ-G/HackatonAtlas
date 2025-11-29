# 🤖 Integración de Chat IA - Atlas Energético

## 📋 Resumen de la Implementación

Se ha integrado exitosamente un sistema de chat inteligente especializado en energías renovables para Colombia, utilizando la API de Gemini como modelo de lenguaje.

## 🎯 Características Implementadas

### ✅ 1. Cliente LLM Reutilizable
- **Archivo:** `src/services/llmClient.js`
- Manejo de llamadas a Gemini API
- Construcción automática de contexto
- Manejo robusto de errores
- Configuración de parámetros de generación

### ✅ 2. Detección de Tipo de Usuario
- **Archivo:** `src/services/chat/userTypeDetector.js`
- Detecta 3 perfiles: **ejecutivo**, **técnico**, **ciudadano**
- Ajusta el tono de respuesta automáticamente
- Basado en análisis de palabras clave

### ✅ 3. Constructor de Contexto Técnico
- **Archivo:** `src/services/chat/contextBuilder.js`
- Enriquece consultas con datos del modelo de clasificación
- Incluye información climática y geográfica
- Proporciona recomendaciones basadas en datos reales

### ✅ 4. ChatPage Refactorizado
- **Archivo:** `src/routes/ChatPage.jsx`
- Integración completa con LLM
- Detección automática de departamentos
- Sistema de fallback en caso de error
- Mantiene UI/UX premium existente con logo de Gemini

## 🔧 Configuración Requerida

### 1. Variables de Entorno

El proyecto **ya tiene configurado** el archivo `.env` con la API key. Verificar que contenga:

```env
VITE_OPENAI_API_KEY="AIzaSyDqcCF0Ucg4Ro4D1n0XbBfsAPJ1DVqAcUw"
```

**⚠️ IMPORTANTE:** 
- La variable se llama `VITE_OPENAI_API_KEY` (no cambiar el nombre)
- Debe tener el prefijo `VITE_` para funcionar con Vite
- No commitear este archivo con la API key real en repositorios públicos

### 2. Instalación de Dependencias

```bash
cd v11/atlas-energia
npm install
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

## 🚀 Cómo Usar el Chat IA

### Consultas por Región

El chat detecta automáticamente cuando mencionas un departamento:

```
Usuario: "¿Cuál es el potencial solar de La Guajira?"
Atlas IA: [Analiza datos del departamento y genera respuesta contextualizada]
```

### Ajuste Automático de Tono

El sistema detecta el tipo de consulta y ajusta el lenguaje:

**Consulta Ejecutiva:**
```
"¿Cuál es el ROI de invertir en solar en Antioquia?"
→ Respuesta enfocada en rentabilidad, CAPEX, payback
```

**Consulta Técnica:**
```
"¿Cuál es la radiación promedio en Cesar?"
→ Respuesta con valores técnicos, kWh/m²/día, especificaciones
```

**Consulta Ciudadana:**
```
"¿Me conviene poner paneles solares en mi casa?"
→ Respuesta en lenguaje sencillo con ejemplos cotidianos
```

## 📂 Estructura de Archivos Integrados

```
v11/atlas-energia/
├── .env                                    # ✅ Ya existe con API key
├── src/
│   ├── services/
│   │   ├── llmClient.js                   # ✅ NUEVO - Cliente LLM
│   │   ├── README.md                       # ✅ NUEVO - Documentación técnica
│   │   └── chat/
│   │       ├── userTypeDetector.js        # ✅ NUEVO - Detector de tipo de usuario
│   │       ├── contextBuilder.js          # ✅ NUEVO - Constructor de contexto
│   │       ├── index.js                   # ✅ NUEVO - Exportaciones
│   │       └── energyModelService.js      # ✅ PRESERVADO - Servicio existente
│   └── routes/
│       └── ChatPage.jsx                   # ✅ ACTUALIZADO - Integración LLM
└── CHAT_IA_INTEGRATION.md                 # ✅ NUEVO - Esta documentación
```

## 🔄 Flujo de Funcionamiento

```
1. Usuario escribe mensaje en el chat
   ↓
2. Sistema detecta tipo de usuario (ejecutivo/técnico/ciudadano)
   ↓
3. Sistema busca mención de departamento en el mensaje
   ↓
4. Si hay departamento:
   → Obtiene datos del modelo de clasificación
   → Construye contexto técnico enriquecido
   ↓
5. Construye prompt del sistema con:
   → Instrucciones especializadas en energías renovables
   → Contexto técnico con datos reales
   → Ajuste de tono según tipo de usuario
   ↓
6. Envía consulta a Gemini API
   ↓
7. Recibe y muestra respuesta al usuario

   Si falla la API:
   ↓
   → Muestra datos del modelo como fallback
   → O respuestas predefinidas según el tema
```

## 🛡️ Manejo de Errores

El sistema tiene 3 niveles de fallback:

### Nivel 1: LLM con contexto completo
- Respuesta generada por Gemini con datos del modelo

### Nivel 2: Datos del modelo sin LLM
- Si falla Gemini pero hay datos del departamento
- Muestra estadísticas y recomendaciones basadas en el modelo

### Nivel 3: Respuestas predefinidas
- Si falla todo, respuestas hardcodeadas por tema
- Solar, eólico, híbrido, ZNI, inversión, etc.

## 🎨 Diseño UI/UX Preservado

✅ **Mantenido del diseño original:**
- Logo de Gemini en avatar del bot
- Badge "Powered by Gemini"
- Gradientes azul-púrpura para Gemini
- Sección "Trust-Building" explicando Gemini
- Floating Gemini Badge
- Diseño premium tipo ChatGPT/Claude
- Responsive design completo

✅ **Nuevas funcionalidades integradas:**
- Detección inteligente de tipo de usuario
- Construcción de contexto técnico enriquecido
- Llamadas reales a Gemini API
- Ajuste de tono automático

## 🧪 Pruebas Recomendadas

### Test 1: Consulta de Departamento
```
"¿Cuál es el potencial de Antioquia?"
```
Esperado: Respuesta contextualizada con datos del departamento

### Test 2: Consulta Ejecutiva
```
"¿Cuánto cuesta invertir en energía solar en Cundinamarca y cuál es el ROI?"
```
Esperado: Respuesta con enfoque en costos y retorno de inversión

### Test 3: Consulta Técnica
```
"¿Cuál es la radiación solar promedio en Cesar y la velocidad del viento?"
```
Esperado: Respuesta con valores técnicos detallados

### Test 4: Consulta Ciudadana
```
"¿Me conviene poner paneles solares en mi casa en Bogotá?"
```
Esperado: Respuesta en lenguaje sencillo

### Test 5: Fallback por Error
**Simular:** Desconectar internet o usar API key inválida
```
"¿Potencial de La Guajira?"
```
Esperado: Mensaje de servicio no disponible + datos del modelo

## 📞 Soporte Técnico

### Problemas Comunes

**Error: "API key no configurada"**
- Verificar que existe el archivo `.env` en la raíz
- Confirmar que la variable se llama `VITE_OPENAI_API_KEY`
- Reiniciar el servidor de desarrollo

**Error: "No se pudo conectar con el servicio de IA"**
- Verificar conexión a internet
- Confirmar que la API key es válida
- Revisar consola del navegador

### Documentación Adicional

- **Documentación técnica completa:** `src/services/README.md`
- **Código del cliente LLM:** `src/services/llmClient.js`
- **Documentación de Gemini API:** https://ai.google.dev/docs

## 🎉 Resumen de Cambios

### Archivos Creados (6)
1. `src/services/llmClient.js` - Cliente LLM principal
2. `src/services/chat/userTypeDetector.js` - Detector de tipo de usuario
3. `src/services/chat/contextBuilder.js` - Constructor de contexto
4. `src/services/chat/index.js` - Exportaciones centralizadas
5. `src/services/README.md` - Documentación técnica
6. `CHAT_IA_INTEGRATION.md` - Esta documentación

### Archivos Modificados (1)
1. `src/routes/ChatPage.jsx` - Integración completa con LLM

### Sin Cambios
- ✅ Mapa interactivo
- ✅ Simulador
- ✅ Otras rutas y componentes
- ✅ Modelo de clasificación ML
- ✅ Datos de predicciones
- ✅ Componentes existentes
- ✅ `src/services/chat/energyModelService.js`

---

**Implementación completada el:** 29 de noviembre de 2025  
**Desarrollador:** GitHub Copilot  
**Estado:** ✅ Listo para testing

¡La integración de IA está completa y funcional! 🚀
