/**
 * CHAT LAYOUT - CONTENEDOR PRINCIPAL PREMIUM
 * =========================================== 
 * 
 * Layout corporativo elegante con hero compacto y chat card elevado
 * Diseño tipo dashboard premium con máxima legibilidad
 * 
 * @version 3.0 - Rediseño Premium
 * @author Atlas Energético
 */

import React from 'react';

const ChatLayout = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section Premium - Sticky Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-[#0E1A2B] to-[#123045] shadow-xl border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center">
            {/* Icono y Título Principal */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#35D07F] to-emerald-500 flex items-center justify-center shadow-lg mr-4">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Atlas IA
                <span className="text-[#35D07F] ml-2">– Asistente Energético</span>
              </h1>
            </div>
            
            {/* Subtítulo Profesional */}
            <p className="text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed">
              Consulta inteligente basada en datos reales sobre el potencial energético de Colombia
            </p>
            
            {/* Badge de Estado */}
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <div className="w-2 h-2 bg-[#35D07F] rounded-full animate-pulse mr-2"></div>
                <span className="text-white text-sm font-medium">Sistema Activo • 1,122 Municipios Analizados</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenedor Principal del Chat */}
      <div className="relative -mt-6 pb-8">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Chat Card Premium */}
          <div className={`
            bg-white rounded-[24px] overflow-hidden
            shadow-2xl shadow-slate-900/10
            border border-slate-200/60
            transition-all duration-500 hover:shadow-3xl hover:shadow-slate-900/15
            backdrop-blur-sm
            ${className}
          `}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;