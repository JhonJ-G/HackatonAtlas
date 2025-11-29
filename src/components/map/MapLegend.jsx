import React from 'react';

export default function MapLegend({ selectedEnergyType = 'solar', showNonInterconnected = false }) {
  const labelMap = {
    solar: { title: 'Potencial Solar', from: '#FDE68A', to: '#F59E0B' },
    eolico: { title: 'Potencial Eólico', from: '#A7F3D0', to: '#14B8A6' },
    hibrido: { title: 'Potencial Híbrido', from: '#D9F99D', to: '#34D399' },
  };

  const cfg = labelMap[selectedEnergyType] || labelMap.solar;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white space-y-2">
      <div className="text-sm font-medium">{cfg.title}</div>
      
      {/* Barra de potencia */}
      <div
        className="h-2 w-full rounded-full"
        style={{
          background: `linear-gradient(to right, ${cfg.from}, ${cfg.to})`,
        }}
      />
      
      {/* Etiquetas Bajo / Medio / Alto */}
      <div className="flex justify-between text-[11px] text-white/70">
        <span>Bajo</span>
        <span>Medio</span>
        <span>Alto</span>
      </div>
      
      {showNonInterconnected && (
        <div className="mt-3 text-xs">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-2 py-1 rounded">
            <span className="inline-block w-4 h-0.5 border-t border-dashed border-white"></span>
            Zonas no interconectadas resaltadas
          </span>
        </div>
      )}
    </div>
  );
}
