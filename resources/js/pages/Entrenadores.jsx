import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EntrenadoresTable from '../components/EntrenadoresTable';
import EntrenadorModals from '../components/EntrenadorModals';
import Pagination from '../components/Pagination';
import Sidebar from '../components/Sidebar';

export default function Entrenadores() {
  const [entrenadores, setEntrenadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEntrenador, setSelectedEntrenador] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchEntrenadores();
  }, []);

  const fetchEntrenadores = async () => {
    setLoading(true);
    try {
      const response = await axios.get('entrenadores', {
        headers: { Accept: 'application/json' }
      });
      setEntrenadores(response.data);
    } catch (error) {
      console.error('Error fetching entrenadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedEntrenador(null);
    setModalOpen(true);
  };

  const handleEdit = (entrenador) => {
    setModalMode('edit');
    setSelectedEntrenador(entrenador);
    setModalOpen(true);
  };

  const handleDelete = async (entrenador) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${entrenador.name}?`)) {
      try {
        await axios.delete(`entrenadores/${entrenador.id}`, {
            headers: { Accept: 'application/json' }
        });
        fetchEntrenadores();
      } catch (error) {
        console.error('Error deleting entrenador:', error);
        alert('No se pudo eliminar al entrenador.');
      }
    }
  };

  const handleSave = async (formData, mode, id) => {
    if (mode === 'create') {
      await axios.post('entrenadores', formData, {
        headers: { Accept: 'application/json' }
      });
    } else {
      await axios.put(`entrenadores/${id}`, formData, {
        headers: { Accept: 'application/json' }
      });
    }
    fetchEntrenadores();
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredEntrenadores = entrenadores.filter(entrenador => 
    entrenador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entrenador.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEntrenadores.length / itemsPerPage);
  const currentEntrenadores = filteredEntrenadores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
        {/* Dashboard Header */}
        <header className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm border-b border-slate-100/50 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-3 text-slate-500 hover:text-[#38C1A3] rounded-2xl hover:bg-white transition-all shadow-sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">
                    Gestión de Entrenadores
                </h1>
                <p className="text-slate-400 mt-2 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#38C1A3] rounded-full animate-pulse"></div> Administrando el equipo técnico
                </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             {/* Search Box */}
             <div className="relative group flex-1 sm:flex-none">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:translate-x-1">
                    <i className="fa-solid fa-magnifying-glass text-slate-300 group-focus-within:text-[#38C1A3] transition-colors"></i>
                </div>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar entrenador..." 
                  className="pl-11 pr-5 py-3 w-full sm:w-72 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#38C1A3]/5 focus:border-[#38C1A3] outline-none transition-all font-black text-slate-600 placeholder:text-slate-300 text-xs shadow-sm shadow-slate-200/50"
                />
              </div>

              <button 
                onClick={handleCreate}
                className="px-8 py-3 bg-[#38C1A3] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#2eaa8f] transition-all shadow-lg shadow-teal-100 flex items-center gap-2 active:scale-95 shrink-0"
              >
                <i className="fas fa-plus"></i>
                NUEVO ENTRENADOR
              </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 sm:p-10 scrollbar-hide">
          <div className="w-full mx-auto space-y-8">
            <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100/50">
              <EntrenadoresTable 
                entrenadores={currentEntrenadores} 
                loading={loading} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>

            {/* Pagination Zone */}
            <div className="pb-10">
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredEntrenadores.length}
                />
            </div>
          </div>
        </div>
      </main>

      <EntrenadorModals 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        entrenador={selectedEntrenador}
        mode={modalMode}
      />
    </div>
  );
}
