import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import AlertModal from '../components/AlertModal';
import ConfirmModal from '../components/ConfirmModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MiFicha() {
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState({
        dni: '',
        direccion: '',
        ciudad: '',
        codigo_postal: '',
        peso: '',
        altura: ''
    });
    const [files, setFiles] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [additionalAttributes, setAdditionalAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [savingContact, setSavingContact] = useState(false);
    const [savingStatus, setSavingStatus] = useState(false);
    const [editingMeasurementId, setEditingMeasurementId] = useState(null);
    const [submittingFile, setSubmittingFile] = useState(false);

    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', isError: false });
    const showAlert = (message, isError = false, title = isError ? "Error" : "Aviso") => {
        setAlertConfig({ isOpen: true, title, message, isError });
    };
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null, type: null });

    useEffect(() => {
        fetchFicha();
    }, []);

    const fetchFicha = async () => {
        try {
            const res = await axios.get(`/client-profile/${window.AppConfig.user.id}`);
            setUser(res.data.user);
            setProfileData({
                dni: res.data.user.dni || '',
                direccion: res.data.user.direccion || '',
                ciudad: res.data.user.ciudad || '',
                codigo_postal: res.data.user.codigo_postal || '',
                peso: res.data.user.peso || '',
                altura: res.data.user.altura || ''
            });
            setFiles(res.data.files || []);
            setMeasurements(res.data.measurements || []);
            setAdditionalAttributes(res.data.user.additional_attributes || []);
        } catch (error) {
            console.error('Error fetching ficha:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileDataChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSaveContact = async (e) => {
        e.preventDefault();
        setSavingContact(true);
        try {
            await axios.put(`/client-profile/${user.id}`, {
                dni: profileData.dni,
                direccion: profileData.direccion,
                ciudad: profileData.ciudad,
                codigo_postal: profileData.codigo_postal
            });
            setIsEditingContact(false);
            showAlert('Información de contacto actualizada.');
            fetchFicha();
        } catch (error) {
            showAlert('Error al actualizar contacto.', true);
        } finally {
            setSavingContact(false);
        }
    };

    const handleSaveStatus = async (e) => {
        e.preventDefault();
        setSavingStatus(true);
        try {
            if (editingMeasurementId) {
                await axios.put(`/measurements/${editingMeasurementId}`, {
                    peso: profileData.peso,
                    altura: profileData.altura,
                    measured_at: profileData.measured_at || new Date().toISOString().split('T')[0]
                });
                showAlert('Medida actualizada.');
                setEditingMeasurementId(null);
            } else {
                await axios.post(`/client-profile/${user.id}/progress`, {
                    peso: profileData.peso,
                    altura: profileData.altura
                });
                showAlert('¡Progreso guardado!');
            }
            fetchFicha();
        } catch (error) {
            showAlert('Error al guardar progreso.', true);
        } finally {
            setSavingStatus(false);
        }
    };

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSubmittingFile(true);
        const data = new FormData();
        data.append('file', file);
        try {
            await axios.post(`/client-profile/${user.id}/upload`, data);
            fetchFicha();
            showAlert('Archivo subido.');
        } catch (error) {
            showAlert('Error al subir archivo.', true);
        } finally {
            setSubmittingFile(false);
        }
    };

    const executeDeleteMeasurement = async (id) => {
        try {
            await axios.delete(`/measurements/${id}`);
            fetchFicha();
            showAlert('Medida eliminada.');
        } catch (error) {
            showAlert('Error al eliminar medida.', true);
        }
    };

    const weightVal = parseFloat(profileData.peso);
    const heightVal = parseFloat(profileData.altura);
    const currentIMC = (weightVal > 0 && heightVal > 0) ? (weightVal / (heightVal * heightVal)).toFixed(2) : null;

    const getAttrIcon = (type) => {
        switch(type) {
            case 'number': return 'fa-hashtag';
            case 'date': return 'fa-calendar-day';
            case 'boolean': return 'fa-toggle-check';
            case 'note': return 'fa-file-lines';
            case 'image': return 'fa-image';
            default: return 'fa-font';
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-50"><div className="animate-spin h-10 w-10 border-4 border-[#38C1A3] border-t-transparent rounded-full"></div></div>;

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

            <main className="flex-1 lg:ml-72 p-4 md:p-10 transition-all">
                <div className="max-w-7xl mx-auto space-y-10">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button className="lg:hidden p-2 text-slate-500" onClick={() => setIsSidebarOpen(true)}><i className="fa-solid fa-bars text-xl"></i></button>
                            <h1 className="text-3xl font-black tracking-tight">Mi Expediente Digital</h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* COLUMNA INFO IZQ */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                <button 
                                    onClick={() => setIsEditingContact(!isEditingContact)}
                                    className="absolute top-6 right-6 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all z-20"
                                >
                                    {isEditingContact ? 'Cancelar' : 'Editar Datos'}
                                </button>
                                
                                <div className="flex flex-col items-center text-center space-y-4 mb-8">
                                    <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-50 shadow-inner flex items-center justify-center overflow-hidden">
                                        {user?.foto_de_perfil ? <img src={user.foto_de_perfil} alt="perfil" className="w-full h-full object-cover" /> : <span className="text-4xl font-black text-[#38C1A3]">{user?.name?.charAt(0)}</span>}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800">{user?.name}</h2>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">{user?.dni || 'DNI NO ASIGNADO'}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Información de Contacto</h4>
                                    
                                    {isEditingContact ? (
                                        <form onSubmit={handleSaveContact} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">DNI</label>
                                                <input type="text" name="dni" value={profileData.dni} onChange={handleProfileDataChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-400 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Dirección</label>
                                                <input type="text" name="direccion" value={profileData.direccion} onChange={handleProfileDataChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-400 outline-none transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ciudad</label>
                                                    <input type="text" name="ciudad" value={profileData.ciudad} onChange={handleProfileDataChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-400 outline-none transition-all" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">CP</label>
                                                    <input type="text" name="codigo_postal" value={profileData.codigo_postal} onChange={handleProfileDataChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-400 outline-none transition-all" />
                                                </div>
                                            </div>
                                            <button type="submit" disabled={savingContact} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                                                {savingContact ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Guardar Datos'}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 text-slate-600 group/item">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover/item:text-indigo-500 transition-colors"><i className="fa-solid fa-envelope"></i></div>
                                                <span className="text-sm font-bold">{user?.email || 'Sin email'}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-slate-600 group/item">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover/item:text-indigo-500 transition-colors"><i className="fa-solid fa-location-dot"></i></div>
                                                <span className="text-sm font-bold">{profileData.direccion || '---'}{profileData.ciudad ? `, ${profileData.ciudad}` : ''}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-slate-600 group/item">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover/item:text-indigo-500 transition-colors"><i className="fa-solid fa-truck-ramp-box"></i></div>
                                                <span className="text-sm font-bold">CP: {profileData.codigo_postal || '---'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-7xl text-teal-900 pointer-events-none"><i className="fa-solid fa-heart-pulse"></i></div>
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-xl"><i className="fa-solid fa-gauge-high"></i></div>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Progreso Físico</h3>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Seguimiento de peso e IMC</p>
                                        </div>
                                    </div>
                                    {currentIMC && (
                                        <div className={`px-4 py-2 rounded-2xl flex flex-col items-center justify-center border ${currentIMC < 18.5 ? 'bg-rose-50 border-rose-100 text-rose-500' : (currentIMC > 25 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-500')}`}>
                                            <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">Tu IMC</span>
                                            <span className="text-[11px] font-black tracking-widest leading-none mt-0.5">{currentIMC}</span>
                                        </div>
                                    )}
                                </div>
                                <form onSubmit={handleSaveStatus} className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Peso (kg)</label>
                                            <input type="number" step="0.1" value={profileData.peso} onChange={(e) => setProfileData({...profileData, peso: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all" placeholder="0.0" />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Altura (m)</label>
                                            <input type="number" step="0.01" value={profileData.altura} onChange={(e) => setProfileData({...profileData, altura: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all" placeholder="0.00" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={savingStatus} className="w-full py-4 bg-[#38C1A3] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-500 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2">
                                        {savingStatus ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-plus-circle"></i> Guardar Avance</>}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA - DOCUMENTOS Y NOTAS */}
                        <div className="lg:col-span-8 space-y-10">
                            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-full">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Mis Documentos Compartidos</h3>
                                        <p className="text-sm text-slate-500 mt-1 font-medium">Informes, facturas manuales y archivos de seguimiento.</p>
                                    </div>
                                    <button 
                                        className="bg-[#38C1A3] hover:bg-teal-500 text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-teal-500/20"
                                        onClick={() => document.getElementById('file-upload-input').click()}
                                        disabled={submittingFile}
                                    >
                                        {submittingFile ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up text-lg"></i>}
                                        <span>Añadir Archivo</span>
                                    </button>
                                    <input id="file-upload-input" type="file" hidden onChange={onFileChange} />
                                </div>

                                {files.length === 0 ? (
                                    <div className="py-24 flex flex-col items-center justify-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6"><i className="fa-regular fa-folder-open text-4xl text-slate-300"></i></div>
                                        <p className="text-slate-400 font-black text-sm uppercase tracking-widest">El expediente está vacío</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {files.map(file => (
                                            <div key={file.id} className="p-6 rounded-[2rem] bg-[#FDFDFF] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                                <div className="flex items-start justify-between">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${file.file_type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}><i className={file.file_type === 'pdf' ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image'}></i></div>
                                                    <a href={`/client-file/${file.id}/download`} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-[#38C1A3] hover:bg-teal-50 flex items-center justify-center transition-all shadow-sm"><i className="fa-solid fa-download"></i></a>
                                                </div>
                                                <div className="mt-6">
                                                    <h4 className="font-black text-slate-800 text-sm truncate">{file.file_name}</h4>
                                                    <div className="flex items-center justify-between mt-3 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                                        <span>De: {file.uploader?.name || 'Sistema'}</span>
                                                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <section className="bg-emerald-50/30 p-10 rounded-[3rem] border border-emerald-100/50">
                                <h3 className="text-xl font-black text-emerald-800 tracking-tight flex items-center gap-3 mb-8"><i className="fas fa-notes-medical text-emerald-400"></i> Notas del Expediente</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {additionalAttributes.length > 0 ? (
                                        additionalAttributes.map((attr, i) => (
                                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-emerald-50 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <i className={`fa-solid ${getAttrIcon(attr.type)} text-xs text-emerald-400`}></i>
                                                    <span className="text-[10px] font-black text-emerald-700/60 uppercase tracking-widest">{attr.key}</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-700 whitespace-pre-line">{attr.value}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-10 text-center text-emerald-700/40 text-[10px] font-black uppercase tracking-widest">No hay notas compartidas</div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <AlertModal isOpen={alertConfig.isOpen} onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} title={alertConfig.title} message={alertConfig.message} isError={alertConfig.isError} />
            <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, data: null, type: null })} onConfirm={() => confirmModal.type === 'measurement' && executeDeleteMeasurement(confirmModal.data)} title="Borrar Medida" message="¿Estás seguro de que quieres borrar de tu historial esta medida?" isDestructive={true} confirmText="Sí, aceptar" />
        </div>
    );
}
