import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import EntrenadoresTable from '../components/EntrenadoresTable';
import EntrenadorModals from '../components/EntrenadorModals';

export default function Entrenadores() {
  const [entrenadores, setEntrenadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
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
      const response = await axios.get('/entrenadores', {
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
        await axios.delete(`/entrenadores/${entrenador.id}`, {
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
      await axios.post('/entrenadores', formData, {
        headers: { Accept: 'application/json' }
      });
    } else {
      await axios.put(`/entrenadores/${id}`, formData, {
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
                    Gestión de Entrenadores
                </h1>
                <p className="text-slate-400 mt-1 font-medium text-sm">Administración del equipo técnico</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             {/* Search Box */}
             <div className="relative group flex-1 sm:flex-none">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-[#38C1A3] transition-colors"></i>
                </div>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar entrenador..." 
                  className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white border border-slate-200 rounded-full focus:ring-2 focus:ring-[#38C1A3]/20 focus:border-[#38C1A3] outline-none transition-all font-medium text-slate-600 placeholder:text-slate-400 text-sm shadow-sm"
                />
              </div>

              <Button 
                variant="primary" 
                icon="fas fa-plus" 
                onClick={handleCreate}
                size="md"
              >
                NUEVO
              </Button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="w-full mx-auto space-y-6">
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <EntrenadoresTable 
                entrenadores={currentEntrenadores} 
                loading={loading} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>

        {/* Status bar */}
        <footer className="px-6 py-3 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                {filteredEntrenadores.length} registros encontrados
            </p>
            {totalPages > 1 ? (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <i className="fas fa-chevron-left text-[10px]"></i>
                    </button>
                    <span className="text-xs font-bold text-slate-600 px-2 border-x border-slate-100">
                        {currentPage} <span className="text-slate-400 font-medium">/ {totalPages}</span>
                    </span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <i className="fas fa-chevron-right text-[10px]"></i>
                    </button>
                </div>
            ) : (
                <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#38C1A3]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#38C1A3]/20"></div>
                </div>
            )}
        </footer>
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
