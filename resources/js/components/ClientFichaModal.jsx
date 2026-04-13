import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ClientFichaModal({ isOpen, onClose, user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    dni: '',
    direccion: '',
    codigo_postal: '',
    ciudad: '',
    additional_attributes: []
  });
  const [files, setFiles] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [availableSubscriptions, setAvailableSubscriptions] = useState([]);
  const [selectedSuscripcionId, setSelectedSuscripcionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [editingMeasurementId, setEditingMeasurementId] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', isError: false });

  const confirmAction = (message, onConfirm, isDestructive = false, title = "Confirmación") => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm, isDestructive });
  };
  
  const showAlert = (message, isError = false, title = isError ? "Error" : "Aviso") => {
    setAlertConfig({ isOpen: true, title, message, isError });
  };

  useEffect(() => {
    if (isOpen && user) {
        fetchFicha();
        fetchAvailableSubscriptions();
    }
  }, [isOpen, user]);

  const fetchAvailableSubscriptions = async () => {
    try {
        const res = await axios.get('/suscripciones');
        const subs = res.data.suscripciones || [];
        setAvailableSubscriptions(subs);
        
        if (subs.length > 0 && !selectedSuscripcionId) {
            setSelectedSuscripcionId(subs[0].id.toString());
        }
    } catch (error) {
        console.error("Error fetching available subscriptions:", error);
    }
  };

  const fetchFicha = async () => {
    setLoading(true);
    try {
        const res = await axios.get(`/client-profile/${user.id}`);
        const data = res.data.user;
        setProfileData({
            dni: data.dni || '',
            direccion: data.direccion || '',
            codigo_postal: data.codigo_postal || '',
            ciudad: data.ciudad || '',
            peso: data.peso || '',
            altura: data.altura || '',
            additional_attributes: Array.isArray(data.additional_attributes) ? data.additional_attributes : []
        });
        setFiles(res.data.files || []);
        setUserSubscriptions(res.data.subscriptions || []);
        setMeasurements(res.data.measurements || []);
    } catch (error) {
        console.error("Error fetching ficha:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleAssignSubscription = async () => {
    if (!selectedSuscripcionId) return;
    setSaving(true);
    try {
        await axios.post('/suscripciones-usuarios', {
            id_usuario: user.id,
            id_suscripcion: selectedSuscripcionId
        });
        showAlert('Suscripción asignada correctamente', false, 'Completado');
        fetchFicha();
    } catch (error) {
        const msg = error.response?.data?.message || 'Error al asignar suscripción';
        showAlert(msg, true);
    } finally {
        setSaving(false);
    }
  };

  const handleUpdateSubscriptionSaldo = async (subId, action) => {
    try {
        await axios.post(`/suscripciones-usuarios/${subId}/ajustar-saldo`, {
            accion: action,
            cantidad: 1
        });
        fetchFicha();
    } catch (error) {
        showAlert('Error al actualizar saldo', true);
    }
  };

  const handleDeleteSubscription = async (subId) => {
    confirmAction('¿Estás seguro de que deseas eliminar esta suscripción?', async () => {
        try {
            await axios.delete(`/suscripciones-usuarios/${subId}`);
            fetchFicha();
        } catch (error) {
            showAlert('Error al eliminar suscripción', true);
        }
    }, true, 'Eliminar Suscripción');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
        await axios.put(`/client-profile/${user.id}`, profileData);
        showAlert('Ficha actualizada correctamente', false, 'Guardado');
        fetchFicha();
    } catch (error) {
        showAlert('Error al guardar la ficha', true);
    } finally {
        setSaving(false);
    }
  };

  const handleSaveHealth = async () => {
      setSaving(true);
      try {
          if (editingMeasurementId) {
               await axios.put(`/measurements/${editingMeasurementId}`, {
                   peso: profileData.peso,
                   altura: profileData.altura,
                   measured_at: profileData.measured_at || new Date().toISOString().split('T')[0]
               });
               setEditingMeasurementId(null);
          } else {
              await axios.post(`/client-profile/${user.id}/progress`, {
                  peso: profileData.peso,
                  altura: profileData.altura
              });
          }
          fetchFicha();
          showAlert('Progreso actualizado', false, 'Completado');
      } catch (err) {
          const msg = err.response?.data?.message || 'Error al guardar';
          showAlert(msg, true);
      } finally {
          setSaving(false);
      }
  };

  const handleDeleteMeasurement = async (id) => {
      confirmAction('¿Borrar esta medida del historial?', async () => {
          try {
              await axios.delete(`/measurements/${id}`);
              fetchFicha();
          } catch (err) {
              showAlert('No se pudo eliminar', true);
          }
      }, true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setPendingFile(file);
  };

  const handleFileUpload = async () => {
    if (!pendingFile) return;

    const formData = new FormData();
    formData.append('file', pendingFile);
    formData.append('is_private', 0);

    setUploading(true);
    try {
        const res = await axios.post(`/client-profile/${user.id}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFiles([res.data.file, ...files]);
        setPendingFile(null);
        showAlert('Archivo guardado correctamente', false, 'Subida Exitosa');
    } catch (error) {
        showAlert('Error al subir el archivo', true);
    } finally {
        setUploading(false);
    }
  };

  const deleteFile = async (fileId) => {
    confirmAction('¿Eliminar este archivo definitivamente?', async () => {
        try {
            await axios.delete(`/client-profile/file/${fileId}`);
            setFiles(files.filter(f => f.id !== fileId));
        } catch (error) {
            showAlert('Error al eliminar archivo', true);
        }
    }, true, 'Eliminar Archivo');
  };

  const addAttribute = () => {
    setProfileData({
        ...profileData,
        additional_attributes: [...profileData.additional_attributes, { key: '', value: '', type: 'text' }]
    });
  };

  const updateAttribute = (idx, field, val) => {
    const newAttrs = [...profileData.additional_attributes];
    const item = newAttrs[idx];

    if (field === 'type' && item.type !== val) {
        item.value = '';
    }

    if (field === 'value' && item.type === 'number') {
        val = val.replace(/[^0-9.,-]/g, '').replace(',', '.');
    }

    item[field] = val;
    setProfileData({ ...profileData, additional_attributes: newAttrs });
  };

  const removeAttribute = (index) => {
    setProfileData({
        ...profileData,
        additional_attributes: profileData.additional_attributes.filter((_, i) => i !== index)
    });
  };

  const getAttrIcon = (type) => {
    switch(type) {
        case 'number': return 'fa-hashtag';
        case 'date': return 'fa-calendar-day';
        case 'boolean': return 'fa-toggle-on';
        default: return 'fa-font';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      <div className="relative bg-[#FDFDFF] w-full max-w-4xl h-[90vh] rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border border-white/50">
        
        <div className="relative px-10 pt-10 pb-8 flex items-end justify-between overflow-hidden shrink-0">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl"></div>

            <div className="flex items-center gap-8 relative z-10 w-full pr-12">
                <div 
                    className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-teal-200/50 group shrink-0 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #38C1A3, #2D9B82)' }}
                >
                    {user?.foto_de_perfil ? (
                        <img 
                            src={`/storage/${user.foto_de_perfil}`} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span>{user?.name.trim().charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-3 truncate">{user?.name}</h2>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-[#38C1A3] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-teal-100/50">
                            <i className="fa-solid fa-folder-open"></i> FICHA CLÍNICA
                        </span>
                        <span className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">
                            <i className="fa-solid fa-id-card"></i> CLIENTE #{user?.id}
                        </span>
                    </div>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all hover:rotate-90 shadow-sm border border-slate-100 z-50"
            >
                <i className="fa-solid fa-times text-xl"></i>
            </button>
        </div>

        <div className="px-10 flex gap-10 border-b border-slate-100/60 shrink-0 relative">
            {['profile', 'health', 'files', 'subscriptions'].map(tab => {
                const isActive = activeTab === tab;
                return (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-5 font-black text-[11px] uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 group ${isActive ? 'text-[#38C1A3]' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                        <i className={`fa-solid ${tab === 'profile' ? 'fa-user-gear' : tab === 'health' ? 'fa-heart-pulse' : tab === 'files' ? 'fa-file-shield' : 'fa-ticket-alt'} ${isActive ? 'scale-110' : 'opacity-40 group-hover:opacity-100'} transition-all`}></i>
                        {tab === 'profile' ? 'Expediente' : 
                         tab === 'health' ? 'Salud / IMC' :
                         tab === 'files' ? `Documentación (${files.length})` :
                         'Suscripciones'}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#38C1A3] rounded-t-full shadow-[0_0_10px_rgba(56,193,163,0.5)] animate-in slide-in-from-bottom-2 duration-300"></div>
                        )}
                    </button>
                );
            })}
        </div>

        <div className="flex-1 overflow-auto p-10 scrollbar-hide bg-gradient-to-b from-white to-slate-50/30">
            {loading ? (
                <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando información...</p>
                    </div>
                </div>
            ) : activeTab === 'profile' ? (
                <div className="space-y-12 max-w-3xl mx-auto">
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
                        <div className="flex items-center gap-3 mb-8">
                             <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-sm shadow-sm">
                                <i className="fa-solid fa-address-book"></i>
                             </div>
                             <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">DATOS PERSONALES</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                            {[
                                { label: 'DNI / NIE', key: 'dni', icon: 'fa-id-card' },
                                { label: 'Dirección', key: 'direccion', icon: 'fa-map-location-dot' },
                                { label: 'Código Postal', key: 'codigo_postal', icon: 'fa-location-arrow' },
                                { label: 'Ciudad', key: 'ciudad', icon: 'fa-city' }
                            ].map(field => (
                                <div key={field.key} className="space-y-2 group">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-tighter group-focus-within:text-teal-500 transition-colors">{field.label}</label>
                                    <div className="relative">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-11 flex justify-center text-slate-300 group-focus-within:text-teal-400 transition-colors">
                                            <i className={`fa-solid ${field.icon}`}></i>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={profileData[field.key]} 
                                            onChange={(e) => setProfileData({...profileData, [field.key]: e.target.value})}
                                            className="w-full pl-11 pr-5 py-4 bg-white border border-slate-100 rounded-[1.25rem] shadow-sm outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-500/5 text-slate-700 font-bold transition-all"
                                            placeholder={`Introduce ${field.label.toLowerCase()}...`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                        <div className="flex items-center gap-3 mb-8">
                             <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm shadow-sm">
                                <i className="fa-solid fa-bolt"></i>
                             </div>
                             <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">RESUMEN DE CRÉDITOS</h3>
                        </div>
                        <div className="flex flex-wrap gap-5 px-2">
                            {userSubscriptions.length === 0 ? (
                                <div className="bg-white/50 border border-slate-100 border-dashed rounded-3xl p-8 w-full text-center">
                                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Sin planes de entrenamiento actualmente</p>
                                </div>
                            ) : (
                                userSubscriptions.map(su => (
                                    <div key={su.id} className="bg-white px-6 py-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow group/item">
                                        <div 
                                            className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-lg shadow-teal-100/50 transition-all group-hover/item:scale-110"
                                            style={{ background: su.saldo_actual_calculado > 0 ? 'linear-gradient(135deg, #38C1A3, #2D9B82)' : '#e2e8f0' }}
                                        >
                                            <i className="fa-solid fa-ticket-alt text-[10px] opacity-70 mb-0.5"></i>
                                            <span className="text-lg leading-none">{su.saldo_actual_calculado ?? 0}</span>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{su.suscripcion?.periodo}</p>
                                            <p className="text-sm font-black text-slate-700">{su.suscripcion?.nombre || 'Clase'}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm shadow-sm">
                                    <i className="fa-solid fa-list-check"></i>
                                </div>
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">ATRIBUTOS MÉDICOS Y NOTAS</h3>
                            </div>
                            <button 
                                onClick={addAttribute} 
                                className="px-5 py-2.5 bg-white text-[#38C1A3] border border-teal-100 rounded-2xl text-[10px] font-black hover:bg-teal-50 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                            >
                                <i className="fa-solid fa-plus-circle"></i> NUEVO CAMPO
                            </button>
                        </div>
                        
                        <div className="space-y-4 px-2">
                            {profileData.additional_attributes.length === 0 ? (
                                <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-100/60 shadow-inner group">
                                    <i className="fa-solid fa-notes-medical text-3xl text-slate-100 mb-6 group-hover:scale-125 transition-transform group-hover:text-teal-100 duration-500"></i>
                                    <p className="text-slate-300 text-sm font-bold uppercase tracking-widest">Añade información relevante (Alergias, Objetivos, etc.)</p>
                                </div>
                            ) : (
                                profileData.additional_attributes.map((attr, idx) => (
                                    <div key={idx} className="bg-white p-2.5 rounded-[1.75rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow animate-in slide-in-from-right-4 duration-300 flex items-stretch gap-3">
                                        <div className="relative shrink-0 flex items-center pl-4 pr-1 min-w-[110px]">
                                            <i className={`fa-solid ${getAttrIcon(attr.type)} absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 text-xs pointer-events-none`}></i>
                                            <select 
                                                value={attr.type || 'text'} 
                                                onChange={(e) => updateAttribute(idx, 'type', e.target.value)}
                                                className="w-full pl-6 bg-transparent text-[10px] font-black text-slate-500 uppercase tracking-tighter outline-none appearance-none cursor-pointer hover:text-teal-600 transition-colors"
                                            >
                                                <option value="text">Texto</option>
                                                <option value="number">Número</option>
                                                <option value="date">Fecha</option>
                                                <option value="boolean">Check</option>
                                            </select>
                                        </div>

                                        <div className="w-px bg-slate-100 my-2"></div>

                                        <input 
                                            type="text" 
                                            placeholder="Nombre (p.ej: Alergia)" 
                                            value={attr.key} 
                                            onChange={(e) => updateAttribute(idx, 'key', e.target.value)}
                                            className="w-1/3 px-4 py-3 bg-slate-50 border-transparent rounded-[1.1rem] outline-none focus:bg-white focus:border-teal-200 text-xs font-black text-slate-800 transition-all"
                                        />

                                        <div className="flex-1">
                                            {attr.type === 'boolean' ? (
                                                <div className="h-full flex items-center px-4">
                                                    <button 
                                                        onClick={() => updateAttribute(idx, 'value', attr.value === 'true' || attr.value === true ? 'false' : 'true')}
                                                        className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${attr.value === 'true' || attr.value === true ? 'bg-teal-500' : 'bg-slate-200'}`}
                                                    >
                                                        <div className={`absolute top-1 bottom-1 w-5 bg-white rounded-full transition-all shadow-sm ${attr.value === 'true' || attr.value === true ? 'right-1' : 'left-1'}`}></div>
                                                    </button>
                                                    <span className="ml-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{attr.value === 'true' || attr.value === true ? 'SÍ' : 'NO'}</span>
                                                </div>
                                            ) : (
                                                <input 
                                                    key={`attr-val-${idx}-${attr.type}`}
                                                    type={attr.type === 'date' ? 'date' : (attr.type === 'number' ? 'number' : 'text')} 
                                                    inputMode={attr.type === 'number' ? 'decimal' : 'text'}
                                                    placeholder={attr.type === 'date' ? '' : "Valor del campo..."} 
                                                    value={attr.value} 
                                                    onChange={(e) => {
                                                        let v = e.target.value;
                                                        if (attr.type === 'number') {
                                                            v = v.replace(/[^0-9.,-]/g, '');
                                                        }
                                                        updateAttribute(idx, 'value', v);
                                                    }}
                                                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-[1.1rem] outline-none focus:bg-white focus:border-teal-200 text-xs font-bold text-slate-600 transition-all h-full"
                                                />
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => removeAttribute(idx)} 
                                            className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors group/del"
                                        >
                                            <i className="fa-solid fa-times-circle group-hover/del:scale-125 transition-transform"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            ) : activeTab === 'health' ? (
                <div className="space-y-8 max-w-2xl mx-auto pb-10">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl text-teal-900 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                            <i className="fa-solid fa-notes-medical"></i>
                         </div>

                         <div className="flex items-center justify-between mb-8 relative z-10">
                             <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-xl shadow-sm">
                                     <i className="fa-solid fa-plus-circle"></i>
                                 </div>
                                 <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{editingMeasurementId ? 'Corregir Medida' : 'Nueva Entrada de Salud'}</h4>
                             </div>
                             {editingMeasurementId && (
                                 <button onClick={() => {setEditingMeasurementId(null); fetchFicha();}} className="text-[9px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl hover:bg-rose-100 uppercase transition-all shadow-sm">Cancelar</button>
                             )}
                         </div>

                         <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
                             <div className="space-y-2 group/input">
                                 <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest group-focus-within/input:text-[#38C1A3] transition-colors">Peso (kg)</label>
                                 <div className="relative">
                                     <input 
                                         type="number" step="0.1"
                                         value={profileData.peso}
                                         onChange={(e) => setProfileData({...profileData, peso: e.target.value})}
                                         className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-teal-300 focus:ring-4 focus:ring-teal-500/5 text-sm font-black text-slate-700 transition-all placeholder:text-slate-200"
                                         placeholder="75.0"
                                     />
                                     <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-200">KG</span>
                                 </div>
                             </div>
                             <div className="space-y-2 group/input">
                                 <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest group-focus-within/input:text-[#38C1A3] transition-colors">Altura (m)</label>
                                 <div className="relative">
                                     <input 
                                         type="number" step="0.01"
                                         value={profileData.altura}
                                         onChange={(e) => setProfileData({...profileData, altura: e.target.value})}
                                         className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-teal-300 focus:ring-4 focus:ring-teal-500/5 text-sm font-black text-slate-700 transition-all placeholder:text-slate-200"
                                         placeholder="1.80"
                                     />
                                     <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-200">M</span>
                                 </div>
                             </div>
                         </div>

                         <button 
                             onClick={handleSaveHealth}
                             disabled={saving}
                             className="w-full py-5 bg-[#38C1A3] text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#2eaa8f] transition-all shadow-xl shadow-teal-100/50 active:scale-[0.98] disabled:opacity-50"
                         >
                            {saving ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className={`fa-solid ${editingMeasurementId ? 'fa-pen-to-square' : 'fa-check-circle'} mr-2`}></i>}
                            {editingMeasurementId ? 'CONFIRMAR ACTUALIZACIÓN' : 'REGISTRAR MEDIDAS'}
                         </button>
                    </div>

                    {measurements.length > 1 && (
                        <div className="h-32 w-full px-5">
                            <Line 
                                data={{
                                    labels: [...measurements].reverse().map(m => new Date(m.measured_at).toLocaleDateString()),
                                    datasets: [{
                                        label: 'Peso',
                                        data: [...measurements].reverse().map(m => m.peso),
                                        borderColor: '#38C1A3',
                                        backgroundColor: (context) => {
                                            const chart = context.chart;
                                            const {ctx, chartArea} = chart;
                                            if (!chartArea) return null;
                                            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                                            gradient.addColorStop(0, '#38C1A300');
                                            gradient.addColorStop(1, '#38C1A315');
                                            return gradient;
                                        },
                                        fill: true,
                                        tension: 0.5,
                                        pointRadius: 3,
                                        pointBackgroundColor: '#fff',
                                        pointBorderWidth: 2,
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false }, tooltip: { enabled: true } },
                                    scales: { x: { display: false }, y: { display: false } }
                                }}
                            />
                        </div>
                    )}

                    {measurements.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">Historial Físico</h4>
                                <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">{measurements.length} registros</span>
                            </div>
                            <div className="grid gap-4">
                                {measurements.map(m => (
                                    <div key={m.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all duration-500">
                                        <div className="flex items-center gap-6">
                                           <div className="flex flex-col">
                                               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(m.measured_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                               <div className="flex items-baseline gap-4 mt-1">
                                                   <span className="text-xl font-black text-slate-700 tracking-tighter">{m.peso} kg</span>
                                                   <span className="text-[11px] font-bold text-[#38C1A3] bg-teal-50 px-3 py-1 rounded-xl border border-teal-100/50">IMC: {m.imc}</span>
                                               </div>
                                           </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => {
                                                    setEditingMeasurementId(m.id);
                                                    setProfileData({...profileData, peso: m.peso, altura: m.altura, measured_at: m.measured_at});
                                                }}
                                                className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-[#38C1A3] hover:bg-white hover:shadow-md transition-all flex items-center justify-center"
                                            >
                                                <i className="fa-solid fa-edit text-xs"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteMeasurement(m.id)}
                                                className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-white hover:shadow-md transition-all flex items-center justify-center"
                                            >
                                                <i className="fa-solid fa-trash text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : activeTab === 'subscriptions' ? (
                <div className="space-y-12 max-w-3xl mx-auto pb-10">
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                             <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-sm shadow-sm">
                                <i className="fa-solid fa-ticket-alt"></i>
                             </div>
                             <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">HISTORIAL DE SUSCRIPCIONES</h3>
                        </div>
                        <div className="space-y-5 px-2">
                            {userSubscriptions.length === 0 ? (
                                <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-100/50 shadow-inner group">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 text-3xl group-hover:scale-125 transition-all duration-500">
                                        <i className="fa-solid fa-receipt"></i>
                                    </div>
                                    <p className="text-slate-400 font-extrabold italic text-sm tracking-tight text-balance uppercase">Sin suscripciones registradas.</p>
                                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] mt-4">Utiliza el selector inferior para añadir un plan</p>
                                </div>
                            ) : (
                                userSubscriptions.map(sub => (
                                    <div key={sub.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 group hover:shadow-xl transition-all duration-500">
                                        <div className="flex items-center gap-6">
                                            <div 
                                                className="w-16 h-16 rounded-3xl flex flex-col items-center justify-center font-black shadow-lg shadow-teal-100/50 transition-all group-hover:rotate-3 text-white"
                                                style={{ background: sub.saldo_actual_calculado > 0 ? 'linear-gradient(135deg, #38C1A3, #2D9B82)' : '#f1f5f9' }}
                                            >
                                                <i className={`fa-solid fa-ticket-alt ${sub.saldo_actual_calculado > 0 ? 'opacity-70' : 'text-slate-300'} text-xs mb-1`}></i>
                                                <span className={`text-2xl leading-none ${sub.saldo_actual_calculado > 0 ? '' : 'text-slate-300'}`}>{sub.saldo_actual_calculado ?? 0}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 text-xl tracking-tighter leading-none">{sub.suscripcion?.nombre || 'PLAN PERSONAL'}</h4>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border ${sub.suscripcion?.periodo === 'mensual' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-amber-100 bg-amber-50 text-amber-600'}`}>
                                                        {sub.suscripcion?.periodo?.toUpperCase()}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-300 bg-slate-50 px-3 py-1.5 rounded-xl">ID #{sub.id}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            {/* Saldo Magic Adjuster */}
                                            <div className="flex-1 sm:flex-none flex items-center bg-slate-50 rounded-[1.75rem] p-1.5 border border-slate-100">
                                                <button 
                                                    onClick={() => handleUpdateSubscriptionSaldo(sub.id, 'dec')}
                                                    className="w-10 h-10 flex items-center justify-center rounded-[1.1rem] bg-white text-slate-400 hover:text-rose-500 hover:shadow-md transition-all active:scale-95"
                                                >
                                                    <i className="fa-solid fa-minus text-[10px]"></i>
                                                </button>
                                                <div className="px-5 text-center">
                                                    <span className="text-sm font-black text-slate-800 block leading-none">{sub.saldo_actual_calculado ?? 0}</span>
                                                    <span className="text-[8px] font-black text-slate-300 uppercase mt-1 block tracking-tighter">TOTAL</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleUpdateSubscriptionSaldo(sub.id, 'inc')}
                                                    className="w-10 h-10 flex items-center justify-center rounded-[1.1rem] bg-white text-slate-400 hover:text-teal-500 hover:shadow-md transition-all active:scale-95"
                                                >
                                                    <i className="fa-solid fa-plus text-[10px]"></i>
                                                </button>
                                            </div>

                                            <button 
                                                onClick={() => {
                                                    confirmAction('¿Confirmar pago y recargar créditos?', async () => {
                                                        try {
                                                            await axios.post(`/suscripciones-usuarios/${sub.id}/confirmar-pago`);
                                                            fetchFicha();
                                                        } catch (err) {
                                                            showAlert('Error al procesar pago', true);
                                                        }
                                                    });
                                                }}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white transition-all shadow-sm"
                                                title="Recargar Periodo"
                                            >
                                                <i className="fa-solid fa-coins"></i>
                                            </button>

                                            <button 
                                                onClick={() => handleDeleteSubscription(sub.id)}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                title="Remover"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* New Subscription Selector Redesigned */}
                    <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-8xl text-teal-900 pointer-events-none">
                            <i className="fa-solid fa-plus"></i>
                        </div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-3">
                             <div className="w-2 h-6 bg-teal-500 rounded-full"></div> NUEVA ALTA DE PLAN
                        </h3>
                        <div className="flex flex-col md:flex-row gap-5">
                            <div className="flex-1 relative group">
                                <i className="fa-solid fa-tags absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-400 transition-colors"></i>
                                <select 
                                    value={selectedSuscripcionId}
                                    onChange={(e) => setSelectedSuscripcionId(e.target.value)}
                                    className="w-full pl-12 pr-10 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-teal-200 text-xs font-black text-slate-700 appearance-none shadow-inner transition-all hover:bg-slate-100"
                                >
                                    <option value="">Selección de catálogo...</option>
                                    {availableSubscriptions.map(s => (
                                        <option key={s.id} value={s.id}>{s.nombre.toUpperCase()} — {s.creditos_por_periodo} CRÉDITOS ({s.periodo})</option>
                                    ))}
                                </select>
                                <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-[10px]"></i>
                            </div>
                            <button 
                                onClick={handleAssignSubscription}
                                disabled={!selectedSuscripcionId || saving}
                                className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-teal-600 transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale"
                            >
                                {saving ? <i className="fa-solid fa-spinner fa-spin mr-3"></i> : <i className="fa-solid fa-check-circle mr-3"></i>}
                                VALIDAR Y ACTIVAR
                            </button>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="space-y-10 max-w-3xl mx-auto pb-10">
                    <div className="relative group">
                        <input 
                            type="file" 
                            onChange={handleFileSelect} 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        />
                        <div className={`p-16 border-2 border-dashed rounded-[3rem] text-center transition-all duration-500 ${uploading ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 group-hover:border-teal-400 group-hover:bg-teal-50/30'}`}>
                            {uploading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
                                    <span className="font-black text-slate-500 uppercase text-xs tracking-widest">SUBIENDO ARCHIVO...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 rounded-[2rem] bg-teal-50 text-teal-600 flex items-center justify-center text-3xl shadow-lg shadow-teal-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                        <i className="fa-solid fa-file-circle-plus"></i>
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 text-lg tracking-tight">Carga de Documentación</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">PDF, JPG o PNG aceptados (Máximo 10MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {pendingFile && (
                        <div className="bg-white p-6 rounded-[2rem] border border-teal-100 shadow-xl shadow-teal-500/5 flex items-center justify-between animate-in zoom-in-95 duration-300">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center text-xl">
                                    <i className="fa-solid fa-file-circle-check"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{pendingFile.name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Listo para guardar en expediente</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setPendingFile(null)}
                                    className="px-4 py-3 text-slate-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-colors"
                                >
                                    CANCELAR
                                </button>
                                <button 
                                    onClick={handleFileUpload}
                                    disabled={uploading}
                                    className="px-8 py-4 bg-[#38C1A3] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2eaa8f] transition-all shadow-lg shadow-teal-100 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {uploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                                    GUARDAR ARCHIVO
                                </button>
                             </div>
                        </div>
                    )}

                    <div className="space-y-4 px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                            <div className="w-1 h-1 bg-indigo-500 rounded-full"></div> ARCHIVOS DEL EXPEDIENTE
                        </h3>
                        {files.length === 0 ? (
                            <div className="text-center py-20">
                                <i className="fa-solid fa-box-open text-5xl text-slate-100 mb-4"></i>
                                <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">El archivo está vacío</p>
                            </div>
                        ) : (
                            files.map(file => (
                                <div key={file.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-500 animate-in slide-in-from-right-4">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-colors ${file.file_type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                                            <i className={file.file_type === 'pdf' ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image'}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-sm tracking-tight">{file.file_name}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                Cargado por {file.uploader?.name} • {new Date(file.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <a 
                                            href={`/client-file/${file.id}/download`}
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white transition-all shadow-sm active:scale-95"
                                            title="Descargar"
                                        >
                                            <i className="fa-solid fa-download"></i>
                                        </a>
                                        <button 
                                            onClick={() => deleteFile(file.id)}
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                                            title="Eliminar"
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Improved Footer */}
        <div className="bg-white px-10 py-8 border-t border-slate-100/60 flex justify-between items-center shrink-0">
            <div className="hidden sm:block">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Factomove Client Management System v2.0</p>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={onClose} 
                    className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                    SALIR SIN GUARDAR
                </button>
                {activeTab === 'profile' && (
                    <button 
                        onClick={handleSaveProfile} 
                        disabled={saving} 
                        className="px-10 py-4 bg-[#38C1A3] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2D9B82] transition-all shadow-xl shadow-teal-100 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <i className="fa-solid fa-spinner fa-spin mr-3"></i> : <i className="fa-solid fa-save mr-3"></i>}
                        GUARDAR EXPEDIENTE
                    </button>
                )}
            </div>
        </div>
      </div>

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
