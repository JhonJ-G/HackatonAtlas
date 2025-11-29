import React from 'react';
import SectionTitle from '../common/SectionTitle';

const BenefitsSection = () => {
  const benefits = [
    {
      id: 1,
      title: 'Predicciones precisas con IA',
      description: 'Modelo de clasificación multiclase entrenado con variables geográficas y climáticas para predicciones altamente precisas.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'from-accent-green to-emerald-400',
    },
    {
      id: 2,
      title: 'Mapa interactivo por departamentos',
      description: 'Explora el potencial energético de cada región de Colombia con visualizaciones dinámicas y datos actualizados.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-400',
    },
    {
      id: 3,
      title: 'Simulador de escenarios',
      description: 'Modela diferentes configuraciones de sistemas energéticos y evalúa su viabilidad técnica y económica.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-400',
    },
    {
      id: 4,
      title: 'Asistente inteligente integrado',
      description: 'Chat IA especializado en energías renovables que responde consultas técnicas y brinda recomendaciones personalizadas.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      color: 'from-accent-yellow to-orange-400',
    },
  ];

  return (
    <section className="bg-white section-padding">
      <div className="container-width">
        <div className="animate-fade-in">
          <SectionTitle 
            title="¿Qué ofrece este Atlas Inteligente?"
            subtitle="Herramientas avanzadas de análisis energético impulsadas por inteligencia artificial para la toma de decisiones informadas"
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.id}
                className="group relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                {/* Fondo con gradiente */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>
                
                {/* Ícono */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${benefit.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {benefit.icon}
                </div>

                {/* Contenido */}
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold text-main-dark mb-3 group-hover:text-accent-green transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-main-dark/70 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Indicador de hover */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;