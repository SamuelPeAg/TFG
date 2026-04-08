import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from './Button';

export default function ClientSubscriptionsModal({ isOpen, user, onClose, onUpdate }) {
  // Navigation State: 'list' | 'select' | 'config'
  const [step, setStep] = useState('list');
  
  const [availableSuscripciones, setAvailableSuscripciones] = useState([]);
  const [selectedSus, setSelectedSus] = useState(null);
  
  // Form Data for New Subscription
  const [formData, setFormData] = useState({
    dia_recarga: 1,
    fecha_vencimiento_suscripcion: '',
    pago_adelantado: false,
    confirmar_ahora: true,
    metodo_pago: 'Efectivo',
    saldo_inicial: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSuscripciones();
      setStep('list');
    } else {
      resetForm();
    }
  }, [isOpen]);

  const fetchSuscripciones = async () => {
    try {
      const res = await axios.get('/suscripciones', { headers: { 'Accept': 'application/json' } });
      setAvailableSuscripciones(res.data.suscripciones || []);
    } catch (err) {
      console.error("Error loading subscriptions", err);
    }
  };

  const resetForm = () => {
    setStep('list');
    setSelectedSus(null);
    setFormData({
      dia_recarga: 1,
      fecha_vencimiento_suscripcion: '',
      pago_adelantado: false,
      confirmar_ahora: true,
      metodo_pago: 'Efectivo',
      saldo_inicial: ''
    });
  };

  if (!isOpen || !user) return null;

  const handleAssign = async () => {
    if (!selectedSus) return;
    
    setIsSubmitting(true);
    try {
      // 1. Crear suscripción
      const res = await axios.post('/suscripciones-usuarios', {
        id_usuario: user.id,
        id_suscripcion: selectedSus.id,
        dia_recarga: formData.dia_recarga,
        fecha_vencimiento_suscripcion: formData.fecha_vencimiento_suscripcion,
        pago_adelantado: formData.pago_adelantado,
        saldo_actual: formData.confirmar_ahora ? (formData.saldo_inicial || selectedSus.creditos_por_periodo) : 0
      }, { headers: { 'Accept': 'application/json' } });
      
      const newSubUser = res.data.suscripcion_usuario;

      // 2. Si se marcó confirmar ahora, llamar al endpoint de pago
      if (formData.confirmar_ahora && newSubUser) {
        await axios.post(`/suscripciones-usuarios/${newSubUser.id}/confirmar-pago`, {
            metodo_pago: formData.metodo_pago
        }, { headers: { 'Accept': 'application/json' } });
      }

      resetForm();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert('Error al procesar la suscripción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayment = async (susUserId) => {
    if (!window.confirm("¿Confirmar pago y entregar créditos de este periodo?")) return;
    try {
        await axios.post(`/suscripciones-usuarios/${susUserId}/confirmar-pago`, {
            metodo_pago: 'Efectivo' // Por defecto efectivo desde lista rápida
        }, { headers: { 'Accept': 'application/json' } });
        if (onUpdate) onUpdate();
    } catch (err) {
        console.error(err);
        alert("Error al confirmar pago.");
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

  const userSubs = user.suscripciones || [];

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-8 relative">
            {/* Close Button */}
            <button 
                onClick={onClose} 
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-10"
            >
                <i className="fa-solid fa-xmark"></i>
            </button>

            {/* STEP: LIST */}
            {step === 'list' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#38C1A3]">
                             <i className="fa-solid fa-ticket-alt text-xl"></i>
                        </div>
                        <div className="text-left">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Suscripciones</h2>
                            <p className="text-sm font-bold text-slate-400">{user.name}</p>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {userSubs.length === 0 ? (
                            <div className="py-12 text-center bg-slate-50 rounded-[24px] border border-dashed border-slate-200">
                                <p className="text-slate-400 text-sm font-bold">Sin suscripciones activas</p>
                            </div>
                        ) : (
                            userSubs.map(su => (
                                <div key={su.id} className="p-4 bg-white border border-slate-100 rounded-[20px] shadow-sm hover:border-teal-100 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-left">
                                            <div className="font-black text-slate-800 text-sm capitalize">
                                                {su.suscripcion?.nombre || "Plan Personalizado"}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${su.estado === 'activo' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                                    {su.estado}
                                                </span>
                                                {su.dia_recarga && (
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">
                                                        Recarga: Día {su.dia_recarga}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-lg font-black text-[#38C1A3]">{su.saldo_actual}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">CRÉDITOS</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 border-t border-slate-50 pt-3">
                                        <button 
                                            onClick={() => handleConfirmPayment(su.id)}
                                            className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm shadow-teal-200 flex items-center justify-center gap-2"
                                        >
                                            <i className="fa-solid fa-check-circle"></i>
                                            Confirmar Pago
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSub(su.id)}
                                            className="w-10 h-10 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all flex items-center justify-center"
                                        >
                                            <i className="fa-solid fa-trash-alt text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-8">
                        <Button 
                            onClick={() => setStep('select')}
                            variant="primary"
                            className="w-full py-4 rounded-[20px] text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-500/20"
                            icon="fa-solid fa-plus"
                        >
                            Nueva suscripción
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP: SELECT PLAN */}
            {step === 'select' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-left mb-8">
                        <button onClick={() => setStep('list')} className="text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-2 text-xs font-bold transition-colors">
                            <i className="fa-solid fa-arrow-left"></i> Volver al listado
                        </button>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Elegir Plan</h2>
                        <p className="text-sm font-bold text-slate-400">Selecciona el tipo de abono para {user.name}</p>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {availableSuscripciones.map(s => (
                            <button 
                                key={s.id}
                                onClick={() => {
                                    setSelectedSus(s);
                                    setStep('config');
                                }}
                                className="w-full p-5 text-left bg-slate-50 border-2 border-transparent hover:border-teal-400 hover:bg-white rounded-[24px] transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-black text-slate-800 group-hover:text-teal-600 mb-1">{s.nombre}</div>
                                        <div className="text-xs font-bold text-slate-400">{s.creditos_por_periodo} créditos / {s.periodo}</div>
                                    </div>
                                    <div className="text-lg font-black text-slate-800">{s.precio}€</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP: CONFIGURATION */}
            {step === 'config' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-left mb-8">
                        <button onClick={() => setStep('select')} className="text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-2 text-xs font-bold transition-colors">
                            <i className="fa-solid fa-arrow-left"></i> Cambiar plan
                        </button>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Configuración</h2>
                        <p className="text-sm font-bold text-slate-400">Ajusta los detalles de {selectedSus?.nombre}</p>
                    </div>

                    <div className="space-y-6 text-left">
                        {/* Dia Recarga */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Día de Recarga Semanal</label>
                            <div className="grid grid-cols-7 gap-2">
                                {[1,2,3,4,5,6,7].map(d => (
                                    <button 
                                        key={d}
                                        onClick={() => setFormData({...formData, dia_recarga: d})}
                                        className={`h-10 rounded-xl text-xs font-black transition-all ${formData.dia_recarga === d ? 'bg-teal-500 text-white shadow-md shadow-teal-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'][d-1]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fecha Vencimiento */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Vencimiento de Suscripción (Opcional)</label>
                            <input 
                                type="date"
                                value={formData.fecha_vencimiento_suscripcion}
                                onChange={(e) => setFormData({...formData, fecha_vencimiento_suscripcion: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-teal-400 focus:bg-white font-bold text-slate-700 text-sm"
                            />
                        </div>

                        {/* Opciones de Pago */}
                        <div className="p-5 bg-teal-50/50 rounded-[28px] border border-teal-50 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-teal-800 uppercase tracking-tight">Confirmar pago ahora</span>
                                <button 
                                    onClick={() => setFormData({...formData, confirmar_ahora: !formData.confirmar_ahora})}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.confirmar_ahora ? 'bg-teal-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.confirmar_ahora ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {formData.confirmar_ahora && (
                                <div className="space-y-4 pt-2 border-t border-teal-100/50">
                                    <div className="flex gap-2">
                                        {['Efectivo', 'Tarjeta', 'Transferencia'].map(m => (
                                            <button 
                                                key={m}
                                                onClick={() => setFormData({...formData, metodo_pago: m})}
                                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.metodo_pago === m ? 'bg-white text-teal-600 shadow-sm border border-teal-100' : 'text-teal-400 hover:text-teal-600'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-teal-600 uppercase">Pago Adelantado</span>
                                        <button 
                                            onClick={() => setFormData({...formData, pago_adelantado: !formData.pago_adelantado})}
                                            className={`w-10 h-5 rounded-full transition-colors relative ${formData.pago_adelantado ? 'bg-teal-400' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.pago_adelantado ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <Button 
                                onClick={handleAssign}
                                disabled={isSubmitting}
                                variant="primary"
                                className="w-full py-4 rounded-[20px] text-xs font-black uppercase tracking-widest shadow-xl shadow-teal-500/20"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="fas fa-circle-notch animate-spin"></i> PROCESANDO...
                                    </span>
                                ) : 'FINALIZAR Y ASIGNAR'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}
