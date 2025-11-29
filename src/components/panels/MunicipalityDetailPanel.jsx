import React from 'react';

export default function MunicipalityDetailPanel({ municipality }) {
  if (!municipality) return null;

  const {
    municipio: municipalityName,
    departamento: departmentName,
    tipo_red: networkType,
    predicted_class: predictedClass,
    prob_solar: probSolar = 0,
    prob_eolica: probEolica = 0,
    prob_hibrida: probHibrida = 0,
    latitud: lat,
    longitud: lon,
    altitud_msnm: altitude,
    radiacion_kWhm2_dia: radiation,
    viento_ms: wind,
    temperatura_C: temperature
  } = municipality;

  // Generar recomendación inteligente para el municipio
  const generateMunicipalityRecommendation = () => {
    const maxProb = Math.max(probSolar, probEolica, probHibrida);
    let recommendation = '';
    
    if (predictedClass === 'solar' && probSolar >= 0.7) {
      recommendation = 'Este municipio presenta un potencial principalmente solar con alta probabilidad estimada. Es candidato para proyectos de generación fotovoltaica y autoconsumo.';
    } else if (predictedClass === 'eolica' && probEolica >= 0.7) {
      recommendation = 'El análisis indica excelente potencial eólico. Recomendado para evaluación de parques de generación eólica y aprovechamiento de vientos.';
    } else if (predictedClass === 'hibrida' && probHibrida >= 0.7) {
      recommendation = 'Presenta características favorables para sistemas híbridos solar-eólicos, optimizando la generación con múltiples fuentes.';
    } else if (maxProb >= 0.5 && maxProb < 0.7) {
      recommendation = `El modelo indica una ligera preferencia por la energía ${predictedClass}, pero se recomienda complementar con estudios locales para mayor precisión.`;
    } else {
      recommendation = 'Las condiciones energéticas requieren evaluación técnica adicional para determinar la tecnología más apropiada.';
    }

    if (networkType === 'ZNI') {
      recommendation += ' Al ser una Zona No Interconectada (ZNI), se recomiendan soluciones autónomas con almacenamiento y esquemas híbridos.';
    }

    return recommendation;
  };

  const getNetworkBadge = () => {
    if (networkType === 'SIN') {
      return (
        <span className="px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded-full border border-green-500/30">
          SIN - Interconectado
        </span>
      );
    } else if (networkType === 'ZNI') {
      return (
        <span className="px-2 py-1 bg-amber-600/20 text-amber-300 text-xs rounded-full border border-amber-500/30">
          ZNI - No Interconectado
        </span>
      );
    }
    return null;
  };

  const getPredictedClassBadge = () => {
    const classColors = {
      solar: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30',
      eolica: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
      hibrida: 'bg-green-600/20 text-green-300 border-green-500/30'
    };
    
    const colorClass = classColors[predictedClass] || 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    
    return (
      <span className={`px-3 py-1 text-sm rounded-full border capitalize font-medium ${colorClass}`}>
        {predictedClass}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Encabezado del municipio */}
      <div>
        <div className="text-lg font-semibold text-white">{municipalityName}</div>
        <div className="text-sm text-white/70">{departmentName}</div>
      </div>

      {/* Información básica */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-3">
        <div className="text-sm text-white/70 mb-2">Información básica</div>
        
        {/* Tipo de red */}
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">Tipo de red:</span>
          {getNetworkBadge()}
        </div>

        {/* Coordenadas */}
        <div className="text-xs text-white/80 space-y-1">
          <div className="flex justify-between">
            <span>Latitud:</span>
            <span className="font-mono">{parseFloat(lat).toFixed(4)}°</span>
          </div>
          <div className="flex justify-between">
            <span>Longitud:</span>
            <span className="font-mono">{parseFloat(lon).toFixed(4)}°</span>
          </div>
        </div>

        {/* Datos climáticos si están disponibles */}
        {(altitude || radiation || wind || temperature) && (
          <div className="pt-2 border-t border-white/10">
            <div className="text-xs text-white/70 mb-2">Condiciones climáticas</div>
            <div className="text-xs text-white/80 space-y-1">
              {altitude && (
                <div className="flex justify-between">
                  <span>Altitud:</span>
                  <span>{Math.round(altitude)} msnm</span>
                </div>
              )}
              {radiation && (
                <div className="flex justify-between">
                  <span>Radiación solar:</span>
                  <span>{radiation} kWh/m²/día</span>
                </div>
              )}
              {wind && (
                <div className="flex justify-between">
                  <span>Velocidad del viento:</span>
                  <span>{wind} m/s</span>
                </div>
              )}
              {temperature && (
                <div className="flex justify-between">
                  <span>Temperatura promedio:</span>
                  <span>{temperature}°C</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Potencial energético */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-3">
        <div className="text-sm text-white/70 mb-2">Potencial energético</div>
        
        {/* Potencial dominante */}
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">Potencial dominante:</span>
          {getPredictedClassBadge()}
        </div>

        {/* Probabilidades */}
        <div className="space-y-2">
          <div className="text-xs text-white/70">Probabilidades del modelo:</div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/80">Solar:</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${(probSolar * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-white/80 w-10 text-right">
                  {(probSolar * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/80">Eólico:</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 transition-all duration-300"
                    style={{ width: `${(probEolica * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-white/80 w-10 text-right">
                  {(probEolica * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/80">Híbrido:</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-400 transition-all duration-300"
                    style={{ width: `${(probHibrida * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-white/80 w-10 text-right">
                  {(probHibrida * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendación para el municipio */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <div className="text-sm text-white/70 mb-2">Recomendación técnica</div>
        <div className="text-sm text-white/90 leading-relaxed">
          {generateMunicipalityRecommendation()}
        </div>
      </div>
    </div>
  );
}