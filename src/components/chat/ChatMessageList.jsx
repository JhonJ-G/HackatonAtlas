/**
 * CHAT MESSAGE LIST - CONTENEDOR DE MENSAJES PREMIUM
 * ==================================================
 * 
 * Lista de mensajes con diseño premium, scroll suave y máxima legibilidad
 * Fondo azul corporativo con contraste perfecto
 */

import React, { useEffect, useRef } from 'react';
import ChatMessageBubble from './ChatMessageBubble';
import ChatLoadingBubble from './ChatLoadingBubble';

const ChatMessageList = ({ messages, loading, className = '' }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  
  // Auto-scroll hacia el último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };
  
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 150);
    return () => clearTimeout(timer);
  }, [messages, loading]);
  
  return (
    <div 
      ref={containerRef}
      className={`
        h-[500px] lg:h-[600px] overflow-y-auto
        bg-gradient-to-b from-[#0E1A2B] via-[#1A2634] to-[#0E1A2B]
        px-6 lg:px-8 py-8
        scrollbar-thin scrollbar-thumb-slate-400/30 scrollbar-track-transparent
        ${className}
      `}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(148, 163, 184, 0.3) transparent'
      }}
    >
      {/* Contenedor de mensajes */}
      <div className="space-y-6 lg:space-y-8">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className="
              animate-in slide-in-from-bottom-4 
              fade-in duration-600
            "
            style={{
              animationDelay: `${Math.min(index * 120, 600)}ms`,
              animationFillMode: 'both'
            }}
          >
            <ChatMessageBubble 
              message={message}
              isFirst={index === 0}
              isLast={index === messages.length - 1}
            />
          </div>
        ))}
        
        {/* Bubble de carga */}
        {loading && (
          <div className="
            animate-in slide-in-from-bottom-4 
            fade-in duration-400
          ">
            <ChatLoadingBubble />
          </div>
        )}
        
        {/* Espaciador para scroll suave */}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
};

export default ChatMessageList;