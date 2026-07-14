import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera del Dashboard */}
        <header className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col md:flex-row justify-between items-center border-l-4 border-yellow-500">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-slate-800">Panel de Control Automático</h1>
            <p className="text-slate-500 mt-1">Crianza de Pollitos - Monitoreo Ambiental</p>
          </div>
          
          {/* Selector de Etapas Biológicas */}
          <div className="w-full md:w-72">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Etapa de Crecimiento
            </label>
            <select className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 outline-none transition-colors">
              <option value="pollitos_semana_1">Semana 1 (Días 1-7)</option>
              <option value="pollitos_semana_2">Semana 2 (Días 8-14)</option>
              <option value="pollitos_semana_3">Semana 3 (Días 15-21)</option>
              <option value="pollitos_semana_4">Semana 4 (Días 22-28)</option>
              <option value="pollitos_semana_5">Semana 5 (Días 29-35)</option>
              <option value="pollitos_semana_6">Semana 6 (Días 36-42)</option>
            </select>
          </div>
        </header>

        {/* Cuadrícula de Sensores (Cascarón vacío por ahora) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          
          {/* Tarjeta de Temperatura */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Temperatura</h3>
            <p className="text-4xl font-bold text-slate-800 mt-4">-- °C</p>
          </div>

          {/* Tarjeta de Humedad */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Humedad</h3>
            <p className="text-4xl font-bold text-slate-800 mt-4">-- %</p>
          </div>

          {/* Tarjeta de Luz */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Luminosidad</h3>
            <p className="text-4xl font-bold text-slate-800 mt-4">-- lx</p>
          </div>

          {/* Tarjeta de Amoníaco */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Amoníaco</h3>
            <p className="text-4xl font-bold text-slate-800 mt-4">-- ppm</p>
          </div>

          {/* Tarjeta de CO2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">CO2</h3>
            <p className="text-4xl font-bold text-slate-800 mt-4">-- ppm</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;