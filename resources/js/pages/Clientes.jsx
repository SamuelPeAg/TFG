import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Button from '../components/Button';
import UsersTable from '../components/UsersTable';
import UserModals from '../components/UserModals';

export default function Clientes() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/users');
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
    if (confirm(`¿Estás seguro de que deseas eliminar a ${user.name}?`)) {
      try {
        await axios.delete(`/users/${user.id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('No se pudo eliminar al usuario.');
      }
    }
  };

  const handleSave = async (formData, mode, id) => {
    if (mode === 'create') {
      await axios.post('/users', formData);
    } else {
      await axios.put(`/users/${id}`, formData);
    }
    fetchUsers();
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-64">
        {/* Dashboard Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3] rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight m-0">
              Gestión de Clientes
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             {/* Search Box */}
             <div className="relative group flex-1 sm:flex-none">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#38C1A3] transition-colors"></i>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cliente..." 
                  className="pl-11 pr-4 py-2.5 w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#38C1A3]/10 focus:border-[#38C1A3] outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 text-sm"
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
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <UsersTable 
                users={filteredUsers} 
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
                {filteredUsers.length} registros encontrados
            </p>
            <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#38C1A3]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#38C1A3]/20"></div>
            </div>
        </footer>
      </main>

      <UserModals 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={selectedUser}
        mode={modalMode}
      />
    </div>
  );
}
