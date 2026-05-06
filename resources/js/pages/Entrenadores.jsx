import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EntrenadoresTable from '../components/EntrenadoresTable';
import EntrenadorModals from '../components/EntrenadorModals';
import Pagination from '../components/Pagination';
import Sidebar from '../components/Sidebar';
import PermissionsModal from '../components/PermissionsModal';
import PageHeader from '../components/PageHeader';

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
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);

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

  const handlePermissions = (entrenador) => {
    setSelectedEntrenador(entrenador);
    setPermissionsModalOpen(true);
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
        <PageHeader 
            title="Gestión de Entrenadores"
            subtitle="Administrando el equipo técnico"
            icon="fa-solid fa-user-tie"
            onMenuClick={() => setIsSidebarOpen(true)}
            actions={
                <>
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
                        className="h-[45px] px-6 flex items-center justify-center gap-2 bg-[#38C1A3] hover:bg-teal-500 text-white font-black rounded-xl shadow-lg shadow-teal-500/20 transition-all text-xs"
                    >
                        <i className="fa-solid fa-plus"></i>
                        <span>Nuevo Entrenador</span>
                    </button>
                </>
            }
        />
        
        <div className="flex-1 overflow-auto p-4 sm:p-10 scrollbar-hide">
          <div className="w-full mx-auto space-y-8">
            <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100/50">
              <EntrenadoresTable 
                entrenadores={currentEntrenadores} 
                loading={loading} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPermissions={handlePermissions}
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

      <PermissionsModal 
        isOpen={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
        entrenador={selectedEntrenador}
      />
    </div>
  );
}
