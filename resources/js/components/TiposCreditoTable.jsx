import React, { useState } from 'react';
import axios from 'axios';
import AlertModal from './AlertModal';
import ConfirmModal from './ConfirmModal';

export default function TiposCreditoTable({ tipos = [], centros = [], tiposSesion = [], onUpdate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCredito, setEditingCredito] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    id_centro: '',
    sesiones: []
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', isError: false });
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, id: null });

  const showAlert = (message, isError = false, title = isError ? "Error" : "¡Éxito!") => {
    setAlertConfig({ isOpen: true, title, message, isError });
  };

  const openModal = (credito = null) => {
    if (credito) {
      setEditingCredito(credito);
      setFormData({
        nombre: credito.nombre || '',
        id_centro: credito.id_centro || '',
        sesiones: credito.sesiones ? credito.sesiones.map(s => s.id) : []
      });
    } else {
      setEditingCredito(null);
      setFormData({
        nombre: '',
        id_centro: '',
        sesiones: []
      });
    }
    setSearchTerm('');
    setModalOpen(true);
  };

  const filteredSessions = tiposSesion.filter(s => {
    // Si hay un centro seleccionado, solo mostrar clases de ese centro
    const matchesCenter = !formData.id_centro || String(s.centro_id) === String(formData.id_centro);
    // Filtro por nombre
    const matchesSearch = s.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCenter && matchesSearch;
  });

  const handleSessionToggle = (id) => {
    setFormData(prev => {
      const isSelected = prev.sesiones.includes(id);
      if (isSelected) {
        return { ...prev, sesiones: prev.sesiones.filter(sid => sid !== id) };
      } else {
        return { ...prev, sesiones: [...prev.sesiones, id] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.sesiones.length === 0) {
      showAlert('Debes seleccionar al menos un tipo de sesión para este crédito.', true);
      setLoading(false);
      return;
    }

    try {
      if (editingCredito) {
        await axios.put(`/api/admin/tipos-credito/${editingCredito.id}`, formData);
        showAlert('Tipo de crédito actualizado correctamente.');
      } else {
        await axios.post('/api/admin/tipos-credito', formData);
        showAlert('Nuevo tipo de crédito creado correctamente.');
      }
      setModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error guardando tipo de crédito', error);
      const msg = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(' ')
        : (error.response?.data?.message || 'Error guardando datos.');
      showAlert(msg, true);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setConfirmConfig({ isOpen: true, id });
  };

  const handleDelete = async () => {
    const id = confirmConfig.id;
    if (!id) return;
    
    setConfirmConfig({ ...confirmConfig, isOpen: false });
    try {
      await axios.delete(`/api/admin/tipos-credito/${id}`);
      showAlert('Tipo de crédito eliminado correctamente.');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error eliminando tipo de crédito', error);
      showAlert('No se pudo eliminar el tipo de crédito.', true);
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
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-[13px]">
            {tipos.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-slate-400 font-medium italic">
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
                  <td className="py-3 px-3 text-right space-x-2">
                    <button 
                      onClick={() => openModal(t)}
                      className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                      onClick={() => confirmDelete(t.id)}
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
                    onChange={(e) => {
                      const newCentroId = e.target.value;
                      setFormData({
                        ...formData, 
                        id_centro: newCentroId,
                        sesiones: [] // Limpiar sesiones al cambiar de centro para evitar inconsistencias
                      });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">Global (Válido en cualquier sede)</option>
                    {centros.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2 ml-1">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Sesiones Permitidas</label>
                    <div className="relative">
                      <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"></i>
                      <input 
                        type="text"
                        placeholder="Buscar clase..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1 bg-slate-100 border-none rounded-lg text-[10px] font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 outline-none w-32 sm:w-48 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-[200px] overflow-auto custom-scrollbar space-y-2">
                    {filteredSessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                        <i className="fa-solid fa-layer-group mb-2 opacity-20 text-2xl"></i>
                        <p className="text-[10px] font-medium italic">
                          {searchTerm ? 'No se encontraron clases con ese nombre.' : 'No hay clases disponibles para este centro.'}
                        </p>
                      </div>
                    ) : (
                      filteredSessions.map(s => (
                        <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-slate-100">
                          <input
                            type="checkbox"
                            checked={formData.sesiones.includes(s.id)}
                            onChange={() => handleSessionToggle(s.id)}
                            className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{s.nombre}</p>
                            <p className="text-[10px] text-slate-400">{s.centro_nombre || 'Global'}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {formData.id_centro && (
                    <p className="text-[9px] text-indigo-500 mt-2 ml-1 font-bold">
                      <i className="fa-solid fa-filter mr-1"></i> Mostrando solo clases del centro seleccionado.
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1 ml-1 italic">Este crédito solo podrá usarse para reservar las sesiones seleccionadas.</p>
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

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
        isError={alertConfig.isError}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={handleDelete}
        title="Eliminar Crédito"
        message="¿Estás seguro de que quieres eliminar este Tipo de Crédito? Esto podría afectar a los usuarios que tengan bonos de este tipo."
        confirmText="Sí, eliminar"
        isDestructive={true}
      />
    </div>
  );
}
