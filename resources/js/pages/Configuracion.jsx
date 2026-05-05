import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import AlertModal from '../components/AlertModal';

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
      current_password: '',
      password: '',
      password_confirmation: ''
  });
  
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
              current_password: '',
              password: '',
              password_confirmation: ''
          });
          if (user.foto_de_perfil) {
              setPhotoPreview(`${window.location.origin}/storage/${user.foto_de_perfil}`);
          }
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

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-slate-800">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

        <main className="flex-1 lg:ml-72 p-6 md:p-12 transition-all">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <button className="lg:hidden p-3 bg-white shadow-sm rounded-2xl text-slate-500 hover:text-[#38C1A3] transition-all" onClick={() => setIsSidebarOpen(true)}>
                            <i className="fa-solid fa-bars-staggered text-xl"></i>
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Configuración</h1>
                            <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-wider">Gestiona tu identidad y seguridad de acceso</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
                            <i className="fa-solid fa-user-lock"></i>
                        </div>
                        <span className="pr-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajustes de Cuenta</span>
                    </div>
                </div>

                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin h-12 w-12 border-4 border-[#38C1A3] border-t-transparent rounded-full"></div>
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Cargando ajustes...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                            {/* Left Col: Avatar & Status */}
                            <div className="xl:col-span-1 space-y-8">
                                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-bl-[10rem] -mr-10 -mt-10 transition-all group-hover:bg-teal-100/50"></div>
                                    
                                    <div className="relative z-10 space-y-6">
                                        <div className="relative inline-block">
                                            <div className="w-36 h-36 rounded-[3rem] bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                                {photoPreview ? (
                                                    <img src={photoPreview} alt="Perfil" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-6xl font-black text-[#38C1A3]">{formData.name?.charAt(0)}</span>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                                    <i className="fa-solid fa-camera text-2xl text-white"></i>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#38C1A3] border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform">
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
                                        
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{formData.name || 'Tu Nombre'}</h2>
                                            <p className="text-sm font-bold text-slate-400 mt-1">{formData.email}</p>
                                        </div>

                                        <div className="pt-6 border-t border-slate-50 flex flex-col gap-3">
                                            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</span>
                                                <span className="text-[10px] font-black text-[#38C1A3] uppercase tracking-widest bg-[#38C1A3]/10 px-3 py-1 rounded-full">Cliente</span>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Activo</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-200">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl"><i className="fa-solid fa-circle-info"></i></div>
                                        <h4 className="text-lg font-black tracking-tight">Privacidad</h4>
                                    </div>
                                    <p className="text-sm font-bold opacity-80 leading-relaxed">Tus datos están protegidos bajo cifrado de extremo a extremo. Solo tú y los administradores autorizados pueden ver tu información de facturación.</p>
                                </div>
                            </div>

                            {/* Right Col: Forms */}
                            <div className="xl:col-span-2 space-y-10">
                                
                                {/* Personal & Billing Card */}
                                <div className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-[2rem] bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-id-card"></i></div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Datos de Facturación & Contacto</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Información legal y residencia</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Nombre Completo</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`w-full px-7 py-5 bg-slate-50 border ${errors.name ? 'border-rose-300' : 'border-slate-100'} rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner`} placeholder="Nombre y apellidos" />
                                            {errors.name && <p className="text-[10px] text-rose-500 font-black uppercase ml-4 tracking-tighter">{errors.name[0]}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">DNI / NIE</label>
                                            <input type="text" name="dni" value={formData.dni} onChange={handleInputChange} className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner uppercase" placeholder="12345678X" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">IBAN (Cuenta Bancaria)</label>
                                        <input type="text" name="iban" value={formData.iban} onChange={handleInputChange} className={`w-full px-7 py-5 bg-slate-50 border ${errors.iban ? 'border-rose-300' : 'border-slate-100'} rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner`} placeholder="ES00 0000..." />
                                        {errors.iban && <p className="text-[10px] text-rose-500 font-black uppercase ml-4 tracking-tighter">{errors.iban[0]}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Dirección de Envío / Residencia</label>
                                        <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="Calle, número, piso..." />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Ciudad</label>
                                            <input type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="Madrid" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Código Postal</label>
                                            <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleInputChange} className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="28001" />
                                        </div>
                                    </div>
                                </div>

                                {/* Security Card */}
                                <div className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-10 relative overflow-hidden group">
                                    <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] text-8xl text-rose-500 pointer-events-none group-hover:scale-110 transition-transform duration-700"><i className="fa-solid fa-shield-virus"></i></div>
                                    
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-[2rem] bg-rose-50 text-rose-500 flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-lock-open"></i></div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Cambiar Contraseña</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Protege tu acceso a la plataforma</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Contraseña Actual</label>
                                            <input type="password" name="current_password" value={formData.current_password} onChange={handleInputChange} className={`w-full px-7 py-5 bg-slate-50 border ${errors.current_password ? 'border-rose-300' : 'border-slate-100'} rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-rose-400 outline-none transition-all shadow-inner`} placeholder="••••••••" />
                                            {errors.current_password && <p className="text-[10px] text-rose-500 font-black uppercase ml-4 tracking-tighter">{errors.current_password[0]}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Nueva Contraseña</label>
                                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className={`w-full px-7 py-5 bg-slate-50 border ${errors.password ? 'border-rose-300' : 'border-slate-100'} rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-rose-400 outline-none transition-all shadow-inner`} placeholder="••••••••" />
                                                {errors.password && <p className="text-[10px] text-rose-500 font-black uppercase ml-4 tracking-tighter">{errors.password[0]}</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Confirmar Contraseña</label>
                                                <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleInputChange} className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-rose-400 outline-none transition-all shadow-inner" placeholder="••••••••" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="flex flex-col sm:flex-row justify-end items-center gap-6 pt-6">
                                    <button type="button" onClick={() => window.history.back()} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors">
                                        Descartar cambios
                                    </button>
                                    <button type="submit" disabled={submitting} className="w-full sm:w-auto px-12 py-5 bg-[#38C1A3] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] hover:bg-teal-500 shadow-xl shadow-teal-500/30 active:scale-95 transition-all flex items-center justify-center gap-4 min-w-[240px]">
                                        {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-rocket text-lg"></i> Actualizar Perfil</>}
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
