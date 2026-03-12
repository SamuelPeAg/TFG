import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [terms, setTerms] = useState(false);

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
            const response = await axios.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                terms
            });

            if (response.data.redirect) {
                // Forzamos redirección del navegador completo al Welcome o a donde diga el backend (esto regenerará sesión y limpiará estado temporalmente)
                window.location.href = response.data.redirect;
            }
        } catch (error) {
            // Manejamos los errores de validación (422) que devuelve Laravel automáticamente
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                setErrors({ general: 'Error de conexión con el servidor. Inténtalo de nuevo.' });
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-grow py-12 bg-gradient-to-br from-white via-[#4BB7AE]/30 to-[#EF5D7A]/40">
            <div className="flex-grow flex items-center justify-center p-4 sm:p-8">

                {/* TARJETA DE REGISTRO */}
                <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60">

                    {/* ENCABEZADO DE LA TARJETA */}
                    <div className="px-8 pt-10 pb-4 text-center">
                        <img src="/img/logopng.png"
                            alt="Factomove Logo"
                            className="h-28 w-auto mx-auto mb-6 transform hover:scale-105 transition duration-300" />

                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Únete a Factomove</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Crea tu cuenta y empieza a gestionar el movimiento.
                        </p>
                    </div>

                    {/* FORMULARIO */}
                    <div className="px-8 pb-10">
                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center font-semibold">
                                {errors.general}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            {/* 1. NOMBRE */}
                            <div className="group">
                                <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Nombre Completo</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fa-solid fa-user text-[#EF5D7A] group-focus-within:text-[#EF5D7A]/80 transition text-lg"></i>
                                    </div>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800 ${errors.name ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-[#4BB7AE]/50'}`}
                                        placeholder="Ej. MariaGarcia"
                                        required
                                        aria-label="Introduce tu nombre de usuario, entre 3 y 20 caracteres" />
                                </div>
                                {errors.name && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.name[0]}</p>}
                            </div>

                            {/* 2. EMAIL */}
                            <div className="group">
                                <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Correo Electrónico</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fa-solid fa-envelope text-[#EF5D7A] group-focus-within:text-[#EF5D7A]/80 transition text-lg"></i>
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800 ${errors.email ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-[#4BB7AE]/50'}`}
                                        placeholder="tucorreo@ejemplo.com"
                                        required
                                        aria-label="Introduce tu correo electrónico único" />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.email[0]}</p>}
                            </div>

                            {/* 3. CONTRASEÑA */}
                            <div className="group">
                                <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Contraseña</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fa-solid fa-lock text-[#EF5D7A] group-focus-within:text-[#EF5D7A]/80 transition text-lg"></i>
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800 ${errors.password ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-[#4BB7AE]/50'}`}
                                        placeholder="Mínimo 8 caracteres"
                                        required
                                        autoComplete="new-password"
                                        aria-label="Crea una contraseña de al menos 8 caracteres" />
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.password[0]}</p>}
                            </div>

                            {/* 4. REPETIR CONTRASEÑA */}
                            <div className="group">
                                <label htmlFor="password_confirmation" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Confirmar Contraseña</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fa-solid fa-check-double text-[#EF5D7A] group-focus-within:text-[#EF5D7A]/80 transition text-lg"></i>
                                    </div>
                                    <input
                                        type="password"
                                        id="password_confirmation"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800 ${errors.password ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-[#4BB7AE]/50'}`}
                                        placeholder="Repite tu contraseña"
                                        required
                                        aria-label="Confirma tu contraseña" />
                                </div>
                            </div>

                            {/* 5. TÉRMINOS Y CONDICIONES */}
                            <div className="flex items-start mt-2">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={terms}
                                        onChange={(e) => setTerms(e.target.checked)}
                                        required
                                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-[#4BB7AE]/30 text-[#4BB7AE] cursor-pointer"
                                        aria-label="Aceptar términos y condiciones" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-medium text-gray-600">
                                        He leído y acepto los <a href="/aviso-legal" className="text-[#4BB7AE] hover:underline font-bold">Términos y Condiciones</a>
                                    </label>
                                </div>
                            </div>
                            {errors.terms && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.terms[0]}</p>}

                            {/* BOTÓN REGISTRAR */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-4 mt-6 border border-transparent rounded-xl shadow-lg shadow-[#EF5D7A]/30 text-sm font-bold text-white bg-gradient-to-r from-[#4BB7AE] to-[#EF5D7A] hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4BB7AE] transition transform hover:-translate-y-0.5 duration-200 disabled:opacity-75 disabled:cursor-not-allowed">
                                {loading ? (
                                    <span>
                                        <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> CREANDO...
                                    </span>
                                ) : (
                                    'CREAR CUENTA'
                                )}
                            </button>
                        </form>

                        {/* ENLACE INICIAR SESIÓN */}
                        <div className="mt-8 relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-white text-xs text-gray-400 uppercase font-bold tracking-wider">¿Ya tienes cuenta?</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="inline-block text-[#4BB7AE] font-bold hover:text-teal-800 transition underline decoration-2 decoration-transparent hover:decoration-[#4BB7AE]">
                                Inicia sesión aquí
                            </Link>
                        </div>

                    </div>
                </div>
            </div>

            {/* Si quisieras aquí puedes migrar un footers.footer_welcome a React 
                o dejarlo transparente ya que la pantalla de register suele estar limpia */}
            <footer className="w-full text-center pb-4 text-gray-400 text-xs mt-auto">
                <p>&copy; {new Date().getFullYear()} Factomove. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
