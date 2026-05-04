import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Button from './Button';

export default function TiposSesionTable({ tipos, centros, onUpdate }) {
  const [editMode, setEditMode] = useState(null);
  const selectRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    capacidad_personas: 1,
    capacidad_fija: true,
    precio_base: 0,
    color_hex: '#4BB7AE',
    activo: true,
    orden: 0,
    descripcion: '',
    centro_id: '',
    tipos_credito: []
  });

  // Auto-generation of slug from nombre
  useEffect(() => {
    if (formData.nombre) {
      const generatedSlug = formData.nombre
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '_')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.nombre]);

  // Select2 Integration Sync
  useEffect(() => {
    if (window.$ && selectRef.current && editMode) {
      const $select = window.$(selectRef.current);
      
      // Listener para cambios desde Select2 (jQuery)
      const handleChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, centro_id: value }));
      };

      $select.on('change', handleChange);

      // Sincronizar valor inicial cuando se abre el modal/cambia editMode
      $select.val(formData.centro_id).trigger('change.select2');

      return () => {
        $select.off('change', handleChange);
      };
    }
  }, [editMode]);

  const handleAdd = async () => {
    try {
      const data = { 
        ...formData, 
        precio_base: parseFloat(formData.precio_base) || 0, 
        capacidad_personas: parseInt(formData.capacidad_personas) || 1,
        orden: 0,
        tipos_credito: formData.tipos_credito
      };
      await axios.post('/api/admin/tipos-sesion', data);
      setFormData({
        nombre: '', slug: '', capacidad_personas: 1, capacidad_fija: true,
        precio_base: 0, color_hex: '#4BB7AE', activo: true, orden: 0,
        descripcion: '', centro_id: '', tipos_credito: []
      });
      onUpdate();
      setEditMode(null);
    } catch (e) {
      console.error('Error adding session type:', e.response?.data);
      alert('Error al añadir tipo de sesión: ' + (e.response?.data?.message || 'Datos inválidos'));
    }
  };

  const handleEdit = (tipo) => {
    setFormData({
      ...tipo,
      centro_id: tipo.centro_id || '',
      tipos_credito: tipo.tipos_credito_ids || []
    });
    setEditMode(tipo.id);
  };

  const handleSaveEdit = async () => {
    try {
      const data = { 
        ...formData, 
        precio_base: parseFloat(formData.precio_base) || 0,
        capacidad_personas: parseInt(formData.capacidad_personas) || 1,
        orden: 0,
        tipos_credito: formData.tipos_credito
      };
      await axios.put(`/api/admin/tipos-sesion/${editMode}`, data);
      setEditMode(null);
      onUpdate();
    } catch (e) {
      console.error('Error editing session type:', e.response?.data);
      alert('Error al actualizar: ' + (e.response?.data?.message || 'Error desconocido'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este tipo de sesión?')) return;
    try {
      await axios.delete(`/api/admin/tipos-sesion/${id}`);
      onUpdate();
    } catch (e) {
      alert('Error al eliminar');
    }
  };

  const groupedTipos = tipos.reduce((acc, tipo) => {
    const key = tipo.centro_nombre || 'Global';
    if (!acc[key]) acc[key] = [];
    acc[key].push(tipo);
    return acc;
  }, {});

  const turquesaHex = '#4BB7AE';

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 col-span-1 lg:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-tags" style={{ color: turquesaHex }}></i> Configuración de Tipos de Sesión
        </h3>
        <Button onClick={() => setEditMode('new')} variant="primary" size="sm" icon="fa-plus">AÑADIR TIPO</Button>
      </div>

      <div className="space-y-8">
        {Object.keys(groupedTipos).map(centroName => (
          <div key={centroName} className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-slate-300"></i> {centroName}
            </h4>
            <div className="overflow-x-auto bg-slate-50/30 rounded-3xl p-2">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="pb-3 px-4">Sesión</th>
                    <th className="pb-3 px-4 text-center">Capacidad</th>
                    <th className="pb-3 px-4 text-center">Estado</th>
                    <th className="pb-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupedTipos[centroName].map(tipo => (
                    <tr key={tipo.id} className="text-sm hover:bg-white transition-colors group">
                      <td className="py-4 px-4 font-black text-slate-700">
                        {tipo.nombre}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold text-xs">
                          {tipo.capacidad_personas} pers.
                          {tipo.capacidad_fija ? 
                            <i className="fa-solid fa-lock text-[10px] text-slate-400" title="Capacidad fija"></i> : 
                            <i className="fa-solid fa-lock-open text-[10px] text-slate-300" title="Capacidad editable"></i>
                          }
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {tipo.activo ? 
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg font-black text-[10px] uppercase">Activo</span> : 
                          <span className="bg-rose-50 text-rose-500 px-2 py-0.5 rounded-lg font-black text-[10px] uppercase">Inactivo</span>
                        }
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button onClick={() => handleEdit(tipo)} className="text-slate-300 hover:text-[#4BB7AE] transition-colors"><i className="fa-solid fa-pencil"></i></button>
                        <button onClick={() => handleDelete(tipo.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {editMode && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditMode(null)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <h4 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${turquesaHex}1A`, color: turquesaHex }}>
                 <i className={`fa-solid ${editMode === 'new' ? 'fa-plus' : 'fa-pen-to-square'}`}></i>
              </div>
              {editMode === 'new' ? 'Nuevo Tipo de Sesión' : 'Editar Tipo de Sesión'}
            </h4>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nombre del tipo de sesión</label>
                <input type="text" placeholder="Ej: Trío, Grupo, Personal..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#4BB7AE] outline-none font-bold text-slate-700" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Capacidad de personas</label>
                  <input type="number" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#4BB7AE] outline-none font-bold" value={formData.capacidad_personas} onChange={e => setFormData({...formData, capacidad_personas: e.target.value.replace(/[^0-9]/g, '')})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Precio Base (€)</label>
                  <input type="number" step="0.01" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#4BB7AE] outline-none font-bold" value={formData.precio_base} onChange={e => setFormData({...formData, precio_base: e.target.value.replace(/[^0-9.]/g, '')})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Centro Asignado</label>
                  <select 
                    ref={selectRef}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#4BB7AE] outline-none font-bold text-slate-600" 
                    value={formData.centro_id} 
                    onChange={e => setFormData({...formData, centro_id: e.target.value})}
                  >
                    <option value="">Global (Todos los centros)</option>
                    {centros.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                 <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                    <input type="checkbox" id="capacidad_fija" className="w-5 h-5 rounded-lg" style={{ accentColor: turquesaHex }} checked={formData.capacidad_fija} onChange={e => setFormData({...formData, capacidad_fija: e.target.checked})} />
                    <label htmlFor="capacidad_fija" className="text-xs font-black text-slate-600 uppercase cursor-pointer select-none">Capacidad Fija 🔒</label>
                 </div>
                 <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                    <input type="checkbox" id="activo" className="w-5 h-5 accent-emerald-500 rounded-lg" checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} />
                    <label htmlFor="activo" className="text-xs font-black text-slate-600 uppercase cursor-pointer select-none">Activo ✅</label>
                 </div>
              </div>

              <div className="space-y-2">
                <textarea rows="3" className="w-full px-6 py-4 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-[#4BB7AE] outline-none font-medium text-slate-600" value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})} placeholder="Para qué sirve este tipo de sesión..."></textarea>
              </div>

              {/* Selección de Créditos Permitidos */}
              <div className="space-y-4 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Créditos que dan acceso</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                  {tiposCredito.map(tc => {
                    const isChecked = formData.tipos_credito.includes(tc.id);
                    return (
                      <label key={tc.id} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${isChecked ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-[#4BB7AE] accent-[#4BB7AE]" 
                          checked={isChecked}
                          onChange={() => {
                            const newCredits = isChecked 
                              ? formData.tipos_credito.filter(id => id !== tc.id)
                              : [...formData.tipos_credito, tc.id];
                            setFormData({ ...formData, tipos_credito: newCredits });
                          }}
                        />
                        <span className={`text-xs font-bold ${isChecked ? 'text-teal-700' : 'text-slate-600'}`}>{tc.nombre}</span>
                      </label>
                    );
                  })}
                  {tiposCredito.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic">No hay tipos de crédito configurados aún.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => setEditMode(null)} className="flex-1 py-5 font-black text-slate-400 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors uppercase text-xs tracking-[0.2em]">CANCELAR</button>
              <button onClick={editMode === 'new' ? handleAdd : handleSaveEdit} className="flex-1 py-5 font-black text-white rounded-2xl shadow-xl shadow-turquesa/20 hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs tracking-[0.2em]" style={{ backgroundColor: turquesaHex }}>GUARDAR CAMBIOS</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
