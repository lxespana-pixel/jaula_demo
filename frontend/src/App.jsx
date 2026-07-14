import React, { useState, useEffect } from 'react';
import GaugeChart from 'react-gauge-chart';

const API_URL = "https://8pkac0pg3d.execute-api.us-east-2.amazonaws.com";

function App() {
  const [etapa, setEtapa] = useState('pollitos_semana_1');
  const [config, setConfig] = useState(null);
  const [ultimaLectura, setUltimaLectura] = useState(null);
  const [error, setError] = useState('');

  // 1. Función para traer las reglas biológicas de AWS
  const obtenerConfiguracion = async () => {
    try {
      const res = await fetch(`${API_URL}/configuraciones?etapa=${etapa}`);
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.error("Error al traer configuración:", err);
    }
  };

  // 2. Función para traer los datos reales de los sensores de AWS
  const obtenerSensores = async () => {
    try {
      const res = await fetch(`${API_URL}/lecturas`);
      const data = await res.json();
      // Como modificaste el Limit=1 en AWS, el arreglo trae solo 1 registro (el más reciente)
      if (data && data.length > 0) {
        setUltimaLectura(data[0].datos_sensores);
      }
    } catch (err) {
      setError("Error de conexión con la jaula");
    }
  };

  // 3. Ejecutar las consultas automáticamente
  useEffect(() => {
    obtenerConfiguracion();
  }, [etapa]); // Si cambias de semana, vuelve a pedir las reglas

  useEffect(() => {
    obtenerSensores();
    // Consultar nuevos datos cada 5 segundos
    const intervalo = setInterval(obtenerSensores, 5000);
    return () => clearInterval(intervalo);
  }, []);

  // Función auxiliar para extraer el valor exacto de un sensor específico
  const getValor = (nombre) => {
    if (!ultimaLectura) return 0;
    const sensor = ultimaLectura.find(s => s.nombre.toLowerCase() === nombre.toLowerCase());
    return sensor ? sensor.valor : 0;
  };

  // Cálculos de porcentaje para que la aguja se mueva correctamente (0 a 1)
  // Usamos topes máximos absolutos para escalar el velocímetro
  const pctTemp = getValor('temperatura') / 50; // Tope 50°C
  const pctHum = getValor('humedad') / 100;     // Tope 100%
  const pctCo2 = getValor('co2') / 3000;        // Tope 3000 ppm
  const pctAmon = getValor('amoníaco') / 50;    // Tope 50 ppm
  const pctLuz = getValor('luminosidad') / 500; // Tope 500 lx

  return (
    <div className="min-h-screen bg-slate-900 p-8 font-sans text-slate-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecera del Dashboard en Modo Oscuro Industrial */}
        <header className="bg-slate-800 rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-center border-l-4 border-emerald-500">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-white tracking-wide">Panel de Control IoT</h1>
            <p className="text-slate-400 mt-1">Crianza Automatizada - Jaula 1</p>
            {error && <p className="text-red-400 text-sm mt-2">⚠️ {error}</p>}
          </div>
          
          <div className="w-full md:w-72">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Etapa de Crecimiento
            </label>
            <select 
              value={etapa}
              onChange={(e) => setEtapa(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 outline-none"
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

        {/* Panel Informativo de la Semana */}
        {config && (
          <div className="bg-slate-800 rounded-lg p-4 mb-8 border border-slate-700 text-sm text-slate-300">
            <span className="font-bold text-emerald-400">Objetivo actual: </span> 
            {config.descripcion}
          </div>
        )}

        {/* Cuadrícula de Velocímetros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Velocímetro Temperatura */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-slate-300 mb-4 tracking-wider">TEMPERATURA</h3>
            <GaugeChart id="gauge-temp" 
              nrOfLevels={30} 
              colors={["#3b82f6", "#10b981", "#ef4444"]} // Azul (Frío), Verde (Ideal), Rojo (Calor)
              arcWidth={0.3} 
              percent={pctTemp} 
              textColor="#ffffff"
              formatTextValue={() => `${getValor('temperatura').toFixed(1)} °C`}
            />
            {config && (
              <p className="text-xs text-slate-500 mt-2">Rango ideal: {config.temp_min}°C - {config.temp_max}°C</p>
            )}
          </div>

          {/* Velocímetro Humedad */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-slate-300 mb-4 tracking-wider">HUMEDAD</h3>
            <GaugeChart id="gauge-hum" 
              nrOfLevels={20} 
              colors={["#f59e0b", "#10b981", "#3b82f6"]} 
              arcWidth={0.3} 
              percent={pctHum} 
              textColor="#ffffff"
              formatTextValue={() => `${getValor('humedad').toFixed(1)} %`}
            />
            {config && (
              <p className="text-xs text-slate-500 mt-2">Rango ideal: {config.hum_min}% - {config.hum_max}%</p>
            )}
          </div>

          {/* Velocímetro CO2 */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-slate-300 mb-4 tracking-wider">NIVEL DE CO2</h3>
            <GaugeChart id="gauge-co2" 
              nrOfLevels={20} 
              colors={["#10b981", "#f59e0b", "#ef4444"]} 
              arcWidth={0.3} 
              percent={pctCo2} 
              textColor="#ffffff"
              formatTextValue={() => `${getValor('co2').toFixed(0)} ppm`}
            />
            {config && (
              <p className="text-xs text-slate-500 mt-2">Máximo permitido: {config.co2_max} ppm</p>
            )}
          </div>

          {/* Velocímetro Amoníaco */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-slate-300 mb-4 tracking-wider">AMONÍACO (NH3)</h3>
            <GaugeChart id="gauge-amon" 
              nrOfLevels={20} 
              colors={["#10b981", "#f59e0b", "#ef4444"]} 
              arcWidth={0.3} 
              percent={pctAmon} 
              textColor="#ffffff"
              formatTextValue={() => `${getValor('amoníaco').toFixed(2)} ppm`}
            />
            {config && (
              <p className="text-xs text-slate-500 mt-2">Máximo permitido: {config.amon_max} ppm</p>
            )}
          </div>

          {/* Velocímetro Luz */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-slate-300 mb-4 tracking-wider">LUMINOSIDAD</h3>
            <GaugeChart id="gauge-luz" 
              nrOfLevels={20} 
              colors={["#475569", "#eab308"]} 
              arcWidth={0.3} 
              percent={pctLuz} 
              textColor="#ffffff"
              formatTextValue={() => `${getValor('luminosidad').toFixed(0)} lx`}
            />
            {config && (
              <p className="text-xs text-slate-500 mt-2">Rango ideal: {config.luz_min} - {config.luz_max} lx</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;