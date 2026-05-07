import React, { useState, useEffect, useRef } from 'react';
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
  
  // Inyección de estilos para corregir flechas y spinners
  useEffect(() => {
    if (isOpen) {
        const style = document.createElement('style');
        style.id = 'ficha-modal-styles';
        style.innerHTML = `
            /* ESTILOS PREMIUM PARA SELECT2 */
            .select2-container--default .select2-selection--single {
                background-color: white !important;
                border: 1px solid #f1f5f9 !important;
                border-radius: 1.25rem !important;
                height: 3.5rem !important;
                display: flex !important;
                items-center: center !important;
                padding: 0 1rem !important;
                transition: all 0.3s !important;
                outline: none !important;
            }
            .select2-container--default.select2-container--focus .select2-selection--single {
                border-color: #38C1A3 !important;
                box-shadow: 0 0 0 4px rgba(56, 193, 163, 0.05) !important;
            }
            .select2-container--default .select2-selection--single .select2-selection__rendered {
                color: #334155 !important;
                font-weight: 900 !important;
                font-size: 10px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.1em !important;
                line-height: 3.5rem !important;
                padding-left: 1rem !important;
            }
            .select2-container--default .select2-selection--single .select2-selection__arrow {
                height: 3.5rem !important;
                right: 1rem !important;
            }
            .select2-container--default .select2-selection--single .select2-selection__arrow b {
                border-color: #cbd5e1 transparent transparent transparent !important;
            }
            .select2-dropdown {
                border: 1px solid #f1f5f9 !important;
                border-radius: 1.5rem !important;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
                overflow: hidden !important;
                margin-top: 10px !important;
                padding: 5px !important;
            }
            .select2-search--dropdown {
                padding: 10px !important;
            }
            .select2-search--dropdown .select2-search__field {
                border: 1px solid #f1f5f9 !important;
                border-radius: 0.75rem !important;
                padding: 10px 15px !important;
                outline: none !important;
                background-color: #f8fafc !important;
                font-size: 11px !important;
                font-weight: 700 !important;
            }
            .select2-results__option {
                padding: 12px 15px !important;
                font-size: 10px !important;
                font-weight: 800 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.05em !important;
                border-radius: 0.75rem !important;
                margin: 2px 0 !important;
            }
            .select2-container--default .select2-results__option--highlighted[aria-selected] {
                background-color: #38C1A3 !important;
            }
            .select2-container--default .select2-results__option[aria-selected="true"] {
                background-color: #f1f5f9 !important;
                color: #38C1A3 !important;
            }
            .ficha-modal-select::-ms-expand {
                display: none !important;
            }
            .no-spinner::-webkit-inner-spin-button,
            .no-spinner::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            .no-spinner {
                -moz-appearance: textfield;
            }
        `;
        document.head.appendChild(style);
        return () => {
            const el = document.getElementById('ficha-modal-styles');
            if (el) el.remove();
        };
    }
  }, [isOpen]);

  const [profileData, setProfileData] = useState({
    dni: '',
    iban: '',
    country: 'ES',
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
  const [subscriptionPayments, setSubscriptionPayments] = useState([]);
  const [editingMeasurementId, setEditingMeasurementId] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null); // {id, importe, metodo_pago, fecha_registro}

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
            iban: data.iban || '',
            direccion: data.direccion || '',
            codigo_postal: data.codigo_postal || '',
            ciudad: data.ciudad || '',
            peso: data.peso || '',
            altura: data.altura || '',
            additional_attributes: Array.isArray(data.additional_attributes) ? data.additional_attributes : []
        });
        setFiles(res.data.files || []);
        setUserSubscriptions(res.data.subscriptions || []);
        setSubscriptionPayments(res.data.subscriptionPayments || []);
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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'dni') {
        newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    } else if (name === 'codigo_postal') {
        newValue = value.replace(/[^0-9]/g, '').slice(0, 5);
    } else if (name === 'iban') {
        newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    setProfileData(prev => ({ ...prev, [name]: newValue }));
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
  
  const handleDeletePayment = async (pagoId) => {
    confirmAction('¿Eliminar este registro de contabilidad definitivamente?', async () => {
        try {
            await axios.delete(`/pagos/${pagoId}`);
            fetchFicha();
            showAlert('Registro eliminado', false, 'Completado');
        } catch (error) {
            showAlert('Error al eliminar registro', true);
        }
    }, true, 'Eliminar Recibo');
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;
    setSaving(true);
    try {
        await axios.put(`/pagos/${editingPayment.id}`, {
            importe: editingPayment.importe,
            metodo_pago: editingPayment.metodo_pago,
            fecha_registro: editingPayment.fecha_registro,
            nombre_clase: editingPayment.nombre_clase
        });
        setEditingPayment(null);
        fetchFicha();
        showAlert('Registro actualizado', false, 'Completado');
    } catch (error) {
        showAlert('Error al actualizar registro', true);
    } finally {
        setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    // Validaciones Front
    const dniRegex = /^[0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]$/i;
    const cpRegex = /^[0-9]{5}$/;
    
    if (profileData.dni && !dniRegex.test(profileData.dni)) {
        showAlert('El DNI/NIE no tiene un formato válido.', true, 'Error de Formato');
        return;
    }
    if (profileData.codigo_postal && !cpRegex.test(profileData.codigo_postal)) {
        showAlert('El código postal debe tener 5 números.', true, 'Error de Formato');
        return;
    }

    // Validación IBAN
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{12,30}$/i;
    if (profileData.iban && !ibanRegex.test(profileData.iban)) {
        showAlert('El IBAN introducido no es válido (Debe empezar por el código de país y tener entre 16 y 34 caracteres).', true, 'Error de Formato');
        return;
    }

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
        additional_attributes: [...profileData.additional_attributes, { key: '', value: '', type: 'text', visibility: 'private' }]
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
        case 'note': return 'fa-file-lines';
        case 'image': return 'fa-image';
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

            <div className="flex items-center gap-10 relative z-10 w-full pr-12">
                {(() => {
                    const getImageUrl = (path) => {
                        if (!path) return null;
                        if (path.startsWith('http')) return path;
                        const baseUrl = window.AppConfig?.baseUrl || '/';
                        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
                        if (cleanPath.startsWith('storage/')) return baseUrl + cleanPath;
                        return baseUrl + 'storage/' + cleanPath;
                    };
                    return (
                        <div 
                            className="w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-teal-200/50 group shrink-0 relative overflow-hidden border-4 border-white"
                            style={{ background: 'linear-gradient(135deg, #38C1A3, #2D9B82)' }}
                        >
                            {user?.foto_de_perfil ? (
                                <img 
                                    src={getImageUrl(user.foto_de_perfil)} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `<span>${user.name.trim().charAt(0).toUpperCase()}</span>`;
                                    }}
                                />
                            ) : (
                                <span>{user?.name.trim().charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                    );
                })()}
                <div className="flex-1 min-w-0">
                    <h2 className="text-5xl font-black text-slate-800 tracking-tighter leading-none mb-4 truncate">{user?.name}</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-2.5 px-5 py-2.5 bg-teal-50 text-[#38C1A3] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-teal-100/50 shadow-sm">
                            <i className="fa-solid fa-heart-pulse"></i> FICHA CLÍNICA
                        </span>
                        <span className="flex items-center gap-2.5 px-5 py-2.5 bg-indigo-50 text-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100/50 shadow-sm">
                            <i className="fa-solid fa-fingerprint"></i> ID: {user?.id}
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
                        className={`py-6 font-black text-[11px] uppercase tracking-[0.25em] transition-all relative flex items-center gap-3 group ${isActive ? 'text-[#38C1A3]' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                        <i className={`fa-solid ${tab === 'profile' ? 'fa-user-gear' : tab === 'health' ? 'fa-heart-pulse' : tab === 'files' ? 'fa-file-shield' : 'fa-credit-card'} ${isActive ? 'scale-110' : 'opacity-30 group-hover:opacity-100'} transition-all text-sm`}></i>
                        <span>
                            {tab === 'profile' ? 'Expediente' : 
                             tab === 'health' ? 'Salud / IMC' :
                             tab === 'files' ? `Documentación (${files.length})` :
                             'Suscripciones'}
                        </span>
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#38C1A3] rounded-t-full shadow-[0_0_15px_rgba(56,193,163,0.4)] animate-in slide-in-from-bottom-2 duration-500"></div>
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
                                            name={field.key}
                                            value={profileData[field.key]} 
                                            onChange={handleProfileChange}
                                            className="w-full pl-11 pr-5 py-4 bg-white border border-slate-100 rounded-[1.25rem] shadow-sm outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-500/5 text-slate-700 font-bold transition-all"
                                            placeholder={`Introduce ${field.label.toLowerCase()}...`}
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Campo IBAN único */}
                            <div className="md:col-span-2 space-y-2 group">
                                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-tighter group-focus-within:text-teal-500 transition-colors">IBAN (Cuenta Bancaria)</label>
                                <div className="relative">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-11 flex justify-center text-slate-300 group-focus-within:text-teal-400 transition-colors">
                                        <i className="fa-solid fa-building-columns"></i>
                                    </div>
                                    <input 
                                        type="text" 
                                        name="iban"
                                        value={profileData.iban} 
                                        onChange={handleProfileChange}
                                        className="w-full pl-11 pr-5 py-4 bg-white border border-slate-100 rounded-[1.25rem] shadow-sm outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-500/5 text-slate-700 font-bold transition-all"
                                        placeholder="Introduce IBAN..."
                                    />
                                </div>
                            </div>
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
                                userSubscriptions.map(su => {
                                    const saldos = su.saldos_por_tipo ? Object.values(su.saldos_por_tipo) : [];
                                    if (saldos.length === 0) {
                                        return (
                                            <div key={su.id} className="bg-white px-6 py-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow group/item">
                                                <div 
                                                    className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-lg shadow-teal-100/50 transition-all group-hover/item:scale-110"
                                                    style={{ background: '#e2e8f0' }}
                                                >
                                                    <i className="fa-solid fa-ticket-alt text-[10px] opacity-70 mb-0.5"></i>
                                                    <span className="text-lg leading-none">0</span>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{su.suscripcion?.periodo}</p>
                                                    <p className="text-sm font-black text-slate-700">{su.suscripcion?.nombre || 'Clase'}</p>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return saldos.map((s, idx) => (
                                        <div key={`${su.id}-${idx}`} className="bg-white px-6 py-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow group/item">
                                            <div 
                                                className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-lg shadow-teal-100/50 transition-all group-hover/item:scale-110"
                                                style={{ background: s.saldo > 0 ? 'linear-gradient(135deg, #38C1A3, #2D9B82)' : '#e2e8f0' }}
                                            >
                                                <i className="fa-solid fa-ticket-alt text-[10px] opacity-70 mb-0.5"></i>
                                                <span className="text-lg leading-none">{s.saldo}</span>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{su.suscripcion?.nombre || 'PACK'}</p>
                                                <p className="text-sm font-black text-slate-700">{s.nombre || 'Clase'}</p>
                                            </div>
                                        </div>
                                    ));
                                })
                            )}
                        </div>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                        <div className="flex items-center justify-between px-2 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#38C1A3] border border-teal-100/50 shadow-inner">
                                    <i className="fa-solid fa-notes-medical"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">EXPEDIENTE INTERNO</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Notas, observaciones y registros privados</p>
                                </div>
                            </div>
                            <button 
                                onClick={addAttribute} 
                                className="px-6 py-3 bg-[#38C1A3] text-white rounded-[1.25rem] text-[10px] font-black hover:bg-teal-500 transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-teal-500/20"
                            >
                                <i className="fa-solid fa-plus-circle"></i> NUEVO REGISTRO
                            </button>
                        </div>
                        
                        <div className="space-y-6 px-2">
                            {profileData.additional_attributes.length === 0 ? (
                                <div className="bg-slate-50/50 rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200/60 group">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                        <i className="fa-solid fa-clipboard-list text-3xl text-slate-200 group-hover:text-teal-400 transition-colors"></i>
                                    </div>
                                    <p className="text-slate-400 text-sm font-black uppercase tracking-widest">El expediente interno está vacío</p>
                                    <p className="text-xs text-slate-300 mt-2 font-bold italic">Añade observaciones sobre lesiones, objetivos o nutrición.</p>
                                </div>
                            ) : (
                                profileData.additional_attributes.map((attr, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 group relative">
                                        <div className="flex flex-col gap-5">
                                            {/* Cabeza de la Tarjeta: Tipo y Visibilidad */}
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative group/sel flex-1">
                                                        <select 
                                                            value={attr.type || 'text'} 
                                                            onChange={(e) => updateAttribute(idx, 'type', e.target.value)}
                                                            className="ficha-modal-select w-full pl-10 pr-10 py-3.5 bg-slate-50 hover:bg-slate-100 rounded-[1.25rem] text-[10px] font-black text-slate-500 uppercase tracking-widest outline-none cursor-pointer transition-all border border-slate-100 focus:border-teal-300 focus:ring-4 focus:ring-teal-500/5 appearance-none"
                                                        >
                                                            <option value="text">Dato Corto</option>
                                                            <option value="note">Nota / Observación</option>
                                                            <option value="image">Imagen / Foto</option>
                                                            <option value="number">Cifra / Valor</option>
                                                            <option value="date">Fecha</option>
                                                            <option value="boolean">Interruptor (SÍ/NO)</option>
                                                        </select>
                                                        <i className={`fa-solid ${getAttrIcon(attr.type)} absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 text-xs pointer-events-none group-hover/sel:scale-110 transition-transform`}></i>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-transform group-hover/sel:translate-y-[-40%]">
                                                            <i className="fa-solid fa-chevron-down text-[8px]"></i>
                                                        </div>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => updateAttribute(idx, 'visibility', (attr.visibility || 'private') === 'private' ? 'public' : 'private')}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                                            (attr.visibility || 'private') === 'private' 
                                                            ? 'bg-rose-50 text-rose-500 border-rose-100/50' 
                                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                                                        }`}
                                                        title={(attr.visibility || 'private') === 'private' ? "Solo visible para staff" : "Visible para el cliente"}
                                                    >
                                                        <i className={`fa-solid ${(attr.visibility || 'private') === 'private' ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                        <span>{(attr.visibility || 'private') === 'private' ? 'Privado' : 'Público'}</span>
                                                    </button>
                                                </div>

                                                <button 
                                                    onClick={() => removeAttribute(idx)} 
                                                    className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-rose-500 transition-all hover:bg-rose-50 rounded-xl active:scale-90"
                                                >
                                                    <i className="fa-solid fa-trash-can text-sm"></i>
                                                </button>
                                            </div>

                                            {/* Cuerpo: Título y Contenido */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                <div className="md:col-span-4">
                                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1 mb-1.5 block">Título del Registro</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ej: Lesión de Hombro..." 
                                                        value={attr.key} 
                                                        onChange={(e) => updateAttribute(idx, 'key', e.target.value)}
                                                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl outline-none focus:bg-white focus:border-teal-200 text-xs font-black text-slate-800 transition-all border"
                                                    />
                                                </div>

                                                <div className="md:col-span-8">
                                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1 mb-1.5 block">Contenido / Valor</label>
                                                    {attr.type === 'boolean' ? (
                                                        <div className="h-[46px] flex items-center px-4 bg-slate-50 rounded-2xl border border-transparent">
                                                            <button 
                                                                onClick={() => updateAttribute(idx, 'value', attr.value === 'true' || attr.value === true ? 'false' : 'true')}
                                                                className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${attr.value === 'true' || attr.value === true ? 'bg-teal-500' : 'bg-slate-200'}`}
                                                            >
                                                                <div className={`absolute top-1 bottom-1 w-5 bg-white rounded-full transition-all shadow-sm ${attr.value === 'true' || attr.value === true ? 'right-1' : 'left-1'}`}></div>
                                                            </button>
                                                            <span className="ml-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{attr.value === 'true' || attr.value === true ? 'SÍ' : 'NO'}</span>
                                                        </div>
                                                    ) : attr.type === 'note' ? (
                                                        <textarea 
                                                            placeholder="Escribe aquí las observaciones detalladas..." 
                                                            value={attr.value} 
                                                            onChange={(e) => updateAttribute(idx, 'value', e.target.value)}
                                                            rows={3}
                                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-teal-200 text-xs font-bold text-slate-600 transition-all border leading-relaxed resize-none"
                                                        ></textarea>
                                                    ) : attr.type === 'image' ? (
                                                        <div className="space-y-3">
                                                            {attr.value ? (
                                                                <div className="relative group/img overflow-hidden rounded-2xl border border-slate-100 aspect-video bg-slate-50 flex items-center justify-center">
                                                                    {(() => {
                                                                        const selectedFile = files.find(f => f.id.toString() === attr.value.toString());
                                                                        return selectedFile ? (
                                                                            <img 
                                                                                src={`/storage/${selectedFile.file_path}`} 
                                                                                alt="Preview" 
                                                                                className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                                                                            />
                                                                        ) : (
                                                                            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Archivo no encontrado</div>
                                                                        );
                                                                    })()}
                                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                                        <button 
                                                                            onClick={() => updateAttribute(idx, 'value', '')}
                                                                            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-rose-500 transition-all flex items-center justify-center shadow-lg"
                                                                            title="Quitar imagen"
                                                                        >
                                                                            <i className="fa-solid fa-unlink text-xs"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide py-1">
                                                                    {files.filter(f => f.file_type !== 'pdf').map(f => (
                                                                        <button 
                                                                            key={f.id}
                                                                            onClick={() => updateAttribute(idx, 'value', f.id.toString())}
                                                                            className="aspect-square rounded-xl border-2 border-slate-50 overflow-hidden hover:border-teal-400 hover:scale-95 transition-all shadow-sm group/thumb relative"
                                                                            title={f.file_name}
                                                                        >
                                                                            <img src={`/storage/${f.file_path}`} className="w-full h-full object-cover" />
                                                                            <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover/thumb:opacity-100 transition-opacity"></div>
                                                                        </button>
                                                                    ))}
                                                                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2 text-slate-300 hover:bg-slate-50 hover:text-teal-400 transition-all cursor-pointer">
                                                                        <i className="fa-solid fa-plus-circle text-lg"></i>
                                                                        <span className="text-[8px] font-black uppercase tracking-tighter">SUBIR</span>
                                                                        <input type="file" className="hidden" onChange={async (e) => {
                                                                            const file = e.target.files[0];
                                                                            if (file) {
                                                                                const formData = new FormData();
                                                                                formData.append('file', file);
                                                                                setUploading(true);
                                                                                try {
                                                                                    const res = await axios.post(`/client-profile/${user.id}/upload`, formData);
                                                                                    const newFile = res.data.file;
                                                                                    setFiles([newFile, ...files]);
                                                                                    updateAttribute(idx, 'value', newFile.id.toString());
                                                                                    showAlert('Imagen vinculada', false, 'Éxito');
                                                                                } catch (err) {
                                                                                    showAlert('Error al subir', true);
                                                                                } finally {
                                                                                    setUploading(false);
                                                                                }
                                                                            }
                                                                        }} />
                                                                    </label>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-between px-1">
                                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{attr.value ? 'Imagen Vinculada' : 'Selecciona una imagen o sube una nueva'}</p>
                                                                {attr.value && (
                                                                     <span className="text-[8px] font-bold text-slate-400 italic">#{attr.value}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <input 
                                                            type={attr.type === 'date' ? 'date' : (attr.type === 'number' ? 'number' : 'text')} 
                                                            inputMode={attr.type === 'number' ? 'decimal' : 'text'}
                                                            placeholder={attr.type === 'date' ? '' : "Valor del registro..."} 
                                                            value={attr.value} 
                                                            onChange={(e) => {
                                                                let v = e.target.value;
                                                                if (attr.type === 'number') {
                                                                    v = v.replace(/[^0-9.,-]/g, '');
                                                                }
                                                                updateAttribute(idx, 'value', v);
                                                            }}
                                                            className={`w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-[1.25rem] outline-none focus:bg-white focus:border-teal-200 text-xs font-bold text-slate-600 transition-all border h-[52px] ${attr.type === 'number' ? 'no-spinner' : ''}`}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
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
                                         className="no-spinner w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-teal-300 focus:ring-4 focus:ring-teal-500/5 text-sm font-black text-slate-700 transition-all placeholder:text-slate-200"
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
                                         className="no-spinner w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-teal-300 focus:ring-4 focus:ring-teal-500/5 text-sm font-black text-slate-700 transition-all placeholder:text-slate-200"
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
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-lg shadow-sm border border-teal-100/50">
                                    <i className="fa-solid fa-ticket-alt"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">Planes Activos</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Gestión de créditos y bonos</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-4 py-2 rounded-2xl uppercase border border-slate-200/50">
                                {userSubscriptions.length} Suscripciones
                            </span>
                        </div>

                        <div className="grid gap-6 px-2">
                            {userSubscriptions.length === 0 ? (
                                <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-100/50 shadow-inner group transition-all hover:bg-slate-50/50">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-100 text-3xl group-hover:scale-125 transition-all duration-500">
                                        <i className="fa-solid fa-receipt"></i>
                                    </div>
                                    <p className="text-slate-400 font-extrabold italic text-sm tracking-tight text-balance uppercase">Sin suscripciones registradas.</p>
                                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] mt-4">Utiliza el selector inferior para añadir un plan</p>
                                </div>
                            ) : (
                                userSubscriptions.map(sub => (
                                    <div key={sub.id} className="relative group/card animate-in fade-in slide-in-from-right-4 duration-500">
                                        {/* Premium Ticket Card */}
                                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-500 group-hover/card:-translate-y-1">
                                            {/* Left Section: Credits Badge */}
                                            <div 
                                                className="w-full md:w-36 flex flex-col items-center justify-center p-8 shrink-0 relative overflow-hidden transition-colors"
                                                style={{ background: sub.saldo_actual_calculado > 0 ? 'linear-gradient(135deg, #38C1A3, #2D9B82)' : 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}
                                            >
                                                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                                    <div className="absolute top-0 left-0 w-12 h-12 bg-white rounded-full blur-xl -translate-x-1/2 -translate-y-1/2"></div>
                                                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-white rounded-full blur-2xl translate-x-1/3 translate-y-1/3"></div>
                                                </div>
                                                <i className={`fa-solid fa-ticket-alt ${sub.saldo_actual_calculado > 0 ? 'text-white/40' : 'text-slate-300'} text-xs mb-2 transition-transform group-hover/card:scale-125`}></i>
                                                <span className={`text-4xl font-black leading-none tracking-tighter ${sub.saldo_actual_calculado > 0 ? 'text-white' : 'text-slate-400'}`}>
                                                    {sub.saldo_actual_calculado ?? 0}
                                                </span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${sub.saldo_actual_calculado > 0 ? 'text-white/70' : 'text-slate-300'}`}>
                                                    Créditos
                                                </span>
                                            </div>

                                            {/* Center Section: Info */}
                                            <div className="flex-1 p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[10px] font-black text-[#38C1A3] bg-teal-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-teal-100/50">
                                                        {sub.suscripcion?.periodo?.toUpperCase() || 'PACK'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-3 py-1 rounded-lg">#ID-{sub.id}</span>
                                                </div>
                                                <h4 className="font-black text-slate-800 text-2xl tracking-tight leading-tight">{sub.suscripcion?.nombre || 'Suscripción'}</h4>
                                                <p className="text-[11px] text-slate-400 font-bold mt-2 flex items-center gap-2">
                                                    <i className="fa-solid fa-calendar-check text-teal-400/60"></i>
                                                    ACTIVA DESDE EL {sub.created_at ? new Date(sub.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase() : 'N/A'}
                                                </p>

                                                {/* Breakdown of credits by type */}
                                                {sub.saldos_por_tipo && sub.saldos_por_tipo.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                                        {sub.saldos_por_tipo.map((saldo, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 bg-slate-50/50 px-2.5 py-1.5 rounded-xl border border-slate-100 group/item hover:border-teal-100 hover:bg-white transition-all">
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter group-hover/item:text-slate-500">{saldo.tipo_credito?.nombre || 'Créditos'}:</span>
                                                                <span className="text-[10px] font-black text-slate-700 group-hover/item:text-[#38C1A3]">{saldo.total}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Section: Actions */}
                                            <div className="p-8 bg-slate-50/50 flex flex-row md:flex-col items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 shrink-0">
                                                {/* Adjusted Controls */}
                                                <div className="flex items-center bg-white shadow-sm border border-slate-100 rounded-2xl p-1 mb-2">
                                                    <button 
                                                        onClick={() => handleUpdateSubscriptionSaldo(sub.id, 'dec')}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-rose-50 hover:text-rose-500 text-slate-300 transition-all active:scale-90"
                                                    >
                                                        <i className="fa-solid fa-minus text-[10px]"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateSubscriptionSaldo(sub.id, 'inc')}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-teal-50 hover:text-teal-500 text-slate-300 transition-all active:scale-90"
                                                    >
                                                        <i className="fa-solid fa-plus text-[10px]"></i>
                                                    </button>
                                                </div>

                                                <div className="flex gap-3">
                                                    <button 
                                                        onClick={() => {
                                                            confirmAction('¿Confirmar el cobro y renovar el ciclo de créditos?', async () => {
                                                                try {
                                                                    await axios.post(`/suscripciones-usuarios/${sub.id}/confirmar-pago`);
                                                                    fetchFicha();
                                                                    showAlert('Pago registrado y créditos añadidos', false, 'Éxito');
                                                                } catch (err) {
                                                                    showAlert('No se pudo procesar el pago', true);
                                                                }
                                                            }, false, 'Registrar Cobro');
                                                        }}
                                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#38C1A3] text-white hover:bg-[#2eaa8f] hover:shadow-lg hover:shadow-teal-500/20 active:scale-90 transition-all"
                                                        title="Cobrar y Renovar"
                                                    >
                                                        <i className="fa-solid fa-hand-holding-dollar"></i>
                                                    </button>

                                                    <button 
                                                        onClick={() => handleDeleteSubscription(sub.id)}
                                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-slate-300 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 transition-all shadow-sm active:scale-90"
                                                        title="Deshabilitar"
                                                    >
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Accounting History Section */}
                    <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-sm border border-indigo-100/50">
                                    <i className="fa-solid fa-file-invoice-dollar"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">Contabilidad de Cobros</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Historial de pagos confirmados</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-indigo-400 bg-indigo-50 px-4 py-2 rounded-2xl uppercase border border-indigo-200/50">
                                {subscriptionPayments.length} Recibos
                            </span>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            {subscriptionPayments.length === 0 ? (
                                <div className="p-12 text-center opacity-40">
                                    <i className="fa-solid fa-magnifying-glass-dollar text-3xl mb-4 text-slate-200"></i>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sin pagos registrados todavía</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                                                <th className="px-8 py-5">Fecha de Cobro</th>
                                                <th className="px-8 py-5">Concepto / Plan</th>
                                                <th className="px-8 py-5">Método</th>
                                                <th className="px-8 py-5 text-right">Importe</th>
                                                <th className="px-8 py-5 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {subscriptionPayments.map(pogo => (
                                                <tr key={pogo.id} className="group hover:bg-slate-50/30 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-slate-700">{pogo.fecha_registro ? new Date(pogo.fecha_registro).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</span>
                                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mt-0.5">{pogo.fecha_registro ? new Date(pogo.fecha_registro).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs font-black text-slate-600 truncate max-w-[180px] block">{pogo.nombre_clase || 'ABONO'}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-tighter border border-indigo-100/50">
                                                            {pogo.metodo_pago || 'EFECTIVO'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                         {editingPayment?.id === pogo.id ? (
                                                             <input 
                                                                 type="number" 
                                                                 value={editingPayment.importe}
                                                                 onChange={(e) => setEditingPayment({...editingPayment, importe: e.target.value})}
                                                                 className="w-20 px-2 py-1 bg-white border border-teal-200 rounded text-right text-xs font-black outline-none"
                                                             />
                                                         ) : (
                                                             <span className="text-sm font-black text-emerald-600 tracking-tight">+{parseFloat(pogo.importe).toFixed(2)}€</span>
                                                         )}
                                                     </td>
                                                     <td className="px-8 py-5 text-right">
                                                         <div className="flex justify-end gap-2">
                                                             {editingPayment?.id === pogo.id ? (
                                                                 <>
                                                                     <button 
                                                                         onClick={handleUpdatePayment}
                                                                         className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center"
                                                                     >
                                                                         <i className="fa-solid fa-check"></i>
                                                                     </button>
                                                                     <button 
                                                                         onClick={() => setEditingPayment(null)}
                                                                         className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-200 transition-all flex items-center justify-center"
                                                                     >
                                                                         <i className="fa-solid fa-times"></i>
                                                                     </button>
                                                                 </>
                                                             ) : (
                                                                 <>
                                                                     <button 
                                                                         onClick={() => setEditingPayment({...pogo})}
                                                                         className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                                     >
                                                                         <i className="fa-solid fa-pen text-[10px]"></i>
                                                                     </button>
                                                                     <button 
                                                                         onClick={() => handleDeletePayment(pogo.id)}
                                                                         className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                                     >
                                                                         <i className="fa-solid fa-trash-can text-[10px]"></i>
                                                                     </button>
                                                                 </>
                                                             )}
                                                         </div>
                                                     </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Simplified Subscription Selector */}
                    <section className="mt-12 pt-10 border-t border-slate-100/60">
                        <div className="flex items-center gap-3 mb-6 px-2">
                             <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                <i className="fa-solid fa-plus text-[10px]"></i>
                             </div>
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vincular Nueva Suscripción</h4>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <select 
                                value={selectedSuscripcionId}
                                onChange={(e) => setSelectedSuscripcionId(e.target.value)}
                                className="ficha-modal-select flex-1 w-full"
                            >
                                <option value="">SELECCIONA UN CATÁLOGO DE PLANES...</option>
                                {availableSubscriptions.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {(s.nombre || 'PLAN').toUpperCase()} — {s.creditos_por_periodo} CRÉDITOS ({s.periodo || 'PACK'})
                                    </option>
                                ))}
                            </select>

                            <button 
                                onClick={handleAssignSubscription}
                                disabled={!selectedSuscripcionId || saving}
                                className="h-14 px-10 bg-[#38C1A3] text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#2eaa8f] transition-all active:scale-[0.98] shadow-xl shadow-teal-500/10 disabled:opacity-20 flex items-center justify-center gap-3 shrink-0"
                            >
                                {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                                ACTIVAR PLAN
                            </button>
                        </div>
                    </section>
                </div>
            ) : activeTab === 'files' ? (
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
            ) : null}
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
