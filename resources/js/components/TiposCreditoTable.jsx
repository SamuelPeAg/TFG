import React, { useState } from 'react';
import axios from 'axios';

export default function TiposCreditoTable({ tipos = [], centros = [], tiposSesion = [], onUpdate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCredito, setEditingCredito] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    id_centro: '',
    sesiones: []
  });
  const [loading, setLoading] = useState(false);

  const openModal = (credito = null) => {
    if (credito) {
      setEditingCredito(credito);
      setFormData({
        nombre: credito.nombre || '',
        id_centro: credito.id_centro || '',
        sesiones: credito.sesiones?.map(s => s.id) || []
      });
    } else {
      setEditingCredito(null);
      setFormData({
        nombre: '',
        id_centro: '',
        sesiones: []
      });
    }
    setModalOpen(true);
  };

  const handleCheckboxChange = (sesionId) => {
    setFormData(prev => {
      const isSelected = prev.sesiones.includes(sesionId);
      if (isSelected) {
        return { ...prev, sesiones: prev.sesiones.filter(id => id !== sesionId) };
      } else {
        return { ...prev, sesiones: [...prev.sesiones, sesionId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCredito) {
        await axios.put(`/admin/tipos-credito/${editingCredito.id}`, formData);
      } else {
        await axios.post('/admin/tipos-credito', formData);
      }
      setModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error guardando tipo de crédito', error);
      alert(error.response?.data?.message || 'Error guardando datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este Tipo de Crédito? Afectará a los futuros pagos que usen este crédito.')) return;
    try {
      await axios.delete(`/admin/tipos-credito/${id}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error eliminando tipo de crédito', error);
      alert('Error eliminando el tipo de crédito.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-ticket text-indigo-500"></i> Tipos de Crédito
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Bolsas de crédito multi-clase para bonos</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Nuevo
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
            <tr className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
              <th className="py-3 px-3">Nombre</th>
              <th className="py-3 px-3 hidden md:table-cell">Centro</th>
              <th className="py-3 px-3">Válido para (Clases)</th>
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-[13px]">
            {tipos.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-400 font-medium italic">
                  No hay Tipos de Crédito registrados.
                </td>
              </tr>
            ) : (
              tipos.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-700">{t.nombre}</td>
                  <td className="py-3 px-3 hidden md:table-cell text-slate-500">
                    {t.id_centro ? centros.find(c => c.id === t.id_centro)?.nombre : 'Global'}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                        {t.sesiones?.map(s => (
                            <span key={s.id} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                {s.nombre}
                            </span>
                        ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button 
                      onClick={() => openModal(t)}
                      className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-xl relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <h3 className="font-black text-lg">
                {editingCredito ? 'Editar Tipo de Crédito' : 'Nuevo Tipo de Crédito'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nombre del Crédito</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: Bono Multi-Deporte"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Centro Asociado (Opcional)</label>
                  <select
                    value={formData.id_centro}
                    onChange={(e) => setFormData({...formData, id_centro: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">Global (Válido en cualquier sede)</option>
                    {centros.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Clases Permitidas (Tipos de Sesión)</label>
                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto custom-scrollbar p-2 bg-slate-50 border border-slate-200 rounded-xl">
                        {tiposSesion.map(ts => (
                            <label key={ts.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-2 rounded-lg transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={formData.sesiones.includes(ts.id)}
                                    onChange={() => handleCheckboxChange(ts.id)}
                                    className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">{ts.nombre}</span>
                                    {ts.centro_nombre && <span className="text-[9px] text-slate-400">{ts.centro_nombre}</span>}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                  {editingCredito ? 'Guardar Cambios' : 'Crear Crédito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
