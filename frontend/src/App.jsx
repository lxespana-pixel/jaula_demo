import React, { useState, useEffect } from 'react';
import GaugeComponent from 'react-gauge-component';
import { Thermometer, Droplets, Cloud, FlaskConical, Sun } from 'lucide-react';

const API_URL = "https://8pkac0pg3d.execute-api.us-east-2.amazonaws.com";

const IndicadorGauge = ({ titulo, valor, unidad, minGrafico, maxGrafico, limiteInf, limiteSup, tipo, Icono, colorIcono }) => {
  let subArcs = [];
  
  if (tipo === 'rango' && limiteInf !== undefined && limiteSup !== undefined) {
    subArcs = [
      { limit: limiteInf, color: '#3b82f6' }, 
      { limit: limiteSup, color: '#10b981' }, 
      { color: '#ef4444' } // Rojo
    ];
  } else if (tipo === 'tope' && limiteSup !== undefined) {
    subArcs = [
      { limit: limiteSup, color: '#10b981' }, 
      { color: '#ef4444' } 
    ];
  } else {
    subArcs = [{ limit: maxGrafico, color: '#334155' }];
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center justify-between transition-all hover:border-slate-500">
      
      
      <div className="flex items-center justify-center gap-3 mb-6">
        <Icono className={`w-6 h-6 ${colorIcono}`} />
        <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase">{titulo}</h3>
      </div>
      
      <div className="w-full flex justify-center mb-4">
        <GaugeComponent
          type="semicircle"
          arc={{
            width: 0.15, 
            padding: 0.02,
            subArcs: subArcs
          }}
          pointer={{
            type: "needle",
            color: "#ef4444", 
            length: 0.8,
            width: 12,
            animationDelay: 0, // Animación instantánea
          }}
          labels={{
            valueLabel: {
              formatTextValue: val => `${val.toFixed(1)} ${unidad}`,
              style: { fontSize: "32px", fill: "#ffffff", textShadow: "none", fontWeight: "bold" }
            },
            tickLabels: {
              type: "outer",
              hideMinMax: true, 
              defaultTickValueConfig: { formatTextValue: () => '' }, 
              ticks: []
            }
          }}
          value={valor}
          minValue={minGrafico}
          maxValue={maxGrafico}
        />
      </div>

      <p className="text-xs text-slate-400 text-center font-medium bg-slate-900 py-2 px-4 rounded-full border border-slate-700 mt-2">
        {tipo === 'rango' 
          ? `Ideal: ${limiteInf ?? '--'} a ${limiteSup ?? '--'} ${unidad}` 
          : `Máximo permitido: ${limiteSup ?? '--'} ${unidad}`}
      </p>
    </div>
  );
};

// 2. LA APLICACIÓN PRINCIPAL
function App() {
  const [etapa, setEtapa] = useState('pollitos_semana_1');
  const [config, setConfig] = useState(null);
  const [ultimaLectura, setUltimaLectura] = useState(null);
  const [error, setError] = useState('');

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

  const obtenerSensores = async () => {
    try {
      const res = await fetch(`${API_URL}/lecturas`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const sensores = data[0].datos_sensores || data[0].lecturas || [];
          setUltimaLectura(sensores);
        }
      }
    } catch (err) {
      setError("Error de conexión con AWS");
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

  const getValor = (nombre) => {
    if (!ultimaLectura) return 0;
    const sensor = ultimaLectura.find(s => s.nombre.toLowerCase() === nombre.toLowerCase());
    return sensor ? Number(sensor.valor) : 0;
  };

  const configSegura = config || {};

  return (
    // CAMBIO A PANTALLA COMPLETA: max-w-full en lugar de max-w-7xl
    <div className="min-h-screen bg-slate-900 p-4 md:p-6 font-sans text-slate-100">
      <div className="max-w-full mx-auto">
        
        <header className="bg-slate-800 rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row justify-between items-center border-l-4 border-emerald-500">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Dashboard</h1>
            <p className="text-slate-400 mt-1">Crianza Automatizada - Jaula 1</p>
            {error && <p className="text-red-400 text-sm mt-2"> {error}</p>}
          </div>
          
          <div className="w-full md:w-80">
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              Etapa de Crecimiento
            </label>
            <select 
              value={etapa}
              onChange={(e) => setEtapa(e.target.value)}
              className="bg-slate-900 border border-slate-600 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 outline-none cursor-pointer"
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

        {config && (
          <div className="bg-slate-800 rounded-lg p-5 mb-6 border border-slate-700 text-sm text-slate-300 shadow-md">
            <span className="font-bold text-emerald-400">Estado Biológico: </span> 
            {config.descripcion}
          </div>
        )}

        {/* Cuadrícula adaptable a pantalla completa */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          
          <IndicadorGauge 
            titulo="Temperatura" 
            valor={getValor('temperatura')} 
            unidad="°C" 
            minGrafico={10} maxGrafico={50}
            limiteInf={configSegura.temp_min} limiteSup={configSegura.temp_max}
            tipo="rango"
            Icono={Thermometer}
            colorIcono="text-red-500"
          />

          <IndicadorGauge 
            titulo="Humedad Relativa" 
            valor={getValor('humedad')} 
            unidad="%" 
            minGrafico={0} maxGrafico={100}
            limiteInf={configSegura.hum_min} limiteSup={configSegura.hum_max}
            tipo="rango"
            Icono={Droplets}
            colorIcono="text-blue-400"
          />

          <IndicadorGauge 
            titulo="Nivel de CO2" 
            valor={getValor('co2')} 
            unidad="ppm" 
            minGrafico={0} maxGrafico={4000}
            limiteSup={configSegura.co2_max}
            tipo="tope"
            Icono={Cloud}
            colorIcono="text-gray-400"
          />

          <IndicadorGauge 
            titulo="Amoníaco (NH3)" 
            valor={getValor('amoniaco')} 
            unidad="ppm" 
            minGrafico={0} maxGrafico={100}
            limiteSup={configSegura.amon_max}
            tipo="tope"
            Icono={FlaskConical}
            colorIcono="text-emerald-400"
          />

          <IndicadorGauge 
            titulo="Luminosidad" 
            valor={getValor('luminosidad')} 
            unidad="lx" 
            minGrafico={0} maxGrafico={500}
            limiteInf={configSegura.luz_min} limiteSup={configSegura.luz_max}
            tipo="rango"
            Icono={Sun}
            colorIcono="text-yellow-400"
          />

        </div>

      </div>
    </div>
  );
}

export default App;