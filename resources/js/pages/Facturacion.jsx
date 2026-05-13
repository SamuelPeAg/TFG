import React, { useState, useEffect } from 'react';
import SearchSelect from '../components/SearchSelect';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import FacturasMatrixTable from '../components/FacturasMatrixTable';
import PageHeader from '../components/PageHeader';
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
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  const [filters, setFilters] = useState({
    centro: 'todos',
    anio: currentYear.toString(),
    mes: currentMonth,
    entrenador_id: '',
    cliente_id: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null); // { clienteId, entrenadorId }

  // Se llama a fetchData cuando los filtros cambian o al pulsar el botón
  useEffect(() => {
    fetchData();
  }, []); // Solo al montar, luego usaremos el botón de Filtros para evitar peticiones excesivas
  
  const fetchData = async () => {
    if (loading && data.clientes.length > 0) return; // Evitar peticiones paralelas
    
    setLoading(true);
    try {
      // Limpiar filtros para no enviar cadenas vacías que puedan confundir al backend
      const params = {};
      if (filters.centro && filters.centro !== 'todos') params.centro = filters.centro;
      if (filters.anio) params.anio = filters.anio;
      if (filters.mes) params.mes = filters.mes;
      if (filters.entrenador_id) params.entrenador_id = filters.entrenador_id;
      if (filters.cliente_id) params.cliente_id = filters.cliente_id;

      const response = await axios.get('/facturas', {
        headers: { Accept: 'application/json' },
        params: params
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
    if (e) e.preventDefault();
    setCurrentPage(1); // Reset to page 1 on new filter
    fetchData();
  };

  const handleClearFilters = () => {
    setFilters({
      centro: 'todos',
      anio: currentYear.toString(),
      mes: currentMonth,
      entrenador_id: '',
      cliente_id: ''
    });
    setCurrentPage(1);
    // Opcional: recargar datos inmediatamente tras limpiar
    setLoading(true);
    setTimeout(() => fetchData(), 100); 
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
        <PageHeader 
            title="Gestión de Facturación"
            subtitle="Administración y control de recibos"
            icon="fa-solid fa-file-invoice-dollar"
            onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <div className="flex-1 overflow-auto p-4 sm:p-8 pb-24 sm:pb-8">
          <div className="max-w-full mx-auto space-y-6">
            
            {/* Control Panel (Filters) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-visible">
              <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Año</label>
                    <SearchSelect 
                      name="anio"
                      value={filters.anio}
                      onChange={handleFilterChange}
                      placeholder="Año"
                      icon="fa-solid fa-calendar"
                      searchable={false}
                      options={years.map(y => ({ value: y, label: y }))}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Mes</label>
                    <SearchSelect 
                      name="mes"
                      value={filters.mes}
                      onChange={handleFilterChange}
                      placeholder="Todos"
                      icon="fa-solid fa-calendar-days"
                      searchable={false}
                      options={[{ value: '', label: 'Todos' }, ...meses.map(m => ({ value: m.num, label: m.nombre }))]}
                    />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Centro</label>
                  <SearchSelect 
                    name="centro"
                    value={filters.centro}
                    onChange={handleFilterChange}
                    placeholder="Todos los centros"
                    icon="fa-solid fa-building"
                    options={[{ value: 'todos', label: 'Todos los centros' }, ...data.centros?.map(c => ({ value: c.nombre, label: c.nombre })) || []]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Entrenador</label>
                  <SearchSelect 
                    name="entrenador_id"
                    value={filters.entrenador_id}
                    onChange={handleFilterChange}
                    placeholder="Cualquier entrenador"
                    icon="fa-solid fa-user-tie"
                    options={data.todosLosEntrenadores?.map(e => ({ value: e.id, label: e.name })) || []}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Cliente</label>
                  <SearchSelect 
                    name="cliente_id"
                    value={filters.cliente_id}
                    onChange={handleFilterChange}
                    placeholder="Todos los clientes"
                    icon="fa-solid fa-users"
                    options={data.todosLosClientes?.map(c => ({ value: c.id, label: c.name })) || []}
                  />
                </div>

                <div className="flex-shrink-0 flex gap-2">
                  <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-slate-200 hover:shadow-slate-300 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <i className="fas fa-spinner fa-spin text-[10px]"></i> : <i className="fas fa-filter text-[10px]"></i>}
                    Filtros
                  </button>
                  <button 
                    type="button" 
                    onClick={handleClearFilters}
                    className="px-4 py-2.5 bg-white text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center justify-center border border-slate-100 active:scale-95"
                    title="Limpiar filtros"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </form>
            </div>

            {/* Matrix Table */}
            <div className="space-y-3">
              <div className="flex justify-end items-center gap-3">
                 <button 
                  onClick={() => setPosModalOpen(true)} 
                  className="px-5 py-2.5 bg-[#38C1A3] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-500 transition-all shadow-md shadow-teal-100 flex items-center gap-2 active:scale-95"
                 >
                    <i className="fa-solid fa-receipt"></i> Tickar
                 </button>
                 <button 
                  onClick={() => setExportModalOpen(true)} 
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md shadow-blue-100 flex items-center gap-2 active:scale-95"
                 >
                    <i className="fa-solid fa-file-code"></i> Exportar XML
                 </button>
              </div>

              <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <FacturasMatrixTable 
                    data={{
                      ...data,
                      clientes: data.clientes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    }} 
                    loading={loading} 
                    onCellClick={openModal} 
                />
              </div>

              {/* Pagination Controls */}
              {!loading && data.clientes.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, data.clientes.length)} de {data.clientes.length} Clientes
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    
                    {[...Array(Math.ceil(data.clientes.length / itemsPerPage))].map((_, i) => {
                      const page = i + 1;
                      // Mostrar solo algunas páginas si hay muchas
                      if (
                        page === 1 || 
                        page === Math.ceil(data.clientes.length / itemsPerPage) || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-[10px] transition-all active:scale-95 shadow-sm ${
                              currentPage === page 
                                ? 'bg-slate-900 text-white' 
                                : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 || 
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="text-slate-300">...</span>;
                      }
                      return null;
                    })}

                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(data.clientes.length / itemsPerPage), prev + 1))}
                      disabled={currentPage === Math.ceil(data.clientes.length / itemsPerPage)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
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
        suscripciones={data.suscripciones || []}
        clientes={data.todosLosClientes || []}
        filtros={filters}
      />
    </div>
  );
}
