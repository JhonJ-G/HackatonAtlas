import React, { useState, useRef, useEffect } from 'react';
import SectionTitle from '../../common/SectionTitle';
import InteractiveMap from '../map/InteractiveMap';
import EnergyPointInfo from '../map/EnergyPointInfo';
import SearchBox from '../map/SearchBox';
import MLStatusIndicator from '../map/MLStatusIndicator';
import DataSimulator from '../map/DataSimulator';
import { EnergyDataProvider } from '../context/EnergyDataContext';

const SimulatorPageContent = () => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showGuide, setShowGuide] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 5000); // Ocultar después de 5 segundos
    return () => clearTimeout(timer);
  }, []);

  const handlePointSelect = (pointData) => {
    setSelectedPoint(pointData);
  };

  const handleSearchSelect = (searchResult) => {
    if (mapRef.current && mapRef.current.flyToLocation) {
      // Limpiar selección anterior antes de navegar
      setSelectedPoint(null);
      
      mapRef.current.flyToLocation(searchResult);

      // Analizar automáticamente SOLO para coordenadas y municipios, NO para departamentos
      const coords = searchResult.coords;
      if (coords && coords.length >= 2 && searchResult.type !== 'departamento') {
        setTimeout(() => {
          if (searchResult.type === 'coordenada_exacta') {
            // Para coordenadas exactas
            if (mapRef.current && mapRef.current.analyzeExactCoordinates) {
              mapRef.current.analyzeExactCoordinates(coords[0], coords[1]);
            }
          } else if (searchResult.type === 'municipio' || searchResult.type === 'coordenada') {
            // Para municipios y coordenadas normales
            if (mapRef.current && mapRef.current.analyzeCoordinates) {
              mapRef.current.analyzeCoordinates(coords[0], coords[1]);
            }
          }
        }, 200); // Tiempo suficiente para que termine la navegación
      }
      // Para departamentos: SOLO navegar, sin análisis automático
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Patrón de puntos */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>
      
      {showGuide && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-xl text-slate-800 p-6 rounded-2xl shadow-2xl border border-white/20 z-50 max-w-lg animate-fadeInDown">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full">
              <span className="text-white text-lg">✨</span>
            </div>
            <h3 className="font-bold text-lg text-slate-800">Guía de Simulación Inteligente</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-lg mt-0.5">🔍</span>
              <span className="text-sm text-slate-700"><strong>Explora:</strong> Busca coordenadas, municipios o haz clic directo en el mapa</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg mt-0.5">⚡</span>
              <span className="text-sm text-slate-700"><strong>IA Avanzada:</strong> Random Forest + interpolación con datos reales</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg mt-0.5">🌍</span>
              <span className="text-sm text-slate-700"><strong>Cobertura total:</strong> Más de 1,100 municipios colombianos</span>
            </li>
          </ul>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12 max-w-7xl">
        {/* Header mejorado */}
        <div className="text-center mb-8 lg:mb-12 relative z-10">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌱</span>
            </div>
            <span className="text-white/80 text-sm font-medium uppercase tracking-wider">Tecnología Avanzada</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent leading-tight">
              Simulador de Energías
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Renovables
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-6">
            <span className="font-semibold text-emerald-300">Simula y analiza</span> el potencial energético en 
            <span className="font-semibold text-blue-300">cualquier ubicación de Colombia</span> con 
            <span className="font-semibold text-violet-300">inteligencia artificial avanzada</span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></span>
              <span>Datos Reales</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse delay-700"></span>
              <span>Análisis Territorial</span>
            </div>
          </div>
        </div>

        {/* Contenedor principal del simulador */}
        <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-8 lg:p-10 text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
          {/* Efectos decorativos internos */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-blue-500/5 rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-conic from-violet-500/10 via-blue-500/10 to-emerald-500/10 rounded-full blur-2xl transform translate-x-32 -translate-y-32"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
            {/* Columna izquierda: mapa */}
            <div className="flex-1 relative min-h-0 order-1 lg:order-1">
              {/* Header del mapa */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/20">
                    <span className="text-xl">🗺️</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Mapa Interactivo</h3>
                    <p className="text-white/70 text-sm">Explora el territorio colombiano</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white/80 font-medium">Sistema Activo</span>
                </div>
              </div>
              
              {/* Buscador al lado de controles de zoom */}
              <div className="absolute top-16 sm:top-20 left-16 sm:left-20 lg:left-24 right-4 sm:right-6 z-10">
                <SearchBox
                  onLocationSelect={handleSearchSelect}
                  className="max-w-full sm:max-w-sm lg:max-w-md drop-shadow-2xl"
                />
              </div>

              <div className="rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] bg-white/5 backdrop-blur-sm">
                <InteractiveMap
                  ref={mapRef}
                  onPointSelect={handlePointSelect}
                  className="h-[450px] sm:h-[550px] lg:h-[650px] xl:h-[750px]"
                />
              </div>
            </div>

            {/* Columna derecha: panel de información */}
            <div className="w-full lg:w-80 xl:w-96 space-y-6 order-2 lg:order-2">
              {/* Header del panel */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm border border-white/20">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Análisis Energético</h3>
                  <p className="text-white/70 text-sm">Resultados de IA y datos reales</p>
                </div>
              </div>
              
              {/* Panel de información principal mejorado */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
                <EnergyPointInfo
                  pointData={selectedPoint}
                  className="min-h-[300px] sm:min-h-[400px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Simulador de datos personalizados */}
        <div className="mt-8 lg:mt-12 relative">
          {/* Separador visual */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🧪</span>
              </div>
              <span className="text-white font-semibold text-sm uppercase tracking-wider">Laboratorio Personal</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
          
          {/* Contenedor del simulador */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)]">
            <DataSimulator />
          </div>
        </div>
      </div>
    </div>
  );
};

const SimulatorPage = () => {
  return (
    <EnergyDataProvider>
      <SimulatorPageContent />
    </EnergyDataProvider>
  );
};

export default SimulatorPage;