import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Button from './Button';

const INITIAL_SESSIONS = [
  { id: 'ep', title: 'EP', subtitle: 'Individual', price: 35, icon: 'fa-solid fa-user', colorClass: 'text-blue-600' },
  { id: 'duo', title: 'Duo', subtitle: '2 Personas', price: 20, icon: 'fa-solid fa-user-group', colorClass: 'text-blue-600' },
  { id: 'trio', title: 'Trio', subtitle: '3 Personas', price: 15, icon: 'fa-solid fa-users', colorClass: 'text-blue-600' },
  { id: 'grupos', title: 'Grupos', subtitle: 'Clase Grupal', price: 10, icon: 'fa-solid fa-layer-group', colorClass: 'text-blue-600' },
];

export default function PosTickarModal({ isOpen, onClose, centros, entrenadores, clientes, onSuccess }) {
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [empresas, setEmpresas] = useState([]);
  const [cart, setCart] = useState([]); // Array of { id, title, price, quantity }
  const [isEditMode, setIsEditMode] = useState(false);
  const [empresaId, setEmpresaId] = useState('');
  const [formData, setFormData] = useState({
      cliente_id: '',
      entrenador_id: '',
      centro: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const clientRef = useRef(null);
  const trainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Función para inicializar los selectores con Select2
    // Se usa un intervalo para asegurar que Select2 esté cargado y los elementos existan
    const checkInterval = setInterval(() => {
        const $ = window.$;
        if ($ && typeof $.fn.select2 === 'function' && clientRef.current && trainerRef.current) {
            clearInterval(checkInterval);

            const options = {
                width: '100%',
                dropdownParent: $(clientRef.current).parent().parent(), // Para que se vea encima del modal
                placeholder: 'Selecciona...',
                allowClear: true,
                language: {
                    noResults: () => "Sin resultados"
                }
            };

            $(clientRef.current).select2(options).on('change', (e) => {
                setFormData(prev => ({ ...prev, cliente_id: e.target.value }));
            });

            $(trainerRef.current).select2(options).on('change', (e) => {
                setFormData(prev => ({ ...prev, entrenador_id: e.target.value }));
            });

            // Sincronizar valor inicial
            $(clientRef.current).val(formData.cliente_id).trigger('change.select2');
            $(trainerRef.current).val(formData.entrenador_id).trigger('change.select2');
        }
    }, 100);

    return () => {
        clearInterval(checkInterval);
        const $ = window.$;
        if ($ && typeof $.fn.select2 === 'function') {
            if (clientRef.current) $(clientRef.current).select2('destroy');
            if (trainerRef.current) $(trainerRef.current).select2('destroy');
        }
    };
  }, [isOpen, clientes, entrenadores]);

  // Sincronizar estado React -> Select2 UI (solo si cambian externamente)
  useEffect(() => {
    const $ = window.$;
    if ($ && typeof $.fn.select2 === 'function' && isOpen) {
        if ($(clientRef.current).val() !== formData.cliente_id) {
            $(clientRef.current).val(formData.cliente_id).trigger('change.select2');
        }
        if ($(trainerRef.current).val() !== formData.entrenador_id) {
            $(trainerRef.current).val(formData.entrenador_id).trigger('change.select2');
        }
    }
  }, [formData.cliente_id, formData.entrenador_id, isOpen]);

  useEffect(() => {
    if (isOpen) {
        setCart([]);
        setFormData({ cliente_id: '', entrenador_id: '', centro: centros && centros.length > 0 ? centros[0].nombre : '' });
        setShowSuccess(false);
        setIsEditMode(false);
        
        // Cargar empresas desde el DB
        axios.get('/api/empresas-list').then(res => {
            const emps = res.data || [];
            setEmpresas(emps);
            if (emps.length > 0) setEmpresaId(emps[0].id);
        });

        // Cargar suscripciones del centro para el TPV
        axios.get('/suscripciones').then(res => {
            const subs = res.data.suscripciones || [];
            setSessions([
                ...INITIAL_SESSIONS,
                ...subs.map(s => ({
                    id: `sub_${s.id}`,
                    title: s.nombre,
                    subtitle: `${s.creditos_por_periodo} CLASES`,
                    price: parseFloat(s.precio) || 0,
                    icon: 'fa-solid fa-crown',
                    colorClass: 'text-amber-500',
                    isSuscripcion: true,
                    suscripcion_id: s.id
                }))
            ]);
        });
    }
  }, [isOpen, centros]);

  if (!isOpen) return null;

  const currEmpresa = empresas.find(e => Number(e.id) === Number(empresaId)) || 
                      (empresas.length > 0 ? empresas[0] : null);
  
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
  
  // Explicitly parse IVA to handle string values from DB like "0.00"
  // If no company found or selected, default to 21% as global safety
  const rawIvaValue = currEmpresa ? currEmpresa.iva_configurable : 21;
  const ivaPercent = parseFloat(rawIvaValue);
  const ivaRate = (isNaN(ivaPercent) ? 21 : ivaPercent) / 100;
  
  const ivaAmount = subtotal * ivaRate;
  const total = subtotal + ivaAmount;

  const addToCart = (session) => {
      setCart(prev => {
          const exists = prev.find(item => item.id === session.id);
          if (exists) {
              return prev.map(item => item.id === session.id ? { ...item, quantity: item.quantity + 1 } : item);
          }
          return [...prev, { ...session, quantity: 1, originalPrice: session.price }];
      });
  };

  const removeFromCart = (id) => {
      setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
      setCart(prev => prev.map(item => {
          if (item.id === id) {
              const newQty = Math.max(0, item.quantity + delta);
              return { ...item, quantity: newQty };
          }
          return item;
      }).filter(item => item.quantity > 0));
  };

  const adjustItemPrice = (id, amount) => {
      setCart(prev => prev.map(item => item.id === id ? { ...item, price: Math.max(0, item.price + amount) } : item));
  };

  const handleUpdateSession = (id, field, value) => {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddSession = () => {
      const newId = `session_${Math.random().toString(36).substring(7)}`;
      setSessions([...sessions, { id: newId, title: 'Nueva', subtitle: 'Subtítulo', price: 10, icon: 'fa-solid fa-star', colorClass: 'text-blue-600' }]);
  };

  const handleDeleteSession = (id) => {
      setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async () => {
      if (!formData.cliente_id) return alert('Debes seleccionar un cliente.');
      if (!formData.entrenador_id) return alert('Debes seleccionar un entrenador.');
      if (cart.length === 0) return alert('Debes añadir al menos un concepto a la cuenta.');

      setSubmitting(true);
      try {
          const payload = {
              ...formData,
              empresa: currEmpresa.name,
              iva_rate: ivaRate,
              subtotal,
              iva_amount: ivaAmount,
              total,
              items: cart.flatMap(item => Array(item.quantity).fill({ 
                  tipo: item.title, 
                  precio: item.price,
                  suscripcion_id: item.suscripcion_id || null 
              })),
              importe_entregado: total // Se asume pago exacto
          };
          await axios.post('/facturas/tickar', payload, { headers: { Accept: 'application/json' }});
          setShowSuccess(true);
          if (onSuccess) onSuccess();
      } catch (error) {
          console.error('Error procesando cobro:', error);
          alert('Hubo un error al procesar el cobro.');
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
                <Button onClick={onClose} variant="primary" className="w-full justify-center bg-[#38C1A3] text-white hover:bg-teal-500">ENTENDIDO</Button>
            </div>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex flex-col md:flex-row items-stretch justify-end md:justify-center md:items-center p-0 md:p-6 backdrop-blur-sm transition-all">
      <div className="bg-white md:rounded-2xl shadow-2xl w-full max-w-[950px] h-full md:h-[85vh] flex flex-col overflow-hidden animate-in md:zoom-in-95 slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between shrink-0">
            <h2 className="font-bold text-lg tracking-tight flex items-center gap-2">
                <i className="fa-solid fa-cash-register text-[#38C1A3]"></i> Nuevo Ticket - Factomove
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700">
                <i className="fa-solid fa-xmark text-xl"></i>
            </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="flex-1 overflow-auto bg-slate-50 border-r border-slate-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            {isEditMode ? 'Personalizar Botones' : 'Seleccionar Sesión'}
                        </h3>
                        <button 
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`px-3 py-1.5 rounded-lg flex items-center shadow-sm transition-all ${isEditMode ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                        >
                            <i className={`fa-solid ${isEditMode ? 'fa-check' : 'fa-pen'} text-xs mr-1.5`}></i>
                            {isEditMode ? 'Terminar' : ''}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        {sessions.map((session) => (
                            <div key={session.id} className="relative group">
                                <button 
                                    disabled={isEditMode}
                                    onClick={() => addToCart(session)}
                                    className={`w-full flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white ${!isEditMode && 'hover:border-[#38C1A3]/50 hover:shadow-md active:scale-95'} transition-all text-center min-h-[110px]`}
                                >
                                    <i className={`${session.icon} ${session.colorClass} text-2xl mb-2`}></i>
                                    {isEditMode ? (
                                        <div className="space-y-1 w-full">
                                            <input 
                                                type="text" 
                                                value={session.title} 
                                                onChange={(e) => handleUpdateSession(session.id, 'title', e.target.value)}
                                                className="w-full text-center font-bold text-xs border-b border-slate-100 focus:border-teal-400 outline-none"
                                            />
                                            <input 
                                                type="number" 
                                                value={session.price} 
                                                onChange={(e) => handleUpdateSession(session.id, 'price', parseFloat(e.target.value))}
                                                className="w-full text-center font-black text-xs border-b border-slate-100 focus:border-teal-400 outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <span className="font-bold text-slate-800 text-sm leading-tight">{session.title}</span>
                                            <span className="text-[10px] font-medium text-slate-400 mb-1">{session.subtitle}</span>
                                            <span className="font-black text-slate-600 text-sm">{session.price}€</span>
                                        </>
                                    )}
                                </button>
                                {isEditMode && (
                                    <button 
                                        onClick={() => handleDeleteSession(session.id)}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                                    >
                                        <i className="fa-solid fa-minus text-[10px]"></i>
                                    </button>
                                )}
                            </div>
                        ))}
                        {isEditMode && (
                            <button 
                                onClick={handleAddSession}
                                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-all min-h-[110px]"
                            >
                                <i className="fa-solid fa-plus text-2xl mb-2"></i>
                                <span className="font-bold text-xs uppercase tracking-tighter">Añadir Botón</span>
                            </button>
                        )}
                    </div>

                    <hr className="border-t border-dashed border-slate-300 my-6" />

                    {/* Ajustes Rápidos por Tipo */}
                    <div className="space-y-6">
                        {cart.length === 0 ? (
                            <div className="bg-slate-100/50 rounded-2xl p-10 text-center border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 text-sm font-medium italic">Selecciona sesiones arriba para aplicar descuentos o ajustes rápidos.</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                                                <i className={item.icon}></i>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm">Ajustar {item.title}</h4>
                                                <p className="text-[10px] font-bold text-slate-400">Precio actual (por unidad): {item.price}€</p>
                                            </div>
                                        </div>
                                        <div className="bg-teal-50 text-[#38C1A3] px-3 py-1 rounded-lg text-xs font-black">
                                            {item.quantity} x {item.price}€ = {(item.quantity * item.price).toFixed(2)}€
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[-20, -10, -5, -2, 2, 5, 10, 20].map(val => (
                                            <button 
                                                key={val} 
                                                onClick={() => adjustItemPrice(item.id, val)}
                                                className={`py-2 rounded-xl text-xs font-black border transition-all active:scale-95 ${val < 0 ? 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
                                            >
                                                {val > 0 ? `+${val}` : val}€
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-[350px] flex flex-col bg-white shrink-0">
                <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Empresa / IVA</label>
                        </div>
                        <select 
                            value={empresaId} 
                            onChange={(e) => setEmpresaId(e.target.value)} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#38C1A3]"
                        >
                            {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre} ({e.iva_configurable}%)</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</label>
                        <select 
                            ref={clientRef}
                            id="pos-select-cliente"
                            value={formData.cliente_id} 
                            onChange={(e) => setFormData({...formData, cliente_id: e.target.value})} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#38C1A3]"
                        >
                            <option value="">Seleccionar cliente...</option>
                            {clientes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entrenador</label>
                        <select 
                            ref={trainerRef}
                            id="pos-select-entrenador"
                            value={formData.entrenador_id} 
                            onChange={(e) => setFormData({...formData, entrenador_id: e.target.value})} 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#38C1A3]"
                        >
                            <option value="">Seleccionar entrenador...</option>
                            {entrenadores?.map(e => <option key={e.id} value={e.id}>{e.name || e.nombre}</option>)}
                        </select>
                    </div>
                </div>

                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="font-black text-sm text-slate-700 uppercase tracking-tighter italic">Detalle de la cuenta</h4>
                </div>
                <div className="flex-1 p-5 overflow-auto">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                             <span className="text-xs font-medium italic">Sin conceptos.</span>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {cart.map((item) => (
                                <li key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0 group">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-5 h-5 bg-slate-100 text-slate-500 rounded text-[10px] flex items-center justify-center font-black">{item.quantity}x</span>
                                            <span className="font-bold text-slate-700">{item.title}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 ml-6 pl-0.5">{item.price} € / unid.</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center  bg-slate-50 rounded-lg border border-slate-100">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 text-slate-400 hover:text-rose-500">-</button>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 text-slate-400 hover:text-emerald-500">+</button>
                                        </div>
                                        <span className="font-black text-slate-700 min-w-[50px] text-right">{(item.quantity * item.price).toFixed(2)}€</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-5 bg-slate-50 flex flex-col gap-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Base Subtotal</span>
                        <span>{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>IVA ({ivaPercent}%)</span>
                        <span>{ivaAmount.toFixed(2)} €</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                        <span className="text-sm text-slate-500 font-extrabold uppercase tracking-widest">Total Cobrar</span>
                        <span className="text-3xl font-black text-slate-800 underline decoration-[#38C1A3] decoration-4">{total.toFixed(2)} €</span>
                    </div>
                    
                    <Button onClick={handleSubmit} disabled={submitting || cart.length === 0} variant="primary" className="w-full justify-center mt-3 h-14 text-lg shadow-sm font-black tracking-widest border-transparent text-white bg-[#38c1a3] hover:bg-[#32ad92] rounded-2xl active:scale-95 transition-all">
                        {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : 'COBRAR TICKET'}
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
