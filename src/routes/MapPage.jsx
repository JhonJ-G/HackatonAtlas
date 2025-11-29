import React, { useState, useEffect } from 'react';
import SectionTitle from '../components/common/SectionTitle';
import ColombiaEnergyMap from '../components/map/ColombiaEnergyMap';
import MapModeTabs from '../components/map/MapModeTabs';
import MapLegend from '../components/map/MapLegend';
import MunicipalityDetailPanel from '../components/panels/MunicipalityDetailPanel';
import { getDepartmentData, getDepartmentRecommendation, getMunicipiosByDepartamento } from '../data/predictions-by-region';
import { normalizeDepartmentName } from '../utils/normalizeDepartmentName';

const MapPage = () => {
  const [selectedEnergyType, setSelectedEnergyType] = useState('solar');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [detailMode, setDetailMode] = useState('department'); // 'department' | 'municipality'
  const [showNonInterconnected, setShowNonInterconnected] = useState(true);
  const [departmentData, setDepartmentData] = useState(null);
  const [departmentRecommendation, setDepartmentRecommendation] = useState('');
  const [representativeMunicipios, setRepresentativeMunicipios] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRegionClick = (name) => {
    setSelectedDepartment(name);
    setSelectedMunicipality(null); // Reset municipality when selecting department
    setDetailMode('department'); // Switch to department view
  };

  // Handle municipality details selection
  const handleMunicipalityDetails = (municipalityData) => {
    console.log('Municipality details requested:', municipalityData);
    
    // Ensure the department matches the municipality's department
    const normalizedDept = normalizeDepartmentName(municipalityData.departamento);
    if (selectedDepartment !== municipalityData.departamento) {
      setSelectedDepartment(municipalityData.departamento);
    }
    
    setSelectedMunicipality(municipalityData);
    setDetailMode('municipality');
  };

  // Cargar datos del departamento cuando cambie la selección
  useEffect(() => {
    const loadDepartmentData = async () => {
      if (!selectedDepartment) {
        setDepartmentData(null);
        setDepartmentRecommendation('');
        setRepresentativeMunicipios([]);
        return;
      }

      setLoading(true);
      try {
        console.log(`Cargando datos para departamento: ${selectedDepartment}`);
        
        // Usar directamente el nombre que viene del GeoJSON (las funciones ya normalizan internamente)
        const deptData = await getDepartmentData(selectedDepartment);
        console.log('Datos del departamento:', deptData);
        
        if (!deptData) {
          console.warn(`No se encontraron datos para: ${selectedDepartment}`);
          console.warn(`Nombre normalizado: ${normalizeDepartmentName(selectedDepartment)}`);
        }
        
        setDepartmentData(deptData);
        
        // Cargar recomendación
        const recommendation = await getDepartmentRecommendation(selectedDepartment);
        setDepartmentRecommendation(recommendation);
        
        // Cargar municipios representativos (top 5)
        const municipios = await getMunicipiosByDepartamento(selectedDepartment);
        const sortedMunicipios = municipios
          .sort((a, b) => {
            const aProb = Math.max(a.prob_solar || 0, a.prob_eolica || 0, a.prob_hibrida || 0);
            const bProb = Math.max(b.prob_solar || 0, b.prob_eolica || 0, b.prob_hibrida || 0);
            return bProb - aProb;
          })
          .slice(0, 5);
        
        setRepresentativeMunicipios(sortedMunicipios);
      } catch (error) {
        console.error('Error cargando datos del departamento:', error);
        setDepartmentData(null);
        setDepartmentRecommendation('Error al cargar datos del departamento.');
        setRepresentativeMunicipios([]);
      } finally {
        setLoading(false);
      }
    };

    loadDepartmentData();
  }, [selectedDepartment]);

  return (
    <div className="min-h-screen bg-white">
      <div className="container-width section-padding">
        <div className="text-center mb-10">
          <SectionTitle 
            title="Mapa Interactivo"
            subtitle="Explora el potencial energético de Colombia por departamento"
          />
        </div>

        <div className="bg-main-dark rounded-2xl p-4 lg:p-6 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-180px)]">
            {/* Columna izquierda: mapa */}
            <div className="flex-1 lg:h-full">
              <ColombiaEnergyMap
                mode="full"
                selectedEnergyType={selectedEnergyType}
                onRegionClick={handleRegionClick}
                onMunicipalityDetails={handleMunicipalityDetails}
                height="100%"
                showNonInterconnected={showNonInterconnected}
              />
            </div>

            {/* Columna derecha: controles y detalles */}
            <div className="w-full lg:w-80 flex flex-col lg:h-full">
              
              {/* Zona de controles fijos (SIN scroll) */}
              <div className="space-y-3 flex-shrink-0">
                <MapModeTabs
                  selectedEnergyType={selectedEnergyType}
                  onChange={setSelectedEnergyType}
                />
                <MapLegend selectedEnergyType={selectedEnergyType} showNonInterconnected={showNonInterconnected} />

                {/* Toggle NID */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Resaltar zonas no interconectadas</span>
                    <input
                      type="checkbox"
                      className="accent-accent-green"
                      checked={showNonInterconnected}
                      onChange={(e) => setShowNonInterconnected(e.target.checked)}
                    />
                  </label>
                </div>

                {/* Tabs para alternar entre Departamento y Municipio */}
                {(selectedDepartment || selectedMunicipality) && (
                  <div className="flex rounded-xl bg-slate-900 p-1">
                    <button
                      onClick={() => setDetailMode('department')}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                        detailMode === 'department'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Departamento
                    </button>
                    
                    <button
                      onClick={() => selectedMunicipality && setDetailMode('municipality')}
                      disabled={!selectedMunicipality}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                        detailMode === 'municipality'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      } ${
                        !selectedMunicipality && 'opacity-40 cursor-not-allowed'
                      }`}
                    >
                      Municipio
                    </button>
                  </div>
                )}
              </div>

              {/* Zona de detalle scrollable (CON scroll interno) */}
              <div className="mt-4 flex-1 overflow-y-auto lg:pr-2 space-y-4">
                {/* Panel de detalles */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-h-[280px]">
                {/* Mostrar panel de departamento */}
                {detailMode === 'department' && selectedDepartment ? (
                  <div>
                    <div className="text-sm text-white/70 mb-1">Departamento</div>
                    <div className="text-lg font-semibold mb-3">{selectedDepartment}</div>
                    
                    {loading ? (
                      <div className="flex items-center justify-center h-20">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-accent-green animate-spin rounded-full"></div>
                      </div>
                    ) : departmentData ? (
                      <div className="space-y-4">
                        {/* Métricas de confianza responsable */}
                        {departmentData.unknown_pct > 0.2 && (
                          <div className={`border rounded-lg p-3 ${
                            departmentData.unknown_pct > 0.7 ? 'bg-amber-900/20 border-amber-500/30' :
                            departmentData.unknown_pct > 0.3 ? 'bg-orange-900/15 border-orange-500/25' :
                            'bg-blue-900/15 border-blue-500/25'
                          }`}>
                            <div className={`text-sm mb-1 flex items-center ${
                              departmentData.unknown_pct > 0.7 ? 'text-amber-300' :
                              departmentData.unknown_pct > 0.3 ? 'text-orange-300' :
                              'text-blue-300'
                            }`}>
                              {departmentData.unknown_pct > 0.7 ? '⚠️' : departmentData.unknown_pct > 0.3 ? '📊' : '📈'} Información de confianza
                            </div>
                            <div className={`text-xs space-y-1 ${
                              departmentData.unknown_pct > 0.7 ? 'text-amber-100' :
                              departmentData.unknown_pct > 0.3 ? 'text-orange-100' :
                              'text-blue-100'
                            }`}>
                              <div>Datos confirmados: {((1 - departmentData.unknown_pct) * 100).toFixed(1)}% (
                                {departmentData.unknown_pct > 0.7 ? 'cobertura baja' :
                                 departmentData.unknown_pct > 0.3 ? 'cobertura media' : 'buena cobertura'})
                              </div>
                              <div>Estabilidad de predicciones: {
                                (() => {
                                  const stablePct = departmentData.high_confidence_pct || 1;
                                  if (stablePct >= 0.9) return 'Muy alta (≥ 90%)';
                                  if (stablePct >= 0.7) return `Alta (${(stablePct * 100).toFixed(0)}%)`;
                                  if (stablePct >= 0.4) return `Media (${(stablePct * 100).toFixed(0)}%)`;
                                  return `Baja (${(stablePct * 100).toFixed(0)}%)`;
                                })()
                              }</div>
                              <div className="text-xs mt-2 opacity-90 leading-relaxed">
                                {departmentData.unknown_pct > 0.7 ?
                                  'Aunque las predicciones del modelo son internamente estables, la cobertura de datos reales es limitada. Se recomienda interpretar estos resultados con cautela y priorizar estudios locales.' :
                                  departmentData.unknown_pct > 0.3 ?
                                  'El modelo cuenta con una base de datos parcial y muestra buena estabilidad. Las recomendaciones son útiles como referencia, pero conviene complementarlas con análisis adicionales.' :
                                  'El modelo dispone de buena cantidad de datos y sus predicciones son estables. Las recomendaciones tienen un respaldo sólido, aunque nunca implican certeza absoluta.'
                                }
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Información geográfica */}
                        {departmentData.geographic_info && departmentData.geographic_info.center && (
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="text-sm text-white/70 mb-2">Información geográfica</div>
                            <div className="text-xs text-white/80 space-y-1">
                              <div className="flex justify-between">
                                <span>Centro:</span>
                                <span>{departmentData.geographic_info.center.lat.toFixed(3)}°, {departmentData.geographic_info.center.lng.toFixed(3)}°</span>
                              </div>
                              {departmentData.geographic_info.area_stats.altitude.avg && (
                                <div className="flex justify-between">
                                  <span>Altitud promedio:</span>
                                  <span>{Math.round(departmentData.geographic_info.area_stats.altitude.avg)} msnm</span>
                                </div>
                              )}
                              {departmentData.geographic_info.area_stats.radiation.avg && (
                                <div className="flex justify-between">
                                  <span>Radiación promedio:</span>
                                  <span>{departmentData.geographic_info.area_stats.radiation.avg} kWh/m²/día</span>
                                </div>
                              )}
                              {departmentData.geographic_info.area_stats.wind.avg && (
                                <div className="flex justify-between">
                                  <span>Viento promedio:</span>
                                  <span>{departmentData.geographic_info.area_stats.wind.avg} m/s</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Estadísticas por tipo de energía con probabilidades promedio */}
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                            <div className="text-white/70">Solar</div>
                            <div className="font-semibold">{(departmentData.solar_pct * 100).toFixed(1)}%</div>
                            <div className="text-xs text-white/60">
                              {departmentData.solar_pct >= 0.7 ? 'Alto' : departmentData.solar_pct >= 0.4 ? 'Medio' : 'Bajo'}
                            </div>
                            {departmentData.avg_solar_prob && (
                              <div className="text-xs text-accent-yellow mt-1">
                                Prob: {(departmentData.avg_solar_prob * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                            <div className="text-white/70">Eólico</div>
                            <div className="font-semibold">{(departmentData.eolica_pct * 100).toFixed(1)}%</div>
                            <div className="text-xs text-white/60">
                              {departmentData.eolica_pct >= 0.3 ? 'Alto' : departmentData.eolica_pct >= 0.1 ? 'Medio' : 'Bajo'}
                            </div>
                            {departmentData.avg_eolica_prob && (
                              <div className="text-xs text-accent-blue mt-1">
                                Prob: {(departmentData.avg_eolica_prob * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                            <div className="text-white/70">Híbrido</div>
                            <div className="font-semibold">{(departmentData.hibrida_pct * 100).toFixed(1)}%</div>
                            <div className="text-xs text-white/60">
                              {departmentData.hibrida_pct >= 0.3 ? 'Alto' : departmentData.hibrida_pct >= 0.1 ? 'Medio' : 'Bajo'}
                            </div>
                            {departmentData.avg_hibrida_prob && (
                              <div className="text-xs text-accent-green mt-1">
                                Prob: {(departmentData.avg_hibrida_prob * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Clase dominante */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-sm text-white/70 mb-1">Potencial dominante</div>
                          <div className="font-semibold capitalize">
                            {departmentData.dominant_class}
                            {departmentData.zni_pct > 0.5 && (
                              <span className="ml-2 px-2 py-1 bg-yellow-600/20 text-yellow-300 text-xs rounded">
                                ZNI {(departmentData.zni_pct * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-white/70 mt-1">
                            {departmentData.num_municipios} municipios analizados
                          </div>
                        </div>

                        {/* Recomendación con formato mejorado */}
                        {departmentRecommendation && (
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="text-sm text-white/70 mb-1">Recomendación IA</div>
                            <div className="text-sm text-white/90 leading-relaxed whitespace-pre-line">
                              {departmentRecommendation}
                            </div>
                          </div>
                        )}

                        {/* Municipios representativos */}
                        {representativeMunicipios.length > 0 && (
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="text-sm text-white/70 mb-2">Municipios destacados</div>
                            <div className="space-y-1 max-h-28 overflow-y-auto">
                              {representativeMunicipios.map((municipio, index) => (
                                <div key={municipio.codigo_dane_municipio} className="text-xs text-white/80 flex justify-between items-center">
                                  <span className="flex-1 truncate">{municipio.municipio}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="capitalize text-accent-green">{municipio.predicted_class}</span>
                                    <span className="text-white/60">
                                      {Math.max(
                                        municipio.prob_solar || 0,
                                        municipio.prob_eolica || 0,
                                        municipio.prob_hibrida || 0
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-white/60 text-sm">
                        <div>No se encontraron datos para: <strong>{selectedDepartment}</strong></div>
                        <div className="text-xs mt-1 text-white/50">
                          Normalizado como: <code>{normalizeDepartmentName(selectedDepartment)}</code>
                        </div>
                        <div className="text-xs mt-2 text-yellow-300">
                          Si este error persiste para departamentos conocidos como "La Guajira", por favor reportar.
                        </div>
                      </div>
                    )}
                  </div>
                ) : detailMode === 'municipality' && selectedMunicipality ? (
                  /* Mostrar panel de municipio */
                  <div>
                    <div className="text-sm text-white/70 mb-1">Municipio seleccionado</div>
                    <MunicipalityDetailPanel municipality={selectedMunicipality} />
                  </div>
                ) : (
                  /* Estado por defecto */
                  <div className="text-white/70 text-sm">
                    {!selectedDepartment && !selectedMunicipality ? (
                      <>
                        <div>Haz click en un departamento para ver detalles.</div>
                        <div className="text-xs mt-2 text-white/50">
                          O pasa el mouse sobre un municipio y haz click en "Ver detalles del municipio"
                        </div>
                      </>
                    ) : (
                      <div>Selecciona un departamento o municipio para ver detalles.</div>
                    )}
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;