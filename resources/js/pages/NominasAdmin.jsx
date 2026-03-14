import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/global.css';

export default function NominasAdmin() {
    const today = new Date();
    const [mes, setMes] = useState(today.getMonth() + 1);
    const [anio, setAnio] = useState(today.getFullYear());

    const [borradores, setBorradores] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Filter
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [showGenerarModal, setShowGenerarModal] = useState(false);
    const [dateRange, setDateRange] = useState({
        fecha_inicio: `${anio}-${String(mes).padStart(2, '0')}-01`,
        fecha_fin: new Date(anio, mes, 0).toISOString().split('T')[0]
    });

    const fetchNominas = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/admin/nominas', {
                params: { mes, anio },
                headers: { 'Accept': 'application/json' }
            });
            setBorradores(res.data.borradores || []);
            setHistorial(res.data.historial || []);
        } catch (error) {
            console.error("Error fetching nominas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNominas();
        // Update default date ranges for modals
        setDateRange({
            fecha_inicio: `${anio}-${String(mes).padStart(2, '0')}-01`,
            fecha_fin: new Date(anio, mes, 0).toISOString().split('T')[0]
        });
    }, [mes, anio]);

    const handleGenerar = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setMessage(null);
        try {
            const res = await axios.post('/admin/nominas/generar', {
                mes, anio,
                fecha_inicio: dateRange.fecha_inicio,
                fecha_fin: dateRange.fecha_fin
            }, { headers: { 'Accept': 'application/json' } });
            setMessage({ type: 'success', text: res.data.message });
            setShowGenerarModal(false);
            fetchNominas();
        } catch (error) {
            console.error("Error generating", error);
            setMessage({ type: 'error', text: 'Error al generar nóminas.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esto?')) return;
        setActionLoading(true);
        try {
            const res = await axios.delete(`/admin/nominas/${id}`, { headers: { 'Accept': 'application/json' } });
            setMessage({ type: 'success', text: res.data.message });
            fetchNominas();
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al eliminar.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handlePagar = async (id) => {
        setActionLoading(true);
        try {
            const res = await axios.post(`/admin/nominas/${id}/pagar`, {}, { headers: { 'Accept': 'application/json' } });
            setMessage({ type: 'success', text: res.data.message });
            fetchNominas();
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al marcar como pagada.' });
        } finally {
            setActionLoading(false);
        }
    };

    const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const aniosDisponibles = Array.from({ length: 3 }, (_, i) => today.getFullYear() - i);

    const filteredBorradores = borradores.filter(b => b.user?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredHistorial = historial.filter(h => h.user?.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const pendientesPago = historial.filter(h => h.estado_nomina === 'pendiente_pago');
    const pagados = historial.filter(h => h.estado_nomina === 'pagado');

    return (
        <div className="main-content p-4 md:p-8 w-full transition-all duration-300 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">
                        Gestión de Nóminas
                    </h1>
                    <p className="text-slate-400 mt-1 font-medium text-sm md:text-base">Supervisión y control de pagos a entrenadores</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    {/* Filtros de Mes/Año */}
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border-2 border-slate-100 hover:border-brand-teal/30 transition-all">
                        <div className="flex items-center pl-2 text-slate-400">
                            <i className="fas fa-filter text-xs"></i>
                        </div>
                        <select value={mes} onChange={(e) => setMes(e.target.value)} className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer hover:text-[#4BB7AE] transition-colors py-1.5">
                            {mesesNombres.map((m, idx) => (
                                <option key={idx} value={idx + 1}>{m}</option>
                            ))}
                        </select>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <select value={anio} onChange={(e) => setAnio(e.target.value)} className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer hover:text-[#4BB7AE] transition-colors py-1.5 pr-8">
                            {aniosDisponibles.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>

                    {/* Buscador */}
                    <div className="relative w-full md:w-64">
                        <input type="text" placeholder="Buscar entrenador..."
                            className="pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#4BB7AE] focus:outline-none w-full transition-colors font-medium text-slate-600 shadow-sm"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                    </div>

                    <button onClick={() => setShowGenerarModal(true)}
                        className="w-full md:w-auto group flex items-center justify-center gap-2 bg-gradient-to-r from-[#4BB7AE] to-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-[#4BB7AE]/40 hover:-translate-y-0.5 transition-all duration-200">
                        <i className="fas fa-bolt group-hover:animate-pulse"></i>
                        <span className="whitespace-nowrap">Generar Nóminas</span>
                    </button>
                </div>
            </div>

            {message && (
                <div className={`px-4 py-3 rounded-xl mb-6 flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-red-100 border border-red-200 text-red-800'}`}>
                    <i className={`fas ${message.type === 'success' ? 'fa-check-circle text-green-600' : 'fa-exclamation-circle text-red-600'} text-xl`}></i>
                    {message.text}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex gap-5 group hover:shadow-md transition-all">
                    <div className="w-1.5 bg-orange-500 shrink-0"></div>
                    <div className="flex-1 py-6 pr-6 flex justify-between items-center">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Por Revisar</h4>
                            <p className="text-3xl font-black text-slate-800">{borradores.length}</p>
                            <p className="text-sm font-semibold text-orange-500 mt-1">
                                {borradores.reduce((acc, curr) => acc + parseFloat(curr.importe), 0).toFixed(2)} € est.
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-xl group-hover:scale-110 transition-transform">
                            <i className="fas fa-edit"></i>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex gap-5 group hover:shadow-md transition-all">
                    <div className="w-1.5 bg-teal-500 shrink-0"></div>
                    <div className="flex-1 py-6 pr-6 flex justify-between items-center">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pendiente Pago</h4>
                            <p className="text-3xl font-black text-slate-800">{pendientesPago.length}</p>
                            <p className="text-sm font-semibold text-teal-600 mt-1">
                                {pendientesPago.reduce((acc, curr) => acc + parseFloat(curr.importe), 0).toFixed(2)} € total
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 text-xl group-hover:scale-110 transition-transform">
                            <i className="fas fa-clock"></i>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex gap-5 group hover:shadow-md transition-all">
                    <div className="w-1.5 bg-green-500 shrink-0"></div>
                    <div className="flex-1 py-6 pr-6 flex justify-between items-center">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pagado (Histórico)</h4>
                            <p className="text-3xl font-black text-slate-800">{pagados.length}</p>
                            <p className="text-sm font-semibold text-green-600 mt-1">
                                {pagados.reduce((acc, curr) => acc + parseFloat(curr.importe), 0).toFixed(2)} €
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 text-xl group-hover:scale-110 transition-transform">
                            <i className="fas fa-check-double"></i>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 font-bold text-slate-400"><i className="fas fa-spinner fa-spin mr-2"></i> Cargando datos...</div>
            ) : (
                <>
                    {/* Borradores */}
                    {borradores.length > 0 ? (
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-4 pl-1">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <i className="fas fa-exclamation"></i>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Pendientes de Revisión</h3>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Entrenador</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Periodo</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Importe Calc.</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredBorradores.map(b => (
                                            <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden">
                                                            {b.user?.foto_de_perfil ? (
                                                                <img src={`/storage/${b.user.foto_de_perfil}`} alt={b.user.name} className="h-full w-full object-cover" />
                                                            ) : b.user?.name.charAt(0)}
                                                        </div>
                                                        <span className="font-semibold text-slate-700">{b.user?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-slate-600 font-medium">{b.mes}/{b.anio}</td>
                                                <td className="py-4 px-6 text-slate-800 font-bold text-lg">{parseFloat(b.importe).toFixed(2)} €</td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                                                        <i className="fas fa-pencil-alt text-[10px]"></i> Borrador
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Actions would go here e.g. review modal */}
                                                        <button disabled={actionLoading} onClick={() => handleDelete(b.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors shadow-sm" title="Eliminar">
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 mb-12">
                            <div className="text-5xl text-slate-200 mb-3"><i className="fas fa-clipboard-check"></i></div>
                            <h3 className="text-lg font-bold text-slate-600">Todo al día</h3>
                            <p className="text-slate-400">No hay nóminas pendientes de revisión.</p>
                        </div>
                    )}

                    {/* Historial */}
                    <div>
                        <div className="flex items-center gap-3 mb-4 pl-1">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                <i className="fas fa-history"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Historial de Pagos</h3>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Entrenador</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Periodo</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Importe</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredHistorial.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-slate-400 italic">No hay historial disponible.</td>
                                        </tr>
                                    ) : filteredHistorial.map(h => (
                                        <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-700">{h.user?.name}</div>
                                                <div className="text-xs text-slate-400">{h.concepto}</div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600">{h.mes}/{h.anio}</td>
                                            <td className="py-4 px-6 font-bold text-slate-700">{parseFloat(h.importe).toFixed(2)} €</td>
                                            <td className="py-4 px-6">
                                                {h.estado_nomina === 'pagado' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                                        <i className="fas fa-check text-[10px]"></i> Pagado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                                                        <i className="fas fa-hourglass-half text-[10px]"></i> Pend. Pago
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {h.estado_nomina === 'pendiente_pago' && (
                                                        <button disabled={actionLoading} onClick={() => handlePagar(h.id)} className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Marcar como Pagado">
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    )}
                                                    <button disabled={actionLoading} onClick={() => handleDelete(h.id)} className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Eliminar">
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Modal de Generar Personalizado */}
            {showGenerarModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
                        <button onClick={() => setShowGenerarModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#4BB7AE] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg shadow-[#4BB7AE]/20">
                                <i className="fas fa-calendar-alt"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Cálculo de Nóminas</h2>
                            <p className="text-slate-500 mt-1">Selecciona el rango de sesiones a procesar</p>
                        </div>

                        <form onSubmit={handleGenerar} className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rango de fechas de sesiones</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Desde el día:</label>
                                    <input type="date" value={dateRange.fecha_inicio} onChange={(e) => setDateRange({ ...dateRange, fecha_inicio: e.target.value })} className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 focus:border-[#4BB7AE] outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Hasta el día:</label>
                                    <input type="date" value={dateRange.fecha_fin} onChange={(e) => setDateRange({ ...dateRange, fecha_fin: e.target.value })} className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 focus:border-[#4BB7AE] outline-none" required />
                                </div>
                            </div>

                            <div className="pt-4 text-center">
                                <button type="submit" disabled={actionLoading}
                                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl hover:bg-slate-800 transition-all transform hover:-translate-y-1">
                                    {actionLoading ? <span><i className="fas fa-spinner fa-spin mr-2"></i> Calculando...</span> : 'Procesar y Generar Borradores'}
                                </button>
                                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                                    Se analizarán todas las sesiones entre las fechas indicadas para cada entrenador y se guardarán en el periodo seleccionado arriba.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
