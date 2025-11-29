/**
 * CHAT MESSAGE BUBBLE - BURBUJAS PREMIUM TIPO CHATGPT
 * ===================================================
 * 
 * Burbujas de mensaje con máxima legibilidad y contraste profesional
 * Diseño corporativo elegante con tipografía clara
 */

import React from 'react';
import { formatMessageText } from '../../services/chat/energyModelService';

const ChatMessageBubble = ({ message, isFirst = false, isLast = false }) => {
  const isBot = message.type === 'bot';
  const isUser = message.type === 'user';
  const isError = message.type === 'error';
  const isWarning = message.type === 'warning';
  const isSuccess = message.type === 'success';
  
  // Obtener avatar apropiado
  const getAvatar = () => {
    if (isBot) {
      return (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  };
  
  // Obtener estilos de burbuja premium
  const getBubbleStyles = () => {
    const baseStyles = `
      max-w-lg lg:max-w-2xl
      px-5 lg:px-6 py-4 lg:py-5 rounded-2xl lg:rounded-3xl
      shadow-lg transition-all duration-300
      hover:shadow-xl transform hover:scale-[1.01]
      border
    `;
    
    if (isUser) {
      return `${baseStyles}
        bg-white text-[#0E1A2B]
        border-slate-200 hover:border-slate-300
        shadow-slate-200/50 hover:shadow-slate-300/60
        ml-auto
      `;
    }
    
    if (isError) {
      return `${baseStyles}
        bg-red-50 text-red-900
        border-red-200
        shadow-red-200/50
      `;
    }
    
    if (isWarning) {
      return `${baseStyles}
        bg-amber-50 text-amber-900
        border-amber-200
        shadow-amber-200/50
      `;
    }
    
    if (isSuccess) {
      return `${baseStyles}
        bg-emerald-50 text-emerald-900
        border-emerald-200
        shadow-emerald-200/50
      `;
    }
    
    // Bot message (default) - Azul corporativo con contraste máximo
    return `${baseStyles}
      bg-[#0E1A2B] text-white
      border-slate-600/30
      shadow-slate-900/30 hover:shadow-slate-900/40
    `;
  };
  
  // Formatear timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className="flex items-start space-x-3 lg:space-x-4 max-w-full">
        {/* Avatar para mensajes bot */}
        {!isUser && (
          <div className="
            w-10 h-10 lg:w-12 lg:h-12 rounded-full
            bg-gradient-to-br from-[#35D07F] to-emerald-600
            flex items-center justify-center
            flex-shrink-0 mt-1
            shadow-lg shadow-emerald-500/25
            transition-transform duration-300
            group-hover:scale-110
            border-2 border-white/20
          ">
            {getAvatar()}
          </div>
        )}
        
        {/* Contenido del mensaje */}
        <div className="flex flex-col space-y-2">
          {/* Burbuja del mensaje */}
          <div className={getBubbleStyles()}>
            {/* Contenido del texto con tipografía premium */}
            {isBot || isError || isWarning || isSuccess ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: formatMessageText(message.text)
                }}
                className="
                  text-sm lg:text-base leading-relaxed
                  prose prose-sm lg:prose-base max-w-none
                  prose-headings:font-bold prose-headings:text-inherit
                  prose-p:text-inherit prose-strong:text-inherit prose-em:text-inherit
                  prose-ul:text-inherit prose-li:text-inherit
                "
                style={{
                  color: 'inherit'
                }}
              />
            ) : (
              <p className="text-sm lg:text-base leading-relaxed font-medium">
                {message.text}
              </p>
            )}
          </div>
          
          {/* Timestamp discreto */}
          <div className={`
            text-xs opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            ${isUser ? 'text-right text-slate-400' : 'text-left text-slate-300'}
            px-2
          `}>
            {formatTimestamp(message.timestamp)}
            {message.isWelcome && (
              <span className="ml-2 bg-[#35D07F]/20 text-[#35D07F] px-2 py-1 rounded-md text-xs font-medium">
                Mensaje inicial
              </span>
            )}
          </div>
        </div>
        
        {/* Avatar para mensajes usuario */}
        {isUser && (
          <div className="
            w-10 h-10 lg:w-12 lg:h-12 rounded-full
            bg-gradient-to-br from-slate-600 to-slate-700
            flex items-center justify-center
            flex-shrink-0 mt-1
            shadow-lg shadow-slate-500/25
            transition-transform duration-300
            group-hover:scale-110
            border-2 border-white/20
          ">
            {getAvatar()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;