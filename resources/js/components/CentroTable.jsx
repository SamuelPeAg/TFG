import React, { useState } from 'react';
import axios from 'axios';
import Button from './Button';
import MapPicker from './MapPicker';

export default function CentroTable({ centros, empresas, onUpdate, onAlert, onConfirm }) {
    const [editMode, setEditMode] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '', cif: '', direccion: '', cp: '', ciudad: '', empresa_id: '', google_maps_link: '', color_hex: '#38b2ac', lat: '', lng: '', tag: '', icon: 'fa-heart-pulse',
        serie_facturacion: '', ultimo_numero_factura: 0
    });
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.nombre || formData.nombre.length < 3) newErrors.nombre = 'El nombre debe tener al menos 3 caracteres.';
        if (!formData.cif) newErrors.cif = 'El CIF/NIF es obligatorio.';
        else if (!/^[0-9ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-Z]$/i.test(formData.cif)) newErrors.cif = 'Formato de CIF/NIF no válido.';
        if (!formData.direccion) newErrors.direccion = 'La dirección es obligatoria.';
        if (!formData.cp) newErrors.cp = 'El CP es obligatorio.';
        else if (!/^\d{5}$/.test(formData.cp)) newErrors.cp = 'El CP debe tener 5 dígitos.';
        if (!formData.ciudad) newErrors.ciudad = 'La ciudad es obligatoria.';
        if (!formData.empresa_id) newErrors.empresa_id = 'Selecciona una empresa.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAdd = async () => {
        if (!validate()) return;
        try {
            await axios.post('/api/admin/centros', formData);
            setFormData({ 
                nombre: '', cif: '', direccion: '', cp: '', ciudad: '', empresa_id: '', google_maps_link: '', color_hex: '#38b2ac', lat: '', lng: '', tag: '', icon: 'fa-heart-pulse',
                serie_facturacion: '', ultimo_numero_factura: 0
            });
            setErrors({});
            setShowMapPicker(false);
            onUpdate();
        } catch (e) { 
            if (e.response?.data?.errors) setErrors(e.response.data.errors);
            else onAlert('Error al añadir centro', true); 
        }
    };

    const handleEdit = (c) => {
        setEditMode(c.id);
        setFormData(c);
        setErrors({});
        setShowMapPicker(false);
    };

    const handleSaveEdit = async () => {
        if (!validate()) return;
        try {
            await axios.put(`/api/admin/centros/${editMode}`, formData);
            setEditMode(null);
            setErrors({});
            onUpdate();
        } catch (e) { 
            if (e.response?.data?.errors) setErrors(e.response.data.errors);
            else onAlert('Error al actualizar', true); 
        }
    };

    const handleDelete = async (id) => {
        onConfirm('¿Eliminar este centro?', async () => {
            try {
                await axios.delete(`/api/admin/centros/${id}`);
                onUpdate();
            } catch (e) { onAlert('Error al eliminar', true); }
        }, true, 'Eliminar Centro');
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
                    <thead className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-50">
                        <tr>
                            <th className="pb-3 px-2">Centro</th>
                            <th className="pb-3 px-2">CIF/NIF</th>
                            <th className="pb-3 px-2">SERIE</th>
                            <th className="pb-3 px-2">Empresa Default</th>
                            <th className="pb-3 px-2">Ciudad</th>
                            <th className="pb-3 px-2 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {centros.map(c => (
                            <tr key={c.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-2 font-black text-slate-700">{c.nombre}</td>
                                <td className="py-4 px-2 text-slate-500 font-medium">{c.cif || '---'}</td>
                                <td className="py-4 px-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color_hex || '#38b2ac' }}></div>
                                        <span className="font-black text-slate-800 text-xs tracking-widest">{c.serie_facturacion || '---'}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-2">
                                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg font-black italic text-xs">
                                        {c.empresa?.nombre || 'Sin empresa'}
                                    </span>
                                </td>
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
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setEditMode(null); setShowMapPicker(false); }}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
                        <h4 className="text-xl font-black text-slate-800 mb-6">{editMode === 'new' ? 'Nuevo Centro' : 'Editar Centro'}</h4>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <input type="text" placeholder="Nombre" className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-bold transition-all ${errors.nombre ? 'border-rose-400 bg-rose-50' : 'border-transparent'}`} value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                                {errors.nombre && <p className="text-[10px] text-rose-500 font-black ml-2 uppercase italic">{errors.nombre}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <input type="text" placeholder="CIF" className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-bold transition-all ${errors.cif ? 'border-rose-400 bg-rose-50' : 'border-transparent'}`} value={formData.cif} onChange={e => setFormData({...formData, cif: e.target.value})} />
                                    {errors.cif && <p className="text-[10px] text-rose-500 font-black ml-2 uppercase italic">{errors.cif}</p>}
                                </div>
                                <div className="space-y-1">
                                    <div className="relative group">
                                        <select 
                                            className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-emerald-400/10 focus:border-emerald-400 outline-none font-bold text-slate-600 text-xs appearance-none cursor-pointer pr-10 transition-all hover:bg-slate-100 shadow-sm uppercase tracking-tighter ${errors.empresa_id ? 'border-rose-400 bg-rose-50' : 'border-transparent'}`} 
                                            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                                            value={formData.empresa_id || ''} 
                                            onChange={e => setFormData({...formData, empresa_id: e.target.value})}
                                        >
                                            <option value="">Empresa Default...</option>
                                            {empresas.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.empresa_id && <p className="text-[10px] text-rose-500 font-black ml-2 uppercase italic">{errors.empresa_id}</p>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <input type="text" placeholder="Dirección" className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none transition-all ${errors.direccion ? 'border-rose-400 bg-rose-50' : 'border-transparent'}`} value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
                                {errors.direccion && <p className="text-[10px] text-rose-500 font-black ml-2 uppercase italic">{errors.direccion}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <input type="text" placeholder="CP" className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none transition-all ${errors.cp ? 'border-rose-400 bg-rose-50' : 'border-transparent'}`} value={formData.cp} onChange={e => setFormData({...formData, cp: e.target.value})} />
                                    {errors.cp && <p className="text-[10px] text-rose-500 font-black ml-2 uppercase italic">{errors.cp}</p>}
                                </div>
                                <div className="space-y-1">
                                    <input type="text" placeholder="Ciudad" className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none transition-all ${errors.ciudad ? 'border-rose-400 bg-rose-50' : 'border-transparent'}`} value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} />
                                    {errors.ciudad && <p className="text-[10px] text-rose-500 font-black ml-2 uppercase italic">{errors.ciudad}</p>}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 mt-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Configuración de Facturación</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Serie (ej: AIRA)" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-bold text-sm" value={formData.serie_facturacion || ''} onChange={e => setFormData({...formData, serie_facturacion: e.target.value})} />
                                    <div className="flex items-center px-4 py-3 bg-slate-100/50 rounded-2xl border-none">
                                        <span className="text-[10px] font-black text-slate-400 uppercase mr-2">Nº Actual:</span>
                                        <span className="font-bold text-slate-600">{formData.ultimo_numero_factura || 0}</span>
                                    </div>
                                </div>
                            </div>
                            <input type="text" placeholder="Enlace Google Maps o Iframe" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm" value={formData.google_maps_link} onChange={e => setFormData({...formData, google_maps_link: e.target.value})} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Etiqueta (Tag)</label>
                                    <input type="text" placeholder="Ej: Salud y ejercicio" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-bold text-sm" value={formData.tag || ''} onChange={e => setFormData({...formData, tag: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Icono</label>
                                    <div className="relative group">
                                        <select 
                                            className="w-full px-4 py-3 bg-slate-50 border-transparent border rounded-2xl focus:ring-4 focus:ring-emerald-400/10 focus:border-emerald-400 outline-none font-black text-slate-600 text-xs appearance-none cursor-pointer pr-10 transition-all hover:bg-slate-100 shadow-sm uppercase tracking-widest" 
                                            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                                            value={formData.icon || 'fa-heart-pulse'} 
                                            onChange={e => setFormData({...formData, icon: e.target.value})}
                                        >
                                            <option value="fa-heart-pulse">Corazón (Salud)</option>
                                            <option value="fa-dumbbell">Mancuerna (Fitness)</option>
                                            <option value="fa-sun">Sol (Outdoor)</option>
                                            <option value="fa-bolt">Rayo (HIIT)</option>
                                            <option value="fa-water">Agua (Piscina)</option>
                                            <option value="fa-users">Usuarios (Grupo)</option>
                                            <option value="fa-medal">Medalla (Elite)</option>
                                            <option value="fa-location-dot">Ubicación (Genérico)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Coordenadas Geográficas</label>
                                    <button 
                                        type="button"
                                        onClick={() => setShowMapPicker(!showMapPicker)}
                                        className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full transition-colors"
                                    >
                                        <i className={`fa-solid ${showMapPicker ? 'fa-eye-slash' : 'fa-map-location-dot'}`}></i>
                                        {showMapPicker ? 'Ocultar Mapa' : 'Seleccionar en Mapa'}
                                    </button>
                                </div>

                                {showMapPicker && (
                                    <MapPicker 
                                        lat={formData.lat} 
                                        lng={formData.lng} 
                                        onSelect={(lat, lng) => setFormData({...formData, lat: lat.toFixed(6), lng: lng.toFixed(6)})} 
                                    />
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-slate-400 font-bold ml-2">LATITUD</span>
                                        <input type="number" step="any" placeholder="Ej: 40.4168" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.lat || ''} onChange={e => setFormData({...formData, lat: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-slate-400 font-bold ml-2">LONGITUD</span>
                                        <input type="number" step="any" placeholder="Ej: -3.7038" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.lng || ''} onChange={e => setFormData({...formData, lng: e.target.value})} />
                                    </div>
                                </div>
                                <p className="text-[9px] text-slate-400 italic px-2 leading-tight">
                                    <i className="fa-solid fa-circle-info mr-1"></i>
                                    Se autocompletarán si pegas el enlace de Google Maps arriba, o puedes marcarlas clicando en el mapa.
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Color del Centro en Calendario</label>
                                <div className="flex flex-wrap gap-3">
                                    {['#38b2ac', '#e11d48', '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#6366f1', '#475569'].map(c => (
                                        <button 
                                            key={c}
                                            type="button"
                                            onClick={() => setFormData({...formData, color_hex: c})}
                                            className={`w-8 h-8 rounded-full transition-all duration-300 transform hover:scale-125 hover:shadow-lg ${formData.color_hex === c ? 'ring-4 ring-white shadow-md scale-110' : 'opacity-70 hover:opacity-100'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <div className="relative flex items-center gap-2 ml-auto">
                                        <input 
                                            type="color" 
                                            className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer" 
                                            value={formData.color_hex || '#38b2ac'} 
                                            onChange={e => setFormData({...formData, color_hex: e.target.value})} 
                                        />
                                        <span className="text-[10px] font-bold text-slate-400">Personalizado</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => { setEditMode(null); setShowMapPicker(false); }} className="flex-1 py-3 font-black text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors uppercase text-xs tracking-widest">CANCELAR</button>
                            <button onClick={editMode === 'new' ? handleAdd : handleSaveEdit} className="flex-1 py-3 font-black text-white bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all uppercase text-xs tracking-widest">GUARDAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
