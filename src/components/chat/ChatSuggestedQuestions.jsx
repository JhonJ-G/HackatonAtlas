/**
 * CHAT SUGGESTED QUESTIONS - CHIPS PROFESIONALES TIPO DASHBOARD
 * =============================================================
 * 
 * Chips elegantes con máxima legibilidad y diseño corporativo
 * Botones de acción profesionales con iconografía clara
 */

import React from 'react';
import { SUGGESTED_QUESTIONS } from '../../services/chat/energyModelService';

const ChatSuggestedQuestions = ({ 
  onQuestionClick, 
  className = '',
  showAll = false 
}) => {
  // Mostrar solo algunas preguntas por defecto
  const questionsToShow = showAll 
    ? SUGGESTED_QUESTIONS 
    : SUGGESTED_QUESTIONS.slice(0, 4);
  
  return (
    <div className={`
      bg-slate-50 border-t border-slate-100
      px-6 lg:px-8 py-6
      ${className}
    `}>
      {/* Título profesional */}
      <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
        <svg className="w-4 h-4 mr-2 text-[#35D07F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Preguntas sugeridas
      </div>
      
      {/* Grid responsivo de chips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        {questionsToShow.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(suggestion.text)}
            className="
              group
              px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl
              bg-white hover:bg-slate-50
              border border-slate-200 hover:border-slate-300
              text-left text-[#0E1A2B]
              transition-all duration-200
              text-sm lg:text-base leading-relaxed font-medium
              shadow-sm hover:shadow-md
              transform hover:scale-[1.02] active:scale-[0.98]
              flex items-start space-x-3 lg:space-x-4
            "
          >
            {/* Icono profesional */}
            <div className="
              w-8 h-8 lg:w-10 lg:h-10 rounded-lg
              bg-gradient-to-br from-[#35D07F]/10 to-emerald-500/10
              flex items-center justify-center
              flex-shrink-0 mt-0.5
              group-hover:from-[#35D07F]/20 group-hover:to-emerald-500/20
              transition-all duration-200
            ">
              <span className="text-lg lg:text-xl group-hover:scale-110 transition-transform duration-200">
                {suggestion.icon}
              </span>
            </div>
            
            {/* Contenido del texto */}
            <div className="flex-1 text-left">
              <span className="block text-slate-900 group-hover:text-[#0E1A2B] font-medium leading-relaxed">
                {suggestion.text}
              </span>
              
              {/* Categoría como badge sutil */}
              <div className="mt-2">
                <span className="
                  inline-block px-2.5 py-1 rounded-md
                  bg-slate-100 group-hover:bg-slate-200
                  text-xs font-medium text-slate-600 group-hover:text-slate-700
                  transition-all duration-200
                  capitalize
                ">
                  {suggestion.category.replace('-', ' ')}
                </span>
              </div>
            </div>
            
            {/* Flecha sutil */}
            <div className="flex-shrink-0 mt-1">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400 group-hover:text-[#35D07F] transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
      
      {/* Botón mostrar más (si no se muestran todas) */}
      {!showAll && SUGGESTED_QUESTIONS.length > 4 && (
        <div className="mt-4 text-center">
          <button className="
            text-sm font-medium text-slate-600 hover:text-[#35D07F]
            border-b border-dotted border-slate-300 hover:border-[#35D07F]
            transition-all duration-200
            pb-0.5
          ">
            Ver más preguntas sugeridas
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatSuggestedQuestions;