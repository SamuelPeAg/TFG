import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';

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
        
        // If there's only one subscription, select it by default
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
            additional_attributes: Array.isArray(data.additional_attributes) ? data.additional_attributes : []
        });
        setFiles(res.data.files || []);
        setUserSubscriptions(res.data.subscriptions || []);
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
        fetchFicha(); // Recargar datos
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
    } catch (error) {
        showAlert('Error al guardar la ficha', true);
    } finally {
        setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_private', 0); // Desactivado por ahora a petición del usuario

    setUploading(true);
    try {
        const res = await axios.post(`/client-profile/${user.id}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFiles([res.data.file, ...files]);
    } catch (error) {
        showAlert('Error al subir el archivo', true);
    } finally {
        setUploading(false);
    }
  };

  const togglePrivacy = async (fileId) => {
    try {
        const res = await axios.post(`/client-profile/file/${fileId}/toggle-privacy`);
        setFiles(files.map(f => f.id === fileId ? { ...f, is_private: res.data.is_private } : f));
    } catch (error) {
        showAlert('Error al cambiar privacidad', true);
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
        additional_attributes: [...profileData.additional_attributes, { key: '', value: '' }]
    });
  };

  const updateAttribute = (index, field, val) => {
    const newAttrs = [...profileData.additional_attributes];
    newAttrs[index][field] = val;
    setProfileData({ ...profileData, additional_attributes: newAttrs });
  };

  const removeAttribute = (index) => {
    setProfileData({
        ...profileData,
        additional_attributes: profileData.additional_attributes.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#F8FAFC] w-full max-w-4xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-white px-10 py-8 flex items-center justify-between border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#38C1A3] to-[#2D9B82] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-teal-200/50">
                    {user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{user?.name}</h2>
                    <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
                        <i className="fa-solid fa-folder-open text-[#38C1A3]"></i> HISTORIA Y FICHA CLÍNICA
                    </p>
                </div>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-600 transition-all hover:rotate-90">
                <i className="fa-solid fa-times text-xl"></i>
            </button>
        </div>

        {/* Tabs */}
        <div className="bg-white px-10 flex gap-8 border-b border-slate-100 shrink-0">
            {['profile', 'files', 'subscriptions'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 font-black text-xs uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-[#38C1A3]' : 'text-slate-300 hover:text-slate-500'}`}
                >
                    {tab === 'profile' ? 'Datos y Atributos' : 
                     tab === 'files' ? `Archivos y Documentos (${files.length})` :
                     'Suscripciones'}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#38C1A3] rounded-t-full animate-in slide-in-from-bottom-1 duration-200"></div>}
                </button>
            ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-10 scrollbar-hide">
            {loading ? (
                <div className="h-full flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#38C1A3]/20 border-t-[#38C1A3] rounded-full animate-spin"></div>
                </div>
            ) : activeTab === 'profile' ? (
                <div className="space-y-12 max-w-3xl mx-auto">
                    {/* Basic Info */}
                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <div className="w-1 h-1 bg-[#38C1A3] rounded-full"></div> DATOS PERSONALES
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'DNI / NIE', key: 'dni', icon: 'fa-id-card' },
                                { label: 'Dirección', key: 'direccion', icon: 'fa-map-location-dot' },
                                { label: 'Código Postal', key: 'codigo_postal', icon: 'fa-location-arrow' },
                                { label: 'Ciudad', key: 'ciudad', icon: 'fa-city' }
                            ].map(field => (
                                <div key={field.key} className="space-y-1.5 focus-within:scale-[1.02] transition-transform duration-200">
                                    <label className="text-xs font-bold text-slate-500 ml-1">{field.label}</label>
                                    <div className="relative">
                                        <i className={`fa-solid ${field.icon} absolute left-4 top-1/2 -translate-y-1/2 text-slate-300`}></i>
                                        <input 
                                            type="text" 
                                            value={profileData[field.key]} 
                                            onChange={(e) => setProfileData({...profileData, [field.key]: e.target.value})}
                                            maxLength={field.key === 'direccion' ? 200 : field.key === 'dni' ? 20 : field.key === 'codigo_postal' ? 10 : 100}
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:border-[#38C1A3] focus:ring-4 focus:ring-[#38C1A3]/5 text-slate-700 font-medium"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
245: 
                    {/* Saldo Summary */}
                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <div className="w-1 h-1 bg-[#38C1A3] rounded-full"></div> SALDO ACTUAL
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {userSubscriptions.length === 0 ? (
                                <p className="text-slate-400 text-xs italic font-medium ml-1">Sin suscripciones activas</p>
                            ) : (
                                userSubscriptions.map(su => {
                                    const isMensual = su.suscripcion?.periodo === 'mensual';
                                    const badgeColor = isMensual ? 'bg-emerald-500 border-emerald-600' : 'bg-amber-500 border-amber-600';
                                    return (
                                        <div key={su.id} className="bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                                            <div className={`${badgeColor} w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md`}>
                                                {su.saldo_actual_calculado ?? 0}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">
                                                    {su.suscripcion?.periodo}
                                                </p>
                                                <p className="text-xs font-bold text-slate-700 capitalize">
                                                    {su.suscripcion?.tipo_credito || 'Clases'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    {/* Additional Attributes */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1 h-1 bg-[#38C1A3] rounded-full"></div> ATRIBUTOS ADICIONALES
                            </h3>
                            <button onClick={addAttribute} className="text-[#38C1A3] text-[10px] font-black hover:scale-110 transition-transform flex items-center gap-1.5">
                                <i className="fa-solid fa-plus-circle"></i> AÑADIR NUEVO
                            </button>
                        </div>
                        <div className="space-y-3">
                            {profileData.additional_attributes.length === 0 ? (
                                <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-slate-100">
                                    <p className="text-slate-300 text-xs italic font-medium">Añade campos personalizados como 'Alergias', 'Objetivos', etc.</p>
                                </div>
                            ) : (
                                profileData.additional_attributes.map((attr, idx) => (
                                    <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                                        <input 
                                            type="text" 
                                            placeholder="Título (p.ej: Alergias)" 
                                            value={attr.key} 
                                            onChange={(e) => updateAttribute(idx, 'key', e.target.value)}
                                            maxLength={50}
                                            className="flex-1 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:border-[#38C1A3] text-sm font-black text-slate-800"
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Valor" 
                                            value={attr.value} 
                                            onChange={(e) => updateAttribute(idx, 'value', e.target.value)}
                                            maxLength={200}
                                            className="flex-[2] px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:border-[#38C1A3] text-sm font-medium text-slate-600"
                                        />
                                        <button onClick={() => removeAttribute(idx)} className="w-12 h-12 bg-rose-50 text-rose-400 rounded-2xl hover:bg-rose-100 hover:text-rose-600 transition-colors">
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            ) : activeTab === 'subscriptions' ? (
                <div className="space-y-12 max-w-3xl mx-auto">
                    {/* Active Subscriptions */}
                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <div className="w-1 h-1 bg-[#38C1A3] rounded-full"></div> SUSCRIPCIONES ACTIVAS
                        </h3>
                        <div className="space-y-4">
                            {userSubscriptions.length === 0 ? (
                                <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-100/50 shadow-inner group">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 text-3xl group-hover:scale-110 transition-transform duration-500">
                                        <i className="fa-solid fa-ticket"></i>
                                    </div>
                                    <p className="text-slate-400 font-extrabold italic text-sm tracking-tight text-balance uppercase">Este cliente no dispone de suscripciones vinculadas en este momento.</p>
                                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] mt-3">Utiliza el panel inferior para asignar un nuevo plan</p>
                                </div>
                            ) : (
                                userSubscriptions.map(sub => (
                                    <div key={sub.id} className="bg-white p-7 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 group hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-700">
                                        <div className="flex items-center gap-6">
                                            <div className="relative group/badge">
                                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black shadow-lg transition-all duration-500 group-hover/badge:rotate-6 group-hover/badge:scale-110 ${su.saldo_actual_calculado > 0 ? 'bg-gradient-to-br from-[#38C1A3] to-[#2D9B82] text-white shadow-teal-100' : 'bg-slate-100 text-slate-400 shadow-slate-100'}`}>
                                                    {su.saldo_actual_calculado ?? 0}
                                                </div>
                                                <div className="absolute -top-2 -right-2 bg-white w-6 h-6 rounded-xl flex items-center justify-center text-[10px] text-slate-300 font-black shadow-sm border border-slate-50">
                                                    #{sub.id}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 text-lg tracking-tighter leading-none">{sub.suscripcion?.nombre || 'PLAN DE ENTRENAMIENTO'}</h4>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border transition-colors ${sub.suscripcion?.periodo === 'mensual' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-amber-100 bg-amber-50 text-amber-600'}`}>
                                                        {sub.suscripcion?.periodo?.toUpperCase() || 'PERSONALIZADO'}
                                                    </span>
                                                    {sub.dia_recarga && (
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1.5 rounded-xl">
                                                            Día Recarga: {sub.dia_recarga}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 w-full sm:w-auto">
                                            {/* Saldo Magic Adjuster */}
                                            <div className="flex-1 sm:flex-none flex items-center bg-slate-50 rounded-[2rem] p-2 border border-slate-100 shadow-inner group-hover:bg-white transition-all duration-700">
                                                <button 
                                                    onClick={() => handleUpdateSubscriptionSaldo(sub.id, 'dec')}
                                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-slate-400 hover:text-rose-500 hover:shadow-lg transition-all active:scale-90 border border-transparent hover:border-rose-100"
                                                    title="Restar Sesión"
                                                >
                                                    <i className="fa-solid fa-minus text-xs"></i>
                                                </button>
                                                <div className="w-16 text-center select-none">
                                                    <span className="text-sm font-black text-slate-800 block leading-none">{sub.saldo_actual_calculado ?? 0}</span>
                                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter mt-1 block">CLASES</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleUpdateSubscriptionSaldo(sub.id, 'inc')}
                                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-slate-400 hover:text-[#38C1A3] hover:shadow-lg transition-all active:scale-90 border border-transparent hover:border-teal-100"
                                                    title="Sumar Sesión"
                                                >
                                                    <i className="fa-solid fa-plus text-xs"></i>
                                                </button>
                                            </div>

                                            <div className="w-[1px] h-10 bg-slate-100 hidden sm:block mx-1"></div>

                                            <button 
                                                onClick={() => {
                                                    confirmAction('¿Confirmar pago y entregar créditos de este periodo?', async () => {
                                                        try {
                                                            await axios.post(`/suscripciones-usuarios/${sub.id}/confirmar-pago`);
                                                            fetchFicha();
                                                        } catch (err) {
                                                            showAlert('Error al confirmar pago', true);
                                                        }
                                                    });
                                                }}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white transition-all shadow-sm active:scale-95"
                                                title="Confirmar Pago / Recargar"
                                            >
                                                <i className="fa-solid fa-check-double"></i>
                                            </button>

                                            <button 
                                                onClick={() => handleDeleteSubscription(sub.id)}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm hover:shadow-rose-100 active:scale-95"
                                                title="Eliminar Suscripción"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Assign New Subscription */}
                    <section className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <div className="w-2 h-2 bg-[#38C1A3] rounded-full"></div> ASIGNAR NUEVA SUSCRIPCIÓN
                        </h3>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <select 
                                    value={selectedSuscripcionId}
                                    onChange={(e) => {
                                        console.log("Selected ID changed to:", e.target.value);
                                        setSelectedSuscripcionId(e.target.value);
                                    }}
                                    className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:border-[#38C1A3] text-sm font-bold text-slate-700 appearance-none"
                                >
                                    <option value="">Selecciona una suscripción...</option>
                                    {availableSubscriptions.map(s => (
                                        <option key={s.id} value={s.id}>{s.nombre} ({s.periodo}) - {s.creditos_por_periodo} créditos</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                onClick={() => {
                                    if (!selectedSuscripcionId) {
                                        showAlert(`Error: No hay suscripción seleccionada. ID actual: "${selectedSuscripcionId}". Disponibles: ${availableSubscriptions.length}`, true);
                                        return;
                                    }
                                    if (!user || !user.id) {
                                        showAlert("Error: El usuario no tiene un ID válido.", true);
                                        return;
                                    }
                                    console.log("Assign button clicked. selectedSuscripcionId:", selectedSuscripcionId, "for user:", user.id);
                                    handleAssignSubscription();
                                }}
                                className={`px-8 py-4 bg-[#38C1A3] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#2D9B82] transition-all shadow-lg shadow-teal-100 ${(!selectedSuscripcionId || saving) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {saving ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : null}
                                ASIGNAR
                            </button>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="space-y-8 max-w-3xl mx-auto">
                    {/* File Upload Zone */}
                    <div className="relative group">
                        <input 
                            type="file" 
                            onChange={handleFileUpload} 
                            disabled={uploading}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        />
                        <div className={`p-10 border-2 border-dashed rounded-[2rem] text-center transition-all ${uploading ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 group-hover:border-[#38C1A3] group-hover:bg-[#38C1A3]/5'}`}>
                            {uploading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <i className="fa-solid fa-circle-notch animate-spin text-3xl text-[#38C1A3]"></i>
                                    <span className="font-black text-slate-600">SUBIENDO ARCHIVO...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-teal-50 text-[#38C1A3] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        <i className="fa-solid fa-cloud-arrow-up"></i>
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-700">Pulsa para subir documentos</p>
                                        <p className="text-xs text-slate-400 font-medium mt-1">PDF, Imágenes o Documentos (Max 10MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* File List */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Archivos Subidos</h3>
                        {files.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem]">
                                <i className="fa-regular fa-file-excel text-4xl text-slate-200 mb-4"></i>
                                <p className="text-slate-400 font-bold italic">No hay archivos registrados para este cliente.</p>
                            </div>
                        ) : (
                            files.map(file => (
                                <div key={file.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl">
                                            <i className={file.file_type === 'pdf' ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-lines'}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-sm line-clamp-1">{file.file_name}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-bold text-slate-400">Por: {file.uploader?.name}</span>
                                                {/* <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${file.is_private ? 'border-rose-100 bg-rose-50 text-rose-500' : 'border-emerald-100 bg-emerald-50 text-emerald-500'}`}>
                                                    {file.is_private ? 'PRIVADO (Staff)' : 'VISIBLE PARA CLIENTE'}
                                                </span> */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* <button 
                                            onClick={() => togglePrivacy(file.id)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${file.is_private ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'} hover:scale-110`}
                                            title="Cambiar Privacidad"
                                        >
                                            <i className={file.is_private ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                                        </button> */}
                                        <a 
                                            href={`/client-file/${file.id}/download`}
                                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-teal-50 text-[#38C1A3] hover:bg-[#38C1A3] hover:text-white transition-all hover:scale-110"
                                            title="Descargar"
                                        >
                                            <i className="fa-solid fa-download"></i>
                                        </a>
                                        <button 
                                            onClick={() => deleteFile(file.id)}
                                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all hover:scale-110"
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

        {/* Footer */}
        <div className="bg-white px-10 py-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
            <Button onClick={onClose} variant="secondary" className="px-8 rounded-2xl font-black tracking-widest text-[11px] h-12">CERRAR</Button>
            {activeTab === 'profile' && (
                <Button 
                    onClick={handleSaveProfile} 
                    disabled={saving} 
                    variant="primary" 
                    className="px-10 rounded-2xl bg-[#38C1A3] text-white hover:bg-[#2D9B82] font-black tracking-widest text-[11px] h-12 shadow-lg shadow-teal-100"
                >
                    {saving ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : null}
                    GUARDAR CAMBIOS
                </Button>
            )}
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
