import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import SearchSelect from '../components/SearchSelect';
import Toast from '../components/Toast';

export default function Notificaciones() {
    const user = window.AppConfig?.user;
    const isAdmin = user?.role === 'admin';

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('system'); // 'system' o 'messages'
    
    // Estados para Mensajería Directa
    const [history, setHistory] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [loadingTrainers, setLoadingTrainers] = useState(false);
    
    // Estados para Notificaciones de Sistema
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [loadingSystem, setLoadingSystem] = useState(true);

    const [form, setForm] = useState({
        titulo: '',
        mensaje: '',
        tipo: 'general',
        destinatario_id: ''
    });
    const [sendToAdmin, setSendToAdmin] = useState(!isAdmin);
    const [status, setStatus] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const fetchData = async () => {
        setLoadingHistory(true);
        setLoadingSystem(true);
        try {
            // Cargar Historial de Mensajes
            const resMessages = await axios.get('/notificaciones-entrenador');
            setHistory(resMessages.data);

            // Cargar Notificaciones de Sistema
            const resSystem = await axios.get('/api/user-notifications');
            setSystemNotifications(resSystem.data.notifications);

            // Cargar Lista de Entrenadores
            const resTrainers = await axios.get('/api/entrenadores-list');
            setTrainers(resTrainers.data);
        } catch (e) {
            console.error('Error cargando datos:', e);
        } finally {
            setLoadingHistory(false);
            setLoadingSystem(false);
            setLoadingTrainers(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.post(`/api/user-notifications/${id}/read`);
            setSystemNotifications(prev => prev.filter(n => n.id !== id));
        } catch (e) {
            console.error('Error al marcar como leída:', e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

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
                fetchData();
            }
        } catch (error) {
            setStatus({ success: false, message: 'Hubo un error al enviar el mensaje.' });
        } finally {
            setLoading(false);
        }
    };

    const getSystemIcon = (type) => {
        switch(type) {
            case 'field_alert': return { icon: 'fa-solid fa-circle-exclamation', color: 'text-amber-500', bg: 'bg-amber-50', title: 'Acción Requerida' };
            case 'nutrition': return { icon: 'fa-solid fa-apple-whole', color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Nutrición' };
            case 'workout': return { icon: 'fa-solid fa-dumbbell', color: 'text-blue-500', bg: 'bg-blue-50', title: 'Entrenamiento' };
            case 'payment': return { icon: 'fa-solid fa-credit-card', color: 'text-rose-500', bg: 'bg-rose-50', title: 'Pagos' };
            default: return { icon: 'fa-solid fa-bell', color: 'text-slate-400', bg: 'bg-slate-50', title: 'Aviso del Sistema' };
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
                <PageHeader 
                    title="Centro de Notificaciones"
                    subtitle="Mantente al día de tu actividad"
                    icon="fa-solid fa-bell"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <div className="flex-1 overflow-auto p-4 sm:p-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                        
                        {/* Tabs Premium */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                            <div className="flex p-1 bg-slate-200/50 rounded-2xl w-fit">
                                <button 
                                    onClick={() => setActiveTab('system')}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'system' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <i className="fa-solid fa-bolt-lightning"></i>
                                    Avisos {systemNotifications.length > 0 && <span className="bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] animate-pulse">{systemNotifications.length}</span>}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('messages')}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'messages' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <i className="fa-solid fa-envelope"></i>
                                    Mensajería
                                </button>
                            </div>

                            {activeTab === 'system' && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => showToast('¡Prueba de notificación exitosa! ✨', 'info')}
                                        className="px-4 py-2 bg-slate-800 text-white text-[10px] font-black uppercase rounded-xl hover:bg-slate-700 transition-all"
                                    >
                                        <i className="fa-solid fa-eye mr-2"></i>
                                        Probar UI
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                await axios.post('/api/user-notifications/toggle-field-alert', {
                                                    user_id: user.id,
                                                    field: 'peso',
                                                    message: '¡Hola! Es hora de actualizar tu peso semanal para que la IA ajuste tu dieta. 🍎'
                                                });
                                                showToast('¡Simulación de IA enviada con éxito! 🚀', 'success');
                                                fetchData();
                                            } catch (e) { 
                                                console.error(e); 
                                                showToast('Error al conectar con el servidor ❌', 'error');
                                            }
                                        }}
                                        className="px-4 py-2 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
                                    >
                                        <i className="fa-solid fa-vial mr-2"></i>
                                        Simular Notificación IA
                                    </button>
                                </div>
                            )}
                        </div>

                        {activeTab === 'system' ? (
                            <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-500">
                                {loadingSystem ? (
                                    <div className="flex justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                                    </div>
                                ) : systemNotifications.length === 0 ? (
                                    <div className="bg-white p-20 rounded-[3rem] border border-dashed border-slate-200 text-center flex flex-col items-center">
                                        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center text-3xl mb-6">
                                            <i className="fa-solid fa-check-double"></i>
                                        </div>
                                        <p className="text-lg font-black text-slate-400">¡Estás al día!</p>
                                        <p className="text-sm text-slate-300 font-bold">No tienes avisos pendientes por ahora.</p>
                                    </div>
                                ) : (
                                    systemNotifications.map(notif => {
                                        const config = getSystemIcon(notif.type);
                                        return (
                                            <div key={notif.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex items-center gap-6 relative overflow-hidden">
                                                <div className={`w-16 h-16 ${config.bg} ${config.color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                    <i className={config.icon}></i>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>{config.title}</span>
                                                        <span className="text-[10px] text-slate-300 font-bold">•</span>
                                                        <span className="text-[10px] text-slate-400 font-bold">{new Date(notif.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-slate-700 font-bold leading-relaxed">{notif.message}</p>
                                                </div>
                                                <button 
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Marcar como leída"
                                                >
                                                    <i className="fa-solid fa-check"></i>
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
                                
                                {/* Formulario */}
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                                        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
                                            <i className="fa-solid fa-pen-nib text-indigo-500"></i>
                                            Nuevo Mensaje
                                        </h2>

                                        {status && (
                                            <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 animate-pulse ${status.success ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                                <i className={`fa-solid ${status.success ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                                                <span className="text-xs font-bold">{status.message}</span>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setSendToAdmin(true)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${sendToAdmin ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>ADMIN</button>
                                                <button type="button" onClick={() => setSendToAdmin(false)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${!sendToAdmin ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>COACH</button>
                                            </div>

                                            {(!sendToAdmin || isAdmin) && (
                                                <SearchSelect 
                                                    name="destinatario_id"
                                                    options={trainers.map(t => ({ value: t.id, label: t.name }))}
                                                    value={form.destinatario_id}
                                                    onChange={(e) => setForm(prev => ({ ...prev, destinatario_id: e.target.value }))}
                                                    placeholder="Seleccionar destinatario..."
                                                    icon="fa-solid fa-user-tie"
                                                />
                                            )}

                                            <input 
                                                type="text"
                                                name="titulo"
                                                value={form.titulo}
                                                onChange={(e) => setForm({...form, titulo: e.target.value})}
                                                placeholder="Asunto"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                                required
                                            />

                                            <textarea 
                                                name="mensaje"
                                                value={form.mensaje}
                                                onChange={(e) => setForm({...form, mensaje: e.target.value})}
                                                rows="4"
                                                placeholder="¿En qué podemos ayudarte?"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all resize-none"
                                                required
                                            ></textarea>

                                            <Button type="submit" disabled={loading} className="w-full justify-center py-5 bg-indigo-500 hover:bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                                                {loading ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
                                            </Button>
                                        </form>
                                    </div>
                                </div>

                                {/* Bandeja de Mensajes */}
                                <div className="lg:col-span-7 space-y-6">
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3 ml-4">
                                        <i className="fa-solid fa-inbox text-slate-400"></i>
                                        Bandeja de Entrada
                                    </h2>

                                    {loadingHistory ? (
                                        <div className="flex justify-center py-20"><i className="fa-solid fa-spinner fa-spin text-slate-300 text-3xl"></i></div>
                                    ) : history.length === 0 ? (
                                        <div className="bg-white p-16 rounded-[3rem] border border-dashed border-slate-200 text-center font-bold text-slate-400">Historial vacío.</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {history.map(notif => {
                                                const isReceived = notif.destinatario_id === user.id;
                                                return (
                                                    <div key={notif.id} className={`bg-white p-6 rounded-[2.5rem] border ${isReceived ? 'border-indigo-100 bg-indigo-50/10 shadow-indigo-500/5 shadow-xl' : 'border-slate-100'} group hover:scale-[1.01] transition-all`}>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">{isReceived ? 'RECIBIDO' : 'ENVIADO'}</span>
                                                                <h4 className="text-sm font-black text-slate-800 mt-2">{notif.titulo}</h4>
                                                                <p className="text-[10px] text-slate-400 font-bold mt-1">
                                                                    {isReceived ? `De: ${notif.entrenador?.name}` : `A: ${notif.destinatario?.name || 'Administración'}`} • {new Date(notif.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            {isReceived && (
                                                                <button onClick={() => {setActiveTab('messages'); setForm({...form, destinatario_id: notif.entrenador_id, titulo: `RE: ${notif.titulo}`}); window.scrollTo({top: 0, behavior: 'smooth'})}} className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all">
                                                                    <i className="fa-solid fa-reply"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 leading-relaxed italic">"{notif.mensaje}"</p>
                                                        
                                                        {notif.respuesta && (
                                                            <div className="mt-4 p-4 bg-slate-900 text-white rounded-2xl relative">
                                                                <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-900 rotate-45"></div>
                                                                <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Respuesta del Admin</p>
                                                                <p className="text-xs font-bold leading-relaxed">{notif.respuesta}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}

                    </div>
                </div>
            </main>

            {toast.show && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ ...toast, show: false })} 
                />
            )}
        </div>
    );
}
