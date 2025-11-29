/**
 * ATLAS IA - CHAT PAGE PREMIUM REDESIGN
 * =====================================
 * 
 * Chat profesional con diseño premium tipo ChatGPT/Claude
 * Layout optimizado para móvil y desktop con máxima usabilidad
 * Powered by Gemini - Destacando la integración con el modelo LLM
 * 
 * @version 3.2 - Integración completa con LLM + Gemini UI/UX
 * @author Atlas Energético
 */

import React, { useState, useRef, useEffect } from 'react';
import { getDepartmentData, getDepartmentRecommendation } from '../data/predictions-by-region';
import { askEnergyLLM, buildSystemPrompt } from '../services/llmClient';
import { detectUserType } from '../services/chat/userTypeDetector';
import { buildDepartmentContext, buildGeneralContext } from '../services/chat/contextBuilder';
import logoGemini from '../img/logogemini.png';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `👋 ¡Hola! Soy Atlas IA, tu asistente especializado en energías renovables para Colombia.

Estoy potenciado por **Gemini**, un modelo de inteligencia artificial avanzada de Google, entrenado para comprender contexto, datos energéticos y consultas técnicas.

Puedo ayudarte con:
• Análisis de potencial solar, eólico e híbrido por región  
• Recomendaciones de inversión y priorización de proyectos  
• Exploración de zonas no interconectadas (ZNI)  
• Explicaciones técnicas y escenarios comparativos

¿Sobre qué región, tecnología o tipo de proyecto quieres que empecemos?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewConversation = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        text: `👋 ¡Hola! Soy Atlas IA, tu asistente especializado en energías renovables para Colombia.

Estoy potenciado por **Gemini**, un modelo de inteligencia artificial avanzada de Google, entrenado para comprender contexto, datos energéticos y consultas técnicas.

Puedo ayudarte con:
• Análisis de potencial solar, eólico e híbrido por región  
• Recomendaciones de inversión y priorización de proyectos  
• Exploración de zonas no interconectadas (ZNI)  
• Explicaciones técnicas y escenarios comparativos

¿Sobre qué región, tecnología o tipo de proyecto quieres que empecemos?`,
        timestamp: new Date()
      }
    ]);
    setInputValue('');
    setLoading(false);
  };

  /**
   * Generar respuesta usando LLM con contexto técnico
   * Incluye detección de departamento, construcción de contexto y ajuste de tono
   */
  /**
   * Generar respuesta usando LLM con contexto técnico
   * Incluye detección de departamento, construcción de contexto y ajuste de tono
   */
  const generateResponse = async (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // ========================================
    // 1. DETECCIÓN DE DEPARTAMENTO
    // ========================================
    const departmentQueries = [
      'antioquia', 'cundinamarca', 'valle', 'santander', 'atlantico', 'bolivar',
      'boyaca', 'caldas', 'cauca', 'cesar', 'cordoba', 'huila', 'magdalena',
      'meta', 'nariño', 'quindio', 'risaralda', 'sucre', 'tolima', 'la guajira',
      'guaviare', 'vaupes', 'vichada', 'guainia', 'amazonas', 'putumayo',
      'casanare', 'caqueta', 'choco', 'arauca', 'norte de santander', 'bogota'
    ];
    
    const mentionedDept = departmentQueries.find(dept => message.includes(dept));
    
    // ========================================
    // 2. DETECCIÓN DE TIPO DE USUARIO
    // ========================================
    const userType = detectUserType(userMessage);
    console.log(`[ChatPage] Tipo de usuario detectado: ${userType}`);
    
    // ========================================
    // 3. CONSTRUCCIÓN DE CONTEXTO TÉCNICO
    // ========================================
    let technicalContext = '';
    let deptData = null;
    let recommendation = '';
    
    if (mentionedDept) {
      // Consulta específica de departamento
      try {
        const normalizedDept = mentionedDept.toUpperCase();
        deptData = await getDepartmentData(normalizedDept);
        recommendation = await getDepartmentRecommendation(normalizedDept);
        
        if (deptData) {
          // Construir contexto técnico enriquecido
          technicalContext = buildDepartmentContext(deptData, normalizedDept);
        } else {
          technicalContext = `Departamento consultado: ${normalizedDept}\nNo se encontraron datos en el modelo.`;
        }
      } catch (error) {
        console.error('Error obteniendo datos del departamento:', error);
        technicalContext = `Error al obtener datos del departamento ${mentionedDept}`;
      }
    } else {
      // Consulta general sobre energías renovables
      technicalContext = buildGeneralContext(userMessage);
    }
    
    // ========================================
    // 4. LLAMADA AL LLM CON CONTEXTO
    // ========================================
    try {
      // Construir system prompt con tono ajustado
      const systemPrompt = buildSystemPrompt(userType, technicalContext);
      
      // Preparar mensajes para el LLM
      const llmMessages = [
        {
          role: 'user',
          text: userMessage
        }
      ];
      
      // Llamar al LLM
      const llmResponse = await askEnergyLLM({
        messages: llmMessages,
        systemPrompt: systemPrompt
      });
      
      return llmResponse;
      
    } catch (error) {
      console.error('Error en llamada al LLM:', error);
      
      // ========================================
      // 5. FALLBACK: Respuesta tradicional
      // ========================================
      if (mentionedDept && deptData) {
        // Usar datos del modelo como fallback
        return `⚠️ **En este momento no puedo conectar con el modelo de IA.** Te comparto una recomendación basada en los datos de nuestro modelo:

📍 **${deptData.departamento}**

🔋 **Potencial Energético:**
• Solar: ${(deptData.solar_pct * 100).toFixed(1)}%
• Eólico: ${(deptData.eolica_pct * 100).toFixed(1)}%
• Híbrido: ${(deptData.hibrida_pct * 100).toFixed(1)}%

⭐ **Dominante:** ${deptData.dominant_class.toUpperCase()}
📊 **Municipios analizados:** ${deptData.num_municipios}
${deptData.zni_pct > 0.5 ? '⚠️ **ZNI:** Zona No Interconectada dominante\n' : ''}

**💡 Recomendación:**
${recommendation}`;
      }
      
      // Fallback genérico si no hay departamento
      return getGenericFallbackResponse(message);
    }
  };
  
  /**
   * Respuestas genéricas de fallback cuando falla el LLM
   * Mantiene las respuestas hardcodeadas originales
   */
  const getGenericFallbackResponse = (message) => {
    // Consultas generales sobre tipos de energía
    if (message.includes('solar') || message.includes('fotovoltaic')) {
      return `⚠️ **Servicio de IA temporalmente no disponible**

☀️ **Energía Solar en Colombia**

Los **departamentos con mayor potencial solar** según nuestro modelo:
• La Guajira (85% de municipios)
• Atlántico (78% de municipios)
• Magdalena (76% de municipios)
• Cesar (74% de municipios)

**Factores clave:**
• Radiación solar promedio: 4.5-5.5 kWh/m²/día
• Menor nubosidad en la Costa Caribe
• Temperatura estable 25-30°C

**Recomendaciones:**
• Ideal para autoconsumo industrial
• ROI típico: 6-8 años
• Complementar con almacenamiento en ZNI

¿Te interesa alguna región específica?`;
    }
    
    if (message.includes('eolic') || message.includes('viento')) {
      return `⚠️ **Servicio de IA temporalmente no disponible**

💨 **Energía Eólica en Colombia**

**Región destacada:**
• **La Guajira**: Potencial eólico excepcional (90% de municipios)
• Vientos constantes del Caribe
• Proyectos como Jepírachi ya operativos

**Características técnicas:**
• Velocidades: 7-12 m/s promedio
• Factor de capacidad: 35-45%
• Ideal para gran escala (>50 MW)

**Consideraciones:**
• Requiere estudios de viento detallados
• Inversión inicial alta pero rentable a largo plazo
• Excelente para complementar solar

¿Quieres información específica de alguna región?`;
    }
    
    if (message.includes('hibrido') || message.includes('mixto') || message.includes('combinado')) {
      return `⚠️ **Servicio de IA temporalmente no disponible**

⚡ **Sistemas Híbridos Solar-Eólico**

**Ventajas:**
• Mayor estabilidad en generación
• Aprovecha complementariedad día/noche
• Reduce necesidad de almacenamiento
• Ideal para ZNI

**Regiones recomendadas:**
• **Atlántico**: Balance solar-eólico
• **Magdalena**: Potencial mixto costero
• **Cesar**: Condiciones favorables ambas tecnologías

**Aplicaciones ideales:**
• Sistemas aislados en ZNI
• Microgrids industriales
• Electrificación rural

¿Necesitas una evaluación específica para tu proyecto?`;
    }
    
    if (message.includes('inversion') || message.includes('roi') || message.includes('economic')) {
      return `⚠️ **Servicio de IA temporalmente no disponible**

💰 **Análisis de Inversión en Renovables**

**Factores económicos clave:**
• **Solar**: CAPEX 800-1,200 USD/kW
• **Eólico**: CAPEX 1,200-1,800 USD/kW
• **Híbrido**: CAPEX 1,000-1,500 USD/kW

**ROI promedio en Colombia:**
• Solar residencial: 6-8 años
• Solar comercial: 4-6 años
• Eólico gran escala: 7-10 años

**Incentivos disponibles:**
• Deducción de renta hasta 50%
• Exclusión IVA para equipos
• Depreciación acelerada

Usa nuestro **Simulador** para análisis detallado de tu proyecto específico.`;
    }
    
    if (message.includes('zni') || message.includes('interconectad')) {
      return `⚠️ **Servicio de IA temporalmente no disponible**

🔌 **Zonas No Interconectadas (ZNI)**

**Departamentos con mayor % ZNI:**
• Amazonas, Guainía, Vaupés, Vichada
• Chocó, Putumayo
• Partes de La Guajira

**Oportunidades específicas:**
• Sistemas autónomos solares
• Microgrids híbridos
• Almacenamiento con baterías
• Reemplazo de plantas diesel

**Consideraciones técnicas:**
• Diseño para autoconsumo 100%
• Respaldo con generadores
• Mantenimiento remoto
• Capacitación local

¿Tienes un proyecto específico en ZNI?`;
    }
    
    if (message.includes('como') || message.includes('empezar') || message.includes('iniciar')) {
      return `⚠️ **Servicio de IA temporalmente no disponible**

🚀 **Cómo empezar tu proyecto renovable:**

**1. Análisis de ubicación**
• Usa nuestro **Mapa Interactivo** para identificar potencial
• Revisa clasificación del modelo IA para tu municipio

**2. Evaluación técnica**
• Utiliza el **Simulador** para análisis económico
• Define capacidad requerida (kW)
• Considera tipo de sistema (solar/eólico/híbrido)

**3. Estudios detallados**
• Medición de recurso in-situ (1 año)
• Estudio de suelos y acceso
• Evaluación de conexión a red

**4. Financiación y permisos**
• Solicitud de incentivos tributarios
• Licencias ambientales si aplica
• Financiamiento bancario o leasing

¿En qué etapa estás actualmente?`;
    }
    
    // Respuesta por defecto
    const responses = [
      `⚠️ **Servicio de IA temporalmente no disponible**

Me especializo en energías renovables para Colombia. Puedo ayudarte con:

🗺️ **Consultas por región**: "¿Cuál es el potencial de Antioquia?"
☀️ **Energía solar**: Radiación, tecnologías, ROI
💨 **Energía eólica**: Recursos, ubicaciones, proyectos
⚡ **Sistemas híbridos**: Combinaciones solar-eólico
💰 **Análisis económico**: Inversión, incentivos, retorno
🔌 **Zonas ZNI**: Soluciones para áreas no interconectadas

También puedes usar nuestras herramientas:
• **Mapa Interactivo** para explorar regiones
• **Simulador** para análisis de viabilidad

¿Sobre qué tema específico te gustaría saber más?`,

      `⚠️ **Servicio de IA temporalmente no disponible**

¡Perfecto! Estoy aquí para resolver tus dudas sobre energías renovables en Colombia.

**Preguntas frecuentes que manejo:**
• "¿Qué departamento tiene mejor potencial solar?"
• "¿Conviene invertir en eólica en [departamento]?"
• "¿Cuánto tiempo tarda en pagarse un sistema solar?"
• "¿Qué opciones hay para zonas no interconectadas?"
• "¿Cómo empiezo un proyecto de energía renovable?"

También tengo acceso a datos reales de 1,122 municipios procesados por nuestro modelo de IA.

¿Cuál es tu consulta específica?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;
    
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    
    try {
      // Generar respuesta usando LLM con contexto técnico
      const response = await generateResponse(userMessage.text);
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error en handleSendMessage:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: '⚠️ Disculpa, hubo un error procesando tu consulta. Por favor intenta de nuevo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (text) => {
    // Convertir markdown básico a HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };
  
  // ===============================
  // RENDER PRINCIPAL PREMIUM
  // ===============================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container-width section-padding">
        
        {/* Header Compacto del Chat */}
        <div className="mb-6 lg:mb-8">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-white/20">
            {/* Título Principal */}
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-[#35D07F] to-emerald-500 flex items-center justify-center shadow-lg mr-3">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#0E1A2B] tracking-tight">
                Atlas IA
                <span className="text-[#35D07F] ml-2">– Asistente Energético</span>
              </h1>
            </div>
            
            {/* Subtítulo */}
            <p className="text-base lg:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-4">
              Consulta inteligente basada en datos reales sobre el potencial energético de Colombia
            </p>
            
            {/* Badge de Estado */}
            <div className="inline-flex items-center bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <div className="w-2 h-2 bg-[#35D07F] rounded-full animate-pulse mr-2"></div>
              <span className="text-slate-700 text-sm font-medium">Sistema Activo • 1,122 municipios analizados</span>
            </div>
          </div>
        </div>

        {/* Tarjeta Principal del Chat */}
        <div className="max-w-[1000px] mx-auto">
          <div className="bg-white rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60">
            
            {/* Header Interno del Chat */}
            <div className="bg-white border-b border-slate-100 px-4 lg:px-6 py-4 lg:py-5">
              <div className="flex items-center justify-between">
                {/* Info del Asistente */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white">
                    <img 
                      src={logoGemini} 
                      alt="Gemini AI" 
                      className="w-6 h-6 lg:w-7 lg:h-7 object-contain filter brightness-0 invert"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg lg:text-xl font-bold text-[#0E1A2B]">Atlas IA</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                        <img 
                          src={logoGemini} 
                          alt="Gemini" 
                          className="w-3 h-3 object-contain"
                        />
                        Powered by Gemini
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-[#35D07F] rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-500">En línea • {messages.length} mensajes</span>
                    </div>
                  </div>
                </div>
                
                {/* Botón Nueva Conversación */}
                <button
                  onClick={() => {
                    setMessages([
                      {
                        id: 1,
                        type: 'bot',
                        text: '👋 ¡Hola! Soy tu asistente especializado en energías renovables para Colombia. Puedo ayudarte con consultas sobre potencial energético por región, recomendaciones de inversión y análisis técnico. ¿En qué te puedo ayudar?',
                        timestamp: new Date()
                      }
                    ]);
                    setInputValue('');
                    setLoading(false);
                  }}
                  className="px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-all duration-200 text-sm font-semibold flex items-center space-x-2 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="hidden sm:inline">Nueva conversación</span>
                </button>
              </div>
            </div>

            {/* Área de Mensajes */}
            <div className="min-h-[300px] max-h-[55vh] lg:max-h-[60vh] overflow-y-auto bg-gradient-to-b from-[#0E1A2B] via-[#1A2634] to-[#0E1A2B] scrollbar-thin scrollbar-thumb-slate-400/30 scrollbar-track-transparent">
              <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex animate-in slide-in-from-bottom-4 fade-in duration-500 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className="flex items-start space-x-3 max-w-[85%] lg:max-w-[75%]">
                      {/* Avatar para mensajes bot */}
                      {message.type === 'bot' && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/10 border border-white/10 shadow-inner flex items-center justify-center overflow-hidden">
                            <img 
                              src={logoGemini} 
                              alt="Gemini logo" 
                              className="w-5 h-5 lg:w-6 lg:h-6 object-contain"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col space-y-1">
                        {/* Burbuja del mensaje */}
                        <div
                          className={`px-4 lg:px-5 py-3 lg:py-4 rounded-2xl lg:rounded-3xl shadow-lg transition-all duration-300 hover:shadow-xl border ${
                            message.type === 'user'
                              ? 'bg-white text-[#0E1A2B] border-slate-200 ml-auto shadow-slate-200/50'
                              : 'bg-slate-800 text-white border-slate-600/30 shadow-slate-900/30'
                          }`}
                        >
                          {message.type === 'bot' ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: formatMessage(message.text)
                              }}
                              className="text-sm lg:text-base leading-relaxed prose prose-sm max-w-none prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-white prose-ul:text-white prose-li:text-white"
                            />
                          ) : (
                            <p className="text-sm lg:text-base leading-relaxed font-medium">{message.text}</p>
                          )}
                        </div>
                        
                        {/* Timestamp */}
                        <div className={`text-xs px-2 ${
                          message.type === 'user' ? 'text-slate-400 text-right' : 'text-slate-300'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      
                      {/* Avatar para mensajes usuario */}
                      {message.type === 'user' && (
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border-2 border-white/20">
                          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/10 border border-white/10 shadow-inner flex items-center justify-center overflow-hidden animate-pulse">
                          <img 
                            src={logoGemini} 
                            alt="Gemini logo" 
                            className="w-5 h-5 lg:w-6 lg:h-6 object-contain"
                          />
                        </div>
                      </div>
                      <div className="px-4 lg:px-5 py-3 lg:py-4 rounded-2xl lg:rounded-3xl bg-slate-800 border border-slate-600/30 shadow-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></div>
                            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}></div>
                            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}></div>
                          </div>
                          <span className="text-sm lg:text-base text-white/90 font-medium">Procesando consulta...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Preguntas Sugeridas */}
            {messages.length <= 1 && !loading && (
              <div className="bg-slate-50 border-t border-slate-100 p-4 lg:p-6">
                <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-[#35D07F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  💡 Preguntas sugeridas
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {[
                    { text: '¿Potencial solar en La Guajira?', icon: '☀️' },
                    { text: 'Sistemas híbridos en el Caribe', icon: '⚡' },
                    { text: 'Análisis económico por departamento', icon: '💰' },
                    { text: 'Zonas no interconectadas (ZNI)', icon: '🔌' }
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(suggestion.text)}
                      disabled={loading}
                      className="flex items-center space-x-3 p-3 lg:p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl lg:rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-[#35D07F]/10 to-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg lg:text-xl">{suggestion.icon}</span>
                      </div>
                      <span className="text-slate-900 font-medium text-sm lg:text-base leading-relaxed flex-1">{suggestion.text}</span>
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Área de Input */}
            <div className="p-4 lg:p-6 bg-white border-t border-slate-100">
              <div className="flex items-end space-x-3 lg:space-x-4 p-3 lg:p-4 bg-white border-2 border-slate-200 hover:border-slate-300 focus-within:border-[#35D07F]/50 rounded-2xl lg:rounded-3xl shadow-sm hover:shadow-md focus-within:shadow-lg transition-all duration-300">
                {/* Textarea */}
                <div className="flex-1 min-w-0">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu consulta sobre energías renovables en Colombia..."
                    className="w-full resize-none border-0 outline-none text-[#0E1A2B] placeholder-slate-500 text-base lg:text-lg leading-relaxed min-h-[28px] max-h-32 bg-transparent font-medium scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
                    rows={1}
                    disabled={loading}
                    style={{ lineHeight: '1.6' }}
                  />
                </div>
                
                {/* Botón Enviar */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || loading}
                  className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-300 transform flex-shrink-0 border-2 ${
                    inputValue.trim() && !loading
                      ? 'bg-gradient-to-r from-[#35D07F] to-emerald-500 hover:from-[#35D07F]/90 hover:to-emerald-500/90 text-white border-transparent shadow-lg shadow-[#35D07F]/25 hover:scale-105 active:scale-95 hover:shadow-xl'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                  }`}
                >
                  {loading ? (
                    <div className="w-6 h-6 lg:w-7 lg:h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Hints de uso */}
              <div className="text-xs text-slate-400 mt-3 flex items-center justify-center space-x-4">
                <span className="inline-flex items-center space-x-1.5">
                  <kbd className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium border border-slate-200">Enter</kbd>
                  <span>enviar</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center space-x-1.5">
                  <kbd className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium border border-slate-200">Shift + Enter</kbd>
                  <span>nueva línea</span>
                </span>
              </div>
              
              {/* Estado de carga */}
              {loading && (
                <div className="text-xs text-[#35D07F] mt-3 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#35D07F] rounded-full animate-pulse mr-2"></div>
                  Atlas IA está procesando tu consulta...
                </div>
              )}
            </div>
            
          </div>
          
          {/* Floating Gemini Badge */}
          <div className="fixed bottom-8 right-8 z-50">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
              <img 
                src={logoGemini} 
                alt="Gemini" 
                className="w-4 h-4 object-contain filter brightness-0 invert"
              />
              <span className="text-sm font-medium">Gemini Inside</span>
            </div>
          </div>
        </div>
        
        {/* Trust-Building Section */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 max-w-4xl mx-auto border border-blue-100">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src={logoGemini} 
                alt="Gemini AI" 
                className="w-8 h-8 object-contain"
              />
              <h3 className="text-lg font-bold text-gray-800">Potenciado por Gemini AI</h3>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-4">
              Este chat utiliza <strong>Gemini</strong>, el modelo de inteligencia artificial más avanzado de Google, 
              especializado en comprensión contextual y análisis de datos complejos. Nuestra integración te garantiza 
              respuestas precisas, actualizadas y contextualmente relevantes para el sector energético colombiano.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Análisis en tiempo real</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-purple-700">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Contexto especializado</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Datos verificados</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;