/**
 * CHAT HEADER - CABECERA INTERNA PREMIUM
 * ======================================
 * 
 * Header interno del chat con diseño corporativo elegante
 * Avatar profesional, información clara y controles intuitivos
 */

import React from 'react';
import { ASSISTANT_CONFIG } from '../../services/chat/energyModelService';

const ChatHeader = ({ onNewConversation, messageCount = 0 }) => {
  return (
    <div className="
      bg-white border-b border-slate-100
      px-6 lg:px-8 py-6
      transition-all duration-300
    ">
      <div className="flex items-center justify-between">
        {/* Información del Asistente */}
        <div className="flex items-center space-x-4">
          {/* Avatar Corporativo */}
          <div className="
            w-14 h-14 rounded-full
            bg-gradient-to-br from-[#35D07F] to-emerald-600
            flex items-center justify-center
            shadow-lg shadow-emerald-500/25
            transition-transform duration-300 hover:scale-105
            border-2 border-white
          ">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          
          {/* Información Textual */}
          <div>
            <h2 className="text-xl font-bold text-[#0E1A2B]">
              {ASSISTANT_CONFIG.name}
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Asistente especializado en análisis energético
            </p>
            
            {/* Estado y Métricas */}
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#35D07F] rounded-full animate-pulse" />
                <span className="text-xs text-slate-500 font-medium">En línea</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span className="text-xs text-slate-500">
                {messageCount} mensajes
              </span>
            </div>
          </div>
        </div>
        
        {/* Botón Nueva Conversación */}
        <button
          onClick={onNewConversation}
          className="
            px-5 py-2.5 rounded-xl
            bg-slate-50 hover:bg-slate-100
            border border-slate-200 hover:border-slate-300
            text-slate-700 hover:text-slate-900
            transition-all duration-200
            text-sm font-semibold
            flex items-center space-x-2
            shadow-sm hover:shadow-md
            transform hover:scale-[1.02] active:scale-[0.98]
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Nueva conversación</span>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;