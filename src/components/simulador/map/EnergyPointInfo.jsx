import React from 'react';

const EnergyPointInfo = ({ pointData, className = '' }) => {
  // Manejar errores territoriales
  if (pointData?.isError) {
    return (
      <div className={`${className} bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-400/30 backdrop-blur-sm`}>
        <div className="text-center">
          <div className="text-4xl sm:text-5xl mb-3">🚫</div>
          <div className="text-white/90 text-sm sm:text-base font-medium mb-2">
            ❌ Error de Ubicación
          </div>
          <div className="text-white/70 text-xs sm:text-sm bg-red-500/20 rounded-lg p-3 border border-red-400/20">
            {pointData.error}
          </div>
          <div className="mt-4 text-xs text-white/60">
            🌍 Coordenadas: {pointData.lat?.toFixed(4)}, {pointData.lon?.toFixed(4)}
          </div>
        </div>
      </div>
    );
  }

  if (!pointData) {
    return (
      <div className={`${className} bg-gradient-to-br from-white/10 to-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 backdrop-blur-sm`}>
        <div className="text-center">
          <div className="text-4xl sm:text-5xl mb-3">🌍</div>
          <div className="text-white/90 text-sm sm:text-base font-medium mb-2">
            🔍 Selecciona una ubicación
          </div>
          <div className="text-white/60 text-xs sm:text-sm">
            Haz clic en el mapa o busca coordenadas para analizar el potencial energético renovable
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="px-2 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-xs">☀️ Solar</span>
            <span className="px-2 py-1 bg-teal-400/20 text-teal-300 rounded-full text-xs">🌪️ Eólica</span>
            <span className="px-2 py-1 bg-green-400/20 text-green-300 rounded-full text-xs">⚡ Híbrida</span>
          </div>
        </div>
      </div>
    );
  }

  const { 
    municipio, 
    departamento, 
    lat, 
    lon, 
    radiacion, 
    viento, 
    altitud, 
    temperatura,
    tipo_red,
    potencial,
    clickedCoords,
    bioAnalysis,
    interpolationInfo,
    isAIPrediction 
  } = pointData;

  // Color según recomendación BIO
  const getRecommendationColor = (tipo) => {
    switch(tipo) {
      case 'solar': return 'text-yellow-400 bg-yellow-400/20';
      case 'eólica': case 'eolica': return 'text-teal-400 bg-teal-400/20';
      case 'híbrida': case 'hibrida': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  // Determinar si hay datos del dataset
  const hasDatasetInfo = potencial && potencial.toLowerCase() !== 'desconocido' && potencial.toLowerCase() !== '';
  
  // Icono según fuente de datos
  const getDataSourceIcon = () => {
    if (potencial) return '📊';
    return '🤖';
  };

  const getDataSourceText = () => {
    if (potencial) return 'Dataset';
    return 'Random Forest';
  };

  const recommendationStyle = getRecommendationColor(bioAnalysis?.tipoEnergiaRecomendada);

  return (
    <div className={`${className} bg-gradient-to-br from-white/10 to-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/20 backdrop-blur-sm space-y-3 sm:space-y-4`}>
      {/* Encabezado con ubicación */}
      <div className="border-b border-white/10 pb-3">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          📍 {municipio}
        </h3>
        <p className="text-sm text-white/80 font-medium">{departamento}</p>
        <div className="text-xs text-white/60 mt-1.5 bg-white/5 px-2 py-1 rounded-md inline-block">
          🌐 {clickedCoords?.lat.toFixed(4)}, {clickedCoords?.lng.toFixed(4)}
        </div>
      </div>

      {/* Recomendación BIO */}
      {bioAnalysis && (
        <div className={`rounded-xl p-3 sm:p-4 ${recommendationStyle.split(' ')[1]} border border-white/10`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white">⚡ Energía Recomendada</span>
              </div>
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full inline-flex items-center gap-1 w-fit">
                {getDataSourceIcon()} <span className="font-medium">Fuente: {getDataSourceText()}</span>
              </span>
            </div>
            <div className="text-right">
              <span className={`text-xl sm:text-2xl font-bold capitalize ${recommendationStyle.split(' ')[0]} block`}>
                {bioAnalysis.tipoEnergiaRecomendada}
              </span>
              <div className="text-xs sm:text-sm text-white/80 font-medium">
                Confianza: {bioAnalysis.confianza}%
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5 sm:p-3 mt-3">
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              {bioAnalysis.explicacion}
            </p>
          </div>
          <div className="mt-3">
            <div className="text-xs bg-green-500/30 text-green-200 px-2 py-1 rounded-full font-medium inline-block">
              ✓ Análisis concluyente
            </div>
            
            {/* Información de interpolación IDW */}
            {interpolationInfo && (
              <div className="mt-3 bg-white/10 rounded-lg p-3 border border-white/20">
                <div className="text-xs font-medium text-white/90 mb-2 flex items-center gap-1">
                  🗺️ Municipios utilizados para el análisis
                </div>
                <div className="space-y-1 text-xs text-white/70">
                  <div>📊 Número de municipios: {interpolationInfo.neighbors}</div>
                  <div>📍 Municipio más cercano: {interpolationInfo.nearestMunicipio} ({interpolationInfo.nearestDepartamento})</div>
                  <div>📐 Distancia: {interpolationInfo.nearestDistance} km</div>
                </div>
                {interpolationInfo.municipiosUsados && interpolationInfo.municipiosUsados.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="text-xs font-medium text-white/80 mb-1">📍 Municipios y distancias:</div>
                    <div className="flex flex-wrap gap-1">
                      {interpolationInfo.municipiosUsados.slice(0, 3).map((mun, idx) => (
                        <span key={idx} className="text-xs bg-white/20 text-white/80 px-2 py-0.5 rounded">
                          {mun.municipio} ({mun.distanciaKm}km)
                        </span>
                      ))}
                      {interpolationInfo.municipiosUsados.length > 3 && (
                        <span className="text-xs text-white/60">+{interpolationInfo.municipiosUsados.length - 3} más</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Datos técnicos */}
      <div className="border-t border-white/10 pt-3 sm:pt-4 space-y-3">
        <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          📊 Parámetros Técnicos
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {radiacion > 0 && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-3 border border-yellow-400/20">
              <div className="flex items-center gap-1 text-yellow-200 text-xs mb-1">
                ☀️ <span className="font-medium">Radiación Solar</span>
              </div>
              <div className="text-white font-bold text-lg">{radiacion.toFixed(2)}</div>
              <div className="text-yellow-200/80 text-xs">kWh/m²/día</div>
            </div>
          )}
          
          {viento > 0 && (
            <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-lg p-3 border border-teal-400/20">
              <div className="flex items-center gap-1 text-teal-200 text-xs mb-1">
                🌪️ <span className="font-medium">Velocidad Viento</span>
              </div>
              <div className="text-white font-bold text-lg">{viento.toFixed(1)}</div>
              <div className="text-teal-200/80 text-xs">m/s</div>
            </div>
          )}
          
          {altitud > 0 && (
            <div className="bg-gradient-to-r from-gray-500/10 to-slate-500/10 rounded-lg p-3 border border-gray-400/20">
              <div className="flex items-center gap-1 text-gray-200 text-xs mb-1">
                🏔️ <span className="font-medium">Altitud</span>
              </div>
              <div className="text-white font-bold text-lg">{altitud.toFixed(0)}</div>
              <div className="text-gray-200/80 text-xs">msnm</div>
            </div>
          )}
          
          {temperatura > 0 && (
            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg p-3 border border-red-400/20">
              <div className="flex items-center gap-1 text-red-200 text-xs mb-1">
                🌡️ <span className="font-medium">Temperatura</span>
              </div>
              <div className="text-white font-bold text-lg">{temperatura.toFixed(1)}</div>
              <div className="text-red-200/80 text-xs">°C</div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {potencial && (
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-xs font-medium">📊 Dataset:</span>
              <span className="text-white text-sm font-bold capitalize bg-white/10 px-2 py-1 rounded">{potencial}</span>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default EnergyPointInfo;