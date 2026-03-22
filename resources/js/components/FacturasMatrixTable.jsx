import React from 'react';

export default function FacturasMatrixTable({ data, loading, onCellClick }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandTeal"></div>
      </div>
    );
  }

  const { clientes, entrenadores, matrix, clienteTotals } = data;

  if (!clientes || clientes.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
            <i className="fas fa-file-invoice text-slate-200 text-2xl"></i>
          </div>
          <p className="text-slate-400 font-medium">No se han encontrado registros para estos filtros.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h4 className="font-black text-slate-700 tracking-tight">Clases por Entrenador / Cliente</h4>
      </div>
      <div className="overflow-x-auto relative shadow-inner">
        <table className="w-full border-collapse text-left whitespace-nowrap min-w-max">
          <thead className="bg-white sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 z-20 bg-white border-b border-r border-slate-200 px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider min-w-[150px] sm:min-w-[250px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Cliente
              </th>
              {entrenadores.map(e => (
                <th key={e.id} className="border-b border-slate-200 px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">
                  {e.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientes.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 border-r border-slate-100 px-6 py-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm">{c.name}</span>
                      <span className="text-xs text-slate-400">{c.email}</span>
                    </div>
                    <div className="flex flex-col items-end text-xs">
                       <span className="font-bold text-slate-500">{clienteTotals[c.id]?.total_clases || 0} clases</span>
                       <span className="font-black text-[#38C1A3]">{Number(clienteTotals[c.id]?.total_coste || 0).toFixed(2)} €</span>
                    </div>
                  </div>
                </td>
                {entrenadores.map(e => {
                  const cellData = matrix[c.id]?.[e.id];
                  const count = cellData?.count || 0;
                  const amount = cellData?.amount || 0;
                  
                  return (
                    <td key={e.id} className="px-3 py-3 text-center border-l border-slate-50">
                      {count > 0 ? (
                        <button 
                          onClick={() => onCellClick(c.id, e.id, c, e)}
                          className="flex flex-col items-center justify-center p-2 rounded-xl bg-teal-50 hover:bg-[#38C1A3] group transition-all cursor-pointer w-full"
                          title="Ver detalles de clases"
                        >
                          <span className="font-black text-[#38C1A3] group-hover:text-white text-sm transition-colors">{count} clases</span>
                          <span className="font-bold text-slate-500 group-hover:text-teal-100 text-xs transition-colors">{Number(amount).toFixed(2)} €</span>
                        </button>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-slate-300">
                          <span className="text-sm font-medium">0</span>
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
    </div>
  );
}
