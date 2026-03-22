import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { DetalleNominaModal, PdfPreviewModal } from '../components/AdminNominasModals';

export default function MisNominas() {
  const [nominas, setNominas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tab, setTab] = useState('pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeNomina, setActiveNomina] = useState(null);
  const [modals, setModals] = useState({ detalle: false, pdf: false });
  
  const fetchNominas = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/mis-nominas', {
        headers: { Accept: 'application/json' }
      });
      setNominas(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNominas(); }, []);

  const openModal = (type, item) => {
    const nominaToPass = { 
        ...item, 
        user: window.AppConfig?.user || { name: 'Entrenador' }
    };
    setActiveNomina(nominaToPass);
    setModals({ ...modals, [type]: true });
  };
  const closeModal = (type) => setModals({ ...modals, [type]: false });

  const pagadas = nominas.filter(n => n.estado_nomina === 'pagado');
  const pendientes = nominas.filter(n => n.estado_nomina !== 'pagado');

  const pendientesTotal = pendientes.reduce((acc, curr) => acc + parseFloat(curr.importe || 0), 0);
  const pagadasTotal = pagadas.reduce((acc, curr) => acc + parseFloat(curr.importe || 0), 0);

  const activeNominas = tab === 'pendientes' ? pendientes : pagadas;
  const filteredData = activeNominas.filter(n => {
     if (!searchTerm) return true;
     const term = searchTerm.toLowerCase();
     return (n.concepto && n.concepto.toLowerCase().includes(term)) || 
            (n.mes && n.mes.toString().includes(term)) ||
            (n.anio && n.anio.toString().includes(term));
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72 w-full">
        <header className="px-6 sm:px-8 py-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex items-center gap-3">
                <button className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3] rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setIsSidebarOpen(true)}>
                    <i className="fa-solid fa-bars text-xl"></i>
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Mis Nóminas</h1>
                    <p className="text-slate-400 mt-1 font-medium text-sm">Historial de pagos y recibos.</p>
                </div>
            </div>

            <div className="relative w-full sm:w-64 group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <i className="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-[#38C1A3] text-sm transition-colors"></i>
                 </div>
                 <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar concepto o mes..." 
                       className="pl-10 pr-4 py-2 w-full bg-white border border-slate-200 rounded-full focus:ring-2 focus:ring-[#38C1A3]/20 focus:border-[#38C1A3] outline-none transition-all font-medium text-slate-600 placeholder:text-slate-400 text-sm shadow-sm" />
            </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 transition-all group-hover:w-2"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Pendiente de Cobro</h4>
                                <p className="text-3xl font-black text-slate-800 tracking-tight">
                                    {pendientesTotal.toFixed(2)} <span className="text-xl text-slate-400 font-bold">€</span>
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-xl">
                                <i className="fas fa-money-bill-wave"></i>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#38C1A3] transition-all group-hover:w-2"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Cobrado (Año)</h4>
                                <p className="text-3xl font-black text-slate-800 tracking-tight">
                                    {pagadasTotal.toFixed(2)} <span className="text-xl text-slate-400 font-bold">€</span>
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-teal-50 text-[#38C1A3] flex items-center justify-center text-xl">
                                <i className="fas fa-check-double"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mb-6 border-b border-slate-200 pb-px">
                    <button onClick={() => setTab('pendientes')} className={`pb-3 text-sm font-bold transition-all relative ${tab === 'pendientes' ? 'text-[#38C1A3]' : 'text-slate-400 hover:text-slate-600'}`}>
                    <i className="fas fa-clock mr-2"></i> Por Pagar
                    {tab === 'pendientes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#38C1A3] rounded-t-full"></div>}
                    </button>
                    <button onClick={() => setTab('pagadas')} className={`pb-3 text-sm font-bold transition-all relative ${tab === 'pagadas' ? 'text-[#38C1A3]' : 'text-slate-400 hover:text-slate-600'}`}>
                    <i className="fas fa-check-circle mr-2"></i> Pagadas
                    {tab === 'pagadas' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#38C1A3] rounded-t-full"></div>}
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="py-20 flex justify-center"><div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-[#38C1A3] rounded-full"></div></div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="facto-table w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Periodo</th>
                                        <th className="py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                                        <th className="py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Importe</th>
                                        <th className="py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Fecha Pago</th>
                                        <th className="py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                        <th className="py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Documento</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-16 text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4">
                                                    <i className="fas fa-folder-open text-2xl"></i>
                                                </div>
                                                <p className="text-slate-500 font-bold">No se encontraron nóminas.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map(nomina => (
                                            <tr key={nomina.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="py-4 px-6 text-sm font-bold text-slate-500" data-label="Periodo">
                                                    {nomina.mes}/{nomina.anio}
                                                </td>
                                                <td className="py-4 px-6 text-sm font-black text-slate-800" data-label="Concepto">
                                                    {nomina.concepto}
                                                </td>
                                                <td className="py-4 px-6 text-lg font-black text-slate-800" data-label="Importe">
                                                    {Number(nomina.importe).toFixed(2)} €
                                                </td>
                                                <td className="py-4 px-6 text-sm font-medium text-slate-500" data-label="Fecha Pago">
                                                    {nomina.fecha_pago ? new Date(nomina.fecha_pago).toLocaleDateString('es-ES') : '-'}
                                                </td>
                                                <td className="py-4 px-6" data-label="Estado">
                                                    {nomina.estado_nomina === 'pagado' ? (
                                                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                            <i className="fas fa-check text-[10px]"></i> PAGADO
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-amber-50 text-amber-600 border border-amber-100">
                                                            <i className="fas fa-hourglass-half text-[10px]"></i> PENDIENTE
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6" data-label="Documento">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openModal('pdf', nomina)} 
                                                                className="w-10 h-10 flex items-center justify-center bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white rounded-xl transition-all shadow-sm" title="Vista Previa PDF">
                                                            <i className="fas fa-file-pdf"></i>
                                                        </button>
                                                        <button onClick={() => openModal('detalle', nomina)} 
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-[11px] tracking-wide font-black uppercase rounded-xl hover:bg-slate-200 transition-colors">
                                                            <i className="fas fa-eye"></i> Detalle
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
        </div>
      </main>

      <DetalleNominaModal isOpen={modals.detalle} onClose={() => closeModal('detalle')} nomina={activeNomina} />
      <PdfPreviewModal isOpen={modals.pdf} onClose={() => closeModal('pdf')} nomina={activeNomina} />
    </div>
  );
}
