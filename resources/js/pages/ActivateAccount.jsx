import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';

export default function ActivateAccount() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);

        try {
            await axios.post(`/activate-account/${token}`, formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: 'Hubo un error al activar tu cuenta. El enlace puede haber expirado.' });
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('/img/bg-texture.png')] bg-repeat bg-fixed">
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-emerald-500/10 border border-emerald-100 max-w-md w-full text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-check-circle text-3xl"></i>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">¡Cuenta Activada!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">Tu contraseña se ha guardado correctamente. Serás redirigido al inicio de sesión en unos segundos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('/img/bg-texture.png')] bg-repeat bg-fixed">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 max-w-md w-full animate-in slide-in-from-bottom-6 duration-500">
                <div className="text-center mb-10">
                    <img src="/img/logopng.png" className="h-12 mx-auto mb-8 opacity-90" alt="Factomove" />
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Activa tu Cuenta</h2>
                    <p className="text-slate-500 text-sm mt-3 font-medium">Establece una contraseña para completar tu registro</p>
                </div>

                {errors?.general && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-3">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nueva Contraseña</label>
                        <div className="relative group">
                            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#38C1A3] transition-colors"></i>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#38C1A3]/10 focus:border-[#38C1A3] outline-none transition-all font-medium text-slate-700"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#38C1A3] transition-colors focus:outline-none"
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        {errors?.password && <p className="text-rose-500 text-[10px] font-bold mt-1 pl-1">{errors.password[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirmar Contraseña</label>
                        <div className="relative group">
                            <i className="fas fa-shield-halved absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#38C1A3] transition-colors"></i>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#38C1A3]/10 focus:border-[#38C1A3] outline-none transition-all font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        variant="primary" 
                        className="w-full py-5 text-sm tracking-[0.2em]" 
                        disabled={loading}
                    >
                        {loading ? 'ACTIVANDO...' : 'FINALIZAR REGISTRO'}
                    </Button>
                </form>

                <p className="text-center mt-10 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                    Seguridad Proporcionada por <span className="text-slate-400">Factomove</span>
                </p>
            </div>
        </div>
    );
}
