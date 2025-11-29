/**
 * CHAT INPUT - INPUT PREMIUM FLOTANTE
 * ===================================
 * 
 * Input profesional tipo ChatGPT con diseño corporativo elegante
 * Tarjeta flotante con sombras suaves y máxima usabilidad
 */

import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ 
  onSendMessage, 
  loading = false, 
  placeholder = "Escribe tu consulta sobre energías renovables en Colombia...",
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  
  // Auto-expansión del textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 180; // Altura máxima más generosa
      
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);
  
  // Manejar envío del mensaje
  const handleSendMessage = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || loading) return;
    
    onSendMessage(trimmedValue);
    setInputValue('');
    
    // Reset altura del textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  // Manejar teclas especiales
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    // Ctrl/Cmd + Enter también envía
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Verificar si puede enviar
  const canSend = inputValue.trim() && !loading;
  
  return (
    <div className={`
      bg-white border-t border-slate-100
      px-6 lg:px-8 py-6
      transition-all duration-300
      ${className}
    `}>
      {/* Container del input - Tarjeta flotante */}
      <div className="max-w-4xl mx-auto">
        <div className={`
          flex items-end space-x-4
          p-4 lg:p-5 rounded-2xl lg:rounded-3xl
          bg-white border-2 transition-all duration-300
          shadow-lg hover:shadow-xl
          ${isFocused 
            ? 'border-[#35D07F]/50 shadow-[#35D07F]/10' 
            : 'border-slate-200 hover:border-slate-300'
          }
        `}>
          {/* Textarea principal */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={loading}
              rows={1}
              className="
                w-full resize-none border-0 outline-none
                text-[#0E1A2B] placeholder-slate-500
                text-base lg:text-lg leading-relaxed
                min-h-[28px] max-h-44
                bg-transparent font-medium
                scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100
              "
              style={{
                lineHeight: '1.6'
              }}
            />
            
            {/* Hint de shortcuts solo cuando está enfocado */}
            {isFocused && (
              <div className="
                text-xs text-slate-400 mt-3
                animate-in fade-in duration-300
                flex items-center space-x-4
              ">
                <span className="inline-flex items-center space-x-1.5">
                  <kbd className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium border border-slate-200">Enter</kbd>
                  <span>enviar</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center space-x-1.5">
                  <kbd className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium border border-slate-200">Shift</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium border border-slate-200">Enter</kbd>
                  <span>nueva línea</span>
                </span>
              </div>
            )}
          </div>
          
          {/* Botón de envío premium */}
          <button
            onClick={handleSendMessage}
            disabled={!canSend}
            className={`
              w-12 h-12 lg:w-14 lg:h-14
              rounded-xl lg:rounded-2xl flex items-center justify-center
              transition-all duration-300 transform
              flex-shrink-0 font-semibold
              border-2
              ${canSend
                ? 'bg-gradient-to-r from-[#35D07F] to-emerald-500 hover:from-[#35D07F]/90 hover:to-emerald-500/90 text-white border-transparent shadow-lg shadow-[#35D07F]/25 hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-[#35D07F]/30'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
              }
            `}
          >
            {loading ? (
              <div className="w-6 h-6 lg:w-7 lg:h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg 
                className="w-6 h-6 lg:w-7 lg:h-7" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                />
              </svg>
            )}
          </button>
        </div>
        
        {/* Contador de caracteres discreto */}
        {inputValue.length > 800 && (
          <div className="text-xs text-slate-400 mt-3 text-right">
            {inputValue.length}/2000 caracteres
          </div>
        )}
        
        {/* Indicador de estado cuando está cargando */}
        {loading && (
          <div className="text-xs text-[#35D07F] mt-3 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#35D07F] rounded-full animate-pulse mr-2"></div>
            Atlas IA está procesando tu consulta...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;