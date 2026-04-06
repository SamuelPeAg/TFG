import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import AlertModal from '../components/AlertModal';

export default function MiFicha() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = window.AppConfig?.user;
  const [profileData, setProfileData] = useState(null);
  const [files, setFiles] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

    const [isEditingContact, setIsEditingContact] = useState(false);
    const [submittingFile, setSubmittingFile] = useState(false);
    const [savingContact, setSavingContact] = useState(false);
    
    // Alert Setup
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', isError: false });
    const showAlert = (message, isError = false, title = isError ? "Error" : "Aviso") => {
        setAlertConfig({ isOpen: true, title, message, isError });
    };

    useEffect(() => {
        if (user) fetchFicha();
    }, [user]);

    const fetchFicha = async () => {
        try {
            const res = await axios.get(`client-profile/${user.id}`);
            setProfileData(res.data.user);
            setFiles(res.data.files);
            setSubscriptions(res.data.subscriptions || []);
        } catch (error) {
            console.error("Error fetching ficha:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateContact = async (e) => {
        e.preventDefault();
        setSavingContact(true);
        try {
            await axios.put(`client-profile/${user.id}`, {
                dni: profileData.dni,
                direccion: profileData.direccion,
                codigo_postal: profileData.codigo_postal,
                ciudad: profileData.ciudad
            });
            setIsEditingContact(false);
            fetchFicha();
        } catch (error) {
            console.error("Error updating contact:", error);
            const serverMsg = error.response?.data?.message || error.response?.data?.errors?.dni?.[0];
            showAlert(
                serverMsg || "No se pudo actualizar la información. El texto puede ser demasiado largo o el formato inválido.", 
                true, 
                "Error de Validación"
            );
        } finally {
            setSavingContact(false);
        }
    };

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSubmittingFile(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`client-profile/${user.id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchFicha();
        } catch (error) {
            showAlert("Hubo un problema al subir tu archivo. Verifica el tamaño (máx 10MB) y el formato.", true);
        } finally {
            setSubmittingFile(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
                <header className="px-10 py-8 flex items-center justify-between bg-white border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-6">
                        <button className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3]" onClick={() => setIsSidebarOpen(true)}>
                            <i className="fa-solid fa-bars text-xl"></i>
                        </button>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#38C1A3] to-[#2D9B82] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-teal-100">
                            <i className="fa-solid fa-address-card"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mi Ficha y Salud</h1>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">Consulta tu historial y documentos</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-10 space-y-10">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-[#38C1A3]/20 border-t-[#38C1A3] rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
                            
                            {/* INFO COL */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => setIsEditingContact(!isEditingContact)}
                                            className="text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                                        >
                                            {isEditingContact ? 'Cancelar' : 'Editar Ficha'}
                                        </button>
                                    </div>
                                    <div className="text-center pb-6 border-b border-slate-50">
                                        <div className="w-20 h-20 rounded-full bg-slate-50 mx-auto flex items-center justify-center text-3xl font-black text-[#38C1A3] mb-4 border-2 border-slate-100">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <h2 className="font-black text-slate-800 text-lg">{user.name}</h2>
                                        {isEditingContact ? (
                                            <input 
                                                type="text" 
                                                value={profileData?.dni || ''} 
                                                onChange={(e) => setProfileData({...profileData, dni: e.target.value})}
                                                placeholder="DNI / NIE"
                                                maxLength={20}
                                                className="w-full text-center mt-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase focus:border-indigo-400 outline-none"
                                            />
                                        ) : (
                                            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">{profileData?.dni || 'DNI No asignado'}</p>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Información de Contacto</h3>
                                        {isEditingContact ? (
                                            <form onSubmit={handleUpdateContact} className="space-y-3">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Dirección</label>
                                                    <input 
                                                        type="text" 
                                                        value={profileData?.direccion || ''} 
                                                        onChange={(e) => setProfileData({...profileData, direccion: e.target.value})}
                                                        maxLength={200}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-400 outline-none"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Ciudad</label>
                                                        <input 
                                                            type="text" 
                                                            value={profileData?.ciudad || ''} 
                                                            onChange={(e) => setProfileData({...profileData, ciudad: e.target.value})}
                                                            maxLength={100}
                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-400 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">C.P.</label>
                                                        <input 
                                                            type="text" 
                                                            value={profileData?.codigo_postal || ''} 
                                                            onChange={(e) => setProfileData({...profileData, codigo_postal: e.target.value})}
                                                            maxLength={10}
                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-400 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <button 
                                                    type="submit" 
                                                    disabled={savingContact}
                                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                                >
                                                    {savingContact ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-floppy-disk"></i> Guardar Cambios</>}
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <i className="fa-solid fa-envelope text-slate-300 w-5"></i>
                                                    <span className="text-slate-600 font-medium truncate">{user.email}</span>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <i className="fa-solid fa-location-dot text-slate-300 w-5 mt-0.5 shrink-0"></i>
                                                    <span className="text-slate-600 font-medium leading-tight break-words min-w-0">{profileData?.direccion || '---'}{profileData?.ciudad ? `, ${profileData.ciudad}` : ''}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <i className="fa-solid fa-truck-ramp-box text-slate-300 w-5"></i>
                                                    <span className="text-slate-600 font-medium">CP: {profileData?.codigo_postal || '---'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Suscripciones (Créditos) */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-[2.5rem] border border-indigo-100 shadow-sm space-y-4">
                                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                        <i className="fa-solid fa-ticket"></i> Mis Suscripciones
                                    </h3>
                                    <div className="space-y-4">
                                        {subscriptions?.length > 0 ? (
                                            subscriptions.map((subUser) => {
                                                const nextRecharge = () => {
                                                    if (!subUser.ultima_recarga) return 'Pendiente de activar';
                                                    const last = new Date(subUser.ultima_recarga);
                                                    if (subUser.suscripcion?.periodo === 'semanal') {
                                                        last.setDate(last.getDate() + 7);
                                                    } else {
                                                        last.setMonth(last.getMonth() + (subUser.suscripcion?.meses_reset || 1));
                                                    }
                                                    return last.toLocaleDateString();
                                                };

                                                return (
                                                    <div key={subUser.id} className="bg-white p-5 rounded-3xl shadow-sm border border-indigo-50/50 relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100/30 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                                                        
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h4 className="font-black text-slate-800 text-sm">{subUser.suscripcion?.nombre || 'Suscripción Personalizada'}</h4>
                                                                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                                                                    {subUser.suscripcion?.periodo || 'semanal'}
                                                                </span>
                                                            </div>
                                                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${subUser.saldo_actual > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                                {subUser.saldo_actual > 0 ? 'ACTIVO' : 'AGOTADO'}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-0.5">
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Créditos Disponibles</p>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-3xl font-black text-indigo-600 leading-none">{subUser.saldo_actual}</span>
                                                                    <span className="text-xs font-bold text-indigo-300">/ {subUser.suscripcion?.creditos_por_periodo || 0}</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-0.5 text-right">
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Próxima Recarga</p>
                                                                <p className="text-xs font-black text-slate-800 mt-1">{nextRecharge()}</p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                                                            <p className="text-[9px] text-slate-400 font-bold italic">
                                                                Límite acumulación: {subUser.suscripcion?.limite_acumulacion || 0} usos
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="bg-white/60 text-center p-6 rounded-3xl border border-indigo-50 border-dashed">
                                                <i className="fa-solid fa-ghost text-indigo-200 text-3xl mb-3"></i>
                                                <p className="text-xs text-slate-500 font-medium">No tienes suscripciones activas vinculadas.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Atributos */}
                                <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100/50 space-y-4">
                                    <h3 className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest">Notas Especiales</h3>
                                    <div className="space-y-3">
                                        {profileData?.additional_attributes?.length > 0 ? (
                                            profileData.additional_attributes.map((attr, i) => (
                                                <div key={i} className="flex flex-col">
                                                    <span className="text-[10px] font-black text-emerald-700/60 uppercase">{attr.key}</span>
                                                    <span className="text-sm font-bold text-slate-800">{attr.value}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">No hay notas adicionales.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* FILES COL */}
                            <div className="lg:col-span-2 space-y-6">
                                <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex-1 min-h-[500px]">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                            Mis Documentos
                                            <span className="bg-slate-100 text-slate-400 text-xs px-2 py-0.5 rounded-full">{files.length}</span>
                                        </h3>
                                        <div className="relative">
                                            <button 
                                                className="bg-[#38C1A3] hover:bg-teal-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 active:scale-95 disabled:grayscale"
                                                onClick={() => document.getElementById('file-upload-input').click()}
                                                disabled={submittingFile}
                                            >
                                                {submittingFile ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-upload"></i>}
                                                <span>Subir Archivo</span>
                                            </button>
                                            <input 
                                                id="file-upload-input" 
                                                type="file" 
                                                hidden 
                                                onChange={onFileChange}
                                            />
                                        </div>
                                </div> 
                                
                                {files.length === 0 ? (
                                    <div className="h-64 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-slate-50">
                                        <i className="fa-regular fa-folder-open text-3xl text-slate-200 mb-3"></i>
                                        <p className="text-slate-400 font-bold text-sm">Aún no se han compartido documentos contigo.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {files.map(file => (
                                            <div key={file.id} className="p-5 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 border border-transparent hover:border-slate-100 transition-all group">
                                                <div className="flex items-start justify-between">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                                        <i className={file.file_type === 'pdf' ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image'}></i>
                                                    </div>
                                                    <a 
                                                       href={`/client-file/${file.id}/download`}
                                                       className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-[#38C1A3] shadow-sm flex items-center justify-center transition-colors"
                                                       title="Descargar"
                                                    >
                                                        <i className="fa-solid fa-download text-xs text-info"></i>
                                                    </a>
                                                </div>
                                                <div className="mt-4">
                                                    <h4 className="font-black text-slate-800 text-sm truncate" title={file.file_name}>{file.file_name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Subido por: {file.uploader?.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                    </div>
                )}
            </div>
        </main>

        <AlertModal 
            isOpen={alertConfig.isOpen}
            onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
            title={alertConfig.title}
            message={alertConfig.message}
            isError={alertConfig.isError}
        />
    </div>
  );
}
