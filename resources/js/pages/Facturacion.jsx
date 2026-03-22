import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import FacturasMatrixTable from '../components/FacturasMatrixTable';
import FacturacionModal from '../components/FacturacionModal';
import PosTickarModal from '../components/PosTickarModal';
import ExportXmlModal from '../components/ExportXmlModal';

export default function Facturacion() {
  const [data, setData] = useState({
    centros: [],
    entrenadores: [],
    clientes: [],
    todosLosClientes: [],
    matrix: {},
    clienteTotals: {}
  });
  
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState({
    centro: 'todos',
    anio: currentYear.toString(),
    mes: '',
    entrenador_id: '',
    cliente_id: ''
  });

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null); // { clienteId, entrenadorId }

  useEffect(() => {
    fetchData();
  }, [filters]); // Re-fetch when filters change? No, let's use an Apply button to match the old design.
  
  // Actually, we'll fetch on mount, and then when they click "Apply"
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/facturas', {
        headers: { Accept: 'application/json' },
        params: {
          centro: filters.centro,
          anio: filters.anio,
          mes: filters.mes,
          entrenador_id: filters.entrenador_id,
          cliente_id: filters.cliente_id
        }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching facturación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openModal = (clienteId, entrenadorId, clienteData, entrenadorData) => {
    setSelectedCell({
        clienteId,
        entrenadorId,
        cliente: clienteData,
        entrenador: entrenadorData,
        filters: filters
    });
    setModalOpen(true);
  };

  const meses = [
    { num: '01', nombre: 'Enero' }, { num: '02', nombre: 'Febrero' }, { num: '03', nombre: 'Marzo' },
    { num: '04', nombre: 'Abril' }, { num: '05', nombre: 'Mayo' }, { num: '06', nombre: 'Junio' },
    { num: '07', nombre: 'Julio' }, { num: '08', nombre: 'Agosto' }, { num: '09', nombre: 'Septiembre' },
    { num: '10', nombre: 'Octubre' }, { num: '11', nombre: 'Noviembre' }, { num: '12', nombre: 'Diciembre' }
  ];

  const years = [];
  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    years.push(y);
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
        <header className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3] rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                    Gestión de Facturación
                </h1>
                <p className="text-slate-400 mt-1 font-medium text-sm">Administración y control de recibos</p>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-full mx-auto space-y-6">
            
            {/* Control Panel (Filters) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-visible">
              <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Centro</label>
                  <select name="centro" value={filters.centro} onChange={handleFilterChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38C1A3]/20 focus:border-[#38C1A3] outline-none text-sm font-medium text-slate-700">
                    <option value="todos">Todos</option>
                    {data.centros?.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Año</label>
                  <select name="anio" value={filters.anio} onChange={handleFilterChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38C1A3]/20 focus:border-[#38C1A3] outline-none text-sm font-medium text-slate-700">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Mes</label>
                  <select name="mes" value={filters.mes} onChange={handleFilterChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38C1A3]/20 focus:border-[#38C1A3] outline-none text-sm font-medium text-slate-700">
                    <option value="">Todos</option>
                    {meses.map(m => <option key={m.num} value={m.num}>{m.nombre}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Entrenador</label>
                  <select name="entrenador_id" value={filters.entrenador_id} onChange={handleFilterChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38C1A3]/20 focus:border-[#38C1A3] outline-none text-sm font-medium text-slate-700">
                    <option value="">Todos</option>
                    {data.entrenadores?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Cliente</label>
                  <select name="cliente_id" value={filters.cliente_id} onChange={handleFilterChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38C1A3]/20 focus:border-[#38C1A3] outline-none text-sm font-medium text-slate-700">
                    <option value="">Todos</option>
                    {data.todosLosClientes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-6 flex flex-wrap lg:flex-nowrap gap-2 mt-2">
                  <Button type="submit" variant="primary" icon="fas fa-filter" className="flex-1 py-2.5">
                    Filtros
                  </Button>
                  <Button type="button" onClick={() => setPosModalOpen(true)} className="flex-1 py-2.5 bg-[#38C1A3] hover:bg-teal-500 text-white rounded-xl shadow-md border-transparent flex justify-center items-center gap-2">
                    <i className="fa-solid fa-receipt"></i> Tickar
                  </Button>
                  <Button type="button" onClick={() => setExportModalOpen(true)} className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md border-transparent flex justify-center items-center gap-2">
                    <i className="fa-solid fa-file-code"></i> Exportar XML
                  </Button>
                </div>
              </form>
            </div>

            {/* Matrix Table */}
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               <FacturasMatrixTable 
                  data={data} 
                  loading={loading} 
                  onCellClick={openModal} 
               />
            </div>

          </div>
        </div>
      </main>

      <FacturacionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        cellData={selectedCell} 
      />

      <PosTickarModal 
        isOpen={posModalOpen}
        onClose={() => setPosModalOpen(false)}
        centros={data.centros}
        entrenadores={data.todosLosEntrenadores} // Usaremos el array completo si backend lo provee
        clientes={data.todosLosClientes}
        onSuccess={fetchData}
      />

      <ExportXmlModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        centros={data.centros}
        filtros={filters}
      />
    </div>
  );
}
