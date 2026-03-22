import React, { useState, useEffect } from 'react';
import Button from './Button';

export default function ExportXmlModal({ isOpen, onClose, centros, filtros }) {
  const [selectedCentro, setSelectedCentro] = useState('todos');

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedCentro('todos');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = () => {
    if (!selectedCentro) {
      alert("Debes seleccionar una opción");
      return;
    }
    
    const params = new URLSearchParams({
      centro: selectedCentro,
      anio: filtros.anio,
      mes: filtros.mes
    });
    
    window.location.href = `/facturas/export-xml?${params.toString()}`;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 animate-in zoom-in-95 duration-200">
        <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <i className="fa-solid fa-file-code text-blue-500"></i> Exportar XML
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>
        
        <p className="text-slate-500 font-medium mb-6 text-sm">
          Elige el centro del cual deseas exportar la facturación. Se utilizarán el año ({filtros.anio || 'Todos'}) y mes ({filtros.mes || 'Todos'}) definidos en tus filtros actuales.
        </p>

        <div className="space-y-2 mb-8">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Seleccionar Centro</label>
            <select 
                value={selectedCentro} 
                onChange={(e) => setSelectedCentro(e.target.value)} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
            >
                <option value="todos">Todos los centros</option>
                {centros?.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
            </select>
        </div>

        <div className="flex gap-3">
            <Button onClick={onClose} variant="secondary" className="flex-1 justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border-transparent">
                Cancelar
            </Button>
            <Button onClick={handleExport} className="flex-1 justify-center rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-md border-transparent">
                Exportar XML
            </Button>
        </div>
      </div>
    </div>
  );
}
