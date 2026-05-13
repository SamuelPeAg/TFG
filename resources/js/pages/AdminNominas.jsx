import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import AdminNominasSummaryCards from '../components/AdminNominasSummaryCards';
import PageHeader from '../components/PageHeader';
import { BorradoresTable, HistorialTable } from '../components/AdminNominasTables';
import { GenerarNomiModal, RevisarNominaModal, DetalleNominaModal, PdfPreviewModal } from '../components/AdminNominasModals';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';

export default function AdminNominas() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [filters, setFilters] = useState({
    mes: currentMonth.toString(),
    anio: currentYear.toString(),
    search: ''
  });

  const [data, setData] = useState({
    borradores: [],
    historial: [],
  });

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Modals state
  const [modals, setModals] = useState({
    generar: false,
    revisar: false,
    detalle: false,
    pdf: false
  });
  const [activeItem, setActiveItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, title: '', message: '', isError: false });
  
  const showToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(''), 4000);
  };

  const fetchNominas = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/nominas', {
        headers: { Accept: 'application/json' },
        params: { mes: filters.mes, anio: filters.anio }
      });
      setData({
        borradores: res.data.borradores || [],
        historial: res.data.historial || []
      });
    } catch (error) {
           console.error('Error fetching nominas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNominas();
  }, [filters.mes, filters.anio]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Actions
  const handlePagar = async (id) => {
      try {
          const res = await axios.post(`/admin/nominas/${id}/pagar`, {}, {
              headers: { Accept: 'application/json' }
          });
          showToast(res.data.message || 'Nómina marcada como PAGADA.');
          fetchNominas();
      } catch (error) {
          setAlert({ show: true, title: 'Error', message: 'No se pudo marcar la nómina como pagada.', isError: true });
      }
  };

  const handleDelete = (id) => {
      setDeleteId(id);
      setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
      if(!deleteId) return;
      try {
          const res = await axios.delete(`/admin/nominas/${deleteId}`, {
              headers: { Accept: 'application/json' }
          });
          showToast(res.data.message || 'Nómina eliminada.');
          fetchNominas();
      } catch (error) {
          setAlert({ show: true, title: 'Error', message: 'No se pudo eliminar la nómina.', isError: true });
      } finally {
          setDeleteId(null);
          setShowDeleteModal(false);
      }
  };

  const openModal = (modalName, item = null) => {
    setActiveItem(item);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setActiveItem(null);
  };

  const onModalSuccess = (msg) => {
      showToast(msg);
      fetchNominas();
  };

  const onModalError = (msg) => {
      setAlert({ show: true, title: 'Error', message: msg, isError: true });
  };

  const filteredBorradores = data.borradores.filter(b => 
      !filters.search || b.entrenador?.name?.toLowerCase().includes(filters.search.toLowerCase())
  );
  
  const filteredHistorial = data.historial.filter(h => 
      !filters.search || h.entrenador?.name?.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:ml-72 w-full">
        <PageHeader 
            title="Gestión de Nóminas"
            subtitle="Supervisión y control de pagos a entrenadores"
            icon="fa-solid fa-file-invoice"
            onMenuClick={() => setIsSidebarOpen(true)}
            actions={
                <button onClick={() => openModal('generar')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#38C1A3] hover:bg-teal-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-teal-100 hover:shadow-teal-200 transition-all active:scale-95">
                    <i className="fas fa-bolt"></i> 
                    <span className="whitespace-nowrap uppercase tracking-wider text-xs">Generar Nóminas</span>
                </button>
            }
        />

        <div className="px-6 sm:px-8 pb-4">

            <div className="flex flex-col md:flex-row items-center gap-4 bg-white/50 p-4 rounded-3xl border border-slate-100 shadow-sm">
                {/* Periodo Filter */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 w-full md:w-auto">
                    <div className="pl-3 text-slate-400"><i className="fas fa-calendar-alt text-xs"></i></div>
                    <select name="mes" value={filters.mes} onChange={handleFilterChange} className="select2-ignore bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer py-1.5 px-2 pr-6 appearance-none">
                            {[
                                {v:'1',n:'Enero'}, {v:'2',n:'Febrero'}, {v:'3',n:'Marzo'}, {v:'4',n:'Abril'},
                                {v:'5',n:'Mayo'}, {v:'6',n:'Junio'}, {v:'7',n:'Julio'}, {v:'8',n:'Agosto'},
                                {v:'9',n:'Septiembre'}, {v:'10',n:'Octubre'}, {v:'11',n:'Noviembre'}, {v:'12',n:'Diciembre'}
                            ].map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                    </select>
                    <div className="w-px h-4 bg-slate-200"></div>
                    <select name="anio" value={filters.anio} onChange={handleFilterChange} className="select2-ignore bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer py-1.5 px-4 pr-8 appearance-none">
                        {Array.from({length: 5}, (_, i) => currentYear - i).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                {/* Search */}
                <div className="relative w-full md:flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i className="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-[#38C1A3] text-sm transition-colors"></i>
                        </div>
                        <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Buscar por nombre de entrenador..." 
                            className="pl-10 pr-4 py-3 w-full bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#38C1A3]/20 focus:border-[#38C1A3] outline-none transition-all font-medium text-slate-600 placeholder:text-slate-400 text-sm shadow-sm" />
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-8 pb-24 sm:pb-8">
             {toast && (
                <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <i className="fas fa-check-circle text-lg"></i>
                    <span className="font-bold text-sm tracking-wide">{toast}</span>
                </div>
             )}

             <AdminNominasSummaryCards borradores={data.borradores} historial={data.historial} />

             {loading ? (
                 <div className="py-20 flex justify-center"><div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-[#38C1A3] rounded-full"></div></div>
             ) : (
                 <>
                    <BorradoresTable 
                       borradores={filteredBorradores} 
                       onPreview={(item) => openModal('pdf', item)} 
                       onRevisar={(item) => openModal('revisar', item)}
                       onDelete={handleDelete}
                    />

                    <HistorialTable 
                       historial={filteredHistorial}
                       onPreview={(item) => openModal('pdf', item)} 
                       onVerDetalles={(item) => openModal('detalle', item)}
                       onPagar={handlePagar}
                       onDelete={handleDelete}
                    />
                 </>
             )}
         </div>
      </main>

      {/* Modals */}
      <GenerarNomiModal 
          isOpen={modals.generar} 
          onClose={() => closeModal('generar')} 
          onSuccess={onModalSuccess} 
          onError={onModalError}
          currentYear={currentYear} 
          currentMonth={filters.mes}
      />

      <RevisarNominaModal 
          isOpen={modals.revisar} 
          onClose={() => closeModal('revisar')} 
          nomina={activeItem} 
          onSuccess={onModalSuccess} 
          onError={onModalError}
      />

      <DetalleNominaModal 
          isOpen={modals.detalle} 
          onClose={() => closeModal('detalle')} 
          nomina={activeItem} 
      />

      <PdfPreviewModal 
          isOpen={modals.pdf} 
          onClose={() => closeModal('pdf')} 
          nomina={activeItem} 
      />

      <ConfirmModal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
          onConfirm={confirmDelete}
          title="Eliminar Nómina"
          message="¿Seguro que deseas eliminar esta nómina? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          isDestructive={true}
      />

      <AlertModal 
          isOpen={alert.show} 
          onClose={() => setAlert({ ...alert, show: false })} 
          title={alert.title} 
          message={alert.message} 
          isError={alert.isError} 
      />

    </div>
  );
}
