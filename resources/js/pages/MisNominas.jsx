import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { DetalleNominaModal, PdfPreviewModal } from '../components/AdminNominasModals';
import PageHeader from '../components/PageHeader';

export default function MisNominas() {
  const [nominas, setNominas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tab, setTab] = useState('pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  
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

  // Filtering logic
  const filteredByYear = nominas.filter(n => n.anio.toString() === selectedYear || selectedYear === 'todos');
  
  const pagadas = filteredByYear.filter(n => n.estado_nomina === 'pagado');
  const pendientes = filteredByYear.filter(n => n.estado_nomina !== 'pagado');

  const pendientesTotal = pendientes.reduce((acc, curr) => acc + parseFloat(curr.importe || 0), 0);
  const pagadasTotal = pagadas.reduce((acc, curr) => acc + parseFloat(curr.importe || 0), 0);

  const activeNominas = tab === 'pendientes' ? pendientes : pagadas;
  const filteredData = activeNominas.filter(n => {
     if (!searchTerm) return true;
     const term = searchTerm.toLowerCase();
     return (n.concepto && n.concepto.toLowerCase().includes(term)) || 
            (n.mes && n.mes.toString().includes(term));
  });

  const availableYears = [...new Set(nominas.map(n => n.anio.toString()))].sort((a, b) => b - a);
  if (!availableYears.includes(currentYear.toString())) availableYears.unshift(currentYear.toString());

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-800">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden transition-all duration-300" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72 w-full">
        <PageHeader 
            title="Mis Nóminas"
            subtitle="Consulta y descarga tus recibos mensuales."
            icon="fa-solid fa-receipt"
            onMenuClick={() => setIsSidebarOpen(true)}
            actions={
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    <div className="relative w-full sm:w-36 group">
                         <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                             <i className="fa-solid fa-calendar text-slate-400 text-xs"></i>
                         </div>
                         <select 
                            value={selectedYear} 
                            onChange={e => setSelectedYear(e.target.value)}
                            className="pl-9 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#38C1A3]/10 focus:border-[#38C1A3] outline-none transition-all font-bold text-slate-600 text-sm shadow-sm appearance-none cursor-pointer"
                         >
                            <option value="todos">Todos los años</option>
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                         </select>
                    </div>

                    <div className="relative w-full sm:w-72 group">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <i className="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-[#38C1A3] text-sm transition-colors"></i>
                         </div>
                         <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por concepto..." 
                               className="pl-11 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#38C1A3]/10 focus:border-[#38C1A3] outline-none transition-all font-bold text-slate-600 placeholder:text-slate-400 text-sm shadow-sm" />
                    </div>
                </div>
            }
        />

        <div className="flex-1 overflow-auto p-6 sm:p-10 scrollbar-hide">
                {/* Summary Cards with Premium Aesthetic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="relative p-8 rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group transition-all hover:scale-[1.02] duration-500">
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl transition-all group-hover:bg-orange-500/10"></div>
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-400 to-orange-600"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Pendiente de Cobro</h4>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">
                                        {pendientesTotal.toFixed(2)}
                                    </p>
                                    <span className="text-2xl text-orange-500 font-black">€</span>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-1 bg-orange-50 text-orange-600 rounded-lg uppercase tracking-wider">Esperando Pago</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 rounded-[24px] bg-orange-50 text-orange-500 flex items-center justify-center text-2xl shadow-inner-white">
                                <i className="fa-solid fa-receipt"></i>
                            </div>
                        </div>
                    </div>

                    <div className="relative p-8 rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group transition-all hover:scale-[1.02] duration-500">
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl transition-all group-hover:bg-teal-500/10"></div>
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#38C1A3] to-teal-600"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Total Cobrado ({selectedYear === 'todos' ? 'Histórico' : selectedYear})</h4>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">
                                        {pagadasTotal.toFixed(2)}
                                    </p>
                                    <span className="text-2xl text-[#38C1A3] font-black">€</span>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-1 bg-teal-50 text-teal-600 rounded-lg uppercase tracking-wider">Confirmadas</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 rounded-[24px] bg-teal-50 text-[#38C1A3] flex items-center justify-center text-2xl shadow-inner-white">
                                <i className="fa-solid fa-circle-check"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs with modern styling */}
                <div className="flex gap-10 mb-8 px-2">
                    <button onClick={() => setTab('pendientes')} className={`group pb-4 text-sm font-black transition-all relative ${tab === 'pendientes' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                        <div className="flex items-center gap-3">
                            <i className={`fa-solid fa-clock-rotate-left transition-transform duration-300 ${tab === 'pendientes' ? 'text-orange-500' : 'group-hover:scale-110'}`}></i>
                            <span className="uppercase tracking-widest">Por Pagar</span>
                            {pendientes.length > 0 && <span className="flex items-center justify-center h-5 min-w-[20px] px-1 bg-orange-500 text-white text-[10px] rounded-full">{pendientes.length}</span>}
                        </div>
                        {tab === 'pendientes' && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full animate-in slide-in-from-left-2 duration-300"></div>}
                    </button>

                    <button onClick={() => setTab('pagadas')} className={`group pb-4 text-sm font-black transition-all relative ${tab === 'pagadas' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                        <div className="flex items-center gap-3">
                            <i className={`fa-solid fa-circle-check transition-transform duration-300 ${tab === 'pagadas' ? 'text-[#38C1A3]' : 'group-hover:scale-110'}`}></i>
                            <span className="uppercase tracking-widest">Pagadas</span>
                        </div>
                        {tab === 'pagadas' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#38C1A3] rounded-full animate-in slide-in-from-left-2 duration-300"></div>}
                    </button>
                </div>

                {/* Table Section */}
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-4">
                        <div className="animate-spin h-12 w-12 border-[5px] border-slate-100 border-t-[#38C1A3] rounded-full shadow-sm"></div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Cargando historial...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-12">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Periodo</th>
                                            <th className="py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Concepto</th>
                                            <th className="py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Importe</th>
                                            <th className="py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha Pago</th>
                                            <th className="py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                            <th className="py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-24 text-center">
                                                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-slate-50 text-slate-200 mb-6 transition-transform hover:scale-110 duration-500">
                                                        <i className="fa-solid fa-folder-open text-4xl"></i>
                                                    </div>
                                                    <p className="text-slate-500 font-black text-lg tracking-tight">No se encontraron nóminas</p>
                                                    <p className="text-slate-400 font-medium text-sm mt-1">Prueba a cambiar el año o término de búsqueda.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map(nomina => (
                                                <tr key={nomina.id} className="hover:bg-slate-50/50 transition-all group cursor-default">
                                                    <td className="py-6 px-8">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-700">{nomina.mes}/{nomina.anio}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(nomina.anio, nomina.mes-1).toLocaleString('es-ES', { month: 'long' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#38C1A3]/10 group-hover:text-[#38C1A3] transition-colors duration-300">
                                                                <i className="fa-solid fa-file-invoice-dollar text-xs"></i>
                                                            </div>
                                                            <span className="text-sm font-black text-slate-800 tracking-tight">{nomina.concepto}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-8">
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-lg font-black text-slate-900 tracking-tighter">{Number(nomina.importe).toFixed(2)}</span>
                                                            <span className="text-sm font-bold text-slate-400">€</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-8 text-sm font-bold text-slate-500">
                                                        {nomina.fecha_pago ? (
                                                            <div className="flex items-center gap-2">
                                                                <i className="fa-solid fa-calendar-check text-[#38C1A3] text-xs"></i>
                                                                {new Date(nomina.fecha_pago).toLocaleDateString('es-ES')}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 italic">Pendiente</span>
                                                        )}
                                                    </td>
                                                    <td className="py-6 px-8">
                                                        {nomina.estado_nomina === 'pagado' ? (
                                                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black tracking-[0.1em] uppercase">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                                Liquidada
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black tracking-[0.1em] uppercase">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                                Procesada
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-6 px-8">
                                                        <div className="flex items-center justify-end gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                                            <button 
                                                                onClick={() => openModal('pdf', nomina)} 
                                                                className="w-11 h-11 flex items-center justify-center bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white rounded-2xl transition-all shadow-sm hover:shadow-sky-500/20 active:scale-90" 
                                                                title="Ver PDF"
                                                            >
                                                                <i className="fa-solid fa-file-pdf text-lg"></i>
                                                            </button>
                                                            <button 
                                                                onClick={() => openModal('detalle', nomina)} 
                                                                className="px-5 py-2.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95 flex items-center gap-2"
                                                            >
                                                                <i className="fa-solid fa-eye text-xs"></i> Detalle
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

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4 mb-12">
                            {filteredData.length === 0 ? (
                                <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100">
                                    <i className="fa-solid fa-folder-open text-3xl text-slate-200 mb-4"></i>
                                    <p className="text-slate-500 font-black text-sm">No hay nóminas</p>
                                </div>
                            ) : (
                                filteredData.map(nomina => (
                                    <div key={nomina.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-5">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(nomina.anio, nomina.mes-1).toLocaleString('es-ES', { month: 'long' })} {nomina.anio}</span>
                                                <h4 className="text-lg font-black text-slate-800 tracking-tight mt-1">{nomina.concepto}</h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-baseline justify-end gap-1">
                                                    <span className="text-2xl font-black text-slate-900 tracking-tighter">{Number(nomina.importe).toFixed(2)}</span>
                                                    <span className="text-sm font-black text-[#38C1A3]">€</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between py-4 border-y border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
                                                {nomina.estado_nomina === 'pagado' ? (
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase mt-1 flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Liquidada
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-amber-600 uppercase mt-1 flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> Procesada
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha Pago</span>
                                                <span className="text-[10px] font-black text-slate-600 mt-1">
                                                    {nomina.fecha_pago ? new Date(nomina.fecha_pago).toLocaleDateString() : 'Pendiente'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => openModal('pdf', nomina)} 
                                                className="flex-1 py-3 bg-sky-50 text-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-sky-100"
                                            >
                                                <i className="fa-solid fa-file-pdf"></i> PDF
                                            </button>
                                            <button 
                                                onClick={() => openModal('detalle', nomina)} 
                                                className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                                            >
                                                <i className="fa-solid fa-eye"></i> Detalle
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
        </div>
      </main>

      {/* Modals with increased z-index to stay above everything */}
      <div className="z-[9999]">
        <DetalleNominaModal isOpen={modals.detalle} onClose={() => closeModal('detalle')} nomina={activeNomina} />
        <PdfPreviewModal isOpen={modals.pdf} onClose={() => closeModal('pdf')} nomina={activeNomina} />
      </div>
    </div>
  );
}
