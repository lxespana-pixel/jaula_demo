import React, { useState, useEffect } from 'react';

const API_URL = "https://8pkac0pg3d.execute-api.us-east-2.amazonaws.com";

function App() {
  const [etapa, setEtapa] = useState('pollitos_semana_1');
  const [config, setConfig] = useState(null);
  const [ultimaLectura, setUltimaLectura] = useState(null);
  const [error, setError] = useState('');

  //reglas biológicas
  const obtenerConfiguracion = async () => {
    try {
      const res = await fetch(`${API_URL}/configuraciones?etapa=${etapa}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error("Error al traer configuración:", err);
    }
  };

  //datos de los sensores
  const obtenerSensores = async () => {
    try {
      const res = await fetch(`${API_URL}/lecturas`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          // Buscamos donde guardaste la lista en DynamoDB (lecturas o datos_sensores)
          const sensores = data[0].datos_sensores || data[0].lecturas || [];
          setUltimaLectura(sensores);
        }
      }
    } catch (err) {
      setError("Error de conexión con la jaula");
    }
  };

  useEffect(() => {
    obtenerConfiguracion();
  }, [etapa]);

  useEffect(() => {
    obtenerSensores();
    const intervalo = setInterval(obtenerSensores, 5000);
    return () => clearInterval(intervalo);
  }, []);

  // Extraer el valor de un sensor
  const getValor = (nombre) => {
    if (!ultimaLectura) return 0;
    const sensor = ultimaLectura.find(s => s.nombre.toLowerCase() === nombre.toLowerCase());
    return sensor ? Number(sensor.valor) : 0;
  };

  // Componente visual puro en Tailwind (No se rompe jamás)
  const BarraIndustrial = ({ titulo, valor, unidad, pct, color, limite }) => (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col w-full">
      <h3 className="text-sm font-semibold text-slate-400 mb-2 tracking-wider uppercase">{titulo}</h3>
      <div className="flex items-end mb-4">
        <span className="text-4xl font-bold text-white">{valor.toFixed(1)}</span>
        <span className="text-lg text-slate-500 ml-2 mb-1">{unidad}</span>
      </div>
      {/* Contenedor de la barra */}
      <div className="w-full bg-slate-900 rounded-full h-4 mb-2 overflow-hidden shadow-inner">
        <div 
          className={`h-4 rounded-full transition-all duration-1000 ease-out ${color}`} 
          style={{ width: `${Math.min(pct * 100, 100)}%` }}
        ></div>
      </div>
      <p className="text-xs text-slate-500 text-right">{limite}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 font-sans text-slate-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecera */}
        <header className="bg-slate-800 rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-center border-l-4 border-emerald-500">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Panel de Control SCADA</h1>
            <p className="text-slate-400 mt-1">Crianza Automatizada - Jaula 1</p>
            {error && <p className="text-red-400 text-sm mt-2">⚠️ {error}</p>}
          </div>
          
          <div className="w-full md:w-72">
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              Etapa de Crecimiento
            </label>
            <select 
              value={etapa}
              onChange={(e) => setEtapa(e.target.value)}
              className="bg-slate-900 border border-slate-600 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 outline-none"
            >
              <option value="pollitos_semana_1">Semana 1 (Días 1-7)</option>
              <option value="pollitos_semana_2">Semana 2 (Días 8-14)</option>
              <option value="pollitos_semana_3">Semana 3 (Días 15-21)</option>
              <option value="pollitos_semana_4">Semana 4 (Días 22-28)</option>
              <option value="pollitos_semana_5">Semana 5 (Días 29-35)</option>
              <option value="pollitos_semana_6">Semana 6 (Días 36-42)</option>
            </select>
          </div>
        </header>

        {/* Panel de Información */}
        {config && (
          <div className="bg-slate-800 rounded-lg p-4 mb-8 border border-slate-700 text-sm text-slate-300 shadow-md">
            <span className="font-bold text-emerald-400">Estado Biológico: </span> 
            {config.descripcion}
          </div>
        )}

        {/* Cuadrícula de Sensores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BarraIndustrial 
            titulo="Temperatura" 
            valor={getValor('temperatura')} 
            unidad="°C" 
            pct={getValor('temperatura') / 50} 
            color="bg-blue-500"
            limite={config ? `Ideal: ${config.temp_min} - ${config.temp_max}°C` : 'Calculando...'}
          />
          <BarraIndustrial 
            titulo="Humedad Relativa" 
            valor={getValor('humedad')} 
            unidad="%" 
            pct={getValor('humedad') / 100} 
            color="bg-teal-500"
            limite={config ? `Ideal: ${config.hum_min} - ${config.hum_max}%` : 'Calculando...'}
          />
          <BarraIndustrial 
            titulo="Nivel de CO2" 
            valor={getValor('co2')} 
            unidad="ppm" 
            pct={getValor('co2') / 3000} 
            color="bg-amber-500"
            limite={config ? `Máximo: ${config.co2_max} ppm` : 'Calculando...'}
          />
          <BarraIndustrial 
            titulo="Amoníaco (NH3)" 
            valor={getValor('amoniaco')} 
            unidad="ppm" 
            pct={getValor('amoniaco') / 50} 
            color="bg-red-500"
            limite={config ? `Máximo: ${config.amon_max} ppm` : 'Calculando...'}
          />
          <BarraIndustrial 
            titulo="Luminosidad" 
            valor={getValor('luminosidad')} 
            unidad="lx" 
            pct={getValor('luminosidad') / 500} 
            color="bg-yellow-400"
            limite={config ? `Ideal: ${config.luz_min} - ${config.luz_max} lx` : 'Calculando...'}
          />
        </div>

      </div>
    </div>
  );
}

export default App;