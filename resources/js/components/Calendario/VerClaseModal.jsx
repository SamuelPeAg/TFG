import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmModal from '../ConfirmModal';
import AlertModal from '../AlertModal';

export default function VerClaseModal({ isOpen, onClose, selectedEvent, centros, entrenadores, users, suscripciones, tiposCredito = [], tiposSesion = [], onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for selectors
  const [trainerSearchTerm, setTrainerSearchTerm] = useState('');
  const [showTrainerSuggestions, setShowTrainerSuggestions] = useState(false);
  
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  // We keep a local copy of extendedProps to do optimistic UI updates easily
  const [localProps, setLocalProps] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Custom Alerts & Confirms
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', isError: false });
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });

  const showAlert = (message, isError = false, title = isError ? "Error" : "Éxito") => {
    setAlertConfig({ isOpen: true, title, message, isError });
  };

  const askConfirmation = (title, message, onConfirm, isDestructive = false) => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm, isDestructive });
  };
  
  const sessionTypeLabel = (tipo) => {
    const config = tiposSesion.find(t => t.slug.toUpperCase() === (tipo || '').toString().toUpperCase());
    return config ? config.nombre : (tipo || 'Sin Tipo');
  };

  const [editNombre, setEditNombre] = useState('');
  const [editCentro, setEditCentro] = useState('');
  const [editTipo, setEditTipo] = useState('');
  const [editFecha, setEditFecha] = useState('');
  const [editSuscripciones, setEditSuscripciones] = useState([]);
  const [editCreditos, setEditCreditos] = useState([]);
  const [editCapacidad, setEditCapacidad] = useState('');

  useEffect(() => {
    if (isOpen && selectedEvent) {
      setLocalProps(JSON.parse(JSON.stringify(selectedEvent.extendedProps)));
      setTrainerSearchTerm('');
      setClientSearchTerm('');
      setShowClientSuggestions(false);
      setShowTrainerSuggestions(false);
      setIsEditing(false);
      
      // Init edit form from extendedProps
      const p = selectedEvent.extendedProps;
      setEditNombre(p.clase_nombre || '');
      setEditCentro(p.centro || '');
      setEditTipo(p.tipo_clase || '');
      
      // Handle date formatting
      if (p.session_key && p.session_key.fecha_hora) {
          const dt = p.session_key.fecha_hora.replace(' ', 'T');
          setEditFecha(dt);
      } else if (selectedEvent.start) {
          const d = selectedEvent.start;
          const pad = (n) => String(n).padStart(2, '0');
          setEditFecha(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
      }
      
      setEditSuscripciones(p.suscripciones_permitidas || []);
      setEditCreditos(p.tipos_credito_permitidos || []);
      setEditCapacidad(p.capacidad_maxima || '');
    } else {
      setLocalProps(null);
      setIsEditing(false);
    }
  }, [isOpen, selectedEvent]);

  if (!isOpen || !selectedEvent || !localProps) return null;

  const sessionKey = localProps.session_key;
  
  // Handlers for interacting with Laravel
  const handleAddTrainer = async (trainer) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('trainer_id', trainer.id);
      formData.append('fecha_hora', sessionKey.fecha_hora);
      formData.append('nombre_clase', sessionKey.nombre_clase);
      formData.append('centro', sessionKey.centro);

      const res = await axios.post('/Pagos/add-trainer', formData, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.data.success) {
        setLocalProps({ ...localProps, entrenadores: res.data.trainers });
        setTrainerSearchTerm('');
        setShowTrainerSuggestions(false);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error(err);
      alert("Error al añadir entrenador");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTrainer = (trainerId) => {
    askConfirmation(
        "¿Desasignar entrenador?",
        "Seguro que deseas quitar a este entrenador de la sesión?",
        async () => {
            setIsSubmitting(true);
            try {
              const formData = new FormData();
              formData.append('trainer_id', trainerId);
              formData.append('fecha_hora', sessionKey.fecha_hora);
              formData.append('nombre_clase', sessionKey.nombre_clase);
              formData.append('centro', sessionKey.centro);

              const res = await axios.post('/Pagos/remove-trainer', formData, {
                headers: { 'Accept': 'application/json' }
              });
              if (res.data.success) {
                setLocalProps({ ...localProps, entrenadores: res.data.trainers });
                if (onSuccess) onSuccess();
              }
            } catch (err) {
              showAlert("No se pudo remover al entrenador", true);
            } finally {
              setIsSubmitting(false);
            }
        },
        true
    );
  };

  const handleAddClient = async (user) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('fecha_hora', sessionKey.fecha_hora);
      formData.append('nombre_clase', sessionKey.nombre_clase);
      formData.append('centro', sessionKey.centro);

      const res = await axios.post('/Pagos/add-client', formData, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (res.data.success) {
        // Optimistic update
        const newStudent = {
            id: user.id,
            nombre: user.name,
            pago: 'Pendiente',
            coste: 0,
            photo: user.photo || null
        };
        setLocalProps({
            ...localProps,
            alumnos: [...(localProps.alumnos || []), newStudent],
            alumnos_count: (localProps.alumnos_count || 0) + 1
        });

        if (onSuccess) onSuccess();
        setClientSearchTerm('');
        setShowClientSuggestions(false);
      } else {
        alert(res.data.error || "Error al añadir alumno");
      }
    } catch (err) {
      console.error(err);
      const serverError = err.response?.data?.error || err.response?.data?.message;
      alert(serverError || "Error al añadir alumno");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveClient = (userId) => {
    askConfirmation(
        "¿Eliminar asistente?",
        "¿Estás seguro de que quieres dar de baja a este cliente de la sesión? Se le devolverá el crédito si está en plazo.",
        async () => {
            setIsSubmitting(true);
            try {
              const formData = new FormData();
              formData.append('user_id', userId);
              formData.append('fecha_hora', sessionKey.fecha_hora);
              formData.append('nombre_clase', sessionKey.nombre_clase);
              formData.append('centro', sessionKey.centro);

              const res = await axios.post('/Pagos/remove-client', formData, {
                headers: { 'Accept': 'application/json' }
              });
              if (res.data.success) {
                  const newAlumnos = (localProps.alumnos || []).filter(a => a.id != userId);
                  setLocalProps({ ...localProps, alumnos: newAlumnos });
                  if(onSuccess) onSuccess();
                  showAlert(res.data.message || "Cliente eliminado correctamente");
              } else {
                  showAlert(res.data.error || "No se pudo eliminar al cliente", true);
              }
            } catch (err) {
              const serverError = err.response?.data?.error || err.response?.data?.message;
              showAlert(serverError || "Error al conectar con el servidor", true);
            } finally {
              setIsSubmitting(false);
            }
        },
        true
    );
  };

  const handleDeleteSession = () => {
    askConfirmation(
        "¿Eliminar sesión?",
        "Esta acción eliminará la sesión completa y los pagos asociados de forma permanente. ¿Continuar?",
        async () => {
            setIsSubmitting(true);
            try {
              const formData = new FormData();
              formData.append('fecha_hora', sessionKey.fecha_hora);
              formData.append('nombre_clase', sessionKey.nombre_clase);
              formData.append('centro', sessionKey.centro);

              const res = await axios.post('/Pagos/delete-session', formData, {
                headers: { 'Accept': 'application/json' }
              });
              if (res.data.success) {
                if (onSuccess) onSuccess();
                onClose();
              } else {
                showAlert(res.data.error || "Error al eliminar la sesión", true);
              }
            } catch (err) {
              showAlert("Error al conectar con el servidor", true);
            } finally {
              setIsSubmitting(false);
            }
        },
        true
    );
  };

  const handleSaveSession = async () => {
    setIsSubmitting(true);
    try {
        const payload = {
            old_fecha_hora: sessionKey.fecha_hora,
            old_nombre_clase: sessionKey.nombre_clase,
            old_centro: sessionKey.centro,
            new_fecha_hora: editFecha.replace('T', ' '),
            new_nombre_clase: editNombre,
            new_centro: editCentro,
            new_tipo_clase: editTipo,
            capacidad_maxima: editCapacidad,
            suscripciones_permitidas: editSuscripciones,
            tipos_credito_permitidos: editCreditos
        };
        
        const res = await axios.post('/Pagos/update-session', payload);

        if (res.data.success) {
            if (onSuccess) onSuccess();
            setIsEditing(false);
            
            // Re-map suscripciones_detalles for local state
            const selectedSubs = suscripciones.filter(s => editSuscripciones.includes(s.id))
                                             .map(s => ({ id: s.id, nombre: s.nombre }));

            setLocalProps({
                ...localProps,
                clase_nombre: editNombre,
                centro: editCentro,
                tipo_clase: editTipo,
                capacidad_maxima: editCapacidad,
                suscripciones_detalles: selectedSubs,
                suscripciones_permitidas: editSuscripciones,
                tipos_credito_permitidos: editCreditos,
                tipos_credito_detalles: tiposCredito.filter(t => editCreditos.includes(t.id)).map(t => ({ id: t.id, nombre: t.nombre })),
                hora: editFecha.split('T')[1].substring(0, 5),
                session_key: {
                    ...sessionKey,
                    fecha_hora: editFecha.replace('T', ' '),
                    nombre_clase: editNombre,
                    centro: editCentro
                }
            });
        }
    } catch (err) {
        console.error(err);
        alert("Error al actualizar la sesión");
    } finally {
        setIsSubmitting(false);
    }
  };


  // Helper Formatting
  const rawDate = selectedEvent.start;
  const days = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'];
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  
  const dayName = rawDate ? days[rawDate.getDay()] : '...';
  const dayNum = rawDate ? rawDate.getDate() : '...';
  const monthName = rawDate ? months[rawDate.getMonth()] : '...';
  const horaFormat = localProps.hora || (rawDate ? `${rawDate.getHours().toString().padStart(2,'0')}:${rawDate.getMinutes().toString().padStart(2,'0')}` : '...');

  const filteredUsers = users.filter(u => 
      (u.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || (u.dni && u.dni.toLowerCase().includes(clientSearchTerm.toLowerCase()))) &&
      !(localProps.alumnos || []).find(a => a.id === u.id)
  ).slice(0, 5);

  const filteredTrainersList = entrenadores.filter(t => 
      t.name.toLowerCase().includes(trainerSearchTerm.toLowerCase()) &&
      !(localProps.entrenadores || []).find(e => e.id === t.id)
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[9999] flex items-center justify-center p-2 sm:p-6 backdrop-blur-md"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      
      <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        
        {/* Header Premium with Gradient */}
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white pt-8 pb-10 text-center relative px-4 shrink-0 shadow-lg">
           <button 
             onClick={onClose}
             className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 transition-all border border-white/5"
           >
             <i className="fa-solid fa-xmark text-lg"></i>
           </button>
           <h3 className="text-[12px] font-black tracking-[0.3em] text-[#38b2ac] mb-2 leading-none uppercase">{dayName}</h3>
           <div className="flex items-baseline justify-center gap-3">
               <span className="text-6xl font-black tracking-tighter drop-shadow-md">{dayNum}</span>
               <span className="text-3xl font-medium text-slate-400">de {monthName}</span>
           </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
           
           {/* Left Column (Main Info & Attendees) */}
           <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white scrollbar-hide">
              
              <div className="mb-8">
                  {isEditing ? (
                      <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                          <div>
                              <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Nombre de la Clase</label>
                              <div className="relative group">
                                  <input 
                                      type="text" 
                                      value={editNombre} 
                                      onChange={(e) => setEditNombre(e.target.value)}
                                      className="w-full text-3xl font-black text-[#0f172a] border-b-2 border-slate-100 focus:border-[#38b2ac] outline-none pb-2 bg-transparent transition-all"
                                      placeholder="Nombre de la clase"
                                  />
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Fecha y Hora</label>
                                  <div className="space-y-3">
                                      {/* Selector de Fecha */}
                                      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 focus-within:border-[#38b2ac] transition-all">
                                          <i className="fa-solid fa-calendar-day text-[#38b2ac]"></i>
                                          <input 
                                              type="date" 
                                              value={editFecha.split('T')[0]} 
                                              onChange={(e) => {
                                                  const time = editFecha.split('T')[1] || '00:00';
                                                  setEditFecha(`${e.target.value}T${time}`);
                                              }}
                                              className="w-full bg-transparent outline-none font-bold text-slate-700 text-sm cursor-pointer"
                                          />
                                      </div>
                                      {/* Selector de Hora con controles rápidos */}
                                      <div className="flex items-center gap-2">
                                          <div className="flex-1 flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 focus-within:border-[#38b2ac] transition-all">
                                              <i className="fa-solid fa-clock text-[#38b2ac]"></i>
                                              <input 
                                                  type="time" 
                                                  value={editFecha.split('T')[1]?.substring(0, 5) || '00:00'} 
                                                  onChange={(e) => {
                                                      const date = editFecha.split('T')[0];
                                                      setEditFecha(`${date}T${e.target.value}`);
                                                  }}
                                                  className="w-full bg-transparent outline-none font-bold text-slate-700 text-sm cursor-pointer"
                                              />
                                          </div>
                                          {/* Botones de ajuste rápido (+/- 15 min) */}
                                          <div className="flex flex-col gap-1">
                                              <button 
                                                  onClick={() => {
                                                      const d = new Date(editFecha);
                                                      d.setMinutes(d.getMinutes() + 15);
                                                      const pad = (n) => String(n).padStart(2, '0');
                                                      setEditFecha(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                                                  }}
                                                  className="w-8 h-6 bg-slate-100 hover:bg-[#38b2ac] hover:text-white rounded-t-lg flex items-center justify-center text-[10px] transition-colors"
                                                  title="+15 min"
                                              >
                                                  <i className="fa-solid fa-plus"></i>
                                              </button>
                                              <button 
                                                  onClick={() => {
                                                      const d = new Date(editFecha);
                                                      d.setMinutes(d.getMinutes() - 15);
                                                      const pad = (n) => String(n).padStart(2, '0');
                                                      setEditFecha(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                                                  }}
                                                  className="w-8 h-6 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-b-lg flex items-center justify-center text-[10px] transition-colors"
                                                  title="-15 min"
                                              >
                                                  <i className="fa-solid fa-minus"></i>
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <div>
                                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Centro</label>
                                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 focus-within:border-[#38b2ac] transition-all">
                                      <i className="fa-solid fa-building text-[#38b2ac]"></i>
                                      <select 
                                          value={editCentro} 
                                          onChange={(e) => setEditCentro(e.target.value)}
                                          className="w-full bg-transparent outline-none font-bold text-slate-700 text-sm uppercase"
                                      >
                                          {centros.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                                      </select>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="animate-in fade-in duration-500">
                          <h2 className="text-4xl font-black text-[#0f172a] tracking-tight leading-[1.1] mb-6">
                              {localProps.clase_nombre || "Clase sin Nombre"}
                          </h2>
                          <div className="flex flex-wrap gap-3">
                              <div className="flex items-center gap-2.5 px-5 py-2.5 bg-[#f1f5f9] rounded-2xl border border-slate-100 shadow-sm">
                                  <i className="fa-solid fa-clock text-[#38b2ac] text-sm"></i>
                                  <span className="text-[13px] font-black text-[#1e293b]">{horaFormat}</span>
                              </div>
                              <div className="flex items-center gap-2.5 px-5 py-2.5 bg-[#f1f5f9] rounded-2xl border border-slate-100 shadow-sm transition-all">
                                  <i className="fa-solid fa-location-dot text-[#38b2ac] text-sm"></i>
                                  <span className="text-[13px] font-black text-[#1e293b] uppercase tracking-wide">{localProps.centro}</span>
                              </div>
                              {localProps.tipo_clase && (
                                  <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border shadow-sm transition-all" 
                                       style={{ backgroundColor: localProps.tipo_color ? localProps.tipo_color + '15' : '#f1f5f9', borderColor: localProps.tipo_color || '#e2e8f0' }}>
                                      <i className="fa-solid fa-layer-group text-sm" style={{ color: localProps.tipo_color || '#64748b' }}></i>
                                      <span className="text-[13px] font-black uppercase tracking-wide" style={{ color: localProps.tipo_color || '#475569' }}>
                                          {sessionTypeLabel(localProps.tipo_clase)}
                                      </span>
                                  </div>
                              )}
                          </div>
                      </div>
                  )}
              </div>

              {/* Credits Area with Premium Visuals */}
              <div className="mb-10">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-1">
                      CRÉDITOS CANJEABLES
                   </h4>
                   <div className={`p-6 rounded-[24px] border transition-all ${isEditing ? 'bg-white border-[#38b2ac] shadow-xl' : 'bg-slate-50/50 border-slate-100'}`}>
                      {isEditing ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                              {tiposCredito
                                  .sort((a, b) => {
                                      const aChecked = editCreditos.includes(a.id);
                                      const bChecked = editCreditos.includes(b.id);
                                      if (aChecked && !bChecked) return -1;
                                      if (!aChecked && bChecked) return 1;
                                      return 0;
                                  })
                                  .map(t => {
                                      const isSelected = editCreditos.includes(t.id);
                                      return (
                                          <button 
                                              key={t.id}
                                              onClick={() => {
                                                  if (isSelected) setEditCreditos(editCreditos.filter(id => id !== t.id));
                                                  else setEditCreditos([...editCreditos, t.id]);
                                              }}
                                              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black transition-all border-2 ${isSelected ? 'bg-[#38b2ac] text-white border-[#38b2ac] shadow-md scale-[1.02]' : 'bg-white text-slate-500 border-slate-100 hover:border-[#38b2ac]/30'}`}
                                          >
                                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-white text-[#38b2ac]' : 'bg-slate-100 text-slate-300'}`}>
                                                  <i className={`fa-solid ${isSelected ? 'fa-check text-[10px]' : 'fa-plus text-[10px]'}`}></i>
                                              </div>
                                              <span className="truncate">{t.nombre}</span>
                                          </button>
                                      );
                                  })}
                          </div>
                      ) : (
                          <div className="flex flex-wrap gap-2.5">
                              {localProps.tipos_credito_detalles && localProps.tipos_credito_detalles.length > 0 ? (
                                  localProps.tipos_credito_detalles.map(t => (
                                      <span key={t.id} className="inline-flex items-center gap-3 bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                          <div className="w-2.5 h-2.5 rounded-full bg-[#38b2ac]"></div>
                                          <span className="text-xs font-black text-[#334155]">{t.nombre}</span>
                                      </span>
                                  ))
                              ) : (
                                  <div className="flex items-center gap-3 text-[13px] text-slate-400 font-bold italic py-2">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                                          <i className="fa-solid fa-unlock-keyhole"></i>
                                      </div>
                                      Acceso libre - Sin filtros aplicados
                                  </div>
                              )}
                          </div>
                      )}
                   </div>
              </div>

              {/* Attendees List Section */}
              <div className="mb-6">
                   <div className="flex items-center justify-between mb-5 px-1">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                           Asistentes Confirmados
                        </h4>
                        <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500">
                             {localProps.alumnos_count || 0} / {localProps.capacidad_maxima || '∞'}
                        </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(localProps.alumnos || []).length === 0 ? (
                          <div className="col-span-full py-10 text-center bg-slate-50/50 rounded-[24px] border border-slate-100">
                               <p className="text-sm font-bold text-slate-400 italic">No hay asistentes inscritos aún.</p>
                          </div>
                      ) : (
                          localProps.alumnos.map((alum) => (
                              <div key={alum.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 shadow-sm rounded-2xl group hover:border-[#38b2ac]/30 hover:shadow-lg transition-all">
                                  <div className="flex items-center gap-3">
                                      <div className="w-11 h-11 shrink-0 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-white shadow-sm">
                                          {alum.photo ? (
                                              <img src={alum.photo} className="w-full h-full object-cover" />
                                          ) : (
                                              <div className="w-full h-full flex items-center justify-center bg-teal-50 text-[#38b2ac] font-black text-xs">
                                                  {alum.nombre.charAt(0).toUpperCase()}
                                              </div>
                                          )}
                                      </div>
                                      <div className="min-w-0">
                                          <div className="font-black text-[#1e293b] text-[13px] leading-tight truncate">{alum.nombre}</div>
                                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{alum.pago || "Bono"}</div>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-4 shrink-0">
                                      {window.IS_ADMIN && (
                                          <button 
                                              onClick={() => handleRemoveClient(alum.id)}
                                              disabled={isSubmitting}
                                              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                          >
                                             <i className="fa-solid fa-circle-xmark text-lg"></i>
                                          </button>
                                      )}
                                  </div>
                              </div>
                          ))
                      )}
                   </div>
              </div>

              {/* Integrated Search Tool */}
              {window.IS_ADMIN && (
                  <div className="relative mt-8 pt-6 border-t border-slate-50">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#38b2ac] mb-4 px-1">
                           <i className="fa-solid fa-plus-circle mr-2"></i> Inscribir Alumno
                       </h4>
                       <div className="relative group">
                           <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#38b2ac] transition-colors"></i>
                           <input 
                               type="text" 
                               placeholder="Buscar por nombre, email o DNI para añadir rápido..." 
                               className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#38b2ac]/20 focus:bg-white outline-none rounded-2xl font-bold text-sm text-slate-700 placeholder:text-slate-300 transition-all shadow-sm"
                               value={clientSearchTerm}
                               onChange={(e) => {
                                   setClientSearchTerm(e.target.value);
                                   setShowClientSuggestions(true);
                               }}
                               onFocus={() => setShowClientSuggestions(true)}
                               onBlur={() => setTimeout(() => setShowClientSuggestions(false), 300)}
                           />

                           {showClientSuggestions && clientSearchTerm && (
                               <div className="absolute bottom-full left-0 w-full mb-3 bg-white border border-slate-100 rounded-[24px] shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                                   <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                       Sugerencias de Clientes
                                   </div>
                                   {filteredUsers.length === 0 ? (
                                       <div className="p-8 text-sm font-bold text-slate-400 text-center italic">
                                           No hemos encontrado clientes para añadir.
                                       </div>
                                   ) : (
                                       <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide flex flex-col gap-1">
                                           {filteredUsers.map(u => (
                                               <div 
                                                  key={u.id} 
                                                  className="p-3 rounded-2xl hover:bg-[#38b2ac]/5 cursor-pointer flex items-center justify-between transition-all group/res border border-transparent hover:border-[#38b2ac]/10"
                                                  onClick={() => handleAddClient(u)}
                                               >
                                                   <div className="flex items-center gap-3">
                                                       <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm bg-slate-100">
                                                           {u.photo ? (
                                                               <img src={u.photo} className="w-full h-full object-cover" />
                                                           ) : (
                                                               <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-xs">
                                                                   {u.name.charAt(0).toUpperCase()}
                                                               </div>
                                                           )}
                                                       </div>
                                                       <div className="min-w-0">
                                                           <div className="text-[13px] font-black text-slate-800 group-hover/res:text-[#38b2ac] transition-colors">{u.name}</div>
                                                           <div className="text-[10px] text-slate-400 font-bold uppercase truncate">{u.email} {u.dni ? `• ${u.dni}` : ''}</div>
                                                       </div>
                                                   </div>
                                                   <i className="fa-solid fa-plus-circle text-lg text-slate-200 group-hover/res:text-[#38b2ac] transition-all"></i>
                                               </div>
                                           ))}
                                       </div>
                                   )}
                               </div>
                           )}
                       </div>
                  </div>
              )}
           </div>

           {/* Right Column (Staff) */}
           <div className="w-full md:w-[300px] border-t md:border-t-0 md:border-l border-slate-100 bg-[#f8fafc]/50 flex flex-col p-6 md:p-8 shrink-0 relative overflow-y-auto scrollbar-hide">
                
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="w-8 h-8 rounded-xl bg-[#38b2ac] flex items-center justify-center text-white shadow-lg">
                         <i className="fa-solid fa-user-tie text-xs"></i>
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0f172a]">
                        Equipo Técnico
                    </h4>
                </div>
                
                <div className="space-y-3 mb-10">
                    {(localProps.entrenadores || []).length === 0 ? (
                        <div className="bg-white/60 border-2 border-dashed border-slate-100 rounded-[20px] p-8 text-center">
                            <i className="fa-solid fa-user-ninja text-slate-200 text-2xl mb-3 block"></i>
                            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Sin Asignación</span>
                        </div>
                    ) : (
                        localProps.entrenadores.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm group/trainer hover:border-[#38b2ac]/30 transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-100 shadow-sm shrink-0">
                                        {t.photo ? (
                                            <img src={t.photo} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center font-black text-xs">
                                                {t.initial || t.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-[13px] font-black text-slate-700 truncate">{t.name}</div>
                                </div>
                                {window.IS_ADMIN && (
                                    <button 
                                        onClick={() => handleRemoveTrainer(t.id)}
                                        disabled={isSubmitting}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover/trainer:opacity-100"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {window.IS_ADMIN && (
                    <div className="relative mb-auto pb-8">
                        <div className="relative group">
                            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#38b2ac] transition-colors"></i>
                            <input 
                                type="text"
                                placeholder="Añadir profesor..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl outline-none focus:border-[#38b2ac] font-bold text-xs shadow-sm"
                                value={trainerSearchTerm}
                                onChange={(e) => {
                                    setTrainerSearchTerm(e.target.value);
                                    setShowTrainerSuggestions(true);
                                }}
                                onFocus={() => setShowTrainerSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowTrainerSuggestions(false), 250)}
                            />

                            {showTrainerSuggestions && trainerSearchTerm && (
                                <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[100] overflow-hidden p-1 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    {filteredTrainersList.length === 0 ? (
                                        <div className="p-4 text-[11px] font-bold text-slate-400 text-center uppercase tracking-widest">Sin resultados</div>
                                    ) : (
                                        filteredTrainersList.map(t => (
                                            <div 
                                                key={t.id}
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#38b2ac]/5 cursor-pointer transition-all group/p"
                                                onClick={() => handleAddTrainer(t)}
                                            >
                                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm shrink-0">
                                                    {t.photo ? (
                                                        <img src={t.photo} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center font-black text-[10px]">
                                                            {t.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-[12px] font-black text-slate-700 group-hover/p:text-[#38b2ac]">{t.name}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Actions Area */}
                <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
                    {window.IS_ADMIN ? (
                         <>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <button 
                                       onClick={handleSaveSession}
                                       disabled={isSubmitting}
                                       className="w-full py-4 bg-[#38b2ac] text-white text-center text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-xl shadow-teal-500/30 transition-all hover:bg-teal-600 active:scale-95 disabled:opacity-50"
                                    >
                                        <i className="fas fa-check-circle mr-3"></i> Guardar Todo
                                    </button>
                                </div>
                            ) : (
                                <button 
                                   onClick={handleDeleteSession}
                                   disabled={isSubmitting}
                                   className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <i className="fas fa-trash-can mr-2"></i> Eliminar Sesión
                                </button>
                            )}
                         </>
                    ) : (
                        <div className="animate-in fade-in duration-700">
                             {(() => {
                               const isJoined = (localProps.alumnos || []).some(a => String(a.id) === String(window.AppConfig?.user?.id));
                               if (isJoined) {
                                   return (
                                       <button 
                                          onClick={() => handleRemoveClient(window.AppConfig?.user?.id)}
                                          disabled={isSubmitting}
                                          className="w-full py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-white bg-rose-500 hover:bg-rose-600 rounded-2xl shadow-xl shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
                                       >
                                           <i className="fa-solid fa-user-xmark mr-2"></i> CANCELAR CLASE
                                       </button>
                                   );
                               } else {
                                   return (
                                       <button 
                                          onClick={() => handleAddClient(window.AppConfig?.user)}
                                          disabled={isSubmitting}
                                          className="w-full py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-white bg-[#0f172a] hover:bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50"
                                       >
                                           <i className="fa-solid fa-check mr-2"></i> INSCRIBIRME
                                       </button>
                                   );
                               }
                            })()}
                        </div>
                    )}
                </div>
           </div>
        </div>

        {/* Global Modal Bottom Actions */}
        <div className="px-6 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
           <div className="flex-1 flex gap-4">
               {window.IS_ADMIN && (
                   <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex-1 max-w-[200px] px-6 py-3.5 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 ${isEditing ? 'bg-white border-2 border-slate-100 text-slate-400' : 'bg-[#f1f5f9] text-[#334155] border-2 border-transparent hover:border-[#38b2ac] shadow-sm'}`}
                   >
                      <i className={`fa-solid ${isEditing ? 'fa-xmark' : 'fa-pen-to-square'}`}></i>
                      {isEditing ? 'CANCELAR' : 'EDITAR'}
                   </button>
               )}
               <button 
                  onClick={onClose}
                  className="flex-1 px-8 py-3.5 bg-[#0f172a] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3"
               >
                  CERRAR PANEL
               </button>
           </div>
        </div>

        </div>
 
        <ConfirmModal 
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          isDestructive={confirmConfig.isDestructive}
        />

        <AlertModal 
          isOpen={alertConfig.isOpen}
          onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
          title={alertConfig.title}
          message={alertConfig.message}
          isError={alertConfig.isError}
        />
      </div>
  );
}
