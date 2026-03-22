import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CrearClaseModal({ isOpen, onClose, centros = [], entrenadores = [], users = [], suscripciones = [], initialDate, onSuccess }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showCentrosDropdown, setShowCentrosDropdown] = useState(false);
    
    // Búsqueda de alumnos (Paso 2)
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    const [formData, setFormData] = useState({
        centro: '', // Now it's an array for multiple centers
        nombre_clase: '',
        tipo_clase: 'ep',
        capacidad: '',
        fecha_hora: '',
        precio_base: '0.00',
        is_recurring: false,
        recurrence_end: '',
        trainers: [],
        participants: [], 
        suscripciones_permitidas: []
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                fecha_hora: initialDate || getCurrentLocalTime()
            }));
            setCurrentStep(1);
            setErrors({});
            setSearchQuery('');
        }
    }, [isOpen, initialDate]);

    // Lógica para filtrar usuarios en tiempo real
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers([]);
            return;
        }
        const lowerQ = searchQuery.toLowerCase();
        const selectedIds = new Set(formData.participants.map(p => p.id));
        setFilteredUsers(users.filter(u => u.name.toLowerCase().includes(lowerQ) && !selectedIds.has(u.id)).slice(0, 8));
    }, [searchQuery, users, formData.participants]);

    const getCurrentLocalTime = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleCentrosChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, centros: selectedOptions }));
        if (errors.centros) setErrors(prev => ({ ...prev, centros: null }));
    };

    // --- Lógica Entrenadores (Paso 1) ---
    const toggleTrainer = (id, name, photo) => {
        setFormData(prev => {
            const exists = prev.trainers.some(t => t.id === id);
            if (exists) {
                return { ...prev, trainers: prev.trainers.filter(t => t.id !== id) };
            } else {
                return { ...prev, trainers: [...prev.trainers, { id, name, photo }] };
            }
        });
    };

    // --- Lógica Alumnos (Paso 2) ---
    const addParticipant = (user) => {        
        let newParticipants = [...formData.participants];
        newParticipants.push(user);
        setFormData(prev => ({ ...prev, participants: newParticipants }));
        setSearchQuery(''); // Cerrar auto-completar
    };

    const removeParticipant = (userId) => {
        setFormData(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.id !== userId)
        }));
    };

    // --- Lógica Suscripciones (Paso 3) ---
    const toggleSuscripcion = (id) => {
        setFormData(prev => {
            const arr = prev.suscripciones_permitidas;
            return {
                ...prev,
                suscripciones_permitidas: arr.includes(id) ? arr.filter(s => s !== id) : [...arr, id]
            }
        });
    };

    // --- Validación por Pasos ---
    const validateStep = (step) => {
        const newErrs = {};
        if (step === 1) {
            if (!formData.centro) newErrs.centro = "Selecciona un centro deportivo.";
            if (!formData.nombre_clase.trim()) newErrs.nombre_clase = "El nombre es obligatorio.";
            if (!formData.tipo_clase) newErrs.tipo_clase = "Obligatorio.";
        } else if (step === 2) {
            if (!formData.fecha_hora) newErrs.fecha_hora = "Obligatorio.";
            if (formData.is_recurring && !formData.recurrence_end) newErrs.recurrence_end = "Obligatorio si hay repetición.";
        }
        
        setErrors(newErrs);
        return Object.keys(newErrs).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // --- Enviar ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(3)) return; 
        
        setLoading(true);
        try {
            const payload = { 
                ...formData, 
                trainers: formData.trainers.map(t=>t.id), 
                participants: formData.participants.map(p => ({
                    user_id: p.id,
                    precio: formData.tipo_clase === 'ep' ? (p.precio_hora || 0) : 0,
                    metodo_pago: 'Por defecto'
                })) 
            };
            const response = await axios.post('/Pagos', payload);
            if (response.data.success) {
                onSuccess();
                onClose();
            } else {
                alert(response.data.message || 'Error al agendar la clase');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Error de conexión o red al guardar.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const showCapacidad = ['Grupo especial', 'Grupo'].includes(formData.tipo_clase);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 md:p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col md:flex-row h-[85vh] max-h-[800px] overflow-hidden relative animate-in zoom-in-95 duration-200">
                
                <button 
                  onClick={onClose} 
                  className="absolute top-5 right-5 z-20 w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center transition-colors shadow-sm"
                >
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>

                {/* SIDEBAR WIZARD (Left) */}
                <div className="w-full md:w-72 bg-slate-50 border-r border-slate-100 p-8 flex flex-col shrink-0">
                    <div className="flex items-center gap-3 mb-10">
                        <img src="/img/logopng.png" alt="Logo" className="w-8 h-8 drop-shadow-sm" />
                        <span className="font-extrabold text-slate-900 tracking-tight text-lg uppercase">Factomove</span>
                    </div>

                    <div className="flex flex-col gap-6 flex-1">
                        {/* Step 1 */}
                        <div className={`flex items-start gap-4 transition-opacity ${currentStep === 1 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm shadow-sm transition-colors duration-300 
                                ${currentStep === 1 ? 'bg-[#38C1A3] text-white border-0 shadow-md shadow-teal-500/20' : currentStep > 1 ? 'bg-[#38C1A3] text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                                {currentStep > 1 ? <i className="fa-solid fa-check text-xs"></i> : '1'}
                            </div>
                            <div>
                                <h4 className={`font-bold ${currentStep === 1 ? 'text-slate-900' : 'text-slate-600'}`}>Configuración</h4>
                                <p className="text-xs text-slate-500 font-medium">Centro y Entrenadores</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className={`flex items-start gap-4 transition-opacity ${currentStep === 2 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm shadow-sm transition-colors duration-300 
                                ${currentStep === 2 ? 'bg-[#38C1A3] text-white border-0 shadow-md shadow-teal-500/20' : currentStep > 2 ? 'bg-[#38C1A3] text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                                {currentStep > 2 ? <i className="fa-solid fa-check text-xs"></i> : '2'}
                            </div>
                            <div>
                                <h4 className={`font-bold ${currentStep === 2 ? 'text-slate-900' : 'text-slate-600'}`}>Planificación</h4>
                                <p className="text-xs text-slate-500 font-medium">Horario y Alumnos</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className={`flex items-start gap-4 transition-opacity ${currentStep === 3 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm shadow-sm transition-colors duration-300 
                                ${currentStep === 3 ? 'bg-[#38C1A3] text-white border-0 shadow-md shadow-teal-500/20' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                                3
                            </div>
                            <div>
                                <h4 className={`font-bold ${currentStep === 3 ? 'text-slate-900' : 'text-slate-600'}`}>Accesibilidad</h4>
                                <p className="text-xs text-slate-500 font-medium">Filtro de suscripciones</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 text-xs text-slate-400 font-medium border-t border-slate-200/60">
                        &copy; {new Date().getFullYear()} Factomove
                    </div>
                </div>

                {/* MAIN CONTENT (Right) */}
                <div className="flex-1 flex flex-col bg-white w-full overflow-hidden">
                    
                    <div className="px-10 py-8 border-b border-slate-50 shrink-0">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Agendar Nueva Clase</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">Completa los detalles para crear una sesión.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-10 py-8">
                        
                        {/* ————————————————— PASO 1: CONFIGURACIÓN ————————————————— */}
                        {currentStep === 1 && (
                            <div className="animate-in slide-in-from-right-4 fade-in duration-300 w-full max-w-2xl mx-auto space-y-10">
                                <section>
                                    <h3 className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-6">Detalles Generales</h3>
                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-1.5 relative">
                                            <label className="text-xs font-bold text-slate-600 pl-1">Centro Deportivo</label>
                                            
                                            {/* Custom Dropdown Selector */}
                                            <div className="relative">
                                                <div 
                                                    onClick={() => setShowCentrosDropdown(!showCentrosDropdown)}
                                                    className={`w-full bg-slate-50 border ${errors.centro ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer flex justify-between items-center hover:bg-slate-100 transition-colors`}
                                                >
                                                    <div className="flex flex-wrap gap-1">
                                                        {formData.centro ? (
                                                            <span className="bg-[#38C1A3] text-white text-[12px] px-3 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                                                {formData.centro}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 font-medium italic">Seleccionar centro...</span>
                                                        )}
                                                    </div>
                                                    <i className={`fas fa-chevron-down text-slate-400 transition-transform duration-200 ${showCentrosDropdown ? 'rotate-180' : ''}`}></i>
                                                </div>

                                                {showCentrosDropdown && (
                                                    <>
                                                        <div className="fixed inset-0 z-[60]" onClick={() => setShowCentrosDropdown(false)}></div>
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-[70] py-2 animate-in fade-in slide-in-from-top-2 duration-200 max-h-48 overflow-y-auto">
                                                            {centros.map(c => {
                                                                const isSelected = formData.centro === c.nombre;
                                                                return (
                                                                    <div 
                                                                        key={c.id} 
                                                                        onClick={() => {
                                                                            setFormData(prev => ({ ...prev, centro: c.nombre }));
                                                                            setShowCentrosDropdown(false);
                                                                        }}
                                                                        className="px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer group"
                                                                    >
                                                                        <span className={`text-sm font-bold ${isSelected ? 'text-[#38C1A3]' : 'text-slate-600'}`}>{c.nombre}</span>
                                                                        {isSelected && <i className="fas fa-check text-[#38C1A3] text-xs"></i>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            {errors.centro && <p className="text-xs text-rose-500 font-bold pl-1 mt-1">{errors.centro}</p>}
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-600 pl-1">Nombre de la Clase</label>
                                                <input type="text" name="nombre_clase" value={formData.nombre_clase} onChange={handleChange} placeholder="Ej. Pilates Reformer"
                                                    className={`w-full bg-slate-50 border ${errors.nombre_clase ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 outline-none`} />
                                                {errors.nombre_clase && <p className="text-xs text-rose-500 font-bold pl-1">{errors.nombre_clase}</p>}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-600 pl-1">Tipo de Sesión</label>
                                                <select name="tipo_clase" value={formData.tipo_clase} onChange={handleChange} 
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 outline-none">
                                                    <option value="ep">EP (Personal)</option>
                                                    <option value="duo">Dúo</option>
                                                    <option value="trio">Trío</option>
                                                    <option value="privado">Privado</option>
                                                    <option value="Grupo especial">Grupo especial</option>
                                                    <option value="Grupo">Grupo</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    {showCapacidad && (
                                        <div className="space-y-1.5 mt-4">
                                            <label className="text-xs font-bold text-slate-600 pl-1">Límite de Personas</label>
                                            <input type="number" name="capacidad" value={formData.capacidad} onChange={handleChange} min="1" placeholder="Ej. 10"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 outline-none" />
                                        </div>
                                    )}
                                </section>

                                <section>
                                    <h3 className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-6">Asignación de Entrenadores</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {entrenadores.map(coach => {
                                            const isSelected = formData.trainers.some(t => t.id === coach.id);
                                            return (
                                                <label key={coach.id} className="cursor-pointer">
                                                    <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleTrainer(coach.id, coach.name, coach.foto_de_perfil || coach.profile_photo_path)} />
                                                    <div className={`border p-3 rounded-xl flex items-center gap-3 transition-all ${isSelected ? 'border-[#38C1A3] bg-teal-50/50' : 'border-slate-200 bg-white'}`}>
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 overflow-hidden shrink-0">
                                                            {coach.profile_photo_path || coach.foto_de_perfil ? <img src={`/storage/${coach.profile_photo_path || coach.foto_de_perfil}`} className="w-full h-full object-cover"/> : coach.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-xs font-bold truncate text-slate-800">{coach.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium">Entrenador</span>
                                                        </div>
                                                        {isSelected && <i className="fa-solid fa-circle-check text-teal-500 ml-auto"></i>}
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* ————————————————— PASO 2: PLANIFICACIÓN ————————————————— */}
                        {currentStep === 2 && (
                            <div className="animate-in slide-in-from-right-4 fade-in duration-300 w-full max-w-2xl mx-auto space-y-10">
                                <section>
                                    <h3 className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-6">Agenda y Precios</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 pl-1">Fecha y Hora</label>
                                            <input type="datetime-local" name="fecha_hora" value={formData.fecha_hora} onChange={handleChange} 
                                                className={`w-full bg-slate-50 border ${errors.fecha_hora ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 outline-none`} />
                                            {errors.fecha_hora && <p className="text-xs text-rose-500 font-bold pl-1">{errors.fecha_hora}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 pl-1">Precio Base por Persona (€)</label>
                                            <input type="number" step="0.01" name="precio_base" value={formData.precio_base} onChange={handleChange} 
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 outline-none" />
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-teal-50 border border-teal-100 rounded-2xl">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" name="is_recurring" checked={formData.is_recurring} onChange={handleChange} className="w-4 h-4 text-teal-500 accent-teal-500" />
                                            <span className="font-bold text-slate-800 text-sm">Repetir esta clase semanalmente</span>
                                        </label>
                                        {formData.is_recurring && (
                                            <div className="mt-4 pt-4 border-t border-teal-200/50">
                                                <label className="text-xs font-bold text-teal-800 mb-1.5 block">Repetir hasta el día:</label>
                                                <input type="date" name="recurrence_end" value={formData.recurrence_end} onChange={handleChange} 
                                                    className={`w-full bg-white border ${errors.recurrence_end ? 'border-rose-400' : 'border-teal-200'} text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 outline-none`} />
                                                {errors.recurrence_end && <p className="text-xs text-rose-500 font-bold mt-1">{errors.recurrence_end}</p>}
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-6 flex items-center gap-2">Participantes <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{formData.participants.length}</span></h3>
                                    <div className="relative w-full mb-6">
                                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar alumno por nombre..."
                                            className="w-full bg-white border border-slate-200 focus:border-[#38C1A3] text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 pl-12 outline-none shadow-sm" />
                                        {filteredUsers.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-56 overflow-y-auto z-20">
                                                {filteredUsers.map(u => (
                                                    <button key={u.id} type="button" onClick={() => addParticipant(u)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-left">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs">{u.name.charAt(0).toUpperCase()}</div>
                                                        <span className="font-bold text-slate-700 text-sm">{u.name}</span>
                                                        <i className="fa-solid fa-plus ml-auto text-teal-500"></i>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.participants.length === 0 ? (
                                            <div className="w-full py-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center">
                                                <i className="fa-solid fa-users-slash text-slate-300 text-2xl mb-2"></i>
                                                <span className="text-slate-500 text-xs font-bold">Busca y selecciona alumnos</span>
                                            </div>
                                        ) : (
                                            formData.participants.map(p => (
                                                <span key={p.id} className="inline-flex items-center gap-2 bg-white border border-slate-200 shadow-sm pl-2 pr-1 py-1 rounded-full">
                                                    <div className="w-6 h-6 rounded-full bg-[#38C1A3] text-white flex items-center justify-center font-bold text-[10px]">{p.name.charAt(0).toUpperCase()}</div>
                                                    <span className="text-xs font-bold text-slate-700">{p.name}</span>
                                                    <button type="button" onClick={() => removeParticipant(p.id)} className="w-6 h-6 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center">
                                                        <i className="fa-solid fa-xmark"></i>
                                                    </button>
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* ————————————————— PASO 3: ACCESIBILIDAD ————————————————— */}
                        {currentStep === 3 && (
                            <div className="animate-in slide-in-from-right-4 fade-in duration-300 w-full max-w-2xl mx-auto">
                                <section>
                                    <h3 className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-2">Control de Acceso por Suscripción</h3>
                                    <p className="text-slate-500 font-medium text-sm mb-6">Selecciona qué paquetes de suscripción tienen permitido el acceso a esta sesión específica.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {suscripciones.length > 0 ? suscripciones.map(sus => {
                                            const isChecked = formData.suscripciones_permitidas.includes(sus.id);
                                            return (
                                                <label key={sus.id} className="cursor-pointer block relative">
                                                    <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleSuscripcion(sus.id)} />
                                                    <div className={`border-2 rounded-2xl p-4 transition-all ${isChecked ? 'border-[#38C1A3] bg-teal-50/20' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="font-bold text-sm text-slate-800">{sus.nombre}</span>
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isChecked ? 'bg-[#38C1A3] border-transparent' : 'bg-white border-slate-200'}`}>
                                                                {isChecked && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tipo: {sus.tipo_credito}</span>
                                                            <span className="text-[11px] font-semibold text-slate-400">Centro: {sus.centro?.nombre || 'Global'}</span>
                                                        </div>
                                                    </div>
                                                </label>
                                            )
                                        }) : (
                                            <div className="col-span-full py-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                                                <i className="fa-solid fa-box-open text-slate-300 text-3xl mb-2"></i>
                                                <p className="text-slate-500 text-sm font-medium">No hay suscripciones configuradas en el sistema todavía.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 p-3 bg-sky-50 border border-sky-100 rounded-xl text-sky-800 text-xs font-semibold flex gap-3 items-start">
                                        <i className="fa-solid fa-info-circle mt-0.5"></i>
                                        <p>Los alumnos con las suscripciones marcadas visualizarán esta clase en su app y podrán reservar con sus créditos automáticamente.</p>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions Main */}
                    <div className="px-10 py-5 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
                        {currentStep > 1 ? (
                            <button type="button" onClick={prevStep} className="px-6 py-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                                <i className="fa-solid fa-arrow-left"></i> Anterior
                            </button>
                        ) : <div></div>}

                        {currentStep < 3 ? (
                            <button type="button" onClick={nextStep} className="px-8 py-2.5 bg-[#4BB7AE] hover:bg-[#3da49c] text-white rounded-xl font-bold text-sm shadow-md transition-transform hover:-translate-y-0.5 flex items-center gap-2">
                                Siguiente <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={loading} className="px-8 py-2.5 bg-[#38C1A3] hover:bg-[#2eaa8f] text-white rounded-xl font-bold text-sm shadow-lg transition-transform hover:-translate-y-0.5 flex items-center gap-2">
                                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>} CONFIRMAR Y GUARDAR
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
