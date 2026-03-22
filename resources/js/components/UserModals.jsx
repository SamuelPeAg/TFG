import React, { useState, useEffect } from 'react';
import Button from './Button';

export default function UserModals({ 
  isOpen, 
  onClose, 
  onSave, 
  user = null,
  mode = 'create' // 'create' or 'edit'
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    iban: '',
    firma_digital: '',
    precio_hora: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        iban: user.iban || '',
        firma_digital: user.firma_digital || '',
        precio_hora: user.precio_hora || '',
        password: '',
        password_confirmation: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        iban: '',
        firma_digital: '',
        precio_hora: '',
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      await onSave(formData, mode, user?.id);
      onClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: 'Error al procesar la solicitud.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${mode === 'edit' ? 'bg-teal-50 text-[#38C1A3]' : 'bg-rose-50 text-[#E65C9C]'}`}>
              <i className={`fas ${mode === 'edit' ? 'fa-user-edit' : 'fa-user-plus'} text-2xl`}></i>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {mode === 'edit' ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              {mode === 'edit' ? 'Modifica los datos del cliente seleccionado' : 'Introduce la información para registrar al nuevo cliente'}
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl flex items-center gap-3">
              <i className="fas fa-circle-exclamation"></i>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Nombre Completo</label>
                <div className="relative group">
                  <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#38C1A3] transition-colors"></i>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#38C1A3]/10 focus:bg-white focus:border-[#38C1A3] outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.name[0]}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#38C1A3] transition-colors"></i>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#38C1A3]/10 focus:bg-white focus:border-[#38C1A3] outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.email[0]}</p>}
              </div>
            </div>

            {/* IBAN */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">IBAN (Cuenta Bancaria)</label>
              <div className="relative group">
                <i className="fas fa-credit-card absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#38C1A3] transition-colors"></i>
                <input
                  type="text"
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#38C1A3]/10 focus:bg-white focus:border-[#38C1A3] outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 uppercase font-mono"
                  placeholder="ES00 0000 0000 0000 0000 0000"
                />
              </div>
              {errors.iban && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.iban[0]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
                  {mode === 'edit' ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                </label>
                <div className="relative group">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E65C9C] transition-colors"></i>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#E65C9C]/10 focus:bg-white focus:border-[#E65C9C] outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                    placeholder="••••••••"
                    required={mode === 'create'}
                  />
                </div>
                {errors.password && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.password[0]}</p>}
              </div>

              {/* Firma Digital */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Firma Digital</label>
                <div className="relative group">
                  <i className="fas fa-pen-nib absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#38C1A3] transition-colors"></i>
                  <input
                    type="text"
                    name="firma_digital"
                    value={formData.firma_digital}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#38C1A3]/10 focus:bg-white focus:border-[#38C1A3] outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                    placeholder="Código de firma"
                  />
                </div>
                {errors.firma_digital && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.firma_digital[0]}</p>}
              </div>

              {/* Precio Hora */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Precio Hora (€)</label>
                <div className="relative group">
                  <i className="fas fa-euro-sign absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#38C1A3] transition-colors"></i>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_hora"
                    value={formData.precio_hora}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#38C1A3]/10 focus:bg-white focus:border-[#38C1A3] outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                    placeholder="0.00"
                  />
                </div>
                {errors.precio_hora && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.precio_hora[0]}</p>}
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-4 text-sm tracking-widest"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <i className="fas fa-circle-notch animate-spin"></i>
                    PROCESANDO...
                  </span>
                ) : (
                  <span>{mode === 'edit' ? 'ACTUALIZAR DATOS' : 'REGISTRAR CLIENTE'}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
