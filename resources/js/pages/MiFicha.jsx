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
                showAlert('Registro físico actualizado.');
                setEditingMeasurementId(null);
            } else {
                await axios.post(`/client-profile/${user.id}/progress`, {
                    peso: profileData.peso,
                    altura: profileData.altura
                });
                showAlert('¡Evolución guardada con éxito!');
            }
            fetchFicha();
        } catch (error) {
            showAlert('No se pudieron guardar las medidas.', true);
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
            showAlert('Archivo subido al expediente.');
        } catch (error) {
            showAlert('Error al subir el archivo.', true);
        } finally {
            setSubmittingFile(false);
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
        <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-slate-800">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

            <main className="flex-1 lg:ml-72 p-6 md:p-12 transition-all">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-5">
                            <button className="lg:hidden p-3 bg-white shadow-sm rounded-2xl text-slate-500 hover:text-[#38C1A3] transition-all" onClick={() => setIsSidebarOpen(true)}>
                                <i className="fa-solid fa-bars-staggered text-xl"></i>
                            </button>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Mi Expediente Digital</h1>
                                <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-wider">Gestión centralizada de tu salud y documentos</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#38C1A3]">
                                <i className="fa-solid fa-shield-halved"></i>
                            </div>
                            <span className="pr-4 text-xs font-black text-slate-600 uppercase tracking-widest">Portal Seguro</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* LEFT COLUMN: Profile & Health */}
                        <div className="lg:col-span-5 space-y-10">
                            
                            {/* Contact Card (Enhanced) */}
                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[10rem] -mr-10 -mt-10 transition-all group-hover:bg-indigo-100/50"></div>
                                
                                <div className="flex flex-col items-center text-center space-y-5 mb-12 relative z-10">
                                    <div className="relative">
                                        <div className="w-28 h-28 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                            {user?.foto_de_perfil ? (
                                                <img src={user.foto_de_perfil} alt="perfil" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
                                                    <span className="text-5xl font-black text-[#38C1A3]">{user?.name?.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center text-white text-xs shadow-lg shadow-emerald-500/20">
                                            <i className="fa-solid fa-check"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
                                        <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 bg-slate-100 rounded-full">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">{user?.dni || 'DNI NO ASIGNADO'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">Información de Contacto</h4>
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                    </div>
                                    
                                    <div className="grid gap-4">
                                        <div className="flex items-center gap-5 p-5 bg-slate-50/50 rounded-[2rem] border border-slate-50 group/item hover:bg-white hover:shadow-md transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover/item:text-indigo-500 transition-colors"><i className="fa-solid fa-envelope text-lg"></i></div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                                                <span className="text-sm font-black text-slate-700">{user?.email || 'Sin email registrado'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5 p-5 bg-slate-50/50 rounded-[2rem] border border-slate-50 group/item hover:bg-white hover:shadow-md transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover/item:text-indigo-500 transition-colors"><i className="fa-solid fa-location-dot text-lg"></i></div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Residencia</span>
                                                <span className="text-sm font-black text-slate-700">{profileData.direccion || '---'}{profileData.ciudad ? `, ${profileData.ciudad}` : ''}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5 p-5 bg-slate-50/50 rounded-[2rem] border border-slate-50 group/item hover:bg-white hover:shadow-md transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover/item:text-indigo-500 transition-colors"><i className="fa-solid fa-truck-ramp-box text-lg"></i></div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Código Postal</span>
                                                <span className="text-sm font-black text-slate-700">{profileData.codigo_postal || '---'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Physical Progress Card */}
                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-8xl text-[#38C1A3] pointer-events-none group-hover:scale-110 transition-transform duration-700"><i className="fa-solid fa-heart-pulse"></i></div>
                                
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-3xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-gauge-high"></i></div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Evolución Física</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control de peso & IMC</p>
                                        </div>
                                    </div>
                                    {currentIMC && (
                                        <div className={`px-5 py-2.5 rounded-[1.2rem] flex flex-col items-center justify-center border-2 ${currentIMC < 18.5 ? 'bg-rose-50 border-rose-100 text-rose-500' : (currentIMC > 25 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-500')}`}>
                                            <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">Tu IMC</span>
                                            <span className="text-base font-black tracking-widest leading-none mt-1">{currentIMC}</span>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSaveStatus} className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Peso (kg)</label>
                                            <div className="relative">
                                                <input type="number" step="0.1" value={profileData.peso} onChange={(e) => setProfileData({...profileData, peso: e.target.value})} className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="0.0" />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">kg</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Altura (m)</label>
                                            <div className="relative">
                                                <input type="number" step="0.01" value={profileData.altura} onChange={(e) => setProfileData({...profileData, altura: e.target.value})} className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="0.00" />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">m</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={savingStatus} className="w-full py-5 bg-[#38C1A3] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] hover:bg-teal-500 shadow-xl shadow-teal-500/30 active:scale-95 transition-all flex items-center justify-center gap-3">
                                        {savingStatus ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-fire-pulse text-lg"></i> Registrar Progreso</>}
                                    </button>
                                </form>

                                {measurements.length > 1 && (
                                    <div className="pt-6 border-t border-slate-100">
                                        <div className="h-44 w-full">
                                            <Line 
                                                data={{
                                                    labels: [...measurements].reverse().map(m => new Date(m.measured_at).toLocaleDateString()),
                                                    datasets: [{
                                                        label: 'Peso',
                                                        data: [...measurements].reverse().map(m => m.peso),
                                                        borderColor: '#38C1A3',
                                                        backgroundColor: 'rgba(56, 193, 163, 0.1)',
                                                        fill: true,
                                                        tension: 0.45,
                                                        pointRadius: 4,
                                                        pointBackgroundColor: '#fff',
                                                        pointBorderColor: '#38C1A3',
                                                        pointBorderWidth: 2
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { display: false }, tooltip: { cornerRadius: 10, padding: 12 } },
                                                    scales: { 
                                                        x: { display: false }, 
                                                        y: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 }, color: '#94A3B8' } } 
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Documents & Notes */}
                        <div className="lg:col-span-7 space-y-10">
                            
                            {/* Documents Center */}
                            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/40 min-h-[500px] flex flex-col group">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 text-indigo-500 flex items-center justify-center text-3xl shadow-inner"><i className="fa-solid fa-folder-tree"></i></div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Expediente Digital</h3>
                                            <p className="text-sm text-slate-400 mt-1 font-bold uppercase tracking-wider">Historial de informes y archivos</p>
                                        </div>
                                    </div>
                                    <button 
                                        className="bg-[#38C1A3] hover:bg-teal-500 text-white px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-4 transition-all shadow-xl shadow-teal-500/30 active:scale-95 group/btn"
                                        onClick={() => document.getElementById('file-upload-input').click()}
                                        disabled={submittingFile}
                                    >
                                        {submittingFile ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-upload text-lg group-btn-hover:animate-bounce"></i>}
                                        <span>Subir Archivo</span>
                                    </button>
                                    <input id="file-upload-input" type="file" hidden onChange={onFileChange} />
                                </div>

                                <div className="flex-1">
                                    {files.length === 0 ? (
                                        <div className="h-full py-32 flex flex-col items-center justify-center bg-slate-50/50 rounded-[3.5rem] border-2 border-dashed border-slate-200 group-hover:bg-white group-hover:border-[#38C1A3] transition-all duration-700">
                                            <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mb-8"><i className="fa-regular fa-folder-open text-5xl text-slate-200 group-hover:text-[#38C1A3]/30 transition-colors"></i></div>
                                            <p className="text-slate-400 font-black text-sm uppercase tracking-[0.3em]">No hay archivos</p>
                                            <p className="text-[10px] text-slate-300 mt-3 font-bold uppercase">Sube tu primer informe para comenzar</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {files.map(file => (
                                                <div key={file.id} className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group/card relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-10 -mt-10 group-hover/card:bg-teal-50 transition-colors"></div>
                                                    
                                                    <div className="flex items-start justify-between relative z-10">
                                                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-sm transition-transform duration-500 group-hover/card:scale-110 ${file.file_type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                                                            <i className={file.file_type === 'pdf' ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image'}></i>
                                                        </div>
                                                        <a href={`/client-file/${file.id}/download`} className="w-12 h-12 rounded-[1.2rem] bg-white border border-slate-100 text-slate-400 hover:text-[#38C1A3] hover:border-[#38C1A3] shadow-sm flex items-center justify-center transition-all group/dl">
                                                            <i className="fa-solid fa-download group-hover/dl:animate-bounce"></i>
                                                        </a>
                                                    </div>
                                                    <div className="mt-8 relative z-10">
                                                        <h4 className="font-black text-slate-800 text-base truncate pr-4" title={file.file_name}>{file.file_name}</h4>
                                                        <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-50">
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Subido por</span>
                                                                <span className="text-[10px] font-black text-slate-500 uppercase">{file.uploader?.name || 'Sistema'}</span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-300 tracking-tighter bg-slate-50 px-3 py-1 rounded-full">{new Date(file.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Medical Notes / Expedient Attributes */}
                            <section className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 p-12 rounded-[4rem] border border-emerald-100/50 shadow-sm">
                                <h3 className="text-2xl font-black text-emerald-900 tracking-tight flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-emerald-400"><i className="fas fa-notes-medical"></i></div>
                                    Notas del Especialista
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {additionalAttributes.length > 0 ? (
                                        additionalAttributes.map((attr, i) => (
                                            <div key={i} className="bg-white p-8 rounded-[3rem] border border-emerald-50 shadow-sm hover:shadow-lg transition-all group/note relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] text-emerald-900 pointer-events-none group-hover/note:scale-125 transition-transform"><i className={`fa-solid ${getAttrIcon(attr.type)} text-2xl`}></i></div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                                    <span className="text-[10px] font-black text-emerald-700/60 uppercase tracking-[0.2em]">{attr.key}</span>
                                                </div>
                                                <p className="text-[15px] font-bold text-slate-700 leading-relaxed whitespace-pre-line">{attr.value}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-16 text-center">
                                            <div className="text-emerald-900/10 text-6xl mb-6"><i className="fa-solid fa-clipboard-question"></i></div>
                                            <p className="text-emerald-800/40 text-[11px] font-black uppercase tracking-[0.3em]">Sin notas compartidas actualmente</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <AlertModal isOpen={alertConfig.isOpen} onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} title={alertConfig.title} message={alertConfig.message} isError={alertConfig.isError} />
            <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, data: null, type: null })} onConfirm={() => confirmModal.type === 'measurement' && executeDeleteMeasurement(confirmModal.data)} title="Confirmar Acción" message="¿Estás seguro de que quieres realizar esta operación?" isDestructive={true} confirmText="Sí, aceptar" />
        </div>
    );
}
