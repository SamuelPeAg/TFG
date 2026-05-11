import React from 'react';

export default function FacturasMatrixTable({ data, loading, onCellClick }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 sm:py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-brandTeal mx-auto mb-3"></div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const { clientes, entrenadores, matrix, clienteTotals, validation_status } = data;

  if (!clientes || clientes.length === 0) {
    return (
      <div className="py-16 sm:py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-50 flex items-center justify-center">
            <i className="fas fa-file-invoice text-slate-200 text-lg sm:text-2xl"></i>
          </div>
          <p className="text-slate-400 font-medium text-xs sm:text-sm">No se han encontrado registros para estos filtros.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50">
        <h4 className="font-black text-slate-700 tracking-tight text-xs sm:text-sm">Clases por Entrenador / Cliente</h4>
      </div>

      {/* Desktop/Tablet View - Matrix Table */}
      <div className="hidden sm:block overflow-x-auto relative shadow-inner">
        <table className="w-full border-collapse text-left whitespace-nowrap min-w-max">
          <thead className="bg-white sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 z-20 bg-white border-b border-r border-slate-200 px-4 sm:px-6 py-3 sm:py-4 text-xs font-black text-slate-400 uppercase tracking-wider min-w-[120px] sm:min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Cliente
              </th>
              {entrenadores.map(e => (
                <th key={e.id} className="border-b border-slate-200 px-3 sm:px-6 py-3 sm:py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">
                  {e.name.split(' ')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientes.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 border-r border-slate-100 px-4 sm:px-6 py-3 sm:py-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-center gap-2 sm:gap-4">
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-700 text-xs sm:text-sm truncate">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 truncate">{c.email}</span>
                        {validation_status && validation_status[c.id] && (
                          <div className="flex items-center gap-1 group/err relative">
                            <i className="fa-solid fa-circle-exclamation text-rose-500 text-[10px] animate-pulse"></i>
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/err:block z-50">
                              <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-xl whitespace-nowrap font-bold">
                                {validation_status[c.id].join(', ')}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-xs flex-shrink-0">
                       <span className="font-bold text-slate-500">{clienteTotals[c.id]?.total_clases || 0}</span>
                       <span className="font-black text-[#38C1A3]">{Number(clienteTotals[c.id]?.total_coste || 0).toFixed(2)}€</span>
                    </div>
                  </div>
                </td>
                {entrenadores.map(e => {
                  const cellData = matrix[c.id]?.[e.id];
                  const count = cellData?.count || 0;
                  const amount = cellData?.amount || 0;
                  
                  return (
                    <td key={e.id} className="px-2 sm:px-3 py-2 sm:py-3 text-center border-l border-slate-50">
                      {count > 0 ? (
                        <button 
                          onClick={() => onCellClick(c.id, e.id, c, e)}
                          className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-teal-50 hover:bg-[#38C1A3] group transition-all cursor-pointer w-full"
                          title="Ver detalles de clases"
                        >
                          <span className="font-black text-[#38C1A3] group-hover:text-white text-xs sm:text-sm transition-colors">{count}</span>
                          <span className="font-bold text-slate-500 group-hover:text-teal-100 text-[10px] sm:text-xs transition-colors">{Number(amount).toFixed(2)}€</span>
                        </button>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1.5 sm:p-2 text-slate-300">
                          <span className="text-xs font-medium">-</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden divide-y divide-slate-100">
        {clientes.map(c => (
          <div key={c.id} className="p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-black text-slate-800 truncate text-sm">{c.name}</p>
                    {validation_status && validation_status[c.id] && (
                        <i className="fa-solid fa-circle-exclamation text-rose-500 text-[10px] animate-pulse"></i>
                    )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">{c.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-[#38C1A3] text-sm">{Number(clienteTotals[c.id]?.total_coste || 0).toFixed(2)}€</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{clienteTotals[c.id]?.total_clases || 0} clases</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Desglose por Entrenador</p>
              <div className="grid grid-cols-1 gap-2">
                {entrenadores.map(e => {
                  const cellData = matrix[c.id]?.[e.id];
                  const count = cellData?.count || 0;
                  const amount = cellData?.amount || 0;
                  
                  if (count === 0) return null;

                  return (
                    <button 
                      key={e.id}
                      onClick={() => onCellClick(c.id, e.id, c, e)}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#38C1A3] hover:bg-white transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-[#38C1A3] border border-slate-100">
                            {e.name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-600 truncate">{e.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400">{count} clases</span>
                        <span className="font-black text-slate-700 text-xs">{Number(amount).toFixed(2)}€</span>
                        <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-[#38C1A3]"></i>
                      </div>
                    </button>
                  );
                })}
                {entrenadores.every(e => (matrix[c.id]?.[e.id]?.count || 0) === 0) && (
                    <p className="text-[10px] italic text-slate-300 py-1">Sin actividad registrada</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
