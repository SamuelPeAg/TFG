import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/global.css';

export default function NominasEntrenador() {
    const [filtro, setFiltro] = useState('pendiente');
    const [nominas, setNominas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchNominas = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/entrenador/nominas', {
                params: { estado: filtro },
                headers: { 'Accept': 'application/json' }
            });
            setNominas(res.data.nominas || []);
        } catch (error) {
            console.error("Error fetching nominas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNominas();
    }, [filtro]);

    const handleDownload = (id) => {
        window.open(`/entrenador/nominas/${id}/descargar`, '_blank');
    };

    const filteredNominas = nominas.filter(n => {
        const search = searchTerm.toLowerCase();
        return (n.concepto && n.concepto.toLowerCase().includes(search)) ||
            (`${n.mes}/${n.anio}`.includes(search));
    });

    const totalPendiente = nominas.filter(n => n.estado_nomina !== 'pagado').reduce((acc, curr) => acc + parseFloat(curr.importe), 0);
    const totalCobrado = nominas.filter(n => n.estado_nomina === 'pagado').reduce((acc, curr) => acc + parseFloat(curr.importe), 0);

    return (
        <div className="main-content p-4 md:p-8 w-full transition-all duration-300 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">
                        Mis Nóminas
                    </h1>
                    <p className="text-slate-400 mt-1 font-medium">Historial de pagos y recibos.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <input type="text" placeholder="Buscar concepto o mes..."
                        className="pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#4BB7AE] focus:outline-none w-full transition-colors font-medium text-slate-600"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex gap-5">
                    <div className="w-1.5 bg-orange-500 shrink-0"></div>
                    <div className="flex-1 py-6 pr-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pendiente de Cobro</h4>
                        <p className="text-3xl font-black text-slate-800">{filtro === 'pendiente' ? totalPendiente.toFixed(2) : '--'} €</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex gap-5">
                    <div className="w-1.5 bg-green-500 shrink-0"></div>
                    <div className="flex-1 py-6 pr-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Cobrado (Año)</h4>
                        <p className="text-3xl font-black text-slate-800">{filtro === 'pagado' ? totalCobrado.toFixed(2) : '--'} €</p>
                    </div>
                </div>
            </div>

            {/* Tabs Filtro */}
            <div className="flex gap-6 mb-6 border-b border-slate-200 pb-1">
                <button onClick={() => setFiltro('pendiente')}
                    className={`pb-3 text-sm font-bold transition-colors ${filtro === 'pendiente' ? 'text-[#4BB7AE] border-b-2 border-[#4BB7AE]' : 'text-slate-400 hover:text-slate-600'}`}>
                    <i className="fas fa-clock mr-1"></i> Por Pagar
                </button>
                <button onClick={() => setFiltro('pagado')}
                    className={`pb-3 text-sm font-bold transition-colors ${filtro === 'pagado' ? 'text-[#4BB7AE] border-b-2 border-[#4BB7AE]' : 'text-slate-400 hover:text-slate-600'}`}>
                    <i className="fas fa-check-circle mr-1"></i> Pagadas
                </button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Periodo</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Concepto</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Importe</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Fecha Pago</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Estado</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Documento</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-12 text-center text-slate-400"><i className="fas fa-spinner fa-spin mr-2"></i> Cargando datos...</td>
                            </tr>
                        ) : filteredNominas.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-300">
                                        <i className="fas fa-folder-open text-4xl mb-3"></i>
                                        <p className="text-sm font-medium">No se encontraron nóminas en esta sección.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredNominas.map(nomina => (
                            <tr key={nomina.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-6 text-slate-600 font-medium">{nomina.mes}/{nomina.anio}</td>
                                <td className="py-4 px-6 text-slate-800 font-semibold">{nomina.concepto}</td>
                                <td className="py-4 px-6 text-slate-800 font-bold text-lg">{parseFloat(nomina.importe).toFixed(2)} €</td>
                                <td className="py-4 px-6 text-slate-500 text-sm">
                                    {nomina.fecha_pago ? new Date(nomina.fecha_pago).toLocaleDateString('es-ES') : '-'}
                                </td>
                                <td className="py-4 px-6">
                                    {nomina.estado_nomina === 'pagado' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                            <i className="fas fa-check text-[10px]"></i> Pagado
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                                            <i className="fas fa-hourglass-half text-[10px]"></i> Pendiente
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* Acciones */}
                                        <button onClick={() => handleDownload(nomina.id)} className="w-10 h-10 flex items-center justify-center bg-teal-50 text-[#4BB7AE] rounded-xl hover:bg-teal-100 transition-colors shadow-sm" title="Descargar PDF">
                                            <i className="fas fa-file-pdf"></i>
                                        </button>
                                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition-all border border-slate-200">
                                            <i className="fas fa-eye text-[#4BB7AE]"></i> Ver Detalle
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
