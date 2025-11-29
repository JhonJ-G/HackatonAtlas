import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import ColombiaEnergyMap from '../map/ColombiaEnergyMap';
import MapModeTabs from '../map/MapModeTabs';

const HeroSection = () => {
  const [selectedEnergyType, setSelectedEnergyType] = useState('solar');
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div className="absolute inset-0 bg-gradient-to-br from-main-dark/50 to-transparent"></div>
      
      <div className="container-width relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center section-padding">
          {/* Contenido principal */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Atlas Inteligente de{' '}
                <span className="text-accent-green">Potencial Energético</span>{' '}
                en Colombia
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 font-light">
                Explora, simula y analiza el potencial solar, eólico e híbrido por región.
              </p>
              
              <p className="text-lg text-white/70">
                Diseñado para apoyar decisiones de inversión energética en municipios y zonas no interconectadas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/mapa">
                <Button variant="primary" className="text-lg px-8 py-4 w-full sm:w-auto">
                  Explorar Mapa Energético
                </Button>
              </Link>
              <Link to="/simulador">
                <Button variant="secondary" className="text-lg px-8 py-4 w-full sm:w-auto">
                  Probar Simulador
                </Button>
              </Link>
            </div>

            {/* Estadísticas rápidas */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md sm:max-w-none">
              <div className="rounded-2xl bg-main-dark/55 border border-white/10 px-5 py-4 text-center shadow-[0_18px_40px_rgba(15,23,42,0.55)] backdrop-blur-sm">
                <div className="text-2xl md:text-3xl font-semibold text-accent-green">32</div>
                <div className="mt-1 text-xs md:text-sm font-medium text-slate-100/90 tracking-wide">
                  Departamentos
                </div>
              </div>
              <div className="rounded-2xl bg-main-dark/55 border border-white/10 px-5 py-4 text-center shadow-[0_18px_40px_rgba(15,23,42,0.55)] backdrop-blur-sm">
                <div className="text-2xl md:text-3xl font-semibold text-accent-green">1,100+</div>
                <div className="mt-1 text-xs md:text-sm font-medium text-slate-100/90 tracking-wide">
                  Municipios
                </div>
              </div>
              <div className="rounded-2xl bg-main-dark/55 border border-white/10 px-5 py-4 text-center shadow-[0_18px_40px_rgba(15,23,42,0.55)] backdrop-blur-sm">
                <div className="text-2xl md:text-3xl font-semibold text-accent-green">3</div>
                <div className="mt-1 text-xs md:text-sm font-medium text-slate-100/90 tracking-wide">
                  Tipos de Energía
                </div>
              </div>
            </div>
          </div>

          {/* Visualización del mapa */}
          <div className="relative animate-slide-up">
            <div className="glass-effect rounded-2xl p-8">
              <div className="rounded-xl mb-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div className="flex items-center justify-between p-6 pb-2">
                  <h3 className="text-slate-800 font-semibold text-lg">Mapa de Colombia</h3>
                  <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse"></div>
                </div>
                <div className="h-72 md:h-80 lg:h-96 flex items-center justify-center overflow-hidden">
                  <ColombiaEnergyMap mode="hero" selectedEnergyType={selectedEnergyType} />
                </div>
              </div>

              {/* Switch de tipos de energía */}
              <div className="flex items-center justify-between gap-3">
                <MapModeTabs selectedEnergyType={selectedEnergyType} onChange={setSelectedEnergyType} />
                <span className="text-xs text-slate-600">
                  Zonas no interconectadas: borde punteado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;