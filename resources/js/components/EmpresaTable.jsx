import React, { useState } from 'react';
import axios from 'axios';
import Button from './Button';

export default function EmpresaTable({ empresas, onUpdate }) {
    const [editMode, setEditMode] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '', cif_dni: '', direccion: '', cp: '', ciudad: '', iva_configurable: 21
    });

    const handleAdd = async () => {
        try {
            const data = { ...formData, iva_configurable: parseFloat(formData.iva_configurable) || 0 };
            await axios.post('/api/admin/empresas', data);
            setFormData({ nombre: '', cif_dni: '', direccion: '', cp: '', ciudad: '', iva_configurable: 21 });
            onUpdate();
            setEditMode(null);
        } catch (e) { 
            console.error('Error adding:', e.response?.data);
            alert('Error al añadir empresa: ' + (e.response?.data?.message || 'CIF/DNI duplicado o datos inválidos')); 
        }
    };

    const handleEdit = (emp) => {
        setEditMode(emp.id);
        setFormData(emp);
    };

    const handleSaveEdit = async () => {
        try {
            const data = { ...formData, iva_configurable: parseFloat(formData.iva_configurable) || 0 };
            await axios.put(`/api/admin/empresas/${editMode}`, data);
            setEditMode(null);
            onUpdate();
        } catch (e) { 
            console.error('Error editing:', e.response?.data);
            alert('Error al actualizar: ' + (e.response?.data?.message || 'Error desconocido')); 
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta empresa?')) return;
        try {
            await axios.delete(`/api/admin/empresas/${id}`);
            onUpdate();
        } catch (e) { alert('Error al eliminar'); }
    };

    return (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <i className="fa-solid fa-building text-indigo-400"></i> Gestión de Empresas Fiscales
                </h3>
                <Button onClick={() => setEditMode('new')} variant="primary" size="sm" icon="fa-plus">AÑADIR</Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-50">
                        <tr>
                            <th className="pb-3 px-2">Empresa</th>
                            <th className="pb-3 px-2">CIF/DNI</th>
                            <th className="pb-3 px-2">IVA</th>
                            <th className="pb-3 px-2">Ciudad</th>
                            <th className="pb-3 px-2 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {empresas.map(emp => (
                            <tr key={emp.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-2 font-black text-slate-700">{emp.nombre}</td>
                                <td className="py-4 px-2 text-slate-500 font-medium">{emp.cif_dni}</td>
                                <td className="py-4 px-2"><span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-black">{emp.iva_configurable}%</span></td>
                                <td className="py-4 px-2 text-slate-400">{emp.ciudad}</td>
                                <td className="py-4 px-2 text-right space-x-2">
                                    <button onClick={() => handleEdit(emp)} className="text-slate-300 hover:text-indigo-500 transition-colors"><i className="fa-solid fa-pencil"></i></button>
                                    <button onClick={() => handleDelete(emp.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><i className="fa-solid fa-trash"></i></button>
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
                        <h4 className="text-xl font-black text-slate-800 mb-6">{editMode === 'new' ? 'Nueva Empresa' : 'Editar Empresa'}</h4>
                        <div className="space-y-4">
                            <input type="text" placeholder="Nombre / Razón Social" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none font-bold" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="CIF / DNI" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none font-bold" value={formData.cif_dni} onChange={e => setFormData({...formData, cif_dni: e.target.value})} />
                                <input type="number" step="0.01" placeholder="IVA %" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none font-bold" value={formData.iva_configurable} onChange={e => setFormData({...formData, iva_configurable: e.target.value})} />
                            </div>
                            <input type="text" placeholder="Dirección" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="CP" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none" value={formData.cp} onChange={e => setFormData({...formData, cp: e.target.value})} />
                                <input type="text" placeholder="Ciudad" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setEditMode(null)} className="flex-1 py-3 font-black text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors uppercase text-xs tracking-widest">CANCELAR</button>
                            <button onClick={editMode === 'new' ? handleAdd : handleSaveEdit} className="flex-1 py-3 font-black text-white bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-600 transition-all uppercase text-xs tracking-widest">GUARDAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
