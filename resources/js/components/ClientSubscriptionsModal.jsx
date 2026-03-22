import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ClientSubscriptionsModal({ isOpen, user, onClose, onUpdate }) {
  const [availableSuscripciones, setAvailableSuscripciones] = useState([]);
  const [selectedSus, setSelectedSus] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load all available package types
      axios.get('/suscripciones', { headers: { 'Accept': 'application/json' } })
        .then(res => {
          setAvailableSuscripciones(res.data.suscripciones || []);
        })
        .catch(err => console.error("Error loading subscriptions", err));
    } else {
      // reset form
      setSelectedSus('');
      setInitialBalance('');
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedSus) return;
    
    setIsSubmitting(true);
    try {
      await axios.post('/suscripciones-usuarios', {
        id_usuario: user.id,
        id_suscripcion: selectedSus,
        saldo_actual: initialBalance === '' ? null : parseInt(initialBalance, 10),
      }, { headers: { 'Accept': 'application/json' } });
      
      setSelectedSus('');
      setInitialBalance('');
      if (onUpdate) onUpdate(); // refresh user list
    } catch (err) {
      console.error(err);
      alert('Error al asignar la suscripción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handeAdjustBalance = async (susUserId, accion) => {
    try {
        await axios.post(`/suscripciones-usuarios/${susUserId}/ajustar-saldo`, {
            accion: accion,
            cantidad: 1
        }, { headers: { 'Accept': 'application/json' } });
        if (onUpdate) onUpdate();
    } catch (err) {
        console.error(err);
    }
  };

  const handleDeleteSub = async (susUserId) => {
      if(!window.confirm("¿Seguro que deseas eliminar esta suscripción del cliente?")) return;
      try {
        await axios.delete(`/suscripciones-usuarios/${susUserId}`, { headers: { 'Accept': 'application/json' }});
        if (onUpdate) onUpdate();
      } catch (err) {
          console.error(err);
      }
  };

  // Extract current subs
  const userSubs = user.suscripciones || [];

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-8 pb-6 relative text-center">
            {/* Close Button */}
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                title="Cerrar"
            >
                <i className="fa-solid fa-xmark"></i>
            </button>

            {/* Icon Banner */}
            <div className="flex justify-center mb-6 mt-2">
                 <i className="fa-solid fa-ticket-alt text-5xl text-[#38C1A3] drop-shadow-sm rotate-[-5deg]"></i>
            </div>
            
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                Suscripciones de <span className="text-slate-600">{user.name}</span>
            </h2>

            {/* Current Subscriptions List */}
            <div className="mt-6 mb-2 text-left">
                {userSubs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                             <i className="fa-solid fa-info text-slate-400 text-xs"></i>
                        </div>
                        <p className="text-sm italic font-medium">Este cliente no tiene suscripciones asociadas aún.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {userSubs.map(su => (
                            <div key={su.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm capitalize">
                                        {su.suscripcion?.nombre || su.suscripcion?.tipo_credito}
                                    </div>
                                    <div className="text-xs font-semibold text-slate-400 mt-0.5">
                                        Estado: <span className={su.estado === 'activo' ? 'text-emerald-500' : 'text-rose-500'}>{su.estado}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => handeAdjustBalance(su.id, 'dec')}
                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
                                        >
                                            <i className="fas fa-minus text-[10px]"></i>
                                        </button>
                                        <div className="w-10 text-center font-black text-sm text-[#4BB7AE]">
                                            {su.saldo_actual}
                                        </div>
                                        <button 
                                            onClick={() => handeAdjustBalance(su.id, 'inc')}
                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
                                        >
                                            <i className="fas fa-plus text-[10px]"></i>
                                        </button>
                                    </div>

                                    <button 
                                        onClick={() => handleDeleteSub(su.id)}
                                        className="w-8 h-8 rounded-xl bg-white border border-rose-100 text-rose-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition shadow-sm"
                                        title="Eliminar Subscripción"
                                    >
                                        <i className="fas fa-trash-alt text-[11px]"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <hr className="border-slate-100 my-6" />

            {/* Assign New Subscription Form */}
            <form onSubmit={handleAssign} className="text-left space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Asignar Nueva Suscripción</h3>
                    
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                        SELECCIONAR SUSCRIPCIÓN
                    </label>
                    <div className="relative">
                        <select 
                            value={selectedSus}
                            onChange={(e) => setSelectedSus(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#4BB7AE] transition-colors shadow-sm"
                        >
                            <option value="">-- Elige una suscripción --</option>
                            {availableSuscripciones.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.nombre} ({s.creditos_por_periodo} créditos)
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <i className="fas fa-chevron-down text-slate-400 text-xs"></i>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                        SALDO INICIAL (OPCIONAL)
                    </label>
                    <input 
                        type="number"
                        min="0"
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        placeholder="Si se deja vacío, se usará el por defecto"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:border-[#4BB7AE] transition-colors placeholder:text-slate-300 shadow-sm"
                    />
                </div>

                <div className="pt-2">
                    <button 
                        type="submit"
                        disabled={!selectedSus || isSubmitting}
                        className="w-full py-3.5 rounded-xl text-white font-black text-sm tracking-wide bg-[#38C1A3] hover:bg-[#2eaa8f] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'ASIGNANDO...' : 'ASIGNAR SUSCRIPCIÓN'}
                    </button>
                </div>
            </form>

        </div>
      </div>
    </div>
  );
}
