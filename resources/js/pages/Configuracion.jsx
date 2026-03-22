import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';

export default function Configuracion() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      iban: '',
      current_password: '',
      password: '',
      password_confirmation: ''
  });
  
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [toast, setToast] = useState('');
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
              current_password: '',
              password: '',
              password_confirmation: ''
          });
          if (user.foto_de_perfil) {
              setPhotoPreview(`/storage/${user.foto_de_perfil}`);
          }
      } catch (error) {
          console.error('Error fetching user config:', error);
      } finally {
          setLoading(false);
      }
  };

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      // Borrar error puntual al tipear
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
          if (errors['foto_de_perfil']) {
              setErrors(prev => ({ ...prev, foto_de_perfil: null }));
          }
      }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setErrors({});

      const data = new FormData();
      data.append('_method', 'PUT'); // Laravel spoofing since HTML forms only do GET/POST, axios can do PUT but with FormData _method is useful
      
      data.append('name', formData.name);
      data.append('iban', formData.iban);
      
      if (photoFile) {
          data.append('foto_de_perfil', photoFile);
      }

      if (formData.password) {
          data.append('current_password', formData.current_password);
          data.append('password', formData.password);
          data.append('password_confirmation', formData.password_confirmation);
      }

      try {
          const res = await axios.post('/configuracion', data, {
              headers: { 
                  'Content-Type': 'multipart/form-data',
                  Accept: 'application/json' 
              }
          });
          setToast(res.data.message || 'Configuración actualizada correctamente.');
          setTimeout(() => setToast(''), 4000);
          
          if (res.data.user && res.data.user.foto_de_perfil) {
              if (window.AppConfig && window.AppConfig.user) {
                  window.AppConfig.user.photo = `/storage/${res.data.user.foto_de_perfil}`;
              }
          }
          
          // Limpiar contraseñas tras triunfo
          setFormData(prev => ({
              ...prev,
              current_password: '',
              password: '',
              password_confirmation: ''
          }));
          setPhotoFile(null);

      } catch (error) {
          if (error.response && error.response.status === 422) {
              setErrors(error.response.data.errors || {});
              window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
              alert('Error inesperado al guardar');
          }
      } finally {
          setSubmitting(false);
      }
  };

  const globalErrors = Object.values(errors).flat();

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800 transition-colors duration-300">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {isSidebarOpen && (
            <div 
            className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            />
        )}

        <main className="flex-1 transition-all duration-300 lg:ml-72 w-full p-4 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <button 
                            className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3] rounded-lg hover:bg-slate-100 transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <i className="fa-solid fa-bars text-xl"></i>
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                                Mi Perfil
                            </h1>
                            <p className="text-slate-400 mt-1 font-medium text-sm">Administración de ajustes, seguridad y avatar personal</p>
                        </div>
                    </div>
                </div>

                {toast && (
                    <div className="bg-emerald-50 text-emerald-600 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 font-bold">
                        <i className="fas fa-check-circle text-xl"></i>
                        <span>{toast}</span>
                    </div>
                )}

                {globalErrors.length > 0 && (
                    <div className="bg-rose-50 text-rose-600 px-5 py-4 rounded-2xl mb-6 border border-rose-100 shadow-sm animate-in fade-in">
                        <div className="flex items-center gap-3 font-bold mb-2">
                            <i className="fas fa-exclamation-circle text-xl"></i>
                            <span>Hay errores en el formulario:</span>
                        </div>
                        <ul className="list-disc pl-9 text-sm space-y-1 font-medium">
                            {globalErrors.map((err, idx) => (
                                <li key={idx}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {loading ? (
                    <div className="py-20 flex justify-center"><div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-[#38C1A3] rounded-full"></div></div>
                ) : (
                    <div className="bg-white rounded-4xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">
                            
                            {/* Sec 1: PERFIL */}
                            <section>
                                <div className="border-b border-slate-100 pb-3 mb-6">
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                                        <i className="fas fa-id-card text-slate-400"></i> Información Personal
                                    </h3>
                                </div>
                                
                                {/* Foto Row */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 group">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-md bg-slate-100 flex items-center justify-center relative">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Perfil" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                            ) : (
                                                <i className="fa-solid fa-user text-5xl text-slate-300"></i>
                                            )}
                                        </div>
                                        <button type="button" onClick={() => fileInputRef.current?.click()} 
                                                className="absolute bottom-1 right-1 bg-[#38C1A3] hover:bg-teal-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 border-2 border-white">
                                            <i className="fa-solid fa-camera"></i>
                                        </button>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h4 className="font-bold text-slate-700">Avatar del Perfil</h4>
                                        <p className="text-xs text-slate-400 mt-1 font-medium max-w-[200px]">Formatos recomendados: JPG, PNG, WEBP. Tamaño max: 2MB.</p>
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Nombre Completo</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} 
                                                   className={`w-full text-sm font-bold bg-slate-50/50 border ${errors.name ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-[#38C1A3]'} rounded-xl px-4 py-3 focus:bg-white outline-none transition-all`} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Email (Sólo lectura)</label>
                                            <input type="email" value={formData.email} readOnly 
                                                   className="w-full text-sm font-bold bg-slate-100 text-slate-500 border border-slate-200 rounded-xl px-4 py-3 outline-none cursor-not-allowed" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">IBAN de Facturación</label>
                                        <input type="text" name="iban" value={formData.iban} onChange={handleInputChange} placeholder="ES00 0000 0000 0000 0000 0000"
                                               className={`w-full text-sm font-bold bg-slate-50/50 border ${errors.iban ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-[#38C1A3]'} rounded-xl px-4 py-3 focus:bg-white outline-none transition-all`} />
                                        <p className="text-[11px] text-slate-400 font-medium pl-2">La cuenta donde recibirás tus ingresos.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Sec 2: SEGURIDAD */}
                            <section className="bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-slate-100">
                                <div className="border-b border-slate-200 pb-3 mb-6">
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                                        <i className="fas fa-shield-alt text-slate-400"></i> Seguridad de la Cuenta
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">Déjalo en blanco si no deseas cambiar tu contraseña.</p>
                                </div>
                                
                                <div className="grid gap-6">
                                    <div className="space-y-1.5 md:w-1/2 md:pr-3">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Contraseña Actual</label>
                                        <input type="password" name="current_password" value={formData.current_password} onChange={handleInputChange} placeholder="••••••••"
                                               className={`w-full text-sm font-black tracking-widest bg-white border ${errors.current_password ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-[#38C1A3]'} rounded-xl px-4 py-3 outline-none transition-all`} />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Nueva Contraseña</label>
                                            <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••"
                                                   className={`w-full text-sm font-black tracking-widest bg-white border ${errors.password ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-[#38C1A3]'} rounded-xl px-4 py-3 outline-none transition-all`} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Repetir Nueva</label>
                                            <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleInputChange} placeholder="••••••••"
                                                   className="w-full text-sm font-black tracking-widest bg-white border border-slate-200 focus:border-[#38C1A3] rounded-xl px-4 py-3 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button type="button" onClick={() => window.history.back()} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold shadow-sm">
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" disabled={submitting} className="px-8 py-3 bg-[#38C1A3] hover:bg-teal-500 text-white rounded-xl font-bold shadow-lg shadow-teal-500/25 transition-transform hover:-translate-y-0.5 min-w-[160px]">
                                    {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Guardar Cambios'}
                                </Button>
                            </div>

                        </form>
                    </div>
                )}
            </div>
        </main>
    </div>
  );
}
