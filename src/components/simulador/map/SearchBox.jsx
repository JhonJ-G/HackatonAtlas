import React, { useState, useEffect, useRef } from 'react';
import { useEnergyData } from '../context/EnergyDataContext';

/**
 * SearchBox - Componente de búsqueda avanzada que permite:
 * 1. Búsqueda por nombres de municipios y departamentos
 * 2. Búsqueda por coordenadas geográficas (lat, lon)
 * 3. Sugerencias inteligentes con navegación por teclado
 * 
 * Formatos de coordenadas soportados:
 * - "4.711, -74.072" (con coma)
 * - "4.711 -74.072" (con espacio)
 * - Validación automática para rangos de Colombia
 */
const SearchBox = ({ onLocationSelect, className = '' }) => {
  const { data, departmentData } = useEnergyData();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Función para parsear coordenadas en diferentes formatos
  const parseCoordinates = (text) => {
    const coordPatterns = [
      // Formato: lat, lon (decimales)
      /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/,
      // Formato: lat lon (decimales sin coma)
      /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/,
      // Formato: "lat, lon" con posibles espacios
      /^\s*(-?\d+\.?\d*)\s*,?\s+(-?\d+\.?\d*)\s*$/,
      // Formato más flexible con posibles caracteres extra
      /(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/
    ];

    for (const pattern of coordPatterns) {
      const match = text.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        
        // Validar que las coordenadas estén en rangos válidos
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          // Para Colombia, validar rangos aproximados
          if (lat >= -4.3 && lat <= 12.5 && lon >= -79.0 && lon <= -66.9) {
            return { lat, lon };
          }
        }
      }
    }
    return null;
  };

  // Buscar puntos cercanos a coordenadas específicas
  const searchByCoordinates = (lat, lon, radius = 0.1) => {
    const nearbyPoints = [];
    
    data.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(point.lat - lat, 2) + Math.pow(point.lon - lon, 2)
      );
      
      if (distance <= radius) {
        nearbyPoints.push({
          type: 'coordenada',
          name: point.municipio,
          department: point.departamento,
          coords: [point.lat, point.lon],
          data: point,
          distance: distance,
          display: `${point.municipio} - ${point.departamento}`,
          subtitle: `${distance.toFixed(4)}° de distancia`
        });
      }
    });

    // Ordenar por distancia
    return nearbyPoints.sort((a, b) => a.distance - b.distance).slice(0, 5);
  };

  // Buscar en municipios, departamentos y coordenadas
  const searchLocations = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const municipios = [];
    const departamentos = [];
    let coordResults = [];

    // Intentar parsear como coordenadas primero
    const coords = parseCoordinates(searchTerm);
    if (coords) {
      coordResults = searchByCoordinates(coords.lat, coords.lon);
      
      // Siempre agregar opción de coordenadas exactas al inicio
      coordResults.unshift({
        type: 'coordenada_exacta',
        name: 'Coordenadas específicas',
        department: '',
        coords: [coords.lat, coords.lon],
        data: null,
        display: `Ir exactamente a: ${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}`,
        subtitle: 'Coordenadas exactas - ubicación precisa'
      });
    }

    // Si no es una búsqueda de coordenadas, buscar nombres
    if (!coords) {
      // Buscar municipios
      data.forEach(point => {
        if (point.municipio.toLowerCase().includes(term)) {
          municipios.push({
            type: 'municipio',
            name: point.municipio,
            department: point.departamento,
            coords: [point.lat, point.lon],
            data: point,
            display: `${point.municipio} - ${point.departamento}`
          });
        }
      });

      // Buscar departamentos
      Object.keys(departmentData).forEach(dept => {
        if (dept.toLowerCase().includes(term)) {
          const deptMunicipios = departmentData[dept].municipios;
          if (deptMunicipios.length > 0) {
            // Usar el centro aproximado del departamento
            const avgLat = deptMunicipios.reduce((sum, m) => sum + m.lat, 0) / deptMunicipios.length;
            const avgLon = deptMunicipios.reduce((sum, m) => sum + m.lon, 0) / deptMunicipios.length;
            
            departamentos.push({
              type: 'departamento',
              name: dept,
              department: dept,
              coords: [avgLat, avgLon],
              municipiosCount: deptMunicipios.length,
              display: `${dept} (${deptMunicipios.length} municipios)`
            });
          }
        }
      });

      // Remover duplicados de municipios
      const uniqueMunicipios = municipios.filter((item, index, self) => 
        index === self.findIndex(t => t.name === item.name && t.department === item.department)
      );

      // Combinar resultados (departamentos primero, luego municipios)
      const combinedResults = [...departamentos, ...uniqueMunicipios.slice(0, 8)].slice(0, 10);
      setResults(combinedResults);
    } else {
      // Si es búsqueda de coordenadas, mostrar solo esos resultados
      setResults(coordResults);
    }
  };

  // Manejar cambio en input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    searchLocations(value);
    setShowResults(true);
  };

  // Manejar selección de resultado
  const handleSelectResult = (result) => {
    setQuery(result.display);
    setShowResults(false);
    setSelectedIndex(-1);
    onLocationSelect?.(result);
  };

  // Manejar teclas
  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Limpiar búsqueda
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Input de búsqueda */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
          placeholder="🔍 Buscar lugar o coordenadas (ej: Bogotá o 4.711, -74.072)"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 pr-10 sm:pr-11 bg-white backdrop-blur-sm border border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all shadow-lg hover:shadow-xl"
        />
        
        {/* Icono de búsqueda */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Botón limpiar */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl shadow-2xl z-50 max-h-56 sm:max-h-64 overflow-y-auto"
        >
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.name}-${result.department}`}
              onClick={() => handleSelectResult(result)}
              className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 hover:shadow-sm border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                index === selectedIndex ? 'bg-accent-green/10' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-900 text-sm font-medium">{result.display}</div>
                  <div className="text-gray-600 text-xs capitalize flex items-center gap-2">
                    {result.type === 'departamento' && (
                      <>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Departamento
                        </span>
                        <span>{result.municipiosCount} municipios</span>
                      </>
                    )}
                    {result.type === 'municipio' && result.data && (
                      <>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Municipio
                        </span>
                        <span>{result.data.potencial}</span>
                      </>
                    )}
                    {(result.type === 'coordenada' || result.type === 'coordenada_exacta') && (
                      <>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {result.type === 'coordenada_exacta' ? 'Coordenadas' : 'Cercano'}
                        </span>
                        {result.subtitle && <span>{result.subtitle}</span>}
                      </>
                    )}
                  </div>
                </div>
                <div className="text-white/40 text-xs">
                  {result.coords[0].toFixed(2)}, {result.coords[1].toFixed(2)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mensaje sin resultados */}
      {showResults && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-xl z-50 p-4 text-center">
          <div className="text-center">
            <div className="text-2xl mb-2">🔍</div>
            <div className="text-gray-700 text-sm font-medium mb-3">
              No se encontraron resultados para "{query}"
            </div>
            <div className="text-gray-600 text-xs space-y-2">
              <div className="font-medium text-gray-700 mb-2">📝 Formatos de búsqueda:</div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <div className="font-medium text-blue-700 mb-1">🏙️ Nombres:</div>
                <div className="text-blue-600">"Bogotá", "Cundinamarca", "Medellín"</div>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg">
                <div className="font-medium text-purple-700 mb-1">📍 Coordenadas:</div>
                <div className="text-purple-600">"4.711, -74.072" o "10.456, -73.240"</div>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg text-gray-600">
                <div className="text-xs">Rangos válidos para Colombia:</div>
                <div className="text-xs">Lat: -4.3 a 12.5 | Lon: -79.0 a -66.9</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ayuda para coordenadas */}
      {showResults && query.length >= 3 && query.includes(',') && results.length === 0 && (() => {
        const coords = parseCoordinates(query);
        return !coords;
      })() && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl shadow-2xl z-50 p-4">
          <div className="text-center">
            <div className="text-2xl mb-2">📍</div>
            <div className="text-yellow-800 text-sm font-bold mb-2">
              💡 Formato de Coordenadas Detectado
            </div>
            <div className="text-yellow-700 text-xs">
              <div className="mb-2">Verifica que las coordenadas estén correctas:</div>
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 font-mono font-medium text-yellow-800">
                latitud, longitud
              </div>
              <div className="mt-2 text-yellow-600">
                <div className="font-medium">Ejemplos válidos:</div>
                <div>Bogotá: 4.711, -74.072</div>
                <div>Medellín: 6.244, -75.581</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBox;