import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: null, message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: null, message: '' });

        try {
            const response = await axios.post('/forgot-password', { email });
            // Laravel manda un 200 si todo va bien con la response en JSON
            setStatus({ type: 'success', message: response.data.message });
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const errorMessage = Object.values(error.response.data.errors)[0][0];
                setStatus({ type: 'error', message: errorMessage });
            } else {
                setStatus({ type: 'error', message: 'Error de conexión. Inténtalo de nuevo más tarde.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center p-4 bg-gradient-to-br from-white via-[#4BB7AE]/30 to-[#EF5D7A]/40 min-h-[calc(100vh-160px)]">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60">
                {/* Header */}
                <div className="px-8 pt-12 pb-6 text-center">
                    <img src="/img/logopng.png"
                        alt="Factomove Logo"
                        className="h-28 w-auto mx-auto mb-6 transform hover:scale-105 transition duration-300" />
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recuperar contraseña</h2>
                    <p className="mt-2 text-sm text-gray-500">Introduce tu email y te enviaremos un enlace para restablecerla</p>
                </div>

                <div className="px-8 pb-10">
                    {status.type === 'success' && (
                        <div className="mb-5 rounded-2xl border border-[#4BB7AE]/30 bg-[#4BB7AE]/10 px-4 py-3 text-sm text-gray-700">
                            <i className="fa-solid fa-circle-check text-[#4BB7AE] mr-2"></i>
                            {status.message}
                        </div>
                    )}

                    {status.type === 'error' && (
                        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="group md:col-span-2">
                                <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                                    Email de acceso
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fa-solid fa-envelope text-[#EF5D7A] group-focus-within:text-[#EF5D7A]/80 transition text-lg"></i>
                                    </div>
                                    <input type="email"
                                        name="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4BB7AE] focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400"
                                        placeholder="tuemail@dominio.com"
                                        required />
                                </div>
                            </div>
                        </div>

                        <button type="submit"
                            disabled={loading}
                            className="mt-8 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#EF5D7A]/30 text-sm font-bold text-white bg-gradient-to-r from-[#4BB7AE] to-[#EF5D7A] hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4BB7AE] transition transform hover:-translate-y-0.5 duration-200 disabled:opacity-75 disabled:cursor-not-allowed">
                            {loading ? (
                                <span><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> ENVIANDO...</span>
                            ) : (
                                <span><i className="fa-solid fa-paper-plane mr-2"></i> ENVIAR ENLACE DE RECUPERACIÓN</span>
                            )}
                        </button>

                        <Link to="/login"
                            className="mt-5 block text-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
                            <i className="fa-solid fa-arrow-left mr-2"></i> Volver a iniciar sesión
                        </Link>

                        <p className="mt-6 text-center text-xs text-gray-400">
                            Por seguridad, si el email existe, enviaremos el enlace igualmente.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
