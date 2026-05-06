import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const SwapClassModal = ({ isOpen, onClose, originalSession, onSwapSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [swapping, setSwapping] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && originalSession) {
            fetchCandidates();
        }
    }, [isOpen, originalSession]);

    const fetchCandidates = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`/booking-swap/${originalSession.id}/candidates`);
            setCandidates(res.data.candidates);
        } catch (err) {
            setError('No se pudieron cargar las clases alternativas.');
        } finally {
            setLoading(false);
        }
    };

    const handleSwap = async () => {
        if (!selectedSession) return;
        setSwapping(true);
        setError(null);
        try {
            await axios.post('/booking-swap/execute', {
                original_pago_id: originalSession.id,
                new_session: selectedSession.session_key
            });
            onSwapSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al procesar el intercambio.');
        } finally {
            setSwapping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Intercambiar Clase</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cambia tu reserva por una similar</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Original Session Info */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Clase Actual</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#38C1A3]">
                                                <i className="fa-solid fa-calendar-check"></i>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{originalSession.nombre_clase}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{originalSession.centro}</p>
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-slate-200/50">
                                            <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                                <i className="fa-regular fa-clock text-[#38C1A3]"></i>
                                                {new Date(originalSession.fecha_registro).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                <span className="text-slate-300 mx-1">•</span>
                                                {new Date(originalSession.fecha_registro).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <i className="fa-solid fa-info-circle"></i> Reglas de Intercambio
                                    </p>
                                    <ul className="text-[10px] font-bold text-indigo-600/80 space-y-2">
                                        <li>• Mismo nivel y tipo de actividad</li>
                                        <li>• Mismo coste en créditos</li>
                                        <li>• Sujeto a disponibilidad de plazas</li>
                                        <li>• Dentro del plazo de cancelación</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Candidate List */}
                            <div className="lg:col-span-8">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center justify-between">
                                    Opciones Disponibles
                                    {loading && <i className="fa-solid fa-spinner fa-spin text-[#38C1A3]"></i>}
                                </h3>

                                {loading ? (
                                    <div className="space-y-3">
                                        {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-3xl" />)}
                                    </div>
                                ) : candidates.length === 0 ? (
                                    <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                                        <i className="fa-solid fa-calendar-xmark text-slate-300 text-3xl mb-4"></i>
                                        <p className="text-slate-400 font-bold text-sm">No hay clases similares disponibles pronto.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pr-2">
                                        {candidates.map((session, idx) => (
                                            <motion.div 
                                                key={idx}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => setSelectedSession(session)}
                                                className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
                                                    selectedSession?.session_key?.fecha_hora === session.session_key.fecha_hora && selectedSession?.session_key?.nombre_clase === session.session_key.nombre_clase
                                                        ? 'border-[#38C1A3] bg-teal-50 shadow-lg shadow-teal-500/5' 
                                                        : 'border-slate-100 bg-white hover:border-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-colors ${
                                                        selectedSession?.session_key?.fecha_hora === session.session_key.fecha_hora && selectedSession?.session_key?.nombre_clase === session.session_key.nombre_clase
                                                            ? 'bg-[#38C1A3] text-white' 
                                                            : 'bg-slate-900 text-white'
                                                    }`}>
                                                        <span className="text-lg font-black leading-none">{new Date(session.fecha_registro).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span className="text-[8px] font-black uppercase opacity-60 mt-1">Hora</span>
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-sm font-black text-slate-800 truncate">{session.nombre_clase}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                                                            <i className="fa-regular fa-calendar"></i>
                                                            {new Date(session.fecha_registro).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                            <span className="text-slate-200 mx-0.5">•</span>
                                                            <i className="fa-solid fa-users"></i> {session.alumnos_count}/{session.capacidad_maxima}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex -space-x-3 overflow-hidden p-0.5 shrink-0 hidden sm:flex">
                                                    {session.alumnos.slice(0, 3).map((alum, i) => (
                                                        <div key={i} className="inline-block w-8 h-8 rounded-full ring-2 ring-white bg-slate-100 overflow-hidden shadow-sm" title={alum.nombre}>
                                                            <img src={alum.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(alum.nombre)}&background=random`} className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                    {session.alumnos.length > 3 && (
                                                        <div className="inline-block w-8 h-8 rounded-full ring-2 ring-white bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                                                            +{session.alumnos.length - 3}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-100 transition-colors group-hover:border-[#38C1A3]">
                                                    <div className={`w-3 h-3 rounded-full transition-all ${
                                                        selectedSession?.session_key?.fecha_hora === session.session_key.fecha_hora && selectedSession?.session_key?.nombre_clase === session.session_key.nombre_clase
                                                            ? 'bg-[#38C1A3] scale-100' 
                                                            : 'bg-transparent scale-0'
                                                    }`} />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-slate-500">
                            <i className="fa-solid fa-shield-halved text-teal-500"></i>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Transacción segura y automática</span>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button 
                                onClick={onClose}
                                className="px-6 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                disabled={!selectedSession || swapping}
                                onClick={handleSwap}
                                className="flex-1 sm:flex-none px-10 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                {swapping ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-right-left"></i>
                                        Confirmar Cambio
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SwapClassModal;
