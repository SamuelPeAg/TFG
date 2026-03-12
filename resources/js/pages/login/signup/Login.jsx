import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Configuración para que Laravel detecte que es una petición AJAX/API
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    // Leemos el token CSRF que dejamos en app.blade.php
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Hacemos el POST directo a la ruta de web.php (LoginController reaccionará con JSON)
            const response = await axios.post('/login', { email, password });

            // Si Laravel nos devuelve un success con la URL a la que redirigir
            if (response.data.redirect) {
                // Como de momento el calendario no está en React, recargamos la ventana entera
                // Cuando pasemos el calendario a React, usaríamos react-router-dom: navigate(response.data.redirect)
                window.location.href = response.data.redirect;
            }
        } catch (error) {
            // Si Laravel nos devuelve un 422 (Error de validación)
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || { general: error.response.data.message });
            } else {
                setErrors({ general: 'Error de conexión con el servidor. Inténtalo de nuevo.' });
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow bg-gradient-to-br from-gray-50 via-[#4BB7AE]/10 to-[#EF5D7A]/10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto w-full max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* Información (Left Column) */}
                    <div className="hidden lg:block space-y-8 px-4">
                        <div className="text-left space-y-6">
                            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                                Bienvenido a <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4BB7AE] to-[#EF5D7A]">Factomove</span>
                            </h1>
                            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg">
                                Accede a tu panel de gestión y lleva el control integral de tus entrenamientos, usuarios y pagos desde cualquier dispositivo.
                            </p>

                            <div className="flex flex-col gap-5 pt-2">
                                <div className="flex items-center gap-4 p-3 bg-white/50 rounded-xl backdrop-blur-sm border border-white/40 w-fit">
                                    <div className="w-10 h-10 rounded-full bg-[#4BB7AE]/20 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-dumbbell text-[#4BB7AE] text-lg"></i>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">Gestión de Entrenadores</span>
                                </div>

                                <div className="flex items-center gap-4 p-3 bg-white/50 rounded-xl backdrop-blur-sm border border-white/40 w-fit">
                                    <div className="w-10 h-10 rounded-full bg-[#EF5D7A]/20 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-users text-[#EF5D7A] text-lg"></i>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">Control de Usuarios</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de Login (Right Column) */}
                    <div className="w-full max-w-md mx-auto lg:max-w-full">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-white to-gray-50/50">
                                <img src="/img/logopng.png" alt="Factomove Logo" className="h-12 lg:h-16 w-auto mx-auto mb-4 transition-all duration-300" />
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">¡Hola de nuevo!</h2>
                                <p className="mt-2 text-sm text-gray-500 font-medium">Ingresa tus credenciales para continuar</p>
                            </div>

                            <div className="px-8 pb-8 pt-2">
                                {/* Mostrar error general si existe */}
                                {errors.general && (
                                    <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center font-semibold">
                                        {errors.general}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="group">
                                        <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            Correo Electrónico
                                        </label>
                                        <div className="relative group-focus-within:text-[#4BB7AE] transition-colors">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fa-solid fa-envelope text-gray-400 group-focus-within:text-[#4BB7AE] transition-colors duration-200"></i>
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-[#4BB7AE]/20 focus:bg-white focus:border-[#4BB7AE] outline-none transition-all duration-200 text-sm font-medium text-gray-800 placeholder-gray-400`}
                                                placeholder="ejemplo@correo.com"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        {/* Error especifico de email */}
                                        {errors.email && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.email[0]}</p>}
                                    </div>

                                    <div className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Contraseña
                                            </label>
                                            <Link to="/forgot-password" className="text-xs text-[#4BB7AE] hover:text-[#4BB7AE]/80 font-bold transition-colors">
                                                ¿Olvidaste tu contraseña?
                                            </Link>
                                        </div>
                                        <div className="relative group-focus-within:text-[#EF5D7A] transition-colors">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fa-solid fa-lock text-gray-400 group-focus-within:text-[#EF5D7A] transition-colors duration-200"></i>
                                            </div>
                                            <input
                                                type="password"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-[#EF5D7A]/20 focus:bg-white focus:border-[#EF5D7A] outline-none transition-all duration-200 text-sm font-medium text-gray-800 placeholder-gray-400`}
                                                placeholder="••••••••"
                                                required
                                                autoComplete="current-password"
                                            />
                                        </div>
                                        {/* Error especifico de password */}
                                        {errors.password && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.password[0]}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full mt-2 group relative flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#4BB7AE]/30 text-sm font-bold text-white bg-gradient-to-r from-[#4BB7AE] to-[#EF5D7A] hover:shadow-xl hover:shadow-[#EF5D7A]/30 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4BB7AE] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                            {loading ? (
                                                <i className="fa-solid fa-circle-notch fa-spin text-white"></i>
                                            ) : (
                                                <i className="fa-solid fa-right-to-bracket text-white/50 group-hover:text-white transition-colors"></i>
                                            )}
                                        </span>
                                        {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
                                    </button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                                    <p className="text-sm text-gray-600">
                                        ¿Aún no eres miembro?{' '}
                                        <Link to="/register" className="font-bold text-[#4BB7AE] hover:text-[#EF5D7A] transition-colors duration-200 inline-flex items-center gap-1">
                                            Crea una cuenta gratis
                                            <i className="fa-solid fa-arrow-right text-xs"></i>
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
