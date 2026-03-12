import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Configuración CSRF y AJAX
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post('/login', { email, password });
            if (response.data.redirect) {
                window.location.href = response.data.redirect;
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || { general: error.response.data.message });
            } else {
                setErrors({ general: 'Error de conexión con el servidor. Inténtalo de nuevo.' });
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow bg-[#f3f7f9] flex items-center justify-center py-24 px-6">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                
                {/* COLUMNA IZQUIERDA: MENSAJE BIENVENIDA */}
                <div className="space-y-8" style={{ marginLeft: '70px' }}>
                    <div className="space-y-4">
                        <h1 className="text-5xl lg:text-7xl font-black text-[#1e293b] leading-tight tracking-tight">
                            Bienvenido a <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4BB7AE] to-[#EF5D7A]">Factomove</span>
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed max-w-lg font-medium">
                            Accede a tu panel de gestión y lleva el control integral de tus entrenamientos, usuarios y pagos desde cualquier dispositivo.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 bg-white p-4 pl-6 pr-10 rounded-[22px] border border-slate-100 shadow-sm w-fit transition-transform hover:scale-[1.02]">
                            <div className="w-12 h-12 rounded-2xl bg-[#4BB7AE]/10 flex items-center justify-center shrink-0 shadow-inner">
                                <i className="fa-solid fa-person-running text-[#4BB7AE] text-xl"></i>
                            </div>
                            <span className="text-lg font-extrabold text-[#334155]">Gestión de Entrenadores</span>
                        </div>

                        <div className="flex items-center gap-4 bg-white p-4 pl-6 pr-10 rounded-[22px] border border-slate-100 shadow-sm w-fit transition-transform hover:scale-[1.02]">
                            <div className="w-12 h-12 rounded-2xl bg-[#EF5D7A]/10 flex items-center justify-center shrink-0 shadow-inner">
                                <i className="fa-solid fa-users text-[#EF5D7A] text-xl"></i>
                            </div>
                            <span className="text-lg font-extrabold text-[#334155]">Control de Usuarios</span>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: CARD DE LOGIN */}
                <div className="w-full max-w-lg mx-auto lg:max-w-none" style={{ marginRight: '100px' }}>
                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 overflow-hidden p-12 lg:p-20 relative group">
                        
                        {/* Branding en Card */}
                        <div className="text-center mb-16">
                            <img src="/img/logopng.png" alt="Factomove" className="h-20 mx-auto mb-8 transition-transform group-hover:scale-110 duration-500" />
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">¡Hola de nuevo!</h2>
                            <p className="text-slate-400 font-bold">Ingresa tus credenciales para continuar</p>
                        </div>

                        {errors.general && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center border border-red-100">
                                {errors.general}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* EMAIL FIELD */}
                            <div className="space-y-3 px-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Correo Electrónico</label>
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-envelope text-slate-400 text-base"></i>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:border-[#4BB7AE] outline-none transition-all duration-300 text-slate-700 font-semibold placeholder:text-slate-400`}
                                        placeholder="ejemplo@correo.com"
                                        required
                                    />
                                </div>
                                {errors.email && <p className="mt-1 ml-16 text-[11px] text-red-500 font-bold uppercase tracking-wide">{errors.email[0]}</p>}
                            </div>

                            {/* PASSWORD FIELD */}
                            <div className="space-y-3 px-2">
                                <div className="flex justify-between items-center ml-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contraseña</label>
                                    <Link to="/forgot-password" title="Olvidé mi contraseña" className="text-[11px] font-black text-[#4BB7AE] hover:text-[#EF5D7A] transition-colors">¿Olvidaste tu contraseña?</Link>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-lock text-slate-400 text-base"></i>
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:border-[#EF5D7A] outline-none transition-all duration-300 text-slate-700 font-semibold placeholder:text-slate-400`}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                {errors.password && <p className="mt-1 ml-16 text-[11px] text-red-500 font-bold uppercase tracking-wide">{errors.password[0]}</p>}
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative bg-gradient-to-r from-[#4BB7AE] to-[#EF5D7A] text-white rounded-[1.5rem] py-4.5 font-black text-lg tracking-[0.1em] hover:brightness-105 shadow-xl shadow-[#4BB7AE]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 overflow-hidden flex items-center justify-center"
                                >
                                    <div className="absolute left-8 inset-y-0 flex items-center">
                                        {loading ? (
                                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        ) : (
                                            <i className="fa-solid fa-right-to-bracket text-xl opacity-90"></i>
                                        )}
                                    </div>
                                    <span className="uppercase">{loading ? 'ACCEDIENDO...' : 'INICIAR SESIÓN'}</span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-12 text-center pb-2">
                            <p className="text-slate-500 font-bold text-sm">
                                ¿Aún no eres miembro?{' '}
                                <Link to="/register" className="text-[#4BB7AE] hover:text-[#EF5D7A] transition-colors flex items-center justify-center gap-2 mt-2">
                                    Crea una cuenta gratis
                                    <i className="fa-solid fa-arrow-right-long transition-transform group-hover:translate-x-1"></i>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
