import React, { useState, useEffect } from 'react';
import Button from './Button';
import SearchSelect from './SearchSelect';

export default function ExportXmlModal({ isOpen, onClose, centros, suscripciones = [], clientes = [], filtros }) {
  const [selectedCentro, setSelectedCentro] = useState('todos');
  const [selectedSuscripciones, setSelectedSuscripciones] = useState([]);
  const [selectedClientes, setSelectedClientes] = useState([]);
  
  const [clientSearch, setClientSearch] = useState('');

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedCentro(filtros?.centro || 'todos');
      setSelectedSuscripciones([]);
      setSelectedClientes([]);
      setClientSearch('');
    }
  }, [isOpen, filtros]);

  if (!isOpen) return null;

  const handleExport = () => {
    if (selectedSuscripciones.length === 0) {
        alert("Debes seleccionar al menos una suscripción para generar la remesa.");
        return;
    }

    const params = new URLSearchParams({
      centro: selectedCentro,
      anio: filtros.anio || new Date().getFullYear(),
      mes: filtros.mes || ''
    });

    selectedSuscripciones.forEach(subId => params.append('suscripciones[]', subId));
    selectedClientes.forEach(clientId => params.append('clientes[]', clientId));
    
    window.location.href = `/facturas/export-xml?${params.toString()}`;
    onClose();
  };

  const toggleSubscription = (id) => {
      setSelectedSuscripciones(prev => 
          prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
      );
  };

  const toggleCliente = (id) => {
      setSelectedClientes(prev => 
          prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
      );
  };

  const toggleAllClientes = () => {
      if (selectedClientes.length === filteredClientes.length) {
          setSelectedClientes([]);
      } else {
          setSelectedClientes(filteredClientes.map(c => c.id));
      }
  };

  const filteredClientes = clientes.filter(c => {
      const matchText = c.name.toLowerCase().includes(clientSearch.toLowerCase());
      
      let matchSub = true;
      if (selectedSuscripciones.length > 0) {
          const clientSubIds = c.suscripciones?.map(s => s.id_suscripcion) || [];
          matchSub = selectedSuscripciones.some(id => clientSubIds.includes(id));
      }
      return matchText && matchSub;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <i className="fa-solid fa-file-invoice-dollar text-blue-500"></i> Exportar Remesa XML
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
            Filtra y personaliza el XML de facturación (domiciliación bancaria). Solo se incluirán los usuarios que tengan activas las suscripciones seleccionadas.
            </p>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Centro</label>
                <SearchSelect 
                    value={selectedCentro} 
                    onChange={(e) => setSelectedCentro(e.target.value)} 
                    placeholder="Seleccionar centro..."
                    icon="fa-solid fa-building"
                    options={[{ value: 'todos', label: 'Todos los centros' }, ...centros?.map(c => ({ value: c.nombre, label: c.nombre })) || []]}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                    Suscripciones a Cobrar <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-2 rounded-xl border border-slate-200 max-h-48 overflow-y-auto custom-scrollbar">
                    {suscripciones.length > 0 ? suscripciones.map(sub => (
                        <label key={sub.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 mt-0.5 text-blue-500 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                checked={selectedSuscripciones.includes(sub.id)}
                                onChange={() => toggleSubscription(sub.id)}
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700 leading-tight">{sub.nombre}</span>
                                <span className="text-xs font-bold text-blue-500 mt-1">{sub.precio}€</span>
                            </div>
                        </label>
                    )) : (
                        <div className="col-span-full text-center text-sm font-medium text-slate-400 p-4">No hay suscripciones disponibles</div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Filtrar Clientes (Opcional)
                    </label>
                    <button 
                        onClick={toggleAllClientes}
                        className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-700 transition tracking-wider"
                    >
                        {selectedClientes.length === filteredClientes.length && filteredClientes.length > 0 ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                </div>
                <div className="relative">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input 
                        type="text" 
                        placeholder="Buscar cliente por nombre..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-col gap-1 bg-white p-2 rounded-xl border border-slate-200 h-48 overflow-y-auto custom-scrollbar">
                    {filteredClientes.length > 0 ? filteredClientes.map(c => (
                        <label key={c.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 text-blue-500 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                checked={selectedClientes.includes(c.id)}
                                onChange={() => toggleCliente(c.id)}
                            />
                            <span className="text-sm font-bold text-slate-700">{c.name}</span>
                        </label>
                    )) : (
                        <div className="text-center text-sm font-medium text-slate-400 p-4">No se encontraron clientes</div>
                    )}
                </div>
                <p className="text-[10px] uppercase font-black text-slate-400 mt-2 ml-1 leading-relaxed">
                    <i className="fa-solid fa-circle-info mr-1 text-slate-300"></i>
                    Si no hay clientes seleccionados, se cobrará a todos los que tengan las suscripciones marcadas.
                </p>
            </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50">
            <Button onClick={onClose} variant="secondary" className="flex-1 justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300 font-bold">
                Cancelar
            </Button>
            <Button onClick={handleExport} className="flex-[2] justify-center rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-transparent font-black tracking-wide">
                <i className="fa-solid fa-download mr-2"></i> Generar Remesa XML
            </Button>
        </div>
      </div>
    </div>
  );
}
