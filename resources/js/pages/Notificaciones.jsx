import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

export default function Notificaciones() {
    const user = window.AppConfig?.user;
    const isAdmin = user?.role === 'admin';

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [loadingTrainers, setLoadingTrainers] = useState(false);
    
    const [form, setForm] = useState({
        titulo: '',
        mensaje: '',
        tipo: 'general',
        destinatario_id: ''
    });
    const [sendToAdmin, setSendToAdmin] = useState(!isAdmin); // Autoseleccionado si no es admin
    const [status, setStatus] = useState(null); // { success: boolean, message: string }

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/notificaciones-entrenador');
            setHistory(res.data);
        } catch (e) {
            console.error('Error cargando historial:', e);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchTrainers = async () => {
        setLoadingTrainers(true);
        try {
            const res = await axios.get('/api/entrenadores-list');
            setTrainers(res.data);
        } catch (e) {
            console.error('Error cargando entrenadores:', e);
        } finally {
            setLoadingTrainers(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchTrainers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        // Si sendToAdmin es true, destinatario_id debe ser null
        const payload = {
            ...form,
            destinatario_id: sendToAdmin ? null : form.destinatario_id
        };

        try {
            const response = await axios.post('/notificaciones-entrenador', payload);
            if (response.data.success) {
                setStatus({ 
                    success: true, 
                    message: sendToAdmin ? '¡Notificación enviada al administrador!' : '¡Mensaje enviado al entrenador!' 
                });
                setForm({ titulo: '', mensaje: '', tipo: 'general', destinatario_id: '' });
                if (!isAdmin) setSendToAdmin(true);
                fetchHistory(); // Recargar historial
            }
        } catch (error) {
            console.error('Error enviando notificación:', error);
            setStatus({ success: false, message: 'Hubo un error al enviar el mensaje. Inténtalo de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
                <PageHeader 
                    title="Centro de Mensajería"
                    subtitle="Comunícate con el equipo"
                    icon="fa-solid fa-comments"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <div className="flex-1 overflow-auto p-4 sm:p-8">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Formulario */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 h-fit">
                                <div className="mb-6">
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Redactar Mensaje</h2>
                                    <p className="text-slate-500 text-xs mt-2 leading-relaxed font-bold uppercase tracking-wider">
                                        Selecciona destinatario y escribe tu mensaje
                                    </p>
                                </div>

                                {status && (
                                    <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${status.success ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                        <i className={`fa-solid ${status.success ? 'fa-circle-check' : 'fa-circle-exclamation'} text-lg`}></i>
                                        <span className="text-sm font-bold">{status.message}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    
                                    {/* Selección de Destinatario */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destinatario</label>
                                        
                                        {!isAdmin ? (
                                            <div className="flex items-center gap-4 mb-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => setSendToAdmin(true)}
                                                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${sendToAdmin ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    <i className="fa-solid fa-user-shield mr-2"></i>
                                                    ADMINISTRACIÓN
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setSendToAdmin(false)}
                                                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${!sendToAdmin ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    <i className="fa-solid fa-users mr-2"></i>
                                                    ENTRENADOR
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 mb-2 flex items-center gap-2">
                                                <i className="fa-solid fa-info-circle"></i>
                                                <span className="text-[10px] font-bold">Como administrador, selecciona un entrenador para enviar un mensaje directo.</span>
                                            </div>
                                        )}

                                        {(!sendToAdmin || isAdmin) && (
                                            <div className="animate-in slide-in-from-top-2 duration-300">
                                                <select 
                                                    name="destinatario_id"
                                                    value={form.destinatario_id}
                                                    onChange={handleChange}
                                                    required={!sendToAdmin || isAdmin}
                                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                                >
                                                    <option value="">Seleccionar entrenador...</option>
                                                    {trainers.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Mensaje</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['general', 'incidencia', 'clase'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setForm(f => ({ ...f, tipo: t }))}
                                                    className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${form.tipo === t ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asunto</label>
                                        <input 
                                            type="text"
                                            name="titulo"
                                            value={form.titulo}
                                            onChange={handleChange}
                                            required
                                            placeholder="Título del mensaje"
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje</label>
                                        <textarea 
                                            name="mensaje"
                                            value={form.mensaje}
                                            onChange={handleChange}
                                            required
                                            rows="4"
                                            placeholder="Escribe aquí los detalles..."
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300 resize-none"
                                        ></textarea>
                                    </div>

                                    <div className="pt-2">
                                        <Button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full justify-center py-4 rounded-xl bg-[#38C1A3] hover:bg-[#2da389] text-white text-xs font-black tracking-widest shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all"
                                        >
                                            {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-paper-plane mr-2"></i>}
                                            {sendToAdmin && !isAdmin ? 'ENVIAR AL ADMIN' : 'ENVIAR MENSAJE'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Historial y Respuestas */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <i className="fa-solid fa-clock-rotate-left text-slate-400"></i>
                                Bandeja de Mensajería
                            </h2>

                            {loadingHistory ? (
                                <div className="flex justify-center py-10">
                                    <i className="fa-solid fa-spinner fa-spin text-slate-300 text-2xl"></i>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 font-bold text-sm">
                                    Aún no hay mensajes en tu historial.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map(notif => {
                                        const isReceived = notif.destinatario_id === user.id;
                                        const isFromAdmin = !notif.entrenador_id; // Si implementáramos admin como remitente nulo, pero aquí el admin es un entrenador con rol.

                                        return (
                                            <div key={notif.id} className={`bg-white rounded-3xl border ${isReceived ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100'} shadow-sm overflow-hidden group hover:shadow-md transition-all`}>
                                                <div className="p-5">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit ${
                                                                notif.tipo === 'incidencia' ? 'bg-rose-100 text-rose-600' : 
                                                                notif.tipo === 'clase' ? 'bg-amber-100 text-amber-600' : 
                                                                'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {notif.tipo}
                                                            </span>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                                                {isReceived ? (
                                                                    <><i className="fa-solid fa-inbox mr-1 text-emerald-500"></i> Recibido de: <span className="text-slate-700">{notif.entrenador?.name}</span></>
                                                                ) : (
                                                                    <><i className="fa-solid fa-paper-plane mr-1 text-blue-500"></i> Enviado a: <span className="text-slate-700">{notif.destinatario?.name || 'Administración'}</span></>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-[10px] text-slate-400 font-bold">{new Date(notif.created_at).toLocaleDateString()}</span>
                                                            {isReceived && (
                                                                <button 
                                                                    onClick={() => {
                                                                        setSendToAdmin(false);
                                                                        setForm(f => ({ 
                                                                            ...f, 
                                                                            destinatario_id: notif.entrenador_id,
                                                                            titulo: `RE: ${notif.titulo}`
                                                                        }));
                                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                    }}
                                                                    className="text-[9px] font-black text-[#38C1A3] hover:underline uppercase"
                                                                >
                                                                    Responder
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <h3 className="text-sm font-black text-slate-800 mb-2">{notif.titulo}</h3>
                                                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{notif.mensaje}</p>

                                                    {/* RESPUESTA DEL ADMIN (Sólo si no es un chat entre entrenadores o si se envió al admin) */}
                                                    {(!notif.destinatario_id || isReceived) && notif.respuesta ? (
                                                        <div className="bg-slate-900 text-white p-4 rounded-2xl relative mt-2 animate-in zoom-in-95 duration-300">
                                                            <div className="absolute -top-2 left-4 w-4 h-4 bg-slate-900 rotate-45"></div>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-5 h-5 rounded-full bg-[#38C1A3] flex items-center justify-center text-[10px] font-black">A</div>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#38C1A3]">RESPUESTA</span>
                                                                </div>
                                                                <span className="text-[9px] text-white/40 font-bold">{new Date(notif.fecha_respuesta).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-xs text-white/90 leading-relaxed font-bold italic">
                                                                "{notif.respuesta}"
                                                            </p>
                                                        </div>
                                                    ) : (!notif.destinatario_id && !notif.respuesta) ? (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 italic">
                                                            <i className="fa-solid fa-clock"></i>
                                                            Esperando respuesta del administrador...
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
