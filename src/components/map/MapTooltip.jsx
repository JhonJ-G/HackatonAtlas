import React from 'react';

export default function MapTooltip({ 
  visible, 
  x, 
  y, 
  name, 
  typeLabel, 
  indexValue, 
  extra, 
  onMunicipalityDetails = null,
  onClosePinned = null,
  isPinned = false
}) {
  if (!visible) return null;
  
  const isLocation = name.includes(',');
  
  const handleMunicipalityDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onMunicipalityDetails && extra) {
      // Construir objeto completo del municipio para el panel de detalles
      const municipalityData = {
        municipio: extra.municipio || name.split(',')[0],
        departamento: extra.departamento || name.split(',')[1]?.trim(),
        tipo_red: extra.tipo_red,
        predicted_class: extra.predicted_class,
        prob_solar: extra.prob_solar || 0,
        prob_eolica: extra.prob_eolica || 0,
        prob_hibrida: extra.prob_hibrida || 0,
        latitud: extra.latitud,
        longitud: extra.longitud,
        altitud_msnm: extra.altitud_msnm,
        radiacion_kWhm2_dia: extra.radiacion_kWhm2_dia,
        viento_ms: extra.viento_ms,
        temperatura_C: extra.temperatura_C,
        codigo_dane_municipio: extra.codigo_dane_municipio
      };
      
      onMunicipalityDetails(municipalityData);
    }
  };

  const handleClosePinned = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClosePinned) {
      onClosePinned();
    }
  };
  
  return (
    <div
      className="pointer-events-auto fixed z-50"
      style={{ left: x + 12, top: y + 12 }}
    >
      <div className={`rounded-lg px-3 py-2 shadow-lg text-white max-w-xs border pointer-events-auto ${
        isPinned 
          ? 'bg-slate-900/95 border-slate-600/50' 
          : 'bg-slate-900/90 border-white/10'
      }`}>
        
        {/* Header con botón de cerrar si está pinned */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xs opacity-80">
              {isLocation ? 'Municipio' : typeLabel}
              {isPinned && <span className="ml-1 text-emerald-300">• Fijado</span>}
            </div>
            <div className="text-sm font-semibold">{name}</div>
          </div>
          
          {/* Botón cerrar solo si está pinned */}
          {isPinned && onClosePinned && (
            <button
              onClick={handleClosePinned}
              className="ml-2 p-1 text-white/60 hover:text-white/90 hover:bg-white/10 rounded transition-colors"
              title="Cerrar"
            >
              ✕
            </button>
          )}
        </div>
        
        {extra && extra.predicted_class && (
          <div className="text-xs mt-1 capitalize">
            <span className="text-accent-green">Potencial:</span> {extra.predicted_class}
          </div>
        )}
        
        {extra && extra.tipo_red && (
          <div className="text-xs">
            <span className="text-accent-green">Red:</span> {extra.tipo_red}
          </div>
        )}
        
        {/* Información geográfica para municipios */}
        {isLocation && extra && (extra.latitud || extra.longitud) && (
          <div className="text-xs mt-1 opacity-90">
            <span className="text-accent-blue">Ubicación:</span> {parseFloat(extra.latitud).toFixed(4)}°, {parseFloat(extra.longitud).toFixed(4)}°
          </div>
        )}
        
        {/* Condiciones climáticas para municipios */}
        {isLocation && extra && (
          <div className="text-xs mt-1 space-y-0.5">
            {extra.altitud_msnm && (
              <div><span className="text-accent-blue">Altitud:</span> {Math.round(extra.altitud_msnm)} msnm</div>
            )}
            {extra.radiacion_kWhm2_dia && (
              <div><span className="text-accent-yellow">Radiación:</span> {extra.radiacion_kWhm2_dia} kWh/m²/día</div>
            )}
            {extra.viento_ms && (
              <div><span className="text-gray-300">Viento:</span> {extra.viento_ms} m/s</div>
            )}
          </div>
        )}
        
        {typeof indexValue === 'number' && (
          <div className="text-xs mt-1">
            {isLocation ? 'Probabilidad' : 'Índice'}: {indexValue.toFixed(2)}
          </div>
        )}
        
        {/* Botón para ver detalles del municipio */}
        {isLocation && onMunicipalityDetails && extra && (
          <button
            onClick={handleMunicipalityDetails}
            className="mt-2 px-3 py-1 text-xs font-medium bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 hover:text-emerald-200 rounded-full border border-emerald-500/30 cursor-pointer transition-colors duration-200 w-full"
          >
            Ver detalles del municipio
          </button>
        )}
      </div>
    </div>
  );
}
