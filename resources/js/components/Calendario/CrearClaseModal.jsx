import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';

export default function CrearClaseModal({ isOpen, onClose, centros = [], entrenadores = [], users = [], suscripciones = [], tiposSesion = [], tiposCredito = [], initialDate, onSuccess }) {
    const [currentStep, setCurrentStep] = useState(1);
    const select2Ref = useRef(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showCentrosDropdown, setShowCentrosDropdown] = useState(false);
    
    // Búsqueda de entrenadores (Paso 1)
    const [trainerSearchQuery, setTrainerSearchQuery] = useState('');
    
    // Búsqueda de alumnos (Paso 2)
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    
    // Búsqueda de suscripciones (Paso 2)
    const [susSearchQuery, setSusSearchQuery] = useState('');

    const getDefaultConfigForType = (slug) => {
        return tiposSesion.find(t => t.slug === slug) || null;
    };

    const defaultCapacityForType = (slug) => {
        const config = getDefaultConfigForType(slug);
        return config ? config.capacidad_personas.toString() : '1';
    };

    const [formData, setFormData] = useState({
        centro: '',
        nombre_clase: '',
        tipo_clase: '', // Will be set in useEffect
        capacidad: '',
        capacidad_maxima: '1',
        fecha_hora: '',
        precio_base: '0.00',
        is_recurring: false,
        recurrence_end: '',
        trainers: [],
        participants: [],
        suscripciones_permitidas: [],
        tipos_credito_permitidos: [],
        horas_cancelacion: '0'
    });

    // Set initial session type from dynamic list
    useEffect(() => {
        if (tiposSesion.length > 0 && !formData.tipo_clase) {
            const firstType = tiposSesion[0];
            setFormData(prev => ({
                ...prev,
                tipo_clase: firstType.slug,
                capacidad_maxima: firstType.capacidad_personas.toString(),
                precio_base: firstType.precio_base || '0.00',
                tipos_credito_permitidos: firstType.tipos_credito_ids || []
            }));
        }
    }, [tiposSesion, isOpen]);

    // Select2 Integration Sync
    useEffect(() => {
        if (window.$ && select2Ref.current && isOpen && currentStep === 1) {
            const $select = window.$(select2Ref.current);
            const handleChangeS2 = (e) => {
                const value = e.target.value;
                const config = getDefaultConfigForType(value);
                setFormData(prev => {
                    return { 
                        ...prev, 
                        tipo_clase: value,
                        capacidad_maxima: config ? config.capacidad_personas.toString() : prev.capacidad_maxima,
                        horas_cancelacion: config ? config.horas_cancelacion_default.toString() : prev.horas_cancelacion,
                        precio_base: config ? (config.precio_base || '0.00') : '0.00',
                        tipos_credito_permitidos: config ? (config.tipos_credito_ids || []) : []
                    };
                });
            };

            // Asegurar que select2 esté inicializado si no lo está
            if (!$select.hasClass('select2-hidden-accessible')) {
                // Si existe una función global o local para inicializarlo, se llamaría aquí
                // Por ejemplo: if ($select.select2) $select.select2();
            }

            $select.on('change', handleChangeS2);
            $select.val(formData.tipo_clase).trigger('change.select2');
            return () => $select.off('change', handleChangeS2);
        }
    }, [isOpen, formData.tipo_clase, currentStep]);

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => {
                const config = getDefaultConfigForType(prev.tipo_clase);
                return {
                    ...prev,
                    fecha_hora: initialDate || getCurrentLocalTime(),
                    capacidad_maxima: config ? config.capacidad_personas.toString() : prev.capacidad_maxima,
                    horas_cancelacion: config ? config.horas_cancelacion_default.toString() : prev.horas_cancelacion,
                    precio_base: config ? (config.precio_base || '0.00') : '0.00'
                };
            });
            setCurrentStep(1);
            setErrors({});
            setSearchQuery('');
        }
    }, [isOpen, initialDate]);

    // Filtrar tipos de sesión por centro seleccionado
    const filteredTipos = useMemo(() => {
        const selectedCentroObj = centros.find(c => c.nombre === formData.centro);
        const selectedCentroId = selectedCentroObj ? selectedCentroObj.id : null;
        return tiposSesion.filter(t => t.centro_id === null || t.centro_id === selectedCentroId);
    }, [centros, tiposSesion, formData.centro]);

    // Filtrar entrenadores por búsqueda
    const filteredCoaches = useMemo(() => {
        if (!trainerSearchQuery.trim()) return entrenadores;
        const q = trainerSearchQuery.toLowerCase();
        return entrenadores.filter(c => c.name.toLowerCase().includes(q));
    }, [trainerSearchQuery, entrenadores]);

    // Auto-corregir tipo de clase si queda fuera del filtro al cambiar de centro
    useEffect(() => {
        if (isOpen && formData.centro && filteredTipos.length > 0) {
            const isCurrentTypeValid = filteredTipos.some(t => t.slug === formData.tipo_clase);
            if (!isCurrentTypeValid) {
                const firstValid = filteredTipos[0];
                setFormData(prev => ({
                    ...prev,
                    tipo_clase: firstValid.slug,
                    capacidad_maxima: firstValid.capacidad_personas.toString(),
                    precio_base: firstValid.precio_base || '0.00'
                }));
            }
        }
    }, [formData.centro, filteredTipos, isOpen, formData.tipo_clase]);

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
        console.log(`[handleChange] name:${name}, value:${value}, type:${type}`);
        setFormData(prev => {
            const nextState = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            if (name === 'tipo_clase') {
                const config = getDefaultConfigForType(value);
                nextState.capacidad_maxima = config ? config.capacidad_personas.toString() : '1';
                nextState.precio_base = config ? (config.precio_base || '0.00') : '0.00';
                console.log(`[handleChange] Tipo cambió a: ${value}, capacidad: ${nextState.capacidad_maxima}, precio: ${nextState.precio_base}`);
            }

            return nextState;
        });
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

    const toggleCredito = (id) => {
        setFormData(prev => {
            const arr = prev.tipos_credito_permitidos;
            return {
                ...prev,
                tipos_credito_permitidos: arr.includes(id) ? arr.filter(s => s !== id) : [...arr, id]
            }
        });
    };

    const selectedTypeConfig = getDefaultConfigForType(formData.tipo_clase);
    const isFixedCapacity = selectedTypeConfig ? selectedTypeConfig.capacidad_fija : false;

    const validateStep = (step) => {
        const newErrs = {};
        if (step === 1) {
            if (!formData.centro) newErrs.centro = "Selecciona un centro deportivo.";
            if (!formData.nombre_clase.trim()) newErrs.nombre_clase = "El nombre es obligatorio.";
            if (!formData.tipo_clase) newErrs.tipo_clase = "Obligatorio.";
        } else if (step === 2) {
            if (!formData.fecha_hora) newErrs.fecha_hora = "Obligatorio.";
            if (parseFloat(formData.precio_base) < 0) newErrs.precio_base = "El precio no puede ser negativo.";
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
        if (!validateStep(2)) return; 
        
        setLoading(true);
        try {
            const mappedType = formData.tipo_clase.toUpperCase();
            
            const payload = {
                ...formData,
                capacidad_maxima: formData.capacidad_maxima ? parseInt(formData.capacidad_maxima) : null,
                trainers: formData.trainers.map(t => t.id),
                participants: formData.participants.map(p => ({
                    user_id: p.id,
                    precio: (formData.tipo_clase === 'ep' || formData.tipo_clase === 'EP') ? (p.precio_hora || 0) : 0,
                    metodo_pago: 'EF'
                })),
                tipo_clase: mappedType
            };
            const response = await axios.post('/Pagos', payload);
            if (response.data.success) {
                // Reset Form
                setFormData({
                    centro: '',
                    nombre_clase: '',
                    tipo_clase: tiposSesion.length > 0 ? tiposSesion[0].slug : '',
                    capacidad: '',
                    capacidad_maxima: tiposSesion.length > 0 ? tiposSesion[0].capacidad_personas.toString() : '1',
                    fecha_hora: getCurrentLocalTime(),
                    precio_base: tiposSesion.length > 0 ? (tiposSesion[0].precio_base || '0.00') : '0.00',
                    is_recurring: false,
                    recurrence_end: '',
                    trainers: [],
                    participants: [],
                    suscripciones_permitidas: [],
                    tipos_credito_permitidos: tiposSesion.length > 0 ? (tiposSesion[0].tipos_credito_ids || []) : [],
                    horas_cancelacion: tiposSesion.length > 0 ? tiposSesion[0].horas_cancelacion_default.toString() : '0'
                });
                setCurrentStep(1);
                setErrors({});
                setSearchQuery('');
                setTrainerSearchQuery('');
                setSusSearchQuery('');
                
                onSuccess();
                onClose();
            } else {
                alert(response.data.message || 'Error al agendar la clase');
            }
        } catch (error) {
            console.error('Submit error:', error);
            const serverMsg = error.response?.data?.message 
                || (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null)
                || error.message 
                || 'Error desconocido';
            alert(`Error al guardar la clase:\n${serverMsg}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    console.log('[CrearClaseModal] Render - formData.tipo_clase:', formData.tipo_clase, 'capacidad_maxima:', formData.capacidad_maxima, 'currentStep:', currentStep);

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
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <img 
                                src={`${window.AppConfig?.baseUrl || '/'}img/logopng.png`} 
                                alt="Factomove Logo" 
                                className="w-9 h-9 drop-shadow-md transition-transform group-hover:scale-110" 
                            />
                            <span className="font-black text-slate-900 tracking-tighter text-xl uppercase italic">Factomove</span>
                        </div>
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

                        {/* Removed Step 3 from Sidebar */}
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
                                                <select 
                                                    ref={select2Ref}
                                                    name="tipo_clase" 
                                                    value={formData.tipo_clase} 
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 outline-none">
                                                    <option value="">Selecciona un tipo...</option>
                                                    {filteredTipos.map(t => (
                                                        <option key={t.id} value={t.slug}>{t.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-[11px] font-black tracking-widest text-slate-400 uppercase">Asignación de Entrenadores</h3>
                                        <div className="relative w-48">
                                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]"></i>
                                            <input 
                                                type="text" 
                                                placeholder="Buscar entrenador..." 
                                                value={trainerSearchQuery}
                                                onChange={(e) => setTrainerSearchQuery(e.target.value)}
                                                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-[#38C1A3]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                                        {filteredCoaches.map(coach => {
                                            const isSelected = formData.trainers.some(t => t.id === coach.id);
                                            return (
                                                <label key={coach.id} className="cursor-pointer">
                                                    <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleTrainer(coach.id, coach.name, coach.foto_de_perfil || coach.profile_photo_path)} />
                                                    <div className={`border p-3 rounded-xl flex items-center gap-3 transition-all ${isSelected ? 'border-[#38C1A3] bg-teal-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 overflow-hidden shrink-0">
                                                            {coach.profile_photo_path || coach.foto_de_perfil ? <img src={`/storage/${coach.profile_photo_path || coach.foto_de_perfil}`} className="w-full h-full object-cover"/> : coach.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-xs font-bold truncate text-slate-800">{coach.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium tracking-tighter uppercase">Coach</span>
                                                        </div>
                                                        {isSelected && <i className="fa-solid fa-circle-check text-teal-500 ml-auto text-xs"></i>}
                                                    </div>
                                                </label>
                                            )
                                        })}
                                        {filteredCoaches.length === 0 && (
                                            <div className="col-span-full py-8 text-center text-slate-400 text-xs italic font-medium">
                                                No se encontraron entrenadores.
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* ————————————————— PASO 2: PLANIFICACIÓN ————————————————— */}
                        {currentStep === 2 && (
                            <div className="animate-in slide-in-from-right-4 fade-in duration-300 w-full max-w-2xl mx-auto space-y-10">
                                <section>
                                    <h3 className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-6">Agenda y Precios</h3>
                                    
                                    {/* Display del tipo seleccionado */}
                                    <div className="mb-6 p-3 bg-slate-100 rounded-lg">
                                        <span className="text-xs font-bold text-slate-600">Tipo de Sesión Seleccionado: <strong className="text-[#38C1A3]">{formData.tipo_clase.toUpperCase()}</strong></span>
                                    </div>
                                    
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

                                    {/* Capacidad máxima — editable para grupos y privado */}
                                    {!isFixedCapacity ? (
                                        <div className="mt-6 space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 pl-1">
                                                Límite de Personas (Máximo)
                                            </label>
                                            <input
                                                type="number"
                                                name="capacidad_maxima"
                                                min="1"
                                                value={formData.capacidad_maxima}
                                                onChange={handleChange}
                                                placeholder="Ej. 10"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 outline-none focus:border-[#38C1A3]"
                                            />
                                            <p className="text-[11px] text-slate-400 pl-1 font-medium">Puedes ajustar el límite para este grupo específico.</p>
                                        </div>
                                    ) : (
                                        <div className="mt-6 space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 pl-1">Límite de Personas (Fijo)</label>
                                            <div className="w-full bg-slate-100 border border-slate-300 text-slate-600 text-sm font-bold rounded-xl px-4 py-3.5 outline-none cursor-not-allowed flex items-center justify-between">
                                                <span>{formData.capacidad_maxima} Persona{formData.capacidad_maxima !== '1' ? 's' : ''}</span>
                                                <i className="fa-solid fa-lock text-slate-400 text-xs"></i>
                                            </div>
                                            <p className="text-[11px] text-slate-400 pl-1 font-medium">El límite es fijo según el tipo de sesión configurado.</p>
                                        </div>
                                    )}

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

                                    {/* Nueva Ventana de Cancelación */}
                                    <div className="mt-6 space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 pl-1 flex items-center gap-2">
                                            <i className="fa-solid fa-clock-rotate-left text-[#38C1A3]"></i>
                                            Ventana de Cancelación (Horas antes)
                                        </label>
                                        <input
                                            type="number"
                                            name="horas_cancelacion"
                                            min="0"
                                            value={formData.horas_cancelacion}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 outline-none focus:border-[#38C1A3]"
                                        />
                                        <p className="text-[11px] text-slate-400 pl-1 font-medium italic">
                                            Si el cliente se desapunta con menos de {formData.horas_cancelacion}h de antelación, perderá el crédito.
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-2">
                                        Participantes <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{formData.participants.length}</span>
                                    </h3>

                                    {/* Búsqueda y selección manual para todos los tipos */}
                                    <>
                                        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
                                            <i className="fa-solid fa-circle-info text-blue-500 mt-0.5 text-sm shrink-0"></i>
                                            <p className="text-xs text-blue-800 font-medium">Puedes añadir participantes ahora o gestionar el grupo desde el calendario después de crear la clase.</p>
                                        </div>

                                        <div className="relative w-full mb-4">
                                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar alumno por nombre..."
                                                className={`w-full bg-white border ${errors.participants ? 'border-rose-400' : 'border-slate-200'} focus:border-[#38C1A3] text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 pl-12 outline-none shadow-sm`} />
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
                                        {errors.participants && <p className="text-xs text-rose-500 font-bold mb-3">{errors.participants}</p>}
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
                                    </>
                                </section>

                                {/* Merged Subscription section into Step 2 with Search */}
                                <section className="pt-6 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[11px] font-black tracking-widest text-slate-400 uppercase">Créditos Permitidos</h3>
                                        <div className="relative w-48">
                                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]"></i>
                                            <input 
                                                type="text" 
                                                placeholder="Buscar crédito..." 
                                                value={susSearchQuery}
                                                onChange={(e) => setSusSearchQuery(e.target.value)}
                                                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-[#38C1A3]"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                                        {tiposCredito
                                            .filter(tc => tc.nombre.toLowerCase().includes(susSearchQuery.toLowerCase()))
                                            .sort((a, b) => {
                                                const aChecked = formData.tipos_credito_permitidos.includes(a.id);
                                                const bChecked = formData.tipos_credito_permitidos.includes(b.id);
                                                if (aChecked && !bChecked) return -1;
                                                if (!aChecked && bChecked) return 1;
                                                return 0;
                                            })
                                            .map(tc => {
                                                const isChecked = formData.tipos_credito_permitidos.includes(tc.id);
                                                return (
                                                    <label key={tc.id} className="cursor-pointer block relative">
                                                        <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleCredito(tc.id)} />
                                                        <div className={`border rounded-xl p-3 transition-all ${isChecked ? 'border-[#38C1A3] bg-teal-50/20' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                                                            <div className="flex justify-between items-center">
                                                                <span className={`font-bold text-xs ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>{tc.nombre}</span>
                                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isChecked ? 'bg-[#38C1A3] border-transparent' : 'bg-white border-slate-200'}`}>
                                                                    {isChecked && <i className="fa-solid fa-check text-[8px] text-white"></i>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                )
                                        })}
                                        {tiposCredito.filter(tc => tc.nombre.toLowerCase().includes(susSearchQuery.toLowerCase())).length === 0 && (
                                            <div className="col-span-full py-4 text-center text-slate-400 text-xs italic font-medium">
                                                No se encontraron créditos disponibles.
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold italic mt-2">
                                        <i className="fa-solid fa-circle-info mr-1"></i> 
                                        Por defecto se aplican los créditos configurados para este tipo de sesión.
                                    </p>
                                </section>
                            </div>
                        )}

                        {/* Step 3 was here */}
                    </div>

                    {/* Footer Actions Main */}
                    <div className="px-10 py-5 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
                        {currentStep > 1 ? (
                            <button type="button" onClick={prevStep} className="px-6 py-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                                <i className="fa-solid fa-arrow-left"></i> Anterior
                            </button>
                        ) : <div></div>}

                        {currentStep < 2 ? (
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
