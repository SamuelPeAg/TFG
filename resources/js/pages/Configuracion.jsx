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

  const [showSuccess, setShowSuccess] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', isError: false });
  const showAlert = (message, isError = false, title = isError ? "Error" : "Éxito") => {
      setAlertConfig({ isOpen: true, title, message, isError });
  };
  
  const [initialData, setInitialData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
     fetchUser();
  }, []);

  useEffect(() => {
    const checkChanges = () => {
        // Ignoramos los campos de password para la detección de cambios simples
        // a menos que se hayan empezado a escribir
        const fieldsToCompare = ['name', 'iban', 'dni', 'direccion', 'ciudad', 'codigo_postal'];
        const changed = fieldsToCompare.some(field => formData[field] !== (initialData[field] || '')) || 
                        formData.password !== '' || 
                        photoFile !== null;
        setHasChanges(changed);
    };
    checkChanges();
  }, [formData, photoFile, initialData]);

  const fetchUser = async () => {
      try {
          const res = await axios.get('/configuracion', {
              headers: { Accept: 'application/json' }
          });
          const user = res.data.user;
          const data = {
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
          };
          setFormData(data);
          setInitialData(data);
          
          if (user.foto_de_perfil) {
              const baseUrl = window.AppConfig?.baseUrl || '/';
              setPhotoPreview(`${baseUrl}storage/${user.foto_de_perfil}`);
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
          
          setShowSuccess(true);
          setHasChanges(false);
          setInitialData({ ...formData, current_password: '', password: '', password_confirmation: '' });
          setTimeout(() => setShowSuccess(false), 5000);
          
          if (res.data.user && res.data.user.foto_de_perfil) {
              if (window.AppConfig && window.AppConfig.user) {
                  const baseUrl = window.AppConfig?.baseUrl || '/';
                  window.AppConfig.user.photo = `${baseUrl}storage/${res.data.user.foto_de_perfil}`;
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
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-slate-800 overflow-x-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

        <main className="flex-1 lg:ml-72 p-6 md:p-12 transition-all">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Success Notification */}
                {showSuccess && (
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-[#38C1A3] text-white px-8 py-4 rounded-[2rem] shadow-2xl shadow-teal-500/40 flex items-center gap-4 border-2 border-white/20 backdrop-blur-md">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <i className="fa-solid fa-check"></i>
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">¡Cambios guardados con éxito!</span>
                        </div>
                    </div>
                )}

                {/* Warning Notification (Unsaved changes) */}
                {hasChanges && !showSuccess && (
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-amber-400 text-amber-950 px-8 py-4 rounded-[2rem] shadow-2xl shadow-amber-500/20 flex items-center gap-4 border-2 border-white/50 backdrop-blur-md">
                            <div className="w-8 h-8 rounded-full bg-amber-950/10 flex items-center justify-center">
                                <i className="fa-solid fa-triangle-exclamation animate-pulse"></i>
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">Tienes cambios sin guardar — ¡Cuidado!</span>
                        </div>
                    </div>
                )}

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
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
                                        
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{formData.name || 'Tu Nombre'}</h2>
                                            <p className="text-sm font-bold text-slate-400 mt-1">{formData.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* NEW LOCATION FOR SAVE BUTTON */}
                                {hasChanges && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <button 
                                            type="submit" 
                                            disabled={submitting} 
                                            className="w-full px-10 py-7 bg-[#38C1A3] text-white rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-teal-500 shadow-2xl shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-4"
                                        >
                                            {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-cloud-arrow-up text-xl"></i> Guardar Cambios</>}
                                        </button>
                                        
                                        <button 
                                            type="button" 
                                            onClick={() => window.history.back()} 
                                            className="w-full py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-400 transition-all border-2 border-transparent hover:border-slate-100 rounded-[2rem]"
                                        >
                                            Descartar
                                        </button>
                                    </div>
                                )}
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
