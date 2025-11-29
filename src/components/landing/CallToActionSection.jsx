import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const CallToActionSection = () => {
  return (
    <section className="bg-gradient-to-r from-main-dark via-main-dark/95 to-main-dark section-padding relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-accent-green/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent-yellow/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent-green/5 rounded-full blur-xl"></div>
      </div>

      <div className="container-width relative">
        <div className="text-center animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Comienza a explorar el{' '}
              <span className="text-accent-green">futuro energético</span>{' '}
              de Colombia
            </h2>
            
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Únete a la revolución de las energías renovables. Descubre oportunidades de inversión, 
              analiza el potencial de tu región y toma decisiones informadas con nuestro atlas inteligente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/mapa">
                <Button variant="primary" className="text-lg px-8 py-4 w-full sm:w-auto">
                  🗺️ Explorar Mapa Ahora
                </Button>
              </Link>
              <Link to="/simulador">
                <Button variant="secondary" className="text-lg px-8 py-4 w-full sm:w-auto">
                  ⚡ Probar Simulador
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="ghost" className="text-lg px-8 py-4 w-full sm:w-auto text-accent-green border-accent-green/30 hover:bg-accent-green/10">
                  💬 Consultar IA
                </Button>
              </Link>
            </div>

            {/* Características destacadas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="text-3xl mb-2">🌞</div>
                <h3 className="text-white font-semibold mb-1">Energía Solar</h3>
                <p className="text-white/60 text-sm">Análisis de radiación solar por región</p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-2">💨</div>
                <h3 className="text-white font-semibold mb-1">Energía Eólica</h3>
                <p className="text-white/60 text-sm">Mapas de velocidad y dirección del viento</p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-2">🔋</div>
                <h3 className="text-white font-semibold mb-1">Sistemas Híbridos</h3>
                <p className="text-white/60 text-sm">Combinaciones óptimas de energías renovables</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;