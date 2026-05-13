import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UsersTable from '../components/UsersTable';
import UserModals from '../components/UserModals';
import ClientSubscriptionsModal from '../components/ClientSubscriptionsModal';
import ClientFichaModal from '../components/ClientFichaModal';
import ClientsImportModal from '../components/ClientsImportModal';
import Pagination from '../components/Pagination';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import PageHeader from '../components/PageHeader';

export default function Clientes() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Slightly more per page if possible
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', isError: false });

  const confirmAction = (message, onConfirm, isDestructive = false, title = "Confirmación") => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm, isDestructive });
  };
  
  const showAlert = (message, isError = false, title = isError ? "Error" : "Aviso") => {
    setAlertConfig({ isOpen: true, title, message, isError });
  };

  // Removido seleccionado para el modal de suscripciones directo
  const [fichaModalOpen, setFichaModalOpen] = useState(false);
  const [selectedUserForFicha, setSelectedUserForFicha] = useState(null);

  const [subscriptionsModalOpen, setSubscriptionsModalOpen] = useState(false);
  const [selectedUserForSubscriptions, setSelectedUserForSubscriptions] = useState(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const handleShowFicha = (user) => {
    setSelectedUserForFicha(user);
    setFichaModalOpen(true);
  };

  const handleShowSubscriptions = (user) => {
    setSelectedUserForSubscriptions(user);
    setSubscriptionsModalOpen(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/users', {
        headers: {
          'Accept': 'application/json'
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (user) => {
    confirmAction(`¿Estás seguro de que deseas eliminar a ${user.name}?`, async () => {
      try {
        await axios.delete(`/users/${user.id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('No se pudo eliminar al usuario.', true, 'Error al Eliminar');
      }
    }, true, 'Eliminar Cliente');
  };

  const handleSave = async (formData, mode, id) => {
    if (mode === 'create') {
      await axios.post('/users', formData);
    } else {
      await axios.put(`/users/${id}`, formData);
    }
    fetchUsers();
  };

  const handleSelectUser = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };


  const handleBulkActivation = async () => {
    if (selectedIds.length === 0) return;
    
    confirmAction(`¿Estás seguro de que deseas enviar el correo a los ${selectedIds.length} clientes seleccionados?`, async () => {
      setIsSendingBulk(true);
      try {
        const response = await axios.post('/users/bulk-send-activation', { user_ids: selectedIds });
        setToast(response.data.message || 'Correos enviados correctamente.');
        setTimeout(() => setToast(null), 5000);
        setSelectedIds([]);
        fetchUsers();
      } catch (error) {
        console.error('Error in bulk activation:', error);
        showAlert('Hubo un error al enviar los correos.', true);
      } finally {
        setIsSendingBulk(false);
      }
    }, false, 'Envío Múltiple');
  };


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    const isProvisional = user.email.toLowerCase().includes('factomove.es');
    
    // Si busca "provisional", filtramos solo los de factomove
    if (search === 'provisional') return isProvisional;

    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.dni && user.dni.toLowerCase().includes(search))
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all current displayed users
      const newIds = new Set([...selectedIds, ...currentUsers.map(u => u.id)]);
      setSelectedIds(Array.from(newIds));
    } else {
      // Deselect current displayed users
      const currentIds = currentUsers.map(u => u.id);
      setSelectedIds(selectedIds.filter(id => !currentIds.includes(id)));
    }
  };

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
        <PageHeader 
            title="Gestión de Clientes"
            subtitle="Administrando padrón de alumnos"
            icon="fa-solid fa-users"
            onMenuClick={() => setIsSidebarOpen(true)}
            actions={
                <>
                    {selectedIds.length > 0 && (
                        <button 
                            onClick={handleBulkActivation}
                            disabled={isSendingBulk}
                            className="h-[45px] px-4 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all text-xs shrink-0"
                            title="Enviar correo de activación/aviso"
                        >
                            {isSendingBulk ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                            <span>ENVIAR ({selectedIds.length})</span>
                        </button>
                    )}
                    
                    <div className="relative group flex-1 sm:flex-none" style={{ maxWidth: '300px' }}>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:translate-x-1">
                            <i className="fa-solid fa-magnifying-glass text-slate-300 group-focus-within:text-[#38C1A3] transition-colors"></i>
                        </div>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar cliente..." 
                            className="pl-11 pr-5 py-3 w-full sm:w-72 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#38C1A3]/5 focus:border-[#38C1A3] outline-none transition-all font-black text-slate-600 placeholder:text-slate-300 text-xs shadow-sm shadow-slate-200/50"
                        />
                    </div>

                    <button 
                        onClick={() => setImportModalOpen(true)}
                        className="h-[45px] px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-black rounded-xl shadow-lg shadow-slate-800/20 transition-all flex items-center gap-2 text-xs shrink-0"
                    >
                        <i className="fa-solid fa-file-excel"></i>
                        <span>IMPORTAR</span>
                    </button>

                    <button 
                        onClick={handleCreate}
                        className="h-[45px] px-6 py-3 bg-[#38C1A3] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#2eaa8f] transition-all shadow-lg shadow-teal-100 flex items-center gap-2 active:scale-95 shrink-0"
                    >
                        <i className="fa-solid fa-plus"></i>
                        <span>NUEVO</span>
                    </button>
                </>
            }
        />
        
        {toast && (
            <div className="px-8 py-4 bg-emerald-50 border-y border-emerald-100 text-emerald-600 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <i className="fas fa-check-circle"></i>
                {toast}
            </div>
        )}
        
        <div className="flex-1 overflow-auto p-4 sm:p-10 pb-24 sm:pb-10 scrollbar-hide">
          <div className="w-full mx-auto space-y-8">
            <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100/50">
              <UsersTable 
                users={currentUsers} 
                loading={loading} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShowFicha={handleShowFicha}
                selectedIds={selectedIds}
                onSelectUser={handleSelectUser}
                onSelectAll={handleSelectAll}
                onAlert={showAlert}
              />
            </div>

            {/* Pagination Zone */}
            <div className="pb-10">
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredUsers.length}
                />
            </div>
          </div>
        </div>
      </main>

      <UserModals 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={selectedUser}
        mode={modalMode}
      />
      
      <ClientFichaModal 
        isOpen={fichaModalOpen}
        user={selectedUserForFicha}
        onClose={() => setFichaModalOpen(false)}
      />

      <ClientsImportModal 
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={(message) => {
            fetchUsers();
            setToast(message || 'Clientes importados correctamente.');
            setTimeout(() => setToast(null), 5000);
        }}
      />
      
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDestructive={confirmConfig.isDestructive}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
            if (confirmConfig.onConfirm) confirmConfig.onConfirm();
        }}
      />

      <AlertModal 
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        isError={alertConfig.isError}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

@media (max-width: 768px) {
  /* Global scroll fix for mobile browser navigation bars */
  main .overflow-auto, 
  .flex-1.overflow-auto,
  [role="dialog"] .overflow-y-auto {
    padding-bottom: 6rem !important;
  }
}
