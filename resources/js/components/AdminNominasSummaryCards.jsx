import React from 'react';

export default function AdminNominasSummaryCards({ borradores, historial }) {
    
    const pendientesPago = historial.filter(h => h.estado_nomina === 'pendiente_pago');
    const pagadas = historial.filter(h => h.estado_nomina === 'pagado');

    const sumBorradores = borradores.reduce((acc, curr) => acc + Number(curr.importe), 0);
    const sumPendientes = pendientesPago.reduce((acc, curr) => acc + Number(curr.importe), 0);
    const sumPagadas = pagadas.reduce((acc, curr) => acc + Number(curr.importe), 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
            {/* Card 1: Borradores */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Por Revisar</h4>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">{borradores.length}</p>
                        <p className="text-sm font-bold text-orange-500 mt-1">
                            {sumBorradores.toFixed(2)} € est.
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-xl group-hover:scale-110 transition-transform">
                        <i className="fas fa-edit"></i>
                    </div>
                </div>
            </div>

            {/* Card 2: Pendientes Pago */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#38C1A3]"></div>
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Pendiente Pago</h4>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">{pendientesPago.length}</p>
                        <p className="text-sm font-bold text-[#38C1A3] mt-1">
                            {sumPendientes.toFixed(2)} € total
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#38C1A3] text-xl group-hover:scale-110 transition-transform">
                        <i className="fas fa-clock"></i>
                    </div>
                </div>
            </div>

            {/* Card 3: Pagado */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Pagado (Histórico)</h4>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">{pagadas.length}</p>
                        <p className="text-sm font-bold text-emerald-500 mt-1">
                            {sumPagadas.toFixed(2)} €
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 text-xl group-hover:scale-110 transition-transform">
                        <i className="fas fa-check-double"></i>
                    </div>
                </div>
            </div>
        </div>
    );
}
