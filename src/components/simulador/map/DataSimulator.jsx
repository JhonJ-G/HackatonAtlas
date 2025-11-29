import React, { useState } from 'react';
import { useEnergyData } from '../context/EnergyDataContext';

const DataSimulator = () => {
  const { clasificacionCientifica } = useEnergyData();
  const [formData, setFormData] = useState({
    radiacion: '',
    viento: '',
    altitud: '',
    temperatura: ''
  });
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSimulate = async () => {
    // Validar que todos los campos estén completos
    if (!formData.radiacion || !formData.viento || !formData.altitud || !formData.temperatura) {
      alert('Por favor completa todos los campos para realizar la simulación');
      return;
    }

    // Validar rangos básicos
    const radiacion = parseFloat(formData.radiacion);
    const viento = parseFloat(formData.viento);
    const altitud = parseFloat(formData.altitud);
    const temperatura = parseFloat(formData.temperatura);

    if (radiacion < 0 || radiacion > 10) {
      alert('La radiación solar debe estar entre 0 y 10 kWh/m²/día');
      return;
    }
    if (viento < 0 || viento > 50) {
      alert('La velocidad del viento debe estar entre 0 y 50 m/s');
      return;
    }
    if (altitud < -500 || altitud > 6000) {
      alert('La altitud debe estar entre -500 y 6000 msnm');
      return;
    }
    if (temperatura < -10 || temperatura > 50) {
      alert('La temperatura debe estar entre -10 y 50°C');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Usar clasificación científica directamente para datos personalizados
      // Esta función no requiere coordenadas ni validación territorial
      const result = clasificacionCientifica(radiacion, viento, altitud, null);
      
      // Formatear resultado para mostrar
      const formattedResult = {
        recomendacion: result.tipo.charAt(0).toUpperCase() + result.tipo.slice(1),
        confianza: Math.round(result.confianza * 100),
        explicacion: result.explicacion,
        fuente: 'Clasificación Científica',
        inputData: { radiacion, viento, altitud, temperatura }
      };

      setResult(formattedResult);
    } catch (error) {
      console.error('Error en simulación:', error);
      alert('Error al realizar la simulación. Verifica los datos ingresados.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearForm = () => {
    setFormData({
      radiacion: '',
      viento: '',
      altitud: '',
      temperatura: ''
    });
    setResult(null);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-white/10">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="text-2xl sm:text-3xl">🧪</div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold">Simulador de Datos Personalizados</h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Ingresa tus propias mediciones ambientales para obtener una recomendación energética
          </p>
        </div>
      </div>

      {/* Formulario de entrada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ☀️ Radiación Solar (kWh/m²/día)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={formData.radiacion}
            onChange={(e) => handleInputChange('radiacion', e.target.value)}
            placeholder="Ej: 4.5"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Rango típico: 3.0 - 6.5</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            💨 Velocidad del Viento (m/s)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="50"
            value={formData.viento}
            onChange={(e) => handleInputChange('viento', e.target.value)}
            placeholder="Ej: 6.2"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Rango típico: 2.0 - 12.0</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🏔️ Altitud (msnm)
          </label>
          <input
            type="number"
            step="1"
            min="-500"
            max="6000"
            value={formData.altitud}
            onChange={(e) => handleInputChange('altitud', e.target.value)}
            placeholder="Ej: 2600"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Rango típico: 0 - 4000</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🌡️ Temperatura Promedio (°C)
          </label>
          <input
            type="number"
            step="0.1"
            min="-10"
            max="50"
            value={formData.temperatura}
            onChange={(e) => handleInputChange('temperatura', e.target.value)}
            placeholder="Ej: 14.2"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Rango típico: 8.0 - 30.0</p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={handleSimulate}
          disabled={isAnalyzing}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Analizando...
            </>
          ) : (
            <>
              <span>⚡</span>
              Simular Energía
            </>
          )}
        </button>
        <button
          onClick={clearForm}
          className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-white/20"
        >
          <span>🗑️</span>
          Limpiar
        </button>
      </div>

      {/* Resultados */}
      {result && (
        <div className="bg-black/20 rounded-xl p-4 sm:p-5 border border-white/10">
          <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span>📊</span>
            Resultado de la Simulación
          </h4>

          {/* Datos ingresados */}
          <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <h5 className="text-sm font-semibold text-gray-300 mb-2">📋 Datos Ingresados:</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Radiación:</span>
                <span className="text-white font-medium">{result.inputData.radiacion} kWh/m²/día</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Viento:</span>
                <span className="text-white font-medium">{result.inputData.viento} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Altitud:</span>
                <span className="text-white font-medium">{result.inputData.altitud} msnm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Temperatura:</span>
                <span className="text-white font-medium">{result.inputData.temperatura}°C</span>
              </div>
            </div>
          </div>

          {/* Recomendación principal */}
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-lg font-bold flex items-center gap-2">
                <span>⚡</span>
                {result.recomendacion || 'Energía Recomendada'}
              </h5>
              <div className="text-right">
                <div className="text-sm text-gray-300">Confianza:</div>
                <div className="text-lg font-bold text-white">{result.confianza}%</div>
              </div>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">
              {result.explicacion || 'Análisis basado en los parámetros ambientales proporcionados.'}
            </p>
          </div>

          {/* Fuente del análisis */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>🤖</span>
            <span>Fuente: {result.fuente || 'Random Forest'}</span>
            <span className="ml-auto">✨ Análisis concluido</span>
          </div>
        </div>
      )}

      {/* Información de ayuda */}
      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <h5 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
          <span>💡</span>
          Consejos para mejores resultados:
        </h5>
        <ul className="text-xs text-blue-200 space-y-1">
          <li>• Usa datos promedio anuales para mayor precisión</li>
          <li>• La radiación solar varía entre 3-7 kWh/m²/día en Colombia</li>
          <li>• Vientos constantes &gt;5 m/s son ideales para energía eólica</li>
          <li>• Mayor altitud puede afectar la temperatura y densidad del aire</li>
        </ul>
      </div>
    </div>
  );
};

export default DataSimulator;