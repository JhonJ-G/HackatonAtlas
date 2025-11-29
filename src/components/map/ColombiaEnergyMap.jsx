import React, { useMemo, useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { geoMercator } from 'd3-geo';
import MapTooltip from './MapTooltip';
import { getEnergyValue, getMunicipiosForMap, getMunicipiosByDepartamento } from '../../data/predictions-by-region';
import { normalizeDepartmentName } from '../../utils/normalizeDepartmentName';

// URL del archivo GeoJSON
const GADM_COL_L1_URL = '/data/gadm41_COL_1.json';

// Configuración mejorada para el mapa con mejor utilización del espacio
const DEFAULT_CENTER = [-74, 4.5]; // Centro aproximado de Colombia
const MIN_ZOOM = 1;
const MAX_ZOOM = 10; // Aumentado para permitir más detalle
const SAFE_ZOOM_DEPARTMENT = 4; // Zoom mejorado para enfocar un departamento
const AUTO_ZOOM_MUNICIPALITY = 6; // Zoom para municipios cuando están visibles

// Bounds mejorados de Colombia para mejor utilización del espacio
const COLOMBIA_BOUNDS = {
  north: 13.5,
  south: -4.2,
  west: -82,
  east: -66,
  center: [-74, 4.5],
  // Escala optimizada para maximizar el uso del espacio del contenedor
  scale: 1500
};

const colorConfigs = {
  solar: { stops: ['#FDE68A', '#F59E0B'], label: 'Potencial Solar' },
  eolico: { stops: ['#A7F3D0', '#14B8A6'], label: 'Potencial Eólico' },
  hibrido: { stops: ['#D9F99D', '#34D399'], label: 'Potencial Híbrido' },
};

export default function ColombiaEnergyMap({
  mode = 'hero',
  selectedEnergyType = 'solar',
  onRegionClick,
  onMunicipalityDetails,
  className = '',
  height = 320,
  dataUrl = GADM_COL_L1_URL,
  nonInterconnected = [
    'Amazonas',
    'Guainía',
    'Guaviare',
    'Vaupés',
    'Vichada',
    'Chocó',
    'Putumayo',
    'La Guajira',
  ],
  showNonInterconnected = true,
}) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: '', value: 0 });
  
  // Estados para tooltip de municipios con modo hover y pinned
  const [hoveredMunicipality, setHoveredMunicipality] = useState(null);
  const [pinnedMunicipality, setPinnedMunicipality] = useState(null);
  
  // Estado controlado de la posición del mapa (centro + zoom) - CLAVE PARA FIX DEL BUG
  const [position, setPosition] = useState({
    coordinates: DEFAULT_CENTER,
    zoom: 1,
  });
  
  const [municipios, setMunicipios] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDepartmentRaw, setSelectedDepartmentRaw] = useState(null); // Nombre original del GeoJSON
  const [energyValues, setEnergyValues] = useState({});
  const [geoData, setGeoData] = useState(null);

  const cfg = colorConfigs[selectedEnergyType] || colorConfigs.solar;

  const colorScale = useMemo(() => {
    return scaleLinear().domain([0, 1]).range(cfg.stops);
  }, [cfg]);

  // Municipio activo para el tooltip (pinned tiene prioridad sobre hovered)
  const activeMunicipality = pinnedMunicipality || hoveredMunicipality;

  // Handler para cerrar tooltip pinned
  const handleClosePinned = () => {
    setPinnedMunicipality(null);
    setHoveredMunicipality(null);
  };

  // Handler para hacer clic en el background del mapa (cerrar pinned)
  const handleMapBackgroundClick = (evt) => {
    // Solo cerrar si realmente es un clic en el background, no en elementos del mapa
    if (pinnedMunicipality && evt.target === evt.currentTarget) {
      handleClosePinned();
    }
  };

  // Función para manejar cambios de posición con validaciones robustas
  const handleMoveEnd = (newPosition) => {
    console.log('handleMoveEnd called with:', newPosition);
    
    // Validaciones críticas para evitar que el mapa desaparezca
    if (
      !newPosition ||
      !Array.isArray(newPosition.coordinates) ||
      newPosition.coordinates.length !== 2 ||
      !Number.isFinite(newPosition.coordinates[0]) ||
      !Number.isFinite(newPosition.coordinates[1]) ||
      !Number.isFinite(newPosition.zoom)
    ) {
      console.warn('Invalid position received, resetting to default');
      setPosition({
        coordinates: DEFAULT_CENTER,
        zoom: 1,
      });
      return;
    }

    // Aplicar límites de zoom de forma segura
    const safeZoom = Math.min(Math.max(newPosition.zoom, MIN_ZOOM), MAX_ZOOM);
    
    // Aplicar límites geográficos para Colombia
    const [lng, lat] = newPosition.coordinates;
    const safeLng = Math.min(Math.max(lng, -85), -65); // Longitud aproximada de Colombia
    const safeLat = Math.min(Math.max(lat, -5), 15);   // Latitud aproximada de Colombia

    setPosition({
      coordinates: [safeLng, safeLat],
      zoom: safeZoom,
    });
  };

  // Función para resetear vista (útil para debugging o botón de reset)
  const handleResetView = () => {
    setPosition({
      coordinates: DEFAULT_CENTER,
      zoom: 1,
    });
  };

  // Controles de zoom programáticos
  const zoomIn = () => {
    setPosition(prev => ({
      coordinates: prev.coordinates,
      zoom: Math.min(prev.zoom * 1.5, MAX_ZOOM)
    }));
  };

  const zoomOut = () => {
    setPosition(prev => ({
      coordinates: prev.coordinates,
      zoom: Math.max(prev.zoom / 1.5, MIN_ZOOM)
    }));
  };

  // Función mejorada para enfocar un departamento
  const focusOnDepartment = (geography) => {
    try {
      // Calcular bounds del departamento usando la geometría completa
      const { geometry } = geography;
      if (!geometry || !geometry.coordinates) return;
      
      // Calcular centro y zoom apropiado
      let minLng = Infinity, maxLng = -Infinity;
      let minLat = Infinity, maxLat = -Infinity;
      
      // Función recursiva para procesar cualquier tipo de geometría
      const processCoordinates = (coords) => {
        if (typeof coords[0] === 'number') {
          // Es una coordenada simple [lng, lat]
          const [lng, lat] = coords;
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        } else if (Array.isArray(coords)) {
          // Es un array de coordenadas, procesar recursivamente
          coords.forEach(processCoordinates);
        }
      };
      
      // Procesar todas las coordenadas
      processCoordinates(geometry.coordinates);

      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;
      
      // Calcular zoom basado en el tamaño del departamento
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;
      const maxDiff = Math.max(latDiff, lngDiff);
      
      const suggestedZoom = maxDiff > 2 ? SAFE_ZOOM_DEPARTMENT : 
                           maxDiff > 1 ? SAFE_ZOOM_DEPARTMENT * 1.5 : 
                           SAFE_ZOOM_DEPARTMENT * 2;

      setPosition({
        coordinates: [centerLng, centerLat],
        zoom: Math.min(suggestedZoom, MAX_ZOOM)
      });
    } catch (error) {
      console.warn('Error focusing on department:', error);
    }
  };

  // Cargar datos del GeoJSON
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const response = await fetch(dataUrl);
        const data = await response.json();
        setGeoData(data);
      } catch (error) {
        console.error('Error loading geo data:', error);
      }
    };
    
    loadGeoData();
  }, [dataUrl]);

  // Cargar municipios cuando cambie el zoom o departamento seleccionado
  useEffect(() => {
    const loadMunicipios = async () => {
      try {
        let municipiosData = [];
        
        if (position.zoom > 2.5) {
          if (selectedDepartmentRaw) {
            // Mostrar solo municipios del departamento seleccionado
            municipiosData = await getMunicipiosByDepartamento(selectedDepartmentRaw);
            console.log(`Cargando municipios para departamento: ${selectedDepartmentRaw}`, municipiosData.length);
          } else {
            // Mostrar todos los municipios (para zoom alto sin selección)
            municipiosData = await getMunicipiosForMap(null, position.zoom);
          }
        }
        
        setMunicipios(municipiosData);
      } catch (error) {
        console.error('Error loading municipios:', error);
        setMunicipios([]);
      }
    };

    loadMunicipios();
  }, [position.zoom, selectedDepartmentRaw]);

  // Pre-cargar valores de energía para todos los departamentos
  useEffect(() => {
    const loadEnergyValues = async () => {
      if (!geoData) return;
      
      const values = {};
      const departments = geoData.features || [];
      
      for (const feature of departments) {
        const name = feature.properties?.NAME_1;
        if (name) {
          try {
            // Usar el nombre original del GeoJSON para getEnergyValue
            const value = await getEnergyValue(name, selectedEnergyType);
            values[name] = value;
          } catch (error) {
            console.warn(`Error loading energy value for ${name}:`, error);
            values[name] = 0.2; // valor por defecto
          }
        }
      }
      
      setEnergyValues(values);
    };

    loadEnergyValues();
  }, [geoData, selectedEnergyType]);

  if (!geoData) {
    return (
      <div className={`flex items-center justify-center bg-slate-900 rounded-xl ${className} ${height === '100%' ? 'h-full' : ''}`} style={{ height: height === '100%' ? undefined : height }}>
        <div className="text-white text-sm">Cargando mapa...</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className} ${height === '100%' ? 'h-full' : ''}`}>
      <div className={`bg-slate-900 rounded-xl overflow-hidden ${height === '100%' ? 'h-full' : ''}`} style={{ height: height === '100%' ? undefined : height }}>
        {/* Controles opcionales para debugging */}
        {/* Controles de mapa mejorados */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {/* Controles de zoom */}
          <div className="flex flex-col bg-black/50 backdrop-blur rounded-lg overflow-hidden border border-white/20">
            <button
              onClick={zoomIn}
              disabled={position.zoom >= MAX_ZOOM}
              className="p-2 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-bold"
              title="Acercar"
            >
              +
            </button>
            <div className="h-px bg-white/20"></div>
            <button
              onClick={zoomOut}
              disabled={position.zoom <= MIN_ZOOM}
              className="p-2 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-bold"
              title="Alejar"
            >
              −
            </button>
          </div>
          
          {/* Botón de reset */}
          <button
            onClick={handleResetView}
            className="p-2 bg-black/50 backdrop-blur text-white hover:bg-white/20 rounded-lg border border-white/20 transition-colors"
            title="Vista general"
          >
            🏠
          </button>
        </div>

        {/* Indicador de zoom y coordenadas (solo en modo debug) */}
        {mode === 'debug' && (
          <div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur rounded-lg p-2 text-white text-xs border border-white/20">
            <div>Zoom: {position.zoom.toFixed(1)}x</div>
            <div>Centro: [{position.coordinates[0].toFixed(2)}, {position.coordinates[1].toFixed(2)}]</div>
          </div>
        )}

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: COLOMBIA_BOUNDS.center,
            scale: COLOMBIA_BOUNDS.scale, // Escala optimizada
          }}
          style={{ width: "100%", height: "100%" }}
          onClick={handleMapBackgroundClick}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={handleMoveEnd}
          >
            <Geographies geography={dataUrl}>
            {({ geographies }) => (
              geographies.map((geo) => {
                const name = geo.properties?.NAME_1 || 'Desconocido';
                const energyValue = energyValues[name] || 0.2;
                const fill = colorScale(energyValue);
                const isNID = showNonInterconnected && nonInterconnected.includes(name);
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseMove={(evt) => {
                      setTooltip({
                        visible: true,
                        x: evt.clientX,
                        y: evt.clientY,
                        name,
                        value: energyValue,
                      });
                    }}
                    onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
                    onClick={() => {
                      // Limpiar tooltip fijado al seleccionar departamento
                      setPinnedMunicipality(null);
                      setHoveredMunicipality(null);
                      
                      // Guardar tanto el nombre original como el normalizado
                      const normalizedName = normalizeDepartmentName(name);
                      setSelectedDepartment(normalizedName);
                      setSelectedDepartmentRaw(name); // Nombre original del GeoJSON
                      
                      // Notificar al componente padre con el nombre original
                      onRegionClick?.(name);
                      
                      console.log(`Departamento seleccionado: ${name} -> normalizado: ${normalizedName}`);
                      
                      // Enfocar el departamento con animación suave
                      focusOnDepartment(geo);
                    }}
                    style={{
                      default: {
                        fill,
                        stroke: isNID ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                        strokeWidth: isNID ? 1 : 0.4,
                        strokeDasharray: isNID ? '4 3' : 'none',
                        outline: 'none',
                        transition: 'fill 200ms ease, transform 200ms ease',
                      },
                      hover: {
                        fill,
                        stroke: isNID ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.8)',
                        strokeWidth: isNID ? 1.4 : 1.1,
                        strokeDasharray: isNID ? '4 3' : 'none',
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            )}
            </Geographies>
            
            {/* Marcadores de municipios con información mejorada cuando hay zoom suficiente */}
            {position.zoom > 2.5 && municipios.map((municipio) => (
              <Marker
                key={municipio.codigo_dane_municipio}
                coordinates={[municipio.longitud, municipio.latitud]}
              >
                <circle
                  r={Math.max(1.5, 8 - position.zoom)}
                  fill={municipio.color}
                  stroke="white"
                  strokeWidth={0.8}
                  opacity={0.9}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(evt) => {
                    // Solo mostrar hover si no hay municipio fijado
                    if (!pinnedMunicipality) {
                      const municipioData = {
                        municipio: municipio.municipio,
                        departamento: municipio.departamento,
                        predicted_class: municipio.predicted_class,
                        tipo_red: municipio.tipo_red,
                        latitud: municipio.latitud,
                        longitud: municipio.longitud,
                        altitud_msnm: municipio.altitud_msnm,
                        radiacion_kWhm2_dia: municipio.radiacion_kWhm2_dia,
                        viento_ms: municipio.viento_ms,
                        temperatura_C: municipio.temperatura_C,
                        prob_solar: municipio.prob_solar,
                        prob_eolica: municipio.prob_eolica,
                        prob_hibrida: municipio.prob_hibrida,
                        codigo_dane_municipio: municipio.codigo_dane_municipio,
                        probability: municipio.probability,
                        color: municipio.color,
                        // Coordenadas para posicionar el tooltip
                        tooltipX: evt.clientX,
                        tooltipY: evt.clientY
                      };
                      setHoveredMunicipality(municipioData);
                    }
                  }}
                  onMouseLeave={() => {
                    // Solo limpiar hover si no hay municipio fijado
                    if (!pinnedMunicipality) {
                      setHoveredMunicipality(null);
                    }
                  }}
                  onClick={(evt) => {
                    // Fijar municipio al hacer clic
                    const municipioData = {
                      municipio: municipio.municipio,
                      departamento: municipio.departamento,
                      predicted_class: municipio.predicted_class,
                      tipo_red: municipio.tipo_red,
                      latitud: municipio.latitud,
                      longitud: municipio.longitud,
                      altitud_msnm: municipio.altitud_msnm,
                      radiacion_kWhm2_dia: municipio.radiacion_kWhm2_dia,
                      viento_ms: municipio.viento_ms,
                      temperatura_C: municipio.temperatura_C,
                      prob_solar: municipio.prob_solar,
                      prob_eolica: municipio.prob_eolica,
                      prob_hibrida: municipio.prob_hibrida,
                      codigo_dane_municipio: municipio.codigo_dane_municipio,
                      probability: municipio.probability,
                      color: municipio.color,
                      // Coordenadas para posicionar el tooltip
                      tooltipX: evt.clientX,
                      tooltipY: evt.clientY
                    };
                    
                    setPinnedMunicipality(municipioData);
                    setHoveredMunicipality(null); // Limpiar hover ya que ahora está fijado
                    
                    // Prevenir que el clic se propague al mapa
                    evt.stopPropagation();
                  }}
                />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Tooltip de municipio con modo hover y pinned */}
      {activeMunicipality && (
        <MapTooltip
          visible={true}
          x={activeMunicipality.tooltipX}
          y={activeMunicipality.tooltipY}
          name={`${activeMunicipality.municipio}, ${activeMunicipality.departamento}`}
          typeLabel={cfg.label}
          indexValue={activeMunicipality.probability}
          extra={activeMunicipality}
          onMunicipalityDetails={onMunicipalityDetails}
          onClosePinned={pinnedMunicipality ? handleClosePinned : null}
          isPinned={!!pinnedMunicipality}
        />
      )}
    </div>
  );
}

/* 
 * SOLUCIÓN AL BUG DEL MAPA QUE DESAPARECE:
 * 
 * PROBLEMA: El ZoomableGroup no tenía el prop 'center' definido, causando que al hacer zoom 
 * o click en departamentos, el centro se volviera undefined/NaN y el mapa se perdiera.
 * 
 * SOLUCIÓN IMPLEMENTADA:
 * 1. Estado controlado 'position' que maneja tanto coordinates como zoom de forma unificada
 * 2. Función handleMoveEnd con validaciones robustas que:
 *    - Verifica que las coordenadas sean números válidos
 *    - Aplica límites geográficos para Colombia
 *    - Resetea a valores seguros si detecta datos inválidos
 * 3. Límites de zoom (MIN_ZOOM, MAX_ZOOM) aplicados consistentemente
 * 4. Función focusOnDepartment opcional para enfocar departamentos de forma segura
 * 
 * RESULTADO: El mapa siempre mantiene valores válidos de centro y zoom, evitando que 
 * desaparezca por coordenadas inválidas.
 */