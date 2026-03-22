import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from './Button';

const SESSIONS = [
  { id: 'ep', title: 'EP', subtitle: 'Individual', price: 35, icon: 'fa-solid fa-user', colorClass: 'text-blue-600' },
  { id: 'duo', title: 'Duo', subtitle: '2 Personas', price: 20, icon: 'fa-solid fa-user-group', colorClass: 'text-blue-600' },
  { id: 'trio', title: 'Trio', subtitle: '3 Personas', price: 15, icon: 'fa-solid fa-users', colorClass: 'text-blue-600' },
  { id: 'grupos', title: 'Grupos', subtitle: 'Clase Grupal', price: 10, icon: 'fa-solid fa-layer-group', colorClass: 'text-blue-600' },
];

export default function PosTickarModal({ isOpen, onClose, centros, entrenadores, clientes, onSuccess }) {
  const [cart, setCart] = useState([]);
  const [entregado, setEntregado] = useState(0);
  const [formData, setFormData] = useState({
      cliente_id: '',
      entrenador_id: '',
      centro: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setCart([]);
        setEntregado(0);
        setFormData({ cliente_id: '', entrenador_id: '', centro: centros && centros.length > 0 ? centros[0].nombre : '' });
        setShowSuccess(false);
    }
  }, [isOpen, centros]);

  if (!isOpen) return null;

  const totalCart = cart.reduce((sum, item) => sum + parseFloat(item.precio), 0);
  const diferencia = entregado - totalCart;

  const addToCart = (session) => {
      setCart([...cart, { tipo: session.title, precio: session.price, uuid: Math.random().toString(36).substring(7) }]);
  };

  const removeFromCart = (uuid) => {
      setCart(cart.filter(item => item.uuid !== uuid));
  };

  const addQuickMoney = (amount) => {
      setEntregado(prev => Math.max(0, prev + amount));
  };

  const handleSubmit = async () => {
      if (!formData.cliente_id) return alert('Debes seleccionar un cliente.');
      if (!formData.entrenador_id) return alert('Debes seleccionar un entrenador.');
      if (cart.length === 0) return alert('Debes añadir al menos un concepto a la cuenta.');

      setSubmitting(true);
      try {
          const payload = {
              ...formData,
              items: cart.map(c => ({ tipo: c.tipo, precio: c.precio })),
              importe_entregado: entregado
          };
          await axios.post('/facturas/tickar', payload, { headers: { Accept: 'application/json' }});
          setShowSuccess(true);
          if (onSuccess) onSuccess();
      } catch (error) {
          console.error('Error procesando cobro:', error);
          alert('Hubo un error al procesar el cobro. Revisa tu conexión.');
      } finally {
          setSubmitting(false);
      }
  };

  if (showSuccess) {
      return (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8 animate-in zoom-in-95 duration-200">
                <div className="text-[#38C1A3] text-6xl mb-4">
                    <i className="fa-solid fa-circle-check"></i>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">¡Cobro Realizado!</h2>
                <p className="text-slate-500 mb-8 font-medium">La cuenta ha sido registrada correctamente en el sistema de facturación.</p>
                <Button onClick={onClose} variant="primary" className="w-full justify-center bg-[#38C1A3] shadow-md border-transparent text-white hover:bg-teal-500">ENTENDIDO</Button>
            </div>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex flex-col md:flex-row items-stretch justify-end md:justify-center md:items-center p-0 md:p-6 backdrop-blur-sm transition-all">
      <div className="bg-white md:rounded-2xl shadow-2xl w-full max-w-[900px] h-full md:h-[85vh] flex flex-col overflow-hidden animate-in md:zoom-in-95 slide-in-from-bottom md:slide-in-from-bottom-0 duration-300">
        
        {/* Header */}
        <div className="bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between shrink-0">
            <h2 className="font-bold text-lg tracking-tight flex items-center gap-2">
                <i className="fa-solid fa-cash-register text-[#38C1A3]"></i> Nuevo Ticket - Factomove
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700">
                <i className="fa-solid fa-xmark text-xl"></i>
            </button>
        </div>

        {/* Content Split */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Left Pad (Items & Cash) */}
            <div className="flex-1 overflow-auto bg-slate-50 border-r border-slate-200">
                <div className="p-6">
                    {/* Sesiones */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            Seleccionar Sesión
                        </h3>
                        <button className="text-slate-400 hover:text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center shadow-sm">
                            <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        {SESSIONS.map((session) => (
                            <button 
                                key={session.id}
                                onClick={() => addToCart(session)}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-[#38C1A3]/50 hover:shadow-md transition-all active:scale-95 text-center min-h-[110px]`}
                            >
                                <i className={`${session.icon} ${session.colorClass} text-2xl mb-2`}></i>
                                <span className="font-bold text-slate-800 text-sm leading-tight">{session.title}</span>
                                <span className="text-[10px] font-medium text-slate-400 mb-1">{session.subtitle}</span>
                                <span className="font-black text-slate-600 text-sm">{session.price}€</span>
                            </button>
                        ))}
                    </div>

                    <hr className="border-t border-dashed border-slate-300 my-6" />

                    {/* Dinero Express */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            Abonado / Entrega Rápida
                        </h3>
                        <button onClick={() => setEntregado(0)} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 bg-rose-50 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-sm">
                            <i className="fa-solid fa-rotate-right"></i> Empezar de 0
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {[5, 10, 20, 50].map((val) => (
                            <button key={val} onClick={() => addQuickMoney(val)} className="flex-1 min-w-[65px] py-3 bg-white text-[#38C1A3] border border-[#38C1A3]/60 hover:bg-teal-50 rounded-xl font-black text-lg active:scale-95 transition-all shadow-sm">
                                + {val}€
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {[0.10, 0.20, 0.50].map((val) => (
                            <button key={val} onClick={() => addQuickMoney(val)} className="flex-1 min-w-[65px] py-3 bg-white text-sky-500 border border-sky-300 hover:bg-sky-50 rounded-xl font-bold text-base active:scale-95 transition-all shadow-sm">
                                + {val.toFixed(2)}€
                            </button>
                        ))}
                        {[-5, -10].map((val) => (
                            <button key={val} onClick={() => addQuickMoney(val)} className="flex-1 min-w-[65px] py-3 bg-white text-rose-500 border border-rose-300 hover:bg-rose-50 rounded-xl font-bold text-base active:scale-95 transition-all shadow-sm">
                                {val}€
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Pane (Cart form & Checkout) */}
            <div className="w-full lg:w-[350px] flex flex-col bg-white shrink-0">
                <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">Cliente</label>
                        <select value={formData.cliente_id} onChange={(e) => setFormData({...formData, cliente_id: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#38C1A3]">
                            <option value="">Seleccionar cliente...</option>
                            {clientes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">Entrenador</label>
                        <select value={formData.entrenador_id} onChange={(e) => setFormData({...formData, entrenador_id: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#38C1A3]">
                            <option value="">Seleccionar entrenador...</option>
                            {entrenadores?.map(e => <option key={e.id} value={e.id}>{e.name || e.nombre}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">Centro</label>
                        <select value={formData.centro} onChange={(e) => setFormData({...formData, centro: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#38C1A3]">
                            <option value="">Seleccionar centro...</option>
                            {centros?.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                        </select>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="font-black text-sm text-slate-700">Detalle de la cuenta</h4>
                </div>
                <div className="flex-1 p-5 overflow-auto">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                             <span className="text-xs font-medium italic">Sin conceptos.</span>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {cart.map((item) => (
                                <li key={item.uuid} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700">{item.tipo}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-600">{parseFloat(item.precio).toFixed(2)} €</span>
                                        <button onClick={() => removeFromCart(item.uuid)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                            <i className="fa-solid fa-xmark text-xs"></i>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Checkout Footer */}
                <div className="p-5 bg-slate-50 flex flex-col gap-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 font-bold">Total Cuenta:</span>
                        <span className="text-2xl font-black text-slate-800">{totalCart.toFixed(2)} €</span>
                    </div>
                    
                    <hr className="border-t border-dashed border-slate-300" />
                    
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 font-bold">Abonado / Entregado:</span>
                        <div className="relative">
                            <input type="number" step="0.01" value={entregado} onChange={(e) => setEntregado(parseFloat(e.target.value) || 0)} className="w-[100px] text-right bg-white border border-slate-200 shadow-inner rounded-md py-1.5 px-3 font-black text-slate-700 focus:outline-none focus:border-[#38C1A3] transition-colors pr-6" />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-800 font-black pointer-events-none">€</span>
                        </div>
                    </div>

                    <Button onClick={handleSubmit} disabled={submitting || cart.length === 0} variant="primary" className="w-full justify-center mt-2 h-12 text-base shadow-sm font-black tracking-wide border-transparent text-white bg-[#38c1a3] hover:bg-[#32ad92]">
                        {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Cobrar Cuenta'}
                    </Button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
