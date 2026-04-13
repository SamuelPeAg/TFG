import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import AlertModal from '../components/AlertModal';

export default function MiFicha() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = window.AppConfig?.user || null;
  const [profileData, setProfileData] = useState({
    dni: '',
    direccion: '',
    codigo_postal: '',
    ciudad: '',
    additional_attributes: []
  });
  const [files, setFiles] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [submittingFile, setSubmittingFile] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [leavingSessionId, setLeavingSessionId] = useState(null);
    
    // Alert Setup
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', isError: false });
    const showAlert = (message, isError = false, title = isError ? "Error" : "Aviso") => {
        setAlertConfig({ isOpen: true, title, message, isError });
    };

    useEffect(() => {
        if (user && user.id) {
            fetchFicha();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchFicha = async () => {
        try {
            const res = await axios.get(`/client-profile/${user.id}`);
            const data = res.data || {};

            setProfileData({
              dni: data.user?.dni || '',
              direccion: data.user?.direccion || '',
              codigo_postal: data.user?.codigo_postal || '',
              ciudad: data.user?.ciudad || '',
              additional_attributes: Array.isArray(data.user?.additional_attributes) ? data.user.additional_attributes : []
            });
            setFiles(Array.isArray(data.files) ? data.files : []);
            setSubscriptions(Array.isArray(data.subscriptions) ? data.subscriptions : []);
            setSessions(Array.isArray(data.sessions) ? data.sessions.filter(session => session.user_id === user?.id) : []);
        } catch (error) {
            console.error("Error fetching ficha:", error);
            setProfileData({
              dni: '',
              direccion: '',
              codigo_postal: '',
              ciudad: '',
              additional_attributes: []
            });
            setFiles([]);
            setSubscriptions([]);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateContact = async (e) => {
        e.preventDefault();
        setSavingContact(true);
        try {
            await axios.put(`/client-profile/${user.id}`, {
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
        if (!user?.id) {
            showAlert('No se ha podido identificar tu usuario. Por favor, recarga la página.', true);
            return;
        }

        const file = e.target.files[0];
        if (!file) return;

        setSubmittingFile(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`/client-profile/${user.id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchFicha();
        } catch (error) {
            showAlert("Hubo un problema al subir tu archivo. Verifica el tamaño (máx 10MB) y el formato.", true);
        } finally {
            setSubmittingFile(false);
        }
    };

    const handleLeaveSession = async (session) => {
        if (!user?.id) {
            showAlert('No se ha podido identificar tu usuario. Por favor, recarga la página.', true);
            return;
        }

        if (!window.confirm('¿Estás seguro de que quieres darte de baja de esta clase?')) {
            return;
        }

        setLeavingSessionId(session.id);

        try {
            await axios.post('/Pagos/remove-client', {
                user_id: user.id,
                fecha_hora: session.fecha_registro,
                nombre_clase: session.nombre_clase,
                centro: session.centro
            });
            showAlert('Te has dado de baja de la clase correctamente.');
            fetchFicha();
        } catch (error) {
            console.error('Error abandoning session:', error);
            const message = error.response?.data?.message || 'No se pudo salir de la clase. Intenta de nuevo.';
            showAlert(message, true);
        } finally {
            setLeavingSessionId(null);
        }
    };

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-700">
                <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-200 text-center max-w-md">
                    <h2 className="text-2xl font-black mb-4">Usuario no identificado</h2>
                    <p className="text-sm text-slate-500">Por favor, inicia sesión nuevamente o recarga la página para acceder a tu ficha.</p>
                </div>
            </div>
        );
    }

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
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                            
                            {/* INFO COL (3/12 space) */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => setIsEditingContact(!isEditingContact)}
                                            className="text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                                        >
                                            {isEditingContact ? 'Cancelar' : 'Editar Datos'}
                                        </button>
                                    </div>
                                    <div className="text-center pb-6 border-b border-slate-50">
                                        <div className="w-20 h-20 rounded-full bg-slate-50 mx-auto flex items-center justify-center text-3xl font-black text-[#38C1A3] mb-4 border-2 border-slate-100 shadow-inner">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <h2 className="font-black text-slate-800 text-lg">{user?.name || 'Cliente'}</h2>
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
                                                    <span className="text-slate-600 font-medium truncate">{user?.email || 'Sin email registrado'}</span>
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

                                {/* Atributos / Notas (Compartido) */}
                                <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100/50 space-y-6">
                                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                        <i className="fa-solid fa-notes-medical"></i> Notas del Expediente
                                    </h3>
                                    <div className="space-y-4">
                                        {profileData?.additional_attributes?.length > 0 ? (
                                            profileData.additional_attributes.map((attr, i) => (
                                                <div key={i} className="flex flex-col bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm">
                                                    <span className="text-[10px] font-black text-emerald-700/60 uppercase">{attr.key}</span>
                                                    <span className="text-sm font-bold text-slate-800 mt-1">{attr.value}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6">
                                                <i className="fa-solid fa-comment-slash text-emerald-100 text-3xl mb-3"></i>
                                                <p className="text-xs text-slate-400 italic">No hay notas compartidas en este expediente.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* MAIN COL (8/12 space) - FOCUS ON DOCUMENTS */}
                            <div className="lg:col-span-8">
                                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-full">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Mis Documentos Compartidos</h3>
                                            <p className="text-sm text-slate-500 mt-1">Accede a tus informes, facturas manuales y archivos de seguimiento.</p>
                                        </div>
                                        <div className="relative">
                                            <button 
                                                className="bg-[#38C1A3] hover:bg-teal-500 text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-teal-500/20 active:scale-95 disabled:grayscale"
                                                onClick={() => document.getElementById('file-upload-input').click()}
                                                disabled={submittingFile}
                                            >
                                                {submittingFile ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up text-lg"></i>}
                                                <span>Añadir Archivo</span>
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
                                        <div className="py-24 flex flex-col items-center justify-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                                                <i className="fa-regular fa-folder-open text-4xl text-slate-300"></i>
                                            </div>
                                            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">El expediente digital está vacío</p>
                                            <p className="text-xs text-slate-300 mt-2">Sube tu primer documento usando el botón superior.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {files.map(file => (
                                                <div key={file.id} className="p-6 rounded-[2rem] bg-[#FDFDFF] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group relative">
                                                    <div className="flex items-start justify-between">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500 ${file.file_type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                                                            <i className={file.file_type === 'pdf' ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image'}></i>
                                                        </div>
                                                        <a 
                                                           href={`/client-file/${file.id}/download`}
                                                           className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-[#38C1A3] hover:bg-teal-50 shadow-sm flex items-center justify-center transition-all"
                                                           title="Descargar"
                                                        >
                                                            <i className="fa-solid fa-download"></i>
                                                        </a>
                                                    </div>
                                                    <div className="mt-6">
                                                        <h4 className="font-black text-slate-800 text-sm truncate" title={file.file_name}>{file.file_name}</h4>
                                                        <div className="flex items-center justify-between mt-3">
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">De: {file.uploader?.name || 'Sistema'}</p>
                                                            <span className="text-[9px] font-black text-slate-300">{new Date(file.created_at || Date.now()).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
