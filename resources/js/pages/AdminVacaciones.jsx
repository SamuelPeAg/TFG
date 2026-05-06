import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/PageHeader';

export default function AdminVacaciones() {
  const [vacations, setVacations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [statusModal, setStatusModal] = useState({ isOpen: false, id: null, status: null, title: '', message: '' });

  const fetchVacations = async () => {
    try {
      const res = await axios.get('/api/admin/vacations');
      setVacations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVacations();
  }, []);

  const confirmStatusUpdate = (id, status) => {
    let title = '';
    let message = '';
    
    if (status === 'approved') {
        title = 'Aprobar Vacaciones';
        message = '¿Estás seguro de que deseas aprobar esta solicitud de vacaciones?';
    } else if (status === 'rejected') {
        title = 'Rechazar Vacaciones';
        message = '¿Estás seguro de que deseas rechazar esta solicitud de vacaciones?';
    } else {
        title = 'Marcar como Pendiente';
        message = '¿Estás seguro de que deseas cambiar el estado de esta solicitud a pendiente?';
    }
    
    setStatusModal({ isOpen: true, id, status, title, message });
  };

  const handleStatusUpdate = async () => {
    if (!statusModal.id || !statusModal.status) return;
    
    try {
      await axios.put(`/api/admin/vacations/${statusModal.id}/status`, { status: statusModal.status });
      fetchVacations();
      setStatusModal({ isOpen: false, id: null, status: null, title: '', message: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar estado');
      setStatusModal({ isOpen: false, id: null, status: null, title: '', message: '' });
    }
  };

  const filteredVacations = vacations.filter(v => filter === 'all' ? true : v.status === filter);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
        <PageHeader 
            title="Vacaciones"
            subtitle="Gestión de solicitudes de entrenadores"
            icon="fa-solid fa-umbrella-beach"
            onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="p-4 sm:p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h2 className="text-lg font-bold text-slate-800">Todas las Solicitudes</h2>
                  <select 
                      value={filter} 
                      onChange={e => setFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-[#38C1A3] focus:border-[#38C1A3] block p-2.5 outline-none"
                  >
                      <option value="all">Todas</option>
                      <option value="pending">Pendientes</option>
                      <option value="approved">Aprobadas</option>
                      <option value="rejected">Rechazadas</option>
                  </select>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                          <tr>
                              <th className="px-6 py-3 font-semibold">Entrenador</th>
                              <th className="px-6 py-3 font-semibold">Fechas</th>
                              <th className="px-6 py-3 font-semibold">Días</th>
                              <th className="px-6 py-3 font-semibold">Estado</th>
                              <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                          {filteredVacations.map(v => (
                              <tr key={v.id} className="hover:bg-slate-50/50">
                                  <td className="px-6 py-4 font-medium text-slate-800">
                                      {v.user?.name}
                                  </td>
                                  <td className="px-6 py-4 font-medium text-slate-800">
                                      {new Date(v.start_date).toLocaleDateString()} - {new Date(v.end_date).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 text-slate-600">{v.days_requested}</td>
                                  <td className="px-6 py-4">
                                      {v.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pendiente</span>}
                                      {v.status === 'approved' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Aprobada</span>}
                                      {v.status === 'rejected' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rechazada</span>}
                                  </td>
                                  <td className="px-6 py-4 text-right space-x-2">
                                      {v.status === 'pending' && (
                                          <>
                                              <button onClick={() => confirmStatusUpdate(v.id, 'approved')} className="text-emerald-500 hover:text-emerald-700 font-medium transition-colors">
                                                  Aprobar
                                              </button>
                                              <span className="text-slate-300">|</span>
                                              <button onClick={() => confirmStatusUpdate(v.id, 'rejected')} className="text-red-500 hover:text-red-700 font-medium transition-colors">
                                                  Rechazar
                                              </button>
                                          </>
                                      )}
                                      {v.status !== 'pending' && (
                                          <button onClick={() => confirmStatusUpdate(v.id, 'pending')} className="text-amber-500 hover:text-amber-700 font-medium transition-colors">
                                              Marcar Pendiente
                                          </button>
                                      )}
                                  </td>
                              </tr>
                          ))}
                          {filteredVacations.length === 0 && (
                              <tr>
                                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No hay solicitudes para mostrar.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
        </div>
      </main>

      <ConfirmModal 
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, id: null, status: null, title: '', message: '' })}
        onConfirm={handleStatusUpdate}
        title={statusModal.title}
        message={statusModal.message}
        confirmText="Confirmar"
        cancelText="Cancelar"
        isDestructive={statusModal.status === 'rejected'}
      />
    </div>
  );
}
