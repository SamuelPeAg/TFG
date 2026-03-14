import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../css/global.css';

export default function Configuracion() {
    const user = window.FactomoveUser;

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        iban: '',
        firma_digital: '',
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    // File state
    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Populate initial data from window.FactomoveUser (if available) or fetch it
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                iban: user.iban || '',
                firma_digital: user.firma_digital || ''
            }));
            if (user.foto_de_perfil) {
                setFotoPreview(`/storage/${user.foto_de_perfil}`);
            }
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFotoFile(file);
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // We use FormData because we are possibly uploading a file
        const data = new FormData();
        data.append('_method', 'PUT'); // Fake put because HTML forms don't support it natively with multipart/form-data
        data.append('name', formData.name);
        if (formData.iban) data.append('iban', formData.iban);
        if (formData.firma_digital) data.append('firma_digital', formData.firma_digital);

        if (fotoFile) {
            data.append('foto_de_perfil', fotoFile);
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
                    'Accept': 'application/json'
                }
            });

            setMessage({ type: 'success', text: res.data.message || 'Configuración actualizada correctamente.' });

            // Clear passwords fields
            setFormData(prev => ({
                ...prev,
                current_password: '',
                password: '',
                password_confirmation: ''
            }));

            // Optionally update window user object here or reload
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMsg = error.response?.data?.message || 'Error al actualizar el perfil.';
            setMessage({ type: 'error', text: errorMsg });

            if (error.response?.data?.errors) {
                // If we want to show specific field errors, we'd handle them here
                const firstError = Object.values(error.response.data.errors)[0][0];
                setMessage({ type: 'error', text: firstError });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content p-4 md:p-8 w-full transition-all duration-300 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">
                    Mi Perfil
                </h1>
                <p className="text-slate-400 mt-1 font-medium text-sm md:text-base">
                    Gestiona tu información personal y configuración.
                </p>
            </div>

            {message && (
                <div className={`px-4 py-3 rounded-xl mb-6 flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-red-100 border border-red-200 text-red-800'}`}>
                    <i className={`fas ${message.type === 'success' ? 'fa-check-circle text-green-600' : 'fa-exclamation-circle text-red-600'} text-xl`}></i>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl">
                <form onSubmit={handleSubmit}>

                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-[#4BB7AE] to-teal-600 relative"></div>

                    <div className="px-6 md:px-10 pb-12 flex flex-col gap-10">
                        {/* Avatar Section */}
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 z-10 relative">
                            <div className="relative group">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white bg-slate-100 overflow-hidden shadow-lg flex items-center justify-center text-slate-400 text-5xl font-bold">
                                    {fotoPreview ? (
                                        <img src={fotoPreview} alt="Perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        formData.name ? formData.name.charAt(0).toUpperCase() : <i className="fas fa-user"></i>
                                    )}
                                </div>

                                <button type="button" onClick={triggerFileInput} className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-800 transition-colors border-2 border-white cursor-pointer">
                                    <i className="fas fa-camera text-sm"></i>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>

                            <div className="pb-2">
                                <h2 className="text-2xl font-black text-slate-800">{formData.name || 'Mi Perfil'}</h2>
                                <p className="text-slate-500 font-medium">{user?.roles?.[0]?.name?.toUpperCase() || 'USUARIO'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Información Personal */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <i className="fas fa-id-card text-[#4BB7AE]"></i> Información Personal
                                </h3>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
                                    <div className="relative">
                                        <i className="fas fa-user absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg"></i>
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-slate-200 focus:border-[#4BB7AE] focus:ring-4 focus:ring-[#4BB7AE]/10 outline-none transition-all font-semibold text-slate-700 bg-slate-50 focus:bg-white text-base" required />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Email (Solo lectura)</label>
                                    <div className="relative">
                                        <i className="fas fa-envelope absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg"></i>
                                        <input type="email" value={formData.email} disabled className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-500 font-semibold cursor-not-allowed text-base" />
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 mt-1 pl-1">El email no se puede modificar por seguridad.</p>
                                </div>
                            </div>

                            {/* Datos Profesionales/Bancarios */}
                            <div className="flex flex-col gap-6">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                                    <i className="fas fa-briefcase text-[#4BB7AE]"></i> Datos Profesionales
                                </h3>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Cuenta Bancaria (IBAN)</label>
                                    <div className="relative">
                                        <i className="fas fa-university absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg"></i>
                                        <input type="text" name="iban" value={formData.iban} onChange={handleInputChange} className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-slate-200 focus:border-[#4BB7AE] focus:ring-4 focus:ring-[#4BB7AE]/10 outline-none transition-all font-semibold text-slate-700 font-mono bg-slate-50 focus:bg-white text-base" placeholder="ES00 0000 0000 0000 0000" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Código Firma Digital</label>
                                    <div className="relative">
                                        <i className="fas fa-pen-nib absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg"></i>
                                        <input type="text" name="firma_digital" value={formData.firma_digital} onChange={handleInputChange} className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-slate-200 focus:border-[#4BB7AE] focus:ring-4 focus:ring-[#4BB7AE]/10 outline-none transition-all font-semibold text-slate-700 bg-slate-50 focus:bg-white text-base" placeholder="Introduce tu firma digital..." />
                                    </div>
                                </div>
                            </div>

                            {/* Cambio de Contraseña (ancho completo) */}
                            <div className="md:col-span-2 flex flex-col gap-8 mt-6 bg-slate-50 p-8 md:p-10 rounded-2xl border-2 border-slate-100 shadow-sm">
                                <div className="flex flex-col gap-2 border-b-2 border-slate-200 pb-4">
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                        <i className="fas fa-shield-alt text-slate-500"></i> Seguridad y Contraseña
                                    </h3>
                                    <p className="text-base text-slate-500 font-medium">Solo es necesario rellenar estos campos si deseas modificar tu contraseña actual por una nueva.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Contraseña Actual *</label>
                                        <div className="relative">
                                            <i className="fas fa-lock absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg"></i>
                                            <input type="password" name="current_password" value={formData.current_password} onChange={handleInputChange} className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-slate-200 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/10 outline-none transition-all text-slate-700 bg-white font-mono text-lg" placeholder="•••••••••" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nueva Contraseña</label>
                                        <div className="relative">
                                            <i className="fas fa-key absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg"></i>
                                            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-slate-200 focus:border-[#4BB7AE] focus:ring-4 focus:ring-[#4BB7AE]/10 outline-none transition-all text-slate-700 bg-white font-mono text-lg" placeholder="•••••••••" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Confirmar Contraseña</label>
                                        <div className="relative">
                                            <i className="fas fa-check-double absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg"></i>
                                            <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleInputChange} className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-slate-200 focus:border-[#4BB7AE] focus:ring-4 focus:ring-[#4BB7AE]/10 outline-none transition-all text-slate-700 bg-white font-mono text-lg" placeholder="•••••••••" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Guardando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i> Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}
