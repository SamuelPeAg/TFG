import React, { useState } from 'react';
import axios from 'axios';
import Button from './Button';

export default function CentroTable({ centros, onUpdate }) {
    const [editMode, setEditMode] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '', cif: '', direccion: '', cp: '', ciudad: '', iva_default: 21, google_maps_link: ''
    });

    const handleAdd = async () => {
        try {
            await axios.post('/api/admin/centros', formData);
            setFormData({ nombre: '', cif: '', direccion: '', cp: '', ciudad: '', iva_default: 21, google_maps_link: '' });
            onUpdate();
        } catch (e) { alert('Error al añadir centro'); }
    };

    const handleEdit = (c) => {
        setEditMode(c.id);
        setFormData(c);
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`/api/admin/centros/${editMode}`, formData);
            setEditMode(null);
            onUpdate();
        } catch (e) { alert('Error al actualizar'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este centro?')) return;
        try {
            await axios.delete(`/api/admin/centros/${id}`);
            onUpdate();
        } catch (e) { alert('Error al eliminar'); }
    };

    return (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <i className="fa-solid fa-hotel text-emerald-400"></i> Gestión de Centros Deportivos
                </h3>
                <Button onClick={() => setEditMode('new')} variant="primary" size="sm" icon="fa-plus">AÑADIR</Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <tr>
                            <th className="pb-3 px-2">Centro</th>
                            <th className="pb-3 px-2">CIF/NIF</th>
                            <th className="pb-3 px-2">IVA Default</th>
                            <th className="pb-3 px-2">Ciudad</th>
                            <th className="pb-3 px-2 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {centros.map(c => (
                            <tr key={c.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-2 font-black text-slate-700">{c.nombre}</td>
                                <td className="py-4 px-2 text-slate-500 font-medium">{c.cif || '---'}</td>
                                <td className="py-4 px-2"><span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg font-black">{c.iva_default}%</span></td>
                                <td className="py-4 px-2 text-slate-400">{c.ciudad || '---'}</td>
                                <td className="py-4 px-2 text-right space-x-2">
                                    <button onClick={() => handleEdit(c)} className="text-slate-300 hover:text-emerald-500 transition-colors"><i className="fa-solid fa-pencil"></i></button>
                                    <button onClick={() => handleDelete(c.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><i className="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editMode && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditMode(null)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
                        <h4 className="text-xl font-black text-slate-800 mb-6">{editMode === 'new' ? 'Nuevo Centro' : 'Editar Centro'}</h4>
                        <div className="space-y-4">
                            <input type="text" placeholder="Nombre" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-bold" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="CIF" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-bold" value={formData.cif} onChange={e => setFormData({...formData, cif: e.target.value})} />
                                <input type="number" placeholder="IVA Default %" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-bold" value={formData.iva_default} onChange={e => setFormData({...formData, iva_default: e.target.value})} />
                            </div>
                            <input type="text" placeholder="Dirección" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="CP" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none" value={formData.cp} onChange={e => setFormData({...formData, cp: e.target.value})} />
                                <input type="text" placeholder="Ciudad" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} />
                            </div>
                            <input type="text" placeholder="Enlace Google Maps" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none" value={formData.google_maps_link} onChange={e => setFormData({...formData, google_maps_link: e.target.value})} />
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setEditMode(null)} className="flex-1 py-3 font-black text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors uppercase text-xs tracking-widest">CANCELAR</button>
                            <button onClick={editMode === 'new' ? handleAdd : handleSaveEdit} className="flex-1 py-3 font-black text-white bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all uppercase text-xs tracking-widest">GUARDAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
