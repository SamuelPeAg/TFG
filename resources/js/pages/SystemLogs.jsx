import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';

export default function SystemLogs() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [status, setStatus] = useState(null);

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/errores?page=${page}`);
            setLogs(res.data.logs || []);
            setPagination(res.data.pagination || { current_page: 1, last_page: 1, total: 0 });
        } catch (error) {
            console.error('Error cargando logs:', error);
            setStatus({ success: false, message: 'Error al cargar los registros del sistema.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchLogs(newPage);
        }
    };

    const handleClearLogs = async () => {
        setClearing(true);
        try {
            const res = await axios.post('/api/admin/errores/clear');
            if (res.data.success) {
                setStatus({ success: true, message: res.data.message });
                setLogs([]);
                setPagination({ current_page: 1, last_page: 1, total: 0 });
            }
        } catch (error) {
            console.error('Error limpiando logs:', error);
            setStatus({ success: false, message: 'Error al limpiar los registros.' });
        } finally {
            setClearing(false);
            setTimeout(() => setStatus(null), 3000);
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'ERROR': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300 font-black';
            case 'EMERGENCY': return 'bg-red-600 text-white border-red-800 font-black';
            case 'WARNING': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
                <PageHeader 
                    title="Registro de Errores"
                    subtitle="Monitor del Sistema"
                    icon="fa-solid fa-bug"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <div className="flex-1 overflow-auto p-4 sm:p-8">
                    <div className="max-w-6xl mx-auto space-y-6 pb-12">
                        
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Logs del Sistema</h2>
                                <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-wider">Total: {pagination.total} errores registrados</p>
                            </div>
                            
                            <Button 
                                onClick={() => setIsConfirmModalOpen(true)}
                                disabled={clearing || pagination.total === 0}
                                className="bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 disabled:opacity-50"
                            >
                                {clearing ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-trash-can mr-2"></i>}
                                LIMPIAR REGISTRO
                            </Button>
                        </div>

                        {status && (
                            <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${status.success ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                <i className={`fa-solid ${status.success ? 'fa-circle-check' : 'fa-circle-exclamation'} text-lg`}></i>
                                <span className="text-sm font-bold">{status.message}</span>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <i className="fa-solid fa-spinner fa-spin text-slate-300 text-4xl"></i>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center flex flex-col items-center">
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                    <i className="fa-solid fa-shield-check text-emerald-400 text-3xl"></i>
                                </div>
                                <h3 className="text-lg font-black text-slate-800">Sistema Saludable</h3>
                                <p className="text-sm text-slate-500 font-bold mt-2">No se han registrado errores recientes en la aplicación.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {logs.map((log, index) => (
                                    <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all overflow-hidden relative">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-slate-100 pb-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getLevelColor(log.level)}`}>
                                                    {log.level}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${log.source === 'FRONTEND' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                    <i className={`fa-solid ${log.source === 'FRONTEND' ? 'fa-desktop' : 'fa-server'} mr-1`}></i>
                                                    {log.source || 'BACKEND'}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400">
                                                    <i className="fa-solid fa-clock mr-1"></i>
                                                    {log.date}
                                                </span>
                                            </div>
                                        </div>

                                        {(log.user || log.url) && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {log.user && (
                                                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                                                        <i className="fa-solid fa-user text-slate-400 text-xs"></i>
                                                        <span className="text-xs font-bold text-slate-700">{log.user}</span>
                                                        {log.role && (
                                                            <span className="text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                                                {log.role}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {log.url && (
                                                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 max-w-full">
                                                        <i className="fa-solid fa-link text-slate-400 text-xs"></i>
                                                        <a href={log.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 hover:underline truncate">
                                                            {log.url}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto custom-scrollbar">
                                            <pre className="text-xs text-rose-300 font-mono whitespace-pre-wrap word-break">
                                                {log.message.length > 500 ? `${log.message.substring(0, 500)}... (truncado)` : log.message}
                                            </pre>
                                        </div>
                                    </div>
                                ))}

                                {/* Paginación */}
                                {pagination.last_page > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-slate-200">
                                        <button 
                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                            disabled={pagination.current_page === 1}
                                            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
                                        >
                                            <i className="fa-solid fa-chevron-left"></i>
                                        </button>
                                        
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-black text-slate-400 px-3 uppercase tracking-widest">
                                                Página {pagination.current_page} de {pagination.last_page}
                                            </span>
                                        </div>

                                        <button 
                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                            disabled={pagination.current_page === pagination.last_page}
                                            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
                                        >
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                    </div>
                </div>
            </main>

            <ConfirmModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleClearLogs}
                title="Limpiar Registro de Errores"
                message="¿Estás seguro de que quieres limpiar todo el registro de errores? Esta acción no se puede deshacer."
                confirmText="SÍ, LIMPIAR"
                cancelText="CANCELAR"
                isDestructive={true}
            />
        </div>
    );
}
