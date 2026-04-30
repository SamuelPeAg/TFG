import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';

export default function MisVacaciones() {
  const [vacations, setVacations] = useState([]);
  const [stats, setStats] = useState({ remaining_days: 0, approved_days: 0, pending_days: 0, total_days: 15 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({ start_date: '', end_date: '' });
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const fetchVacations = async () => {
    try {
      const res = await axios.get('/api/vacations');
      setVacations(res.data.vacations);
      setStats({
        remaining_days: res.data.remaining_days,
        approved_days: res.data.approved_days,
        pending_days: res.data.pending_days,
        total_days: res.data.total_days,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVacations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/vacations', formData);
      setFormData({ start_date: '', end_date: '' });
      fetchVacations();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al solicitar vacaciones');
    }
  };

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await axios.delete(`/api/vacations/${deleteModal.id}`);
      fetchVacations();
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      console.error(err);
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
            <div className="px-4 sm:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button className="lg:hidden p-2.5 text-slate-500 hover:text-[#38C1A3] rounded-xl hover:bg-slate-100 transition-all" onClick={() => setIsSidebarOpen(true)}>
                        <i className="fa-solid fa-bars text-lg"></i>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#38C1A3]/20 to-[#38C1A3]/10 flex items-center justify-center">
                            <i className="fa-solid fa-umbrella-beach text-[#38C1A3] text-lg"></i>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Mis Vacaciones</h1>
                            <p className="text-xs font-medium text-slate-500">Gestiona tus días de descanso</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <div className="p-4 sm:p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500 mb-1">Días Disponibles</p>
                <p className="text-3xl font-bold text-[#38C1A3]">{stats.remaining_days}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500 mb-1">Días Aprobados</p>
                <p className="text-3xl font-bold text-slate-800">{stats.approved_days}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500 mb-1">Días Pendientes</p>
                <p className="text-3xl font-bold text-amber-500">{stats.pending_days}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Anual</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total_days}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Solicitar Vacaciones</h2>
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Inicio</label>
                            <input 
                                type="date" 
                                required
                                value={formData.start_date}
                                onChange={e => setFormData({...formData, start_date: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-[#38C1A3] focus:ring-2 focus:ring-[#38C1A3]/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Fin</label>
                            <input 
                                type="date" 
                                required
                                value={formData.end_date}
                                min={formData.start_date}
                                onChange={e => setFormData({...formData, end_date: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-[#38C1A3] focus:ring-2 focus:ring-[#38C1A3]/20 transition-all"
                            />
                        </div>
                        <button type="submit" className="w-full bg-[#38C1A3] hover:bg-[#2da389] text-white font-bold py-3 rounded-xl transition-colors shadow-sm">
                            Enviar Solicitud
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800">Mis Solicitudes</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Inicio</th>
                                    <th className="px-6 py-3 font-semibold">Fin</th>
                                    <th className="px-6 py-3 font-semibold">Días</th>
                                    <th className="px-6 py-3 font-semibold">Estado</th>
                                    <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {vacations.map(v => (
                                    <tr key={v.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-800">{new Date(v.start_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{new Date(v.end_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-slate-600">{v.days_requested}</td>
                                        <td className="px-6 py-4">
                                            {v.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pendiente</span>}
                                            {v.status === 'approved' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Aprobada</span>}
                                            {v.status === 'rejected' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rechazada</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {v.status === 'pending' && (
                                                <button onClick={() => confirmDelete(v.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Cancelar Solicitud">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {vacations.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No tienes solicitudes de vacaciones este año.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Cancelar Solicitud"
        message="¿Estás seguro de que deseas cancelar esta solicitud de vacaciones? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar"
        cancelText="Volver"
        isDestructive={true}
      />
    </div>
  );
}
