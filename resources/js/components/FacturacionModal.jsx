import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FacturacionModal({ isOpen, onClose, cellData }) {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && cellData) {
      fetchDetalles();
    } else {
      setClases([]);
    }
  }, [isOpen, cellData]);

  const fetchDetalles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/facturas/clases', {
        headers: { Accept: 'application/json' },
        params: {
          cliente_id: cellData.clienteId,
          entrenador_id: cellData.entrenadorId,
          centro: cellData.filters?.centro,
          anio: cellData.filters?.anio,
          mes: cellData.filters?.mes
        }
      });
      setClases(response.data);
    } catch (error) {
      console.error('Error fetching class details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Desglose de Sesiones</h3>
            {cellData?.cliente && cellData?.entrenador && (
              <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
                <i className="fa-solid fa-user text-[#38C1A3]"></i> {cellData.cliente.name} 
                <span className="text-slate-300">|</span> 
                <i className="fa-solid fa-dumbbell text-[#E65C9C]"></i> {cellData.entrenador.name}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-20">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandTeal"></div>
            </div>
          ) : clases.length > 0 ? (
            <div className="table-container rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                <table className="facto-table w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase tracking-wider text-xs">Fecha</th>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase tracking-wider text-xs">Clase</th>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase tracking-wider text-xs">Centro</th>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase tracking-wider text-xs text-right">Importe</th>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase tracking-wider text-xs text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {clases.map((clase, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-700" data-label="Fecha">
                                    {clase.fecha ? new Date(clase.fecha).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}
                                </td>
                                <td className="px-4 py-3 text-slate-600" data-label="Clase">{clase.nombre_clase || '---'}</td>
                                <td className="px-4 py-3 text-slate-600" data-label="Centro">{clase.centro || '---'}</td>
                                <td className="px-4 py-3 text-right" data-label="Importe">
                                    {clase.importe !== null ? (
                                        <span className="font-black text-[#38C1A3]">{Number(clase.importe).toFixed(2)} €</span>
                                    ) : (
                                        <span className="text-slate-400 font-medium">--</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center" data-label="Estado">
                                    {clase.source === 'pago' || clase.importe !== null ? (
                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-lg tracking-wider">Pagado</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-rose-100 text-rose-600 text-[10px] font-black uppercase rounded-lg tracking-wider">Pendiente</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          ) : (
             <div className="py-10 text-center text-slate-400 font-medium">
               No hay clases registradas para este filtro.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
