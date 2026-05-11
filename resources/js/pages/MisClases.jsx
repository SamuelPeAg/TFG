import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AlertModal from '../components/AlertModal';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/PageHeader';
import SwapClassModal from '../components/SwapClassModal';
import Toast from '../components/Toast';

export default function MisClases() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const user = window.AppConfig?.user || null;
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ sessions: [], subscriptions: [] });
    const [leavingSessionId, setLeavingSessionId] = useState(null);

    // Alert Setup
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', isError: false });
    const showAlert = (message, isError = false, title = isError ? "Error" : "Aviso") => {
        setAlertConfig({ isOpen: true, title, message, isError });
    };

    // Confirm Modal Setup
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, session: null });

    // Swap Modal Setup
    const [swapModal, setSwapModal] = useState({ isOpen: false, session: null });

    // Toast Setup
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    useEffect(() => {
        if (user?.id) fetchClientData();
    }, [user]);

    const fetchClientData = async () => {
        try {
            const res = await axios.get(`/client-profile/${user.id}`);
            setData(res.data);
        } catch (error) {
            console.error("Error fetching client data:", error);
            showAlert("No se pudo cargar la información de tus clases.", true);
        } finally {
            setLoading(false);
        }
    };

    const executeLeaveSession = async (session, force = false) => {
        if (!session) return;
        setLeavingSessionId(session.id);
        try {
            const res = await axios.post('/Pagos/remove-client', {
                user_id: user.id,
                fecha_hora: session.fecha_registro,
                nombre_clase: session.nombre_clase,
                centro: session.centro,
                force: force
            });
            showToast(res.data.message || 'Te has dado de baja correctamente.', 'info');
            fetchClientData();
            setConfirmModal({ isOpen: false, session: null });
        } catch (error) {
            const data = error.response?.data;
            if (data?.requires_confirmation) {
                // Actualizamos el modal de confirmación con el aviso de crédito
                setConfirmModal({ 
                    isOpen: true, 
                    session: session,
                    message: data.message,
                    isWarning: true,
                    onConfirm: () => executeLeaveSession(session, true)
                });
                return false; // Evita que el modal se cierre
            } else {
                const message = data?.error || data?.message || 'No se pudo procesar la baja.';
                showAlert(message, true);
                return true;
            }
        } finally {
            setLeavingSessionId(null);
        }
    };

    if (!user) return null;

    const now = new Date();
    const upcomingSessions = data.sessions.filter(s => new Date(s.fecha_registro) >= now);
    const pastSessions = data.sessions.filter(s => new Date(s.fecha_registro) < now).reverse();

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
                <PageHeader 
                    title="Mis Actividades"
                    subtitle="Gestión de clases y suscripciones"
                    icon="fa-solid fa-calendar-days"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <div className="flex-1 overflow-auto p-6 lg:p-10 space-y-12">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-[#38C1A3]/20 border-t-[#38C1A3] rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto space-y-10">
                            
                            
                            {/* SUSCRIPCIONES DINÁMICAS (VINCULADAS A BD) */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Estado de mis Suscripciones</h2>
                                </div>
                                
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {data.subscriptions.length > 0 ? (
                                        data.subscriptions.map(subUser => (
                                            <div key={subUser.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
                                                <div className="p-8 pb-4 flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter mb-2 inline-block">
                                                            {subUser.suscripcion?.periodo || 'Personalizado'}
                                                        </span>
                                                        <h3 className="text-xl font-black text-slate-800">{subUser.suscripcion?.nombre || 'Plan de Entrenamiento'}</h3>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-2">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">Saldo Total</p>
                                                        {subUser.saldos_por_tipo && Object.entries(subUser.saldos_por_tipo).map(([tipo, data]) => (
                                                            <div key={tipo} className="flex flex-col items-end bg-teal-50 px-3 py-1 rounded-xl">
                                                                <p className="text-2xl font-black text-[#38C1A3] leading-none">{data.saldo}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{data.nombre}</p>
                                                            </div>
                                                        ))}
                                                        {(!subUser.saldos_por_tipo || Object.keys(subUser.saldos_por_tipo).length === 0) && (
                                                            <p className="text-3xl font-black text-slate-800">0</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Desglose de Lotes / Monedas */}
                                                <div className="px-8 py-6 bg-slate-50/50 border-y border-slate-50">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <i className="fa-solid fa-layer-group"></i> Desglose de Monedas (Caducidad)
                                                    </p>
                                                    <div className="space-y-3">
                                                        {subUser.lotes && subUser.lotes.filter(l => l.cantidad_actual > 0).length > 0 ? (
                                                            subUser.lotes.filter(l => l.cantidad_actual > 0).map(lote => (
                                                                <div key={lote.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center text-xs">
                                                                            <i className="fa-solid fa-coins"></i>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-black text-slate-700">{lote.cantidad_actual} Unidades</p>
                                                                            <p className="text-[9px] text-slate-400 font-bold uppercase">De lote inicial ({lote.cantidad_inicial})</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase">Vence en</p>
                                                                        <p className={`text-[10px] font-black ${new Date(lote.fecha_vencimiento) < new Date(Date.now() + 7*24*60*60*1000) ? 'text-rose-500' : 'text-slate-600'}`}>
                                                                            {new Date(lote.fecha_vencimiento).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-[10px] text-slate-400 italic">No hay lotes activos actualmente.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="p-8 pt-4 bg-white flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-2">
                                                        <i className="fa-solid fa-receipt text-slate-300"></i>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">PRÓXIMA RECARGA:</span>
                                                        <span className="text-xs font-black text-slate-700">{subUser.ultima_recarga ? new Date(subUser.ultima_recarga).toLocaleDateString() : 'Pendiente'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-white col-span-full p-20 rounded-[3rem] border border-dashed border-slate-200 text-center">
                                            <i className="fa-solid fa-ban text-slate-200 text-5xl mb-6"></i>
                                            <p className="text-slate-400 font-black uppercase text-sm">No tienes suscripciones activas vinculadas en este momento.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                
                                {/* PRÓXIMAS CLASES */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-[#38C1A3] rounded-full"></div>
                                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Próximas Sesiones</h2>
                                        </div>
                                        <span className="text-[10px] font-black bg-teal-50 text-[#38C1A3] px-3 py-1 rounded-full">{upcomingSessions.length} Reservas</span>
                                    </div>

                                    <div className="space-y-4">
                                        {upcomingSessions.length > 0 ? (
                                            upcomingSessions.map(session => (
                                                <div 
                                                    key={session.id} 
                                                    onClick={() => {
                                                        console.log("Navegando al calendario con sesión:", session);
                                                        navigate('/calendario', { 
                                                            state: { 
                                                                goToDate: session.fecha_registro,
                                                                openSession: session
                                                            } 
                                                        });
                                                    }}
                                                    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-5 hover:border-[#38C1A3]/50 transition-all group relative overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-[#38C1A3]/5 active:scale-[0.98]"
                                                >
                                                    
                                                    {/* Decorador de Fondo */}
                                                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>

                                                    <div className="flex items-start justify-between relative z-10">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#38C1A3] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100/50">
                                                                    {session.tipo_clase || 'ESTÁNDAR'}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-xl font-black text-slate-800 group-hover:text-[#38C1A3] transition-colors">{session.nombre_clase}</h4>
                                                            <p className="text-sm font-bold text-slate-500 mt-1 capitalize flex items-center gap-2">
                                                                <i className="fa-regular fa-calendar text-[#38C1A3]"></i>
                                                                {new Date(session.fecha_registro).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-900 text-white px-5 py-3 rounded-[1.5rem] text-center shadow-lg shadow-slate-900/10 group-hover:bg-[#38C1A3] transition-colors duration-500">
                                                            <p className="text-xl font-black leading-none">{new Date(session.fecha_registro).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest group-hover:text-white/70">Hora</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-50 relative z-10">
                                                        
                                                        {/* Team & Participants */}
                                                        <div className="flex items-center gap-6">
                                                            {/* Entrenador principal */}
                                                            {session.entrenadores && session.entrenadores.length > 0 && (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                                                                        {session.entrenadores[0].foto ? (
                                                                            <img src={session.entrenadores[0].foto} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center bg-teal-500 text-white text-xs font-black">
                                                                                {session.entrenadores[0].name.charAt(0)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entrenador</p>
                                                                        <p className="text-[11px] font-black text-slate-700 truncate max-w-[100px]">{session.entrenadores[0].name}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Avatar Stack de Alumnos */}
                                                            {session.alumnos && session.alumnos.length > 1 && (
                                                                <div className="flex flex-col">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Compañeros</p>
                                                                    <div className="flex -space-x-3 overflow-hidden p-0.5">
                                                                        {session.alumnos.filter(a => a.id !== user.id).slice(0, 4).map((alum, idx) => (
                                                                            <div key={idx} className="inline-block w-8 h-8 rounded-full ring-2 ring-white bg-slate-100 overflow-hidden shadow-sm" title={alum.name}>
                                                                                {alum.foto ? (
                                                                                    <img src={alum.foto} alt="" className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400 bg-slate-50">
                                                                                        {alum.name.charAt(0)}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                        {session.alumnos.length > 5 && (
                                                                            <div className="inline-block w-8 h-8 rounded-full ring-2 ring-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-500 shadow-sm">
                                                                                +{session.alumnos.length - 5}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <div className="flex flex-col items-end mr-2">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{session.centro}</span>
                                                                <span className="text-[11px] font-black text-slate-700">CLÍNICA</span>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSwapModal({ isOpen: true, session });
                                                                }}
                                                                className="text-[10px] font-black text-[#38C1A3] uppercase hover:bg-teal-50 px-4 py-2.5 rounded-xl border border-transparent hover:border-teal-100 transition-all active:scale-95"
                                                            >
                                                                <span className="flex items-center gap-2"><i className="fa-solid fa-right-left"></i>Intercambiar</span>
                                                            </button>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setConfirmModal({ isOpen: true, session });
                                                                }}
                                                                disabled={leavingSessionId === session.id}
                                                                className="text-[10px] font-black text-rose-500 uppercase hover:bg-rose-50 px-4 py-2.5 rounded-xl border border-transparent hover:border-rose-100 transition-all active:scale-95 disabled:opacity-50"
                                                            >
                                                                {leavingSessionId === session.id ? '...' : (
                                                                    <span className="flex items-center gap-2"><i className="fa-solid fa-user-minus"></i>Darse de baja</span>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-slate-50 rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 text-2xl shadow-inner">
                                                    <i className="fa-solid fa-calendar-xmark"></i>
                                                </div>
                                                <p className="text-slate-500 font-black text-sm uppercase tracking-widest">No tienes clases programadas.</p>
                                                <p className="text-slate-400 text-xs font-medium mt-1">¡Anímate a reservar tu próxima sesión!</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* HISTORIAL DE CLASES */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-slate-300 rounded-full"></div>
                                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sesiones Anteriores</h2>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {pastSessions.length > 0 ? (
                                            pastSessions.slice(0, 10).map(session => (
                                                <div key={session.id} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#38C1A3]/10 group-hover:text-[#38C1A3] transition-colors relative overflow-hidden">
                                                            {session.entrenadores && session.entrenadores.length > 0 && session.entrenadores[0].foto ? (
                                                                <img src={session.entrenadores[0].foto} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100" />
                                                            ) : (
                                                                <i className="fa-solid fa-check"></i>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-black text-slate-700 leading-tight">{session.nombre_clase}</h5>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">
                                                                {new Date(session.fecha_registro).toLocaleDateString()} • {session.entrenadores.map(e => e.name).join(', ')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex items-center gap-3">
                                                        {/* Stack pequeño de compañeros en el historial si los hay */}
                                                        {session.alumnos && session.alumnos.length > 1 && (
                                                            <div className="hidden sm:flex -space-x-2">
                                                                {session.alumnos.filter(a => a.id !== user.id).slice(0, 3).map((alum, i) => (
                                                                    <div key={i} className="w-5 h-5 rounded-full ring-1 ring-white bg-slate-100 overflow-hidden shadow-sm opacity-50">
                                                                        {alum.foto ? <img src={alum.foto} alt="" /> : <div className="text-[6px] text-center mt-1 font-bold">{alum.name.charAt(0)}</div>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <span className="text-[9px] font-black text-slate-300 bg-slate-50 px-2.5 py-1 rounded-lg uppercase border border-slate-100 transition-colors group-hover:text-emerald-500 group-hover:bg-emerald-50 group-hover:border-emerald-100">Completada</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-50">
                                                <p className="text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">Aún no has asistido a ninguna sesión.</p>
                                            </div>
                                        )}
                                    </div>
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

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, session: null })}
                onConfirm={confirmModal.onConfirm || (() => executeLeaveSession(confirmModal.session))}
                title={confirmModal.isWarning ? "¡Atención!" : "Baja de Clase"}
                message={confirmModal.message || `¿Estás seguro de que quieres darte de baja de la clase ${confirmModal.session?.nombre_clase}?`}
                isDestructive={true}
                confirmText={confirmModal.isWarning ? "Darse de baja igualmente" : "Darse de baja"}
            />

            <SwapClassModal
                isOpen={swapModal.isOpen}
                onClose={() => setSwapModal({ isOpen: false, session: null })}
                originalSession={swapModal.session}
                onSwapSuccess={() => {
                    showToast('¡Clase intercambiada con éxito!', 'success');
                    fetchClientData();
                }}
            />

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
