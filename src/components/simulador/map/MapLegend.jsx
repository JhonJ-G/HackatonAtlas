import React from 'react';

export default function MapLegend({ selectedEnergyType = 'solar', showNonInterconnected = false }) {
  // Leyenda de colores de los puntos del dataset
  const pointColors = {
    solar: { color: '#f59e0b', label: 'Solar' },
    eolica: { color: '#14b8a6', label: 'Eólica' },
    hibrida: { color: '#34d399', label: 'Híbrida' },
    desconocido: { color: '#3b82f6', label: 'Sin clasificar' }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 text-white">
      <div className="text-sm font-medium mb-3">🗺️ Puntos del Dataset</div>
      
      {/* Leyenda de colores */}
      <div className="space-y-2">
        {Object.entries(pointColors).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <div 
              className="w-3 h-3 rounded-full border border-white/30"
              style={{ backgroundColor: config.color }}
            ></div>
            <span className="text-white/90">{config.label}</span>
          </div>
        ))}
      </div>
      
      {/* Información adicional */}
      <div className="mt-3 pt-2 border-t border-white/10 text-xs text-white/70">
        <div className="flex items-center gap-1 mb-1">
          🔍 <span>Haz zoom para ver más puntos</span>
        </div>
        <div className="flex items-center gap-1">
          📍 <span>Clic en puntos para detalles</span>
        </div>
      </div>
      
      {showNonInterconnected && (
        <div className="mt-2 text-xs">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-2 py-1 rounded">
            <span className="inline-block w-4 h-0.5 border-t border-dashed border-white"></span>
            Zonas no interconectadas
          </span>
        </div>
      )}
    </div>
  );
}
