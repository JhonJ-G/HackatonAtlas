import React from 'react';
import { useEnergyData } from '../context/EnergyDataContext';

const MLStatusIndicator = ({ className = '' }) => {
  const { mlReady, loading } = useEnergyData();

  if (loading) {
    return (
      <div className={`${className} bg-blue-500/20 border border-blue-500/30 rounded-lg p-3`}>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-blue-200">Cargando sistema IA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} ${mlReady ? 'bg-green-500/20 border-green-500/30' : 'bg-yellow-500/20 border-yellow-500/30'} rounded-lg p-3 border`}>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-green-400">
          <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-green-200">
            ✓ Sistema listo
          </div>
          <div className="text-xs text-white/70">
            Predicciones disponibles
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default MLStatusIndicator;