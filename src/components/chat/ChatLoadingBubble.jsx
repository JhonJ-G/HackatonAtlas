/**
 * CHAT LOADING BUBBLE - INDICADOR DE CARGA PREMIUM
 * ================================================
 * 
 * Indicador de carga elegante con diseño corporativo
 * Animaciones suaves y tipografía profesional
 */

import React from 'react';

const ChatLoadingBubble = () => {
  return (
    <div className="flex justify-start">
      <div className="flex items-start space-x-3 lg:space-x-4">
        {/* Avatar del bot con animación */}
        <div className="
          w-10 h-10 lg:w-12 lg:h-12 rounded-full
          bg-gradient-to-br from-[#35D07F] to-emerald-600
          flex items-center justify-center
          flex-shrink-0 mt-1
          shadow-lg shadow-emerald-500/25
          animate-pulse
          border-2 border-white/20
        ">
          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        
        {/* Burbuja de carga premium */}
        <div className="
          max-w-xs lg:max-w-sm
          px-5 lg:px-6 py-4 lg:py-5 rounded-2xl lg:rounded-3xl
          bg-[#0E1A2B] text-white
          border border-slate-600/30
          shadow-lg shadow-slate-900/30
          flex items-center space-x-3
        ">
          {/* Tres puntos animados más elegantes */}
          <div className="flex space-x-1.5">
            <div 
              className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-white/80 rounded-full animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
            ></div>
            <div 
              className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-white/80 rounded-full animate-bounce"
              style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
            ></div>
            <div 
              className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-white/80 rounded-full animate-bounce"
              style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
            ></div>
          </div>
          
          {/* Texto de estado profesional */}
          <span className="text-sm lg:text-base text-white/90 font-medium animate-pulse">
            Procesando consulta...
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatLoadingBubble;