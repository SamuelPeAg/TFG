import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';

export default function MiFicha() {
    const [client, setClient] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Modals state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, message: '', title: '' });
    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', title: '', isError: false });
    const [uploading, setUploading] = useState(false);

    // Specialist notes
    const [specialistNotes, setSpecialistNotes] = useState('');

    useEffect(() => {
        fetchFicha();
    }, []);

    const fetchFicha = async () => {
        setLoading(true);
        try {
            // Get current user first
            const userRes = await axios.get('/configuracion');
            const userId = userRes.data.user.id;

            const res = await axios.get(`/client-profile/${userId}`);
            setClient(res.data.user);
            setFiles(res.data.files || []);
            setSpecialistNotes(res.data.user?.notas_especialista || '');

        } catch (error) {
            console.error('Error fetching ficha:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('nombre', file.name);

        setUploading(true);
        try {
            await axios.post(`/client-profile/${client.id}/upload`, formData);
            fetchFicha();
        } catch (error) {
            setAlertModal({
                isOpen: true,
                title: 'Error',
                message: 'Error al subir el archivo',
                isError: true
            });
        } finally {
            setUploading(false);
        }
    };

    const deleteFile = async (fileId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Archivo',
            message: '¿Seguro que quieres eliminar este archivo?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/client-profile/file/${fileId}`);
                    fetchFicha();
                } catch (error) {
                    setAlertModal({
                        isOpen: true,
                        title: 'Error',
                        message: 'Error al eliminar el archivo',
                        isError: true
                    });
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="flex bg-[#F8FAFC] min-h-screen">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 lg:ml-72 transition-all">
                    <div className="animate-spin h-12 w-12 border-4 border-[#38C1A3] border-t-transparent rounded-full shadow-lg"></div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Cargando expediente...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-slate-800 overflow-x-hidden">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

            <main className="flex-1 lg:ml-72 p-6 md:p-12 transition-all">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-5">
                            <button className="lg:hidden p-3 bg-white shadow-sm rounded-2xl text-slate-500" onClick={() => setIsSidebarOpen(true)}>
                                <i className="fa-solid fa-bars-staggered text-xl"></i>
                            </button>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Mi Ficha</h1>
                                <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-wider">Historial clínico y documentos digitales</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                        {/* DIGITAL DOSSIER / FILES */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col group">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-folder-tree"></i></div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Expediente Digital</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Solo imágenes y vídeos</p>
                                    </div>
                                </div>
                                <label className={`cursor-pointer ${uploading ? 'bg-slate-400' : 'bg-[#38C1A3] hover:bg-teal-500'} text-white px-6 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-lg shadow-teal-500/20 active:scale-95 group-hover:-translate-y-1`}>
                                    {uploading ? (
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                    ) : (
                                        <i className="fa-solid fa-cloud-arrow-up"></i>
                                    )}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{uploading ? 'Subiendo...' : 'Subir Archivo'}</span>
                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/jpeg,image/png,image/gif,image/webp,video/*" />
                                </label>
                            </div>

                            {uploading && (
                                <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                        <div className="h-full bg-gradient-to-r from-[#38C1A3] to-teal-400 animate-progress origin-left"></div>
                                    </div>
                                    <p className="text-[9px] font-black text-[#38C1A3] uppercase tracking-widest mt-2 text-center animate-pulse">Procesando documento...</p>
                                </div>
                            )}

                            <div className="flex-1 space-y-4">
                                {files.length === 0 ? (
                                    <div className="h-64 border-4 border-dashed border-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 space-y-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl shadow-inner"><i className="fa-solid fa-folder-open opacity-30"></i></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sin archivos disponibles</p>
                                    </div>
                                ) : (
                                    files.map(file => (
                                        <div key={file.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group/file">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-400 shadow-sm">
                                                    <i className={`fa-solid ${['mp4', 'mov', 'webm'].includes(file.file_type?.toLowerCase()) ? 'fa-file-video' : 'fa-file-image'} text-xl`}></i>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-700 truncate max-w-[150px] md:max-w-xs">{file.file_name || file.nombre}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(file.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <a href={`/storage/${file.file_path}`} target="_blank" rel="noreferrer" className="p-3 bg-white text-slate-400 hover:text-indigo-500 rounded-xl shadow-sm transition-colors"><i className="fa-solid fa-eye"></i></a>
                                                <button onClick={() => deleteFile(file.id)} className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-xl shadow-sm transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* SPECIALIST NOTES */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-8xl text-indigo-500 pointer-events-none group-hover:scale-110 transition-transform duration-700"><i className="fa-solid fa-notes-medical"></i></div>
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-user-doctor"></i></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Notas del Especialista</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Observaciones y recomendaciones</p>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 min-h-[300px] shadow-inner">
                                    {specialistNotes ? (
                                        <p className="text-slate-600 text-sm leading-relaxed font-medium whitespace-pre-wrap">{specialistNotes}</p>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                                            <i className="fa-solid fa-comment-slash text-4xl mb-4 opacity-20"></i>
                                            <p className="text-[9px] font-black uppercase tracking-widest">Aún no hay notas registradas</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="SÍ, ELIMINAR"
                isDestructive={true}
            />

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                isError={alertModal.isError}
            />
        </div>
    );
}

const styles = `
@keyframes progress {
    0% { transform: scaleX(0); }
    100% { transform: scaleX(1); }
}
.animate-progress {
    animation: progress 2s infinite ease-in-out;
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
