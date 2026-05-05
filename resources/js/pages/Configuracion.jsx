import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import AlertModal from '../components/AlertModal';
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

export default function Configuracion() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      iban: '',
      dni: '',
      direccion: '',
      ciudad: '',
      codigo_postal: '',
      peso: '',
      altura: '',
      current_password: '',
      password: '',
      password_confirmation: ''
  });
  
  const [measurements, setMeasurements] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', isError: false });
  const showAlert = (message, isError = false, title = isError ? "Error" : "Éxito") => {
      setAlertConfig({ isOpen: true, title, message, isError });
  };
  
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
     fetchUser();
  }, []);

  const fetchUser = async () => {
      try {
          const res = await axios.get('/configuracion', {
              headers: { Accept: 'application/json' }
          });
          const user = res.data.user;
          setFormData({
              name: user.name || '',
              email: user.email || '',
              iban: user.iban || '',
              dni: user.dni || '',
              direccion: user.direccion || '',
              ciudad: user.ciudad || '',
              codigo_postal: user.codigo_postal || '',
              peso: user.peso || '',
              altura: user.altura || '',
              current_password: '',
              password: '',
              password_confirmation: ''
          });
          if (user.foto_de_perfil) {
              setPhotoPreview(`${window.location.origin}/storage/${user.foto_de_perfil}`);
          }

          // Fetch measurements for the chart preview
          const resFicha = await axios.get(`/client-profile/${user.id}`);
          setMeasurements(resFicha.data.measurements || []);

      } catch (error) {
          console.error('Error fetching user config:', error);
      } finally {
          setLoading(false);
      }
  };

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      let newValue = value;

      if (name === 'iban') {
          newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      }

      setFormData(prev => ({ ...prev, [name]: newValue }));
      if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: null }));
      }
  };

  const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setPhotoFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
              setPhotoPreview(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setErrors({});

      const data = new FormData();
      data.append('_method', 'PUT');
      
      data.append('name', formData.name);
      data.append('dni', formData.dni);
      data.append('direccion', formData.direccion);
      data.append('ciudad', formData.ciudad);
      data.append('codigo_postal', formData.codigo_postal);
      data.append('iban', formData.iban);
      
      if (photoFile) {
          data.append('foto_de_perfil', photoFile);
      }

      if (formData.password) {
          if (formData.password !== formData.password_confirmation) {
              setErrors({ password: ['Las contraseñas no coinciden.'] });
              setSubmitting(false); return;
          }
          data.append('current_password', formData.current_password);
          data.append('password', formData.password);
          data.append('password_confirmation', formData.password_confirmation);
      }

      try {
          const res = await axios.post('/configuracion', data, {
              headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' }
          });
          
          // Also update physical progress if changed
          if (formData.peso || formData.altura) {
             await axios.post(`/client-profile/${formData.id}/progress`, {
                 peso: formData.peso,
                 altura: formData.altura
             });
          }

          showAlert(res.data.message || 'Configuración actualizada correctamente.');
          
          if (res.data.user && res.data.user.foto_de_perfil) {
              if (window.AppConfig && window.AppConfig.user) {
                  window.AppConfig.user.photo = `${window.location.origin}/storage/${res.data.user.foto_de_perfil}`;
                  window.dispatchEvent(new CustomEvent('user-updated'));
              }
          }
          
          setFormData(prev => ({ ...prev, current_password: '', password: '', password_confirmation: '' }));
          setPhotoFile(null);

      } catch (error) {
          if (error.response && error.response.status === 422) {
              setErrors(error.response.data.errors || {});
          } else {
              showAlert('Hubo un error al guardar los cambios.', true);
          }
      } finally {
          setSubmitting(false);
      }
  };

  const weightVal = parseFloat(formData.peso);
  const heightVal = parseFloat(formData.altura);
  const currentIMC = (weightVal > 0 && heightVal > 0) ? (weightVal / (heightVal * heightVal)).toFixed(2) : null;

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-slate-800 overflow-x-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

        <main className="flex-1 lg:ml-72 p-6 md:p-12 transition-all">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <button className="lg:hidden p-3 bg-white shadow-sm rounded-2xl text-slate-500 hover:text-[#38C1A3] transition-all" onClick={() => setIsSidebarOpen(true)}>
                            <i className="fa-solid fa-bars-staggered text-xl"></i>
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Ajustes de Perfil</h1>
                            <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-wider">Control total sobre tu identidad y seguridad</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin h-12 w-12 border-4 border-[#38C1A3] border-t-transparent rounded-full"></div>
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Cargando ajustes...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                            
                            {/* LEFT COLUMN: Avatar & Quick Info */}
                            <div className="xl:col-span-4 space-y-10">
                                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-teal-50/50 rounded-bl-[12rem] -mr-12 -mt-12 transition-all group-hover:bg-teal-100/50"></div>
                                    
                                    <div className="relative z-10 space-y-6">
                                        <div className="relative inline-block">
                                            <div className="w-40 h-40 rounded-[3.5rem] bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:rotate-2">
                                                {photoPreview ? (
                                                    <img src={photoPreview} alt="Perfil" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
                                                        <span className="text-6xl font-black text-[#38C1A3]">{formData.name?.charAt(0)}</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                                    <i className="fa-solid fa-camera text-3xl text-white"></i>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 w-14 h-14 bg-[#38C1A3] border-4 border-white rounded-3xl flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform hover:scale-110">
                                                <i className="fa-solid fa-pen-nib text-lg"></i>
                                            </button>
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
                                        
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{formData.name || 'Tu Nombre'}</h2>
                                            <p className="text-sm font-bold text-slate-400 mt-1">{formData.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PRIVACY BOX IMPROVED */}
                                <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                                    <div className="relative z-10 space-y-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-shield-halved"></i></div>
                                            <h4 className="text-lg font-black tracking-tight uppercase tracking-widest">Privacidad Blindada</h4>
                                        </div>
                                        <p className="text-sm font-bold leading-relaxed opacity-90">
                                            Tus datos están protegidos bajo protocolos de cifrado <span className="text-teal-300">AES-256</span>. Solo tú tienes acceso a tu información de facturación y residencia. 
                                            <br/><br/>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full">Sistema Seguro</span>
                                        </p>
                                    </div>
                                </div>

                                {/* IMC CARD (Incorporated as requested) */}
                                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-8xl text-[#38C1A3] pointer-events-none group-hover:scale-110 transition-transform duration-700"><i className="fa-solid fa-heart-pulse"></i></div>
                                    
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-3xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-gauge-high"></i></div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Evolución Física</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control de peso & IMC</p>
                                            </div>
                                        </div>
                                        {currentIMC && (
                                            <div className={`px-5 py-2.5 rounded-[1.2rem] flex flex-col items-center justify-center border-2 ${currentIMC < 18.5 ? 'bg-rose-50 border-rose-100 text-rose-500' : (currentIMC > 25 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-500')}`}>
                                                <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">Tu IMC</span>
                                                <span className="text-base font-black tracking-widest leading-none mt-1">{currentIMC}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2 group">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Peso (kg)</label>
                                                <div className="relative">
                                                    <input type="number" step="0.1" name="peso" value={formData.peso} onChange={handleInputChange} className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="0.0" />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">kg</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Altura (m)</label>
                                                <div className="relative">
                                                    <input type="number" step="0.01" name="altura" value={formData.altura} onChange={handleInputChange} className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="0.00" />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">m</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100">
                                        <div className="h-44 w-full">
                                            {measurements.length > 0 ? (
                                                <Line 
                                                    data={{
                                                        labels: [...measurements].reverse().map(m => new Date(m.measured_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })),
                                                        datasets: [{
                                                            label: 'Peso',
                                                            data: [...measurements].reverse().map(m => m.peso),
                                                            borderColor: '#38C1A3',
                                                            backgroundColor: 'rgba(56, 193, 163, 0.1)',
                                                            fill: true,
                                                            tension: 0.45,
                                                            pointRadius: 4,
                                                            pointBackgroundColor: '#fff',
                                                            pointBorderColor: '#38C1A3',
                                                            pointBorderWidth: 2
                                                        }]
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: { legend: { display: false }, tooltip: { cornerRadius: 10, padding: 12 } },
                                                        scales: { 
                                                            x: { display: false }, 
                                                            y: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 9 }, color: '#94A3B8' } } 
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-200">
                                                    <i className="fa-solid fa-chart-line text-3xl mb-2"></i>
                                                    <p className="text-[8px] font-black uppercase tracking-widest">Sin historial</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Detailed Forms */}
                            <div className="xl:col-span-8 space-y-10">
                                
                                {/* Identity & Contact Card */}
                                <div className="bg-white p-10 md:p-14 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-12">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[2.2rem] bg-slate-50 text-slate-800 flex items-center justify-center text-3xl shadow-inner"><i className="fa-solid fa-address-card"></i></div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Datos Personales y Contacto</h3>
                                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Información legal y fiscal</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3 group">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em] group-focus-within:text-[#38C1A3] transition-colors">Nombre de Usuario</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-black text-slate-800 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="Ej: Juan Pérez" />
                                            {errors.name && <p className="text-[10px] text-rose-500 font-black uppercase ml-6 tracking-widest animate-pulse">{errors.name[0]}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">DNI / NIE</label>
                                            <input type="text" name="dni" value={formData.dni} onChange={handleInputChange} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-black text-slate-800 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner uppercase" placeholder="12345678X" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em] group-focus-within:text-[#38C1A3] transition-colors">IBAN (Cuenta de Facturación)</label>
                                        <div className="relative">
                                            <input type="text" name="iban" value={formData.iban} onChange={handleInputChange} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-black text-slate-800 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="ES00 0000..." />
                                            <i className="fa-solid fa-building-columns absolute right-8 top-1/2 -translate-y-1/2 text-slate-200"></i>
                                        </div>
                                        {errors.iban && <p className="text-[10px] text-rose-500 font-black uppercase ml-6 tracking-widest">{errors.iban[0]}</p>}
                                    </div>

                                    <div className="space-y-3 group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em] group-focus-within:text-[#38C1A3] transition-colors">Dirección de Residencia</label>
                                        <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-black text-slate-800 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="Calle, portal, piso..." />
                                    </div>

                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">Ciudad</label>
                                            <input type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-black text-slate-800 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="Madrid" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">CP</label>
                                            <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleInputChange} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-black text-slate-800 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="28001" />
                                        </div>
                                    </div>
                                </div>

                                {/* Security & Password Card */}
                                <div className="bg-white p-10 md:p-14 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-12 relative overflow-hidden group/sec">
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] text-9xl text-rose-600 pointer-events-none group-hover/sec:scale-125 transition-transform duration-1000"><i className="fa-solid fa-user-shield"></i></div>
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[2.2rem] bg-rose-50 text-rose-500 flex items-center justify-center text-3xl shadow-inner"><i className="fa-solid fa-vault"></i></div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cambio de Seguridad</h3>
                                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Protege tu acceso a la cuenta</p>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">Contraseña Actual (Necesaria para cambios)</label>
                                            <input type="password" name="current_password" value={formData.current_password} onChange={handleInputChange} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-black text-slate-800 focus:bg-white focus:border-rose-400 outline-none transition-all shadow-inner" placeholder="••••••••" />
                                            {errors.current_password && <p className="text-[10px] text-rose-500 font-black uppercase ml-6 tracking-widest">{errors.current_password[0]}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">Nueva Contraseña</label>
                                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-black text-slate-800 focus:bg-white focus:border-rose-400 outline-none transition-all shadow-inner" placeholder="••••••••" />
                                                {errors.password && <p className="text-[10px] text-rose-500 font-black uppercase ml-6 tracking-widest">{errors.password[0]}</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">Repetir Nueva</label>
                                                <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleInputChange} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-black text-slate-800 focus:bg-white focus:border-rose-400 outline-none transition-all shadow-inner" placeholder="••••••••" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ACTION BAR */}
                                <div className="flex flex-col sm:flex-row justify-end items-center gap-8 pt-8">
                                    <button type="button" onClick={() => window.history.back()} className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-500 transition-all">
                                        Descartar Ajustes
                                    </button>
                                    <button type="submit" disabled={submitting} className="w-full sm:w-auto px-16 py-7 bg-[#38C1A3] text-white rounded-[3rem] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-teal-500 shadow-2xl shadow-teal-500/40 active:scale-95 transition-all flex items-center justify-center gap-4 min-w-[280px]">
                                        {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-bolt-lightning text-xl"></i> Guardar Cambios</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </main>

        <AlertModal isOpen={alertConfig.isOpen} onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} title={alertConfig.title} message={alertConfig.message} isError={alertConfig.isError} />
    </div>
  );
}
