import React from 'react';

export function BorradoresTable({ borradores, onPreview, onRevisar, onDelete }) {
    if (borradores.length === 0) {
        return (
            <div className="mb-12">
               <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="text-5xl text-slate-200 mb-3"><i className="fas fa-clipboard-check"></i></div>
                  <h3 className="text-lg font-bold text-slate-600">Todo al día</h3>
                  <p className="text-slate-400 text-sm mt-1">No hay nóminas pendientes de revisión.</p>
               </div>
            </div>
        );
    }

    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-4 pl-1">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                    <i className="fas fa-exclamation text-sm"></i>
                </div>
                <h3 className="text-lg font-black text-slate-700 tracking-tight">Pendientes de Revisión</h3>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="facto-table w-full text-left whitespace-nowrap md:min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="py-3.5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider">Entrenador</th>
                            <th className="py-3.5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider">Periodo</th>
                            <th className="py-3.5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider">Importe Calc.</th>
                            <th className="py-3.5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider">Estado</th>
                            <th className="py-3.5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {borradores.map(nomina => (
                            <tr key={nomina.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-6" data-label="Entrenador">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-slate-200">
                                            {nomina.user?.foto_de_perfil ? (
                                                <img src={`/storage/${nomina.user.foto_de_perfil}`} alt={nomina.user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                nomina.user?.name ? nomina.user.name.charAt(0).toUpperCase() : 'U'
                                            )}
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm">{nomina.user?.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-6 text-slate-500 font-medium text-sm" data-label="Periodo">{nomina.mes}/{nomina.anio}</td>
                                <td className="py-3 px-6 text-slate-800 font-extrabold" data-label="Importe Calc.">{Number(nomina.importe).toFixed(2)} €</td>
                                <td className="py-3 px-6" data-label="Estado">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-100">
                                        <i className="fas fa-pencil-alt"></i> Borrador
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-right" data-label="Acciones">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => onPreview(nomina)}
                                                className="w-8 h-8 flex items-center justify-center bg-slate-50 text-[#38C1A3] rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors border border-slate-100" title="Vista Previa PDF">
                                            <i className="fas fa-file-pdf"></i>
                                        </button>

                                        <button onClick={() => onRevisar(nomina)}
                                                className="px-3 py-1.5 bg-slate-800 text-white text-[11px] uppercase tracking-wider font-bold rounded-lg shadow-sm hover:bg-slate-700 transition-all">
                                            Revisar
                                        </button>

                                        <button onClick={() => onDelete(nomina.id)}
                                                className="w-8 h-8 flex items-center justify-center bg-slate-50 text-rose-400 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors border border-slate-100" title="Eliminar Borrador">
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
    );
}

export function HistorialTable({ historial, onPreview, onVerDetalles, onPagar, onDelete }) {
    return (
        <div>
            <div className="flex items-center gap-3 mb-4 pl-1">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
                    <i className="fas fa-history text-sm"></i>
                </div>
                <h3 className="text-lg font-black text-slate-700 tracking-tight">Historial de Pagos</h3>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="facto-table w-full text-left whitespace-nowrap md:min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="py-3.5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider">Entrenador</th>
                            <th className="py-3.5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider">Periodo</th>
                            <th className="py-3.5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider">Importe</th>
                            <th className="py-3.5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider">Estado</th>
                            <th className="py-3.5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {historial.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-10 text-center text-slate-400 font-medium text-sm">No hay historial disponible.</td>
                            </tr>
                        ) : (
                            historial.map(nomina => (
                                <tr key={nomina.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 px-6" data-label="Entrenador">
                                        <div className="font-bold text-slate-700 text-sm">{nomina.user?.name}</div>
                                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">{nomina.concepto}</div>
                                    </td>
                                    <td className="py-3 px-6 text-slate-500 font-medium text-sm" data-label="Periodo">{nomina.mes}/{nomina.anio}</td>
                                    <td className="py-3 px-6 text-slate-800 font-extrabold" data-label="Importe">{Number(nomina.importe).toFixed(2)} €</td>
                                    <td className="py-3 px-6" data-label="Estado">
                                        {nomina.estado_nomina === 'pagado' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                <i className="fas fa-check"></i> Pagado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-600 border border-sky-100">
                                                <i className="fas fa-hourglass-half"></i> Pend. Pago
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-6 text-right" data-label="Acciones">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => onPreview(nomina)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-[#38C1A3] border border-slate-100 hover:bg-teal-50 transition-colors" title="Vista Previa PDF">
                                                <i className="fas fa-file-pdf"></i>
                                            </button>

                                            <button onClick={() => onVerDetalles(nomina)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-indigo-500 border border-slate-100 hover:bg-indigo-50 transition-colors" title="Ver Detalles">
                                                <i className="fas fa-eye"></i>
                                            </button>

                                            {nomina.estado_nomina === 'pendiente_pago' && (
                                                <button onClick={() => onPagar(nomina.id)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Marcar como Pagado">
                                                    <i className="fas fa-check"></i>
                                                </button>
                                            )}
                                            
                                            <button onClick={() => onDelete(nomina.id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-rose-400 border border-slate-100 hover:bg-rose-50 transition-colors" title="Eliminar">
                                                <i className="fas fa-trash-alt"></i>
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
    );
}
