import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Popup, Marker } from 'react-leaflet';
import { useEnergyData } from '../context/EnergyDataContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icono personalizado para coordenadas de búsqueda
const searchPinIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="#8B5CF6" stroke="#6D28D9" stroke-width="1" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 7.3 12.5 28.5 12.5 28.5s12.5-21.2 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="white" cx="12.5" cy="12.5" r="6"/>
      <circle fill="#6D28D9" cx="12.5" cy="12.5" r="3"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

// Componente para manejar eventos del mapa
const MapEventHandler = ({ onMapClick, onZoomChange }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    }
  });
  return null;
};

// Componente para mostrar puntos de datos según el zoom con niveles de detalle
const DataPointsLayer = ({ zoomLevel, selectedPoint, onPointClick }) => {
  const { data } = useEnergyData();
  
  // No mostrar puntos en zoom muy bajo
  if (zoomLevel < 6 || !data.length) return null;

  // Filtrar puntos según nivel de zoom para rendimiento
  let displayData;
  if (zoomLevel >= 10) {
    // Zoom alto: mostrar todos los puntos
    displayData = data;
  } else if (zoomLevel >= 8) {
    // Zoom medio: mostrar cada 2do punto + puntos importantes
    const filteredData = data.filter((_, index) => index % 2 === 0);
    const importantPoints = data.filter(point => 
      point.departamento && (
        point.departamento.toLowerCase().includes('san andrés') ||
        point.departamento.toLowerCase().includes('san andres') ||
        point.departamento.toLowerCase().includes('archipiélago') ||
        point.municipio && (
          point.municipio.toLowerCase().includes('san andrés') ||
          point.municipio.toLowerCase().includes('san andres') ||
          point.municipio.toLowerCase().includes('providencia')
        )
      )
    );
    displayData = [...filteredData, ...importantPoints].filter((point, index, array) => 
      array.findIndex(p => p.lat === point.lat && p.lon === point.lon) === index
    );
  } else if (zoomLevel >= 6) {
    // Zoom departamental: mostrar cada 4to punto + puntos importantes (islas, capitales, etc.)
    const filteredData = data.filter((_, index) => index % 4 === 0);
    const importantPoints = data.filter(point => 
      point.departamento && (
        point.departamento.toLowerCase().includes('san andrés') ||
        point.departamento.toLowerCase().includes('san andres') ||
        point.departamento.toLowerCase().includes('archipiélago') ||
        point.municipio && (
          point.municipio.toLowerCase().includes('san andrés') ||
          point.municipio.toLowerCase().includes('san andres') ||
          point.municipio.toLowerCase().includes('providencia') ||
          point.municipio.toLowerCase().includes('bogotá') ||
          point.municipio.toLowerCase().includes('medellín') ||
          point.municipio.toLowerCase().includes('cali') ||
          point.municipio.toLowerCase().includes('barranquilla') ||
          point.municipio.toLowerCase().includes('cartagena')
        )
      )
    );
    displayData = [...filteredData, ...importantPoints].filter((point, index, array) => 
      array.findIndex(p => p.lat === point.lat && p.lon === point.lon) === index
    );
  } else {
    displayData = [];
  }

  // Debug: contar puntos de San Andrés (logs deshabilitados para evitar spam)
  const sanAndresPoints = displayData.filter(point => 
    (point.departamento && (
      point.departamento.toLowerCase().includes('san andrés') ||
      point.departamento.toLowerCase().includes('archipiélago')
    )) ||
    (point.municipio && (
      point.municipio.toLowerCase().includes('san andrés') ||
      point.municipio.toLowerCase().includes('providencia')
    ))
  );
  
  // Logs comentados para evitar spam en consola
  // if (sanAndresPoints.length > 0 && zoomLevel >= 6) {
  //   console.log(`🏝️ Mostrando ${sanAndresPoints.length} puntos de San Andrés en zoom ${zoomLevel}:`, 
  //     sanAndresPoints.map(p => `${p.municipio} (${p.lat.toFixed(3)}, ${p.lon.toFixed(3)})`));
  // }

  return (
    <>
      {displayData.map((point, index) => {
        const isSelected = selectedPoint && 
          selectedPoint.lat === point.lat && 
          selectedPoint.lon === point.lon;
        
        // Color según tipo de potencial - colores más distintivos y contrastantes
        const getColor = (point) => {
          // Color directo basado en potencial del dataset
          if (!point.potencial || point.potencial.toLowerCase() === 'desconocido') {
            return '#8b5cf6'; // Púrpura vibrante para candidatos ML/desconocido
          }

          // Color según potencial del dataset - paleta distintiva
          switch(point.potencial.toLowerCase()) {
            case 'solar': return '#ff6b00'; // Naranja brillante para solar
            case 'eolica': case 'eólica': return '#00c896'; // Verde turquesa para eólica
            case 'hibrida': case 'híbrida': return '#ff2d92'; // Rosa magenta para híbrida
            default: return '#64748b'; // Gris slate para otros
          }
        };

        const pointColor = getColor(point);

        // Calcular tamaño del punto según zoom
        const getPointSize = (zoom, selected) => {
          if (selected) return zoom >= 10 ? 10 : zoom >= 8 ? 8 : 6;
          return zoom >= 10 ? 5 : zoom >= 8 ? 4 : 3;
        };

        const getPointWeight = (zoom, selected) => {
          if (selected) return zoom >= 10 ? 3 : 2;
          return zoom >= 10 ? 2 : 1;
        };

        return (
          <CircleMarker
            key={`${point.lat}-${point.lon}-${index}`}
            center={[point.lat, point.lon]}
            radius={getPointSize(zoomLevel, isSelected)}
            color={pointColor}
            fillColor={pointColor}
            fillOpacity={isSelected ? 0.9 : (zoomLevel >= 10 ? 0.8 : zoomLevel >= 8 ? 0.7 : 0.6)}
            weight={getPointWeight(zoomLevel, isSelected)}
            eventHandlers={{
              click: () => onPointClick(point)
            }}
          >
            <Popup>
              <div className="p-3 min-w-[200px] sm:min-w-[240px]">
                <h3 className="font-bold text-sm text-gray-800 mb-1">📍 {point.municipio}</h3>
                <p className="text-xs text-gray-600 font-medium mb-1">{point.departamento}</p>
                
                {/* Coordenadas exactas del dataset */}
                <div className="text-xs text-gray-500 mb-2 bg-gray-100 px-2 py-1 rounded font-mono">
                  🌐 {point.lat.toFixed(6)}, {point.lon.toFixed(6)}
                </div>
                
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between bg-yellow-50 px-2 py-1 rounded">
                    <span>☀️ Radiación:</span>
                    <span className="font-medium">{point.radiacion?.toFixed(2)} kWh/m²/día</span>
                  </div>
                  <div className="flex justify-between bg-blue-50 px-2 py-1 rounded">
                    <span>💨 Viento:</span>
                    <span className="font-medium">{point.viento?.toFixed(1)} m/s</span>
                  </div>
                  <div className="flex justify-between bg-gray-50 px-2 py-1 rounded">
                    <span>🏔️ Altitud:</span>
                    <span className="font-medium">{point.altitud?.toFixed(0)} msnm</span>
                  </div>
                  <div className="flex justify-between bg-purple-50 px-2 py-1 rounded">
                    <span>🌡️ Temperatura:</span>
                    <span className="font-medium">{point.temperatura?.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between bg-green-50 px-2 py-1 rounded font-medium">
                    <span>⚡ Potencial:</span>
                    <span className="capitalize text-green-700">{point.potencial}</span>
                  </div>
                  
                  {/* Código DANE si está disponible */}
                  {point.codigo_dane && (
                    <div className="text-xs text-gray-500 mt-2 border-t pt-1">
                      📋 DANE: {point.codigo_dane}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};

// Componente principal del mapa
const InteractiveMap = forwardRef(({ onPointSelect, className = '' }, ref) => {
  const { data, loading, error, getClosestDataPoint, evaluateBIO, estimateEnvironmentalParams, validateColombianTerritory } = useEnergyData();
  const [zoomLevel, setZoomLevel] = useState(6);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [searchPin, setSearchPin] = useState(null); // Pin para coordenadas exactas
  const mapRef = useRef(null);

  // Función para navegar a una ubicación
  const flyToLocation = useCallback((searchResult) => {
    if (mapRef.current) {
      const { coords, type, data: pointData, name } = searchResult;
      let zoom;
      if (type === 'departamento') {
        zoom = 8;
      } else if (type === 'coordenada_exacta') {
        // Zoom específico para islas y ubicaciones importantes
        zoom = name && (name.includes('San Andrés') || name.includes('Providencia')) ? 12 : 15;
      } else if (name === 'Colombia') {
        zoom = 6; // Vista general de Colombia
      } else {
        zoom = 12;
      }
      
      mapRef.current.flyTo(coords, zoom, {
        animate: true,
        duration: 1.5
      });

      // Si son coordenadas exactas o puntos cercanos a coordenadas, mostrar pin y ejecutar análisis
      if (type === 'coordenada_exacta' || type === 'coordenada') {
        setSearchPin({
          lat: coords[0],
          lng: coords[1],
          label: type === 'coordenada_exacta' 
            ? `Coordenadas exactas: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
            : `Punto cercano: ${searchResult.name}`
        });
        
        // Para coordenadas exactas, usar análisis directo en esas coordenadas
        if (type === 'coordenada_exacta') {
          handleExactCoordinateAnalysis(coords[0], coords[1]);
        } else {
          // Para puntos cercanos, usar análisis normal
          handleMapClick(coords[0], coords[1]);
        }
      } else {
        // Limpiar pin de búsqueda si no son coordenadas
        setSearchPin(null);
      }

      // Nota: El análisis automático ahora se maneja desde handleSearchSelect
      // para consistencia entre todos los tipos de búsqueda
    }
  }, [evaluateBIO, onPointSelect]);

  // Función especial para análisis de coordenadas exactas
  const handleExactCoordinateAnalysis = useCallback(async (lat, lng) => {
    try {
      // Validar territorio colombiano
      const territoryCheck = validateColombianTerritory(lat, lng);
      if (!territoryCheck.valid) {
        // Crear punto de error para mostrar en UI
        const errorPoint = {
          municipio: 'Ubicación fuera de Colombia',
          departamento: 'Error territorial',
          lat,
          lon: lng,
          error: territoryCheck.message,
          isError: true
        };
        setSelectedPoint(errorPoint);
        onPointSelect?.(errorPoint);
        return;
      }

      // Estimar parámetros ambientales para las coordenadas exactas
      const estimatedParams = estimateEnvironmentalParams(lat, lng);
      
      // Realizar análisis BIO con parámetros estimados
      const bioAnalysis = evaluateBIO({
        ...estimatedParams,
        potencial: null, // Sin dato de dataset
        lat,
        lon: lng,
        interpolationInfo: estimatedParams.interpolationInfo
      });

      // Crear punto con las coordenadas exactas ingresadas
      const exactPoint = {
        municipio: `Coordenadas ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        departamento: 'Ubicación exacta',
        lat,
        lon: lng,
        ...estimatedParams,
        potencial: null,
        tipo_red: 'Coordenadas exactas',
        clickedCoords: { lat, lng },
        bioAnalysis,
        isExactCoordinate: true
      };

      setSelectedPoint(exactPoint);
      onPointSelect?.(exactPoint);
    } catch (error) {
      // Manejar errores de interpolación
      const errorPoint = {
        municipio: 'Error en análisis',
        departamento: 'Error del sistema',
        lat,
        lon: lng,
        error: error.message,
        isError: true
      };
      setSelectedPoint(errorPoint);
      onPointSelect?.(errorPoint);
    }
  }, [estimateEnvironmentalParams, evaluateBIO, onPointSelect, validateColombianTerritory]);

  const handleMapClick = useCallback(async (lat, lng) => {
    try {
      // Validar territorio colombiano
      const territoryCheck = validateColombianTerritory(lat, lng);
      if (!territoryCheck.valid) {
        const errorPoint = {
          municipio: 'Ubicación fuera de Colombia',
          departamento: 'Error territorial',
          lat,
          lon: lng,
          error: territoryCheck.message,
          isError: true
        };
        setSelectedPoint(errorPoint);
        onPointSelect?.(errorPoint);
        return;
      }

      // Permitir análisis en cualquier nivel de zoom para coordenadas exactas
      const closest = getClosestDataPoint(lat, lng);
        
      // Calcular distancia al punto más cercano
      // 1° ≈ 111 km (circunferencia terrestre ~40,075 km / 360°)
      const distance = closest ? Math.sqrt(
        Math.pow(closest.lat - lat, 2) + Math.pow(closest.lon - lng, 2)
      ) : Infinity;

      // Si hay un punto cercano (dentro de ~5km equivalente)
      if (closest && distance < 0.05) {
          const bioAnalysis = evaluateBIO({
            radiacion: closest.radiacion,
            viento: closest.viento,
            altitud: closest.altitud,
            temperatura: closest.temperatura,
            potencial: closest.potencial,
            lat: closest.lat,
            lon: closest.lon
          });

          const enrichedPoint = {
            ...closest,
            clickedCoords: { lat, lng },
            bioAnalysis
          };

        setSelectedPoint(enrichedPoint);
        onPointSelect?.(enrichedPoint);
      } 
      // Si no hay datos cercanos, usar interpolación IDW + Random Forest
      else {
        // Estimar parámetros ambientales
        const estimatedParams = estimateEnvironmentalParams(lat, lng);
        
        // Realizar análisis BIO con parámetros estimados
        const bioAnalysis = evaluateBIO({
          ...estimatedParams,
          potencial: null, // Sin dato de dataset
          lat,
          lon: lng,
          interpolationInfo: estimatedParams.interpolationInfo
        });

        // Crear punto sintético con predicción
        const syntheticPoint = {
          municipio: 'Ubicación sin datos',
          departamento: 'Predicción IA',
          lat,
          lon: lng,
          ...estimatedParams,
          potencial: null,
          tipo_red: 'Estimado',
          clickedCoords: { lat, lng },
          bioAnalysis,
          isAIPrediction: true
        };

        setSelectedPoint(syntheticPoint);
        onPointSelect?.(syntheticPoint);
      }
    } catch (error) {
      // Manejar errores de interpolación
      const errorPoint = {
        municipio: 'Error en análisis',
        departamento: 'Error del sistema',
        lat,
        lon: lng,
        error: error.message,
        isError: true
      };
      setSelectedPoint(errorPoint);
      onPointSelect?.(errorPoint);
    }
  }, [getClosestDataPoint, evaluateBIO, onPointSelect, estimateEnvironmentalParams, validateColombianTerritory]);

  const handleZoomChange = useCallback((zoom) => {
    setZoomLevel(zoom);
  }, []);

  const handlePointClick = useCallback((point) => {
    try {
      const bioAnalysis = evaluateBIO({
        radiacion: point.radiacion,
        viento: point.viento,
        altitud: point.altitud,
        temperatura: point.temperatura,
        potencial: point.potencial,
        lat: point.lat,
        lon: point.lon
      });

      const enrichedPoint = {
        ...point,
        clickedCoords: { lat: point.lat, lng: point.lon },
        bioAnalysis
      };

      setSelectedPoint(enrichedPoint);
      onPointSelect?.(enrichedPoint);
    } catch (error) {
      console.error('Error en análisis de punto:', error);
    }
  }, [evaluateBIO, onPointSelect]);

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    flyToLocation,
    analyzeCoordinates: handleMapClick,
    analyzeExactCoordinates: handleExactCoordinateAnalysis
  }), [flyToLocation, handleMapClick, handleExactCoordinateAnalysis]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center">
          <div className="w-8 h-8 mb-3 mx-auto rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin"></div>
          <p className="text-gray-600">Cargando mapa y datos energéticos...</p>
          <p className="text-xs text-gray-500">Procesando dataset completo</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-red-50 rounded-lg`}>
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">Error cargando datos</p>
          <p className="text-xs text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden`}>
      <MapContainer
        ref={mapRef}
        center={[4.5, -74]}
        zoom={6}
        minZoom={4}
        maxZoom={18}
        style={{ height: '100%', width: '100%' }}
        className="z-0 map-container"
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler 
          onMapClick={handleMapClick}
          onZoomChange={handleZoomChange}
        />
        
        <DataPointsLayer
          zoomLevel={zoomLevel}
          selectedPoint={selectedPoint}
          onPointClick={handlePointClick}
        />
        
        {/* Pin para coordenadas de búsqueda exacta */}
        {searchPin && (
          <Marker position={[searchPin.lat, searchPin.lng]} icon={searchPinIcon}>
            <Popup>
              <div className="p-3 min-w-[200px]">
                <h3 className="font-bold text-sm text-purple-600 mb-2 flex items-center gap-2">
                  📍 <span>Ubicación Buscada</span>
                </h3>
                <p className="text-sm text-gray-700 font-medium mb-2">{searchPin.label}</p>
                <div className="text-xs text-gray-500 bg-purple-50 px-2 py-1 rounded">
                  ✨ Coordenadas exactas de tu búsqueda
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Indicador de zoom y puntos visibles */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-white/95 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg shadow-lg border border-white/20">
        <div className="text-xs font-semibold text-gray-700">
          🔍 Zoom: {zoomLevel}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {zoomLevel <= 5 && "🇨🇴 Nacional"}
          {zoomLevel >= 6 && zoomLevel <= 8 && "🏙️ Departamental"}
          {zoomLevel >= 9 && "🏢 Municipal"}
        </div>
        {/* Contador de puntos */}
        {zoomLevel >= 6 && data.length > 0 && (
          <div className="text-xs text-blue-600 mt-1 border-t border-gray-200 pt-1">
            📊 {(() => {
              if (zoomLevel >= 10) return data.length;
              
              // Calcular número real de puntos mostrados incluyendo puntos importantes
              let count = zoomLevel >= 8 ? Math.floor(data.length / 2) : Math.floor(data.length / 4);
              const importantCount = data.filter(point => 
                point.departamento && (
                  point.departamento.toLowerCase().includes('san andrés') ||
                  point.departamento.toLowerCase().includes('san andres') ||
                  point.departamento.toLowerCase().includes('archipiélago') ||
                  point.municipio && (
                    point.municipio.toLowerCase().includes('providencia') ||
                    (zoomLevel >= 6 && (
                      point.municipio.toLowerCase().includes('bogotá') ||
                      point.municipio.toLowerCase().includes('medellín') ||
                      point.municipio.toLowerCase().includes('cali') ||
                      point.municipio.toLowerCase().includes('barranquilla') ||
                      point.municipio.toLowerCase().includes('cartagena')
                    ))
                  )
                )
              ).length;
              
              return Math.min(count + importantCount, data.length);
            })()} puntos
          </div>
        )}
      </div>



      {/* Instrucciones */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10 bg-white/95 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg shadow-lg max-w-[280px] sm:max-w-sm border border-white/20">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="text-sm sm:text-lg">💡</div>
          <div className="text-xs sm:text-sm text-gray-700 font-medium leading-tight">
            {zoomLevel < 6 && "Haz zoom para explorar"}
            {zoomLevel >= 6 && zoomLevel < 9 && "Clic para analizar energía"}
            {zoomLevel >= 9 && "Clic en puntos para detalles"}
          </div>
        </div>
      </div>
    </div>
  );
});

InteractiveMap.displayName = 'InteractiveMap';

export default InteractiveMap;