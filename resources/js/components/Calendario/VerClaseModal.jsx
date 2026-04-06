import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function VerClaseModal({ isOpen, onClose, selectedEvent, centros, entrenadores, users, suscripciones, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for selectors
  const [selectedTrainerToAdd, setSelectedTrainerToAdd] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  // We keep a local copy of extendedProps to do optimistic UI updates easily
  const [localProps, setLocalProps] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form states
  const [editNombre, setEditNombre] = useState('');
  const [editCentro, setEditCentro] = useState('');
  const [editTipo, setEditTipo] = useState('');
  const [editFecha, setEditFecha] = useState('');
  const [editSuscripciones, setEditSuscripciones] = useState([]);

  useEffect(() => {
    if (isOpen && selectedEvent) {
      setLocalProps(JSON.parse(JSON.stringify(selectedEvent.extendedProps)));
      setSelectedTrainerToAdd('');
      setClientSearchTerm('');
      setShowClientSuggestions(false);
      setIsEditing(false);
      
      // Init edit form from extendedProps
      const p = selectedEvent.extendedProps;
      setEditNombre(p.clase_nombre || '');
      setEditCentro(p.centro || '');
      setEditTipo(p.tipo_clase || '');
      
      // Handle date formatting for datetime-local
      if (p.session_key && p.session_key.fecha_hora) {
          setEditFecha(p.session_key.fecha_hora.replace(' ', 'T'));
      } else if (selectedEvent.start) {
          const d = selectedEvent.start;
          const pad = (n) => String(n).padStart(2, '0');
          setEditFecha(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
      }
      
      setEditSuscripciones(p.suscripciones_permitidas || []);
      setEditCapacidad(p.capacidad_maxima || '');
    } else {
      setLocalProps(null);
      setIsEditing(false);
    }
  }, [isOpen, selectedEvent]);

  if (!isOpen || !selectedEvent || !localProps) return null;

  const sessionKey = localProps.session_key;
  
  // Handlers for interacting with Laravel
  const handleAddTrainer = async () => {
    if (!selectedTrainerToAdd) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('trainer_id', selectedTrainerToAdd);
      formData.append('fecha_hora', sessionKey.fecha_hora);
      formData.append('nombre_clase', sessionKey.nombre_clase);
      formData.append('centro', sessionKey.centro);

      const res = await axios.post('/Pagos/add-trainer', formData, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.data.success) {
        setLocalProps({ ...localProps, entrenadores: res.data.trainers });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      alert("Error al añadir entrenador");
    } finally {
      setIsSubmitting(false);
      setSelectedTrainerToAdd('');
    }
  };

  const handleRemoveTrainer = async (trainerId) => {
    if(!window.confirm("¿Seguro que deseas desasignar a este entrenador?")) return;
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
      alert("Error al remover entrenador");
    } finally {
      setIsSubmitting(false);
    }
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
        if (onSuccess) onSuccess();
        setClientSearchTerm('');
        setShowClientSuggestions(false);
        onClose(); 
      } else {
        alert(res.data.error || "Error al añadir alumno");
      }
    } catch (err) {
      console.error(err);
      alert("Error al añadir alumno");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveClient = async (userId) => {
    if(!window.confirm("¿Eliminar a este cliente de la sesión?")) return;
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
      } else {
          alert(res.data.error || "Error");
      }
    } catch (err) {
      alert("Error al eliminar alumno");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!window.confirm("Esta acción eliminará la sesión completa y los pagos asociados. ¿Continuar?")) return;
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
        alert(res.data.error || "Error al eliminar la sesión");
      }
    } catch (err) {
      alert("Error al eliminar la sesión");
    } finally {
      setIsSubmitting(false);
    }
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
            suscripciones_permitidas: editSuscripciones
        };
        
        const res = await axios.post('/Pagos/update-session', payload);

        if (res.data.success) {
            if (onSuccess) onSuccess();
            onClose();
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

  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) &&
      !(localProps.alumnos || []).find(a => a.id === u.id)
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      
      <div className="w-full max-w-4xl bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0f172a] text-white pt-8 pb-10 text-center relative px-4 rounded-t-[24px]">
           <button 
             onClick={onClose}
             className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
           >
             <i className="fa-solid fa-xmark"></i>
           </button>
           <h3 className="text-[11px] font-black tracking-[0.2em] text-slate-400 mb-1 leading-none">{dayName}</h3>
           <div className="flex items-baseline justify-center gap-2">
               <span className="text-5xl font-black tracking-tight">{dayNum}</span>
               <span className="text-2xl font-semibold text-slate-300">de {monthName}</span>
           </div>
        </div>

        <div className="flex flex-col md:flex-row min-h-[500px]">
           
           {/* Left Column */}
           <div className="flex-1 p-8 md:pr-10 bg-white">
              
              {isEditing ? (
                  <div className="mb-5 space-y-4">
                      <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Nombre de la Clase</label>
                          <input 
                              type="text" 
                              value={editNombre} 
                              onChange={(e) => setEditNombre(e.target.value)}
                              className="w-full text-2xl font-black text-slate-900 border-b-2 border-[#4BB7AE] outline-none pb-1 bg-transparent"
                              placeholder="Nombre de la clase"
                          />
                      </div>
                      <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Fecha y Hora</label>
                          <input 
                              type="datetime-local" 
                              value={editFecha} 
                              onChange={(e) => setEditFecha(e.target.value)}
                              className="w-full text-sm font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#4BB7AE]"
                          />
                      </div>
                  </div>
              ) : (
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-5">
                      {localProps.clase_nombre || "Clase sin Nombre"}
                  </h2>
              )}

              {/* Pills Area */}
              <div className="flex flex-wrap gap-3 mb-10">
                  {isEditing ? (
                      <>
                          {/* Centros Selector */}
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-transparent focus-within:border-[#4BB7AE] transition-all">
                              <i className="fa-solid fa-building text-[#4BB7AE] text-sm"></i>
                              <select 
                                  value={editCentro} 
                                  onChange={(e) => setEditCentro(e.target.value)}
                                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 uppercase cursor-pointer"
                              >
                                  {centros.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                              </select>
                          </div>

                          {/* Tipo Clase Selector */}
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-transparent focus-within:border-[#4BB7AE] transition-all">
                              <i className="fa-solid fa-layer-group text-[#4BB7AE] text-sm"></i>
                              <select 
                                  value={editTipo} 
                                  onChange={(e) => setEditTipo(e.target.value)}
                                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 uppercase cursor-pointer"
                              >
                                  <option value="EP">EP (Personal)</option>
                                  <option value="DUO">DUO</option>
                                  <option value="TRIO">TRIO</option>
                                  <option value="GRUPO">GRUPO</option>
                                  <option value="GRUPO_PRIVADO">GRUPO PRIVADO</option>
                              </select>
                          </div>
                      </>
                  ) : (
                      <>
                          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                              <i className="fa-solid fa-clock text-[#4BB7AE] text-sm"></i>
                              <span className="text-sm font-bold text-slate-600">{localProps.hora || "..."}</span>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                              <i className="fa-solid fa-building text-[#4BB7AE] text-sm"></i>
                              <span className="text-sm font-bold text-slate-600 uppercase">{localProps.centro || "..."}</span>
                          </div>
                          {localProps.tipo_clase && (
                              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                                  <i className="fa-solid fa-layer-group text-[#4BB7AE] text-sm"></i>
                                  <span className="text-sm font-bold text-slate-600 uppercase">{localProps.tipo_clase}</span>
                              </div>
                          )}
                      </>
                  )}
              </div>

              {/* Subscriptions Section */}
              <div className="mb-8 p-5 bg-[#F0FDFB] border border-[#CCFBF1] rounded-[20px]">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2D7A74] mb-3">
                      SUSCRIPCIONES CANJEABLES
                  </h4>
                  <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                          <div className="grid grid-cols-2 gap-2 w-full">
                              {suscripciones.map(s => {
                                  const isSelected = editSuscripciones.includes(s.id);
                                  return (
                                      <button 
                                          key={s.id}
                                          onClick={() => {
                                              if (isSelected) setEditSuscripciones(editSuscripciones.filter(id => id !== s.id));
                                              else setEditSuscripciones([...editSuscripciones, s.id]);
                                          }}
                                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${isSelected ? 'bg-[#4BB7AE] text-white border-transparent shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-[#4BB7AE]'}`}
                                      >
                                          <i className={`fa-solid ${isSelected ? 'fa-check' : 'fa-circle-plus opacity-50'}`}></i>
                                          <span className="truncate">{s.nombre}</span>
                                      </button>
                                  );
                              })}
                          </div>
                      ) : (
                          localProps.suscripciones_detalles && localProps.suscripciones_detalles.length > 0 ? (
                              localProps.suscripciones_detalles.map(s => (
                                  <span key={s.id} className="inline-flex items-center gap-2 bg-white border border-[#99F6E4] px-3 py-1.5 rounded-xl shadow-sm">
                                      <div className="w-2 h-2 rounded-full bg-[#4BB7AE]"></div>
                                      <span className="text-xs font-bold text-slate-700">{s.nombre}</span>
                                  </span>
                              ))
                          ) : (
                              <div className="text-xs text-slate-400 font-bold italic py-1">
                                  <i className="fa-solid fa-circle-exclamation mr-1.5"></i>
                                  No hay filtros de suscripción aplicados (Acceso libre)
                              </div>
                          )
                      )}
                  </div>
              </div>

              {/* Attendees List */}
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  ASISTENTES CONFIRMADOS ({(localProps.alumnos || []).length}{localProps.capacidad_maxima ? ` / ${localProps.capacidad_maxima}` : ''})
              </h4>
              
              <div className="space-y-3 mb-6">
                 {(localProps.alumnos || []).length === 0 ? (
                     <div className="text-sm text-slate-400 font-medium italic mb-6">No hay asistentes apuntados.</div>
                 ) : (
                     localProps.alumnos.map((alum) => (
                         <div key={alum.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 shadow-sm rounded-2xl group hover:border-[#4BB7AE]/30 hover:shadow-md transition-all">
                             <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-teal-100/60 rounded-xl flex items-center justify-center text-[#4BB7AE] font-black text-lg">
                                     {alum.nombre.charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                     <div className="font-bold text-slate-800 text-sm leading-tight">{alum.nombre}</div>
                                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{alum.pago || "Suscripción"}</div>
                                 </div>
                             </div>
                             <div className="flex items-center gap-5">
                                 <div className="font-black text-slate-900 text-sm">
                                     {window.IS_ADMIN ? `€${Number(alum.coste || 0).toFixed(2)}` : ''}
                                 </div>
                                 {window.IS_ADMIN && (
                                     <button 
                                         onClick={() => handleRemoveClient(alum.id)}
                                         disabled={isSubmitting}
                                         className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                                         title="Eliminar Alumno"
                                     >
                                        <i className="fa-solid fa-trash-can"></i>
                                     </button>
                                 )}
                             </div>
                         </div>
                     ))
                 )}
              </div>

              {/* Search Client */}
              {window.IS_ADMIN && (
                  <div className="relative">
                      <div className="w-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-[#4BB7AE] hover:text-[#4BB7AE] hover:bg-teal-50 transition-colors focus-within:border-[#4BB7AE] focus-within:bg-teal-50 focus-within:text-[#4BB7AE] relative overflow-hidden">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none opacity-50">
                              <i className="fa-solid fa-user-plus text-lg"></i>
                          </div>
                          <input 
                              type="text" 
                              placeholder="SELECCIONAR CLIENTE..." 
                              className="w-full py-4 pl-12 pr-4 bg-transparent outline-none text-center font-bold text-xs placeholder:text-inherit text-slate-700"
                              value={clientSearchTerm}
                              onChange={(e) => {
                                  setClientSearchTerm(e.target.value);
                                  setShowClientSuggestions(true);
                              }}
                              onFocus={() => setShowClientSuggestions(true)}
                              onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                          />
                      </div>
                      
                      {showClientSuggestions && clientSearchTerm && (
                          <div className="absolute top-14 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                              {filteredUsers.length === 0 ? (
                                  <div className="p-4 text-xs font-semibold text-slate-400 text-center">No se encontraron clientes</div>
                              ) : (
                                  filteredUsers.map(u => (
                                      <div 
                                         key={u.id} 
                                         className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer flex items-center gap-3 transition-colors"
                                         onClick={() => handleAddClient(u)}
                                      >
                                          <div className="w-8 h-8 rounded-full bg-[#4BB7AE]/10 text-[#4BB7AE] flex items-center justify-center font-bold text-xs">
                                              {u.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="flex-1">
                                              <div className="text-sm font-bold text-slate-700">{u.name}</div>
                                              <div className="text-[10px] text-slate-400 font-semibold">{u.email}</div>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      )}
                  </div>
              )}
           </div>

           {/* Right Column */}
           <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-slate-100 bg-white flex flex-col pt-8 pb-10 px-8 relative">
                
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#4BB7AE] mb-4 text-center">
                    EQUIPO TÉCNICO
                </h4>
                
                <div className="mb-10 w-full flex flex-col gap-3">
                    {(localProps.entrenadores || []).length === 0 ? (
                        <div className="border border-dashed border-slate-200 rounded-xl py-3 px-4 text-center text-xs font-bold text-slate-400 tracking-wide uppercase">
                            SIN ASIGNACIÓN
                        </div>
                    ) : (
                        localProps.entrenadores.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl group/trainer bg-slate-50">
                                <div className="text-sm font-bold text-slate-700">{t.name || 'Personal'}</div>
                                {window.IS_ADMIN && (
                                    <button 
                                        onClick={() => handleRemoveTrainer(t.id)}
                                        disabled={isSubmitting}
                                        className="text-slate-300 hover:text-rose-500 transition-colors hidden group-hover/trainer:block disabled:opacity-50"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {window.IS_ADMIN ? (
                    <>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
                            ASIGNAR PERSONAL
                        </h4>
                        <div className="flex gap-2 mb-auto">
                            <div className="relative flex-1">
                                <select 
                                    value={selectedTrainerToAdd}
                                    onChange={(e) => setSelectedTrainerToAdd(e.target.value)}
                                    className="w-full h-10 appearance-none bg-white border border-slate-200 rounded-xl px-4 py-0 text-xs font-bold text-slate-700 outline-none focus:border-[#0f172a] transition-colors shadow-sm"
                                >
                                    <option value="">Elegir...</option>
                                    {entrenadores.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none"></i>
                            </div>
                            <button 
                                onClick={handleAddTrainer}
                                disabled={!selectedTrainerToAdd || isSubmitting}
                                className="w-10 h-10 shrink-0 bg-[#0f172a] text-white rounded-xl flex items-center justify-center hover:bg-[#1e293b] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-plus text-sm"></i>
                            </button>
                        </div>
                        
                        <hr className="my-8 border-slate-100" />

                        {isEditing ? (
                            <button 
                               onClick={handleSaveSession}
                               disabled={isSubmitting}
                               className="w-full py-4 bg-[#4BB7AE] text-white text-center text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-600 disabled:opacity-50"
                            >
                                <i className="fas fa-check-circle mr-2"></i> GUARDAR CAMBIOS
                            </button>
                        ) : (
                            <button 
                               onClick={handleDeleteSession}
                               disabled={isSubmitting}
                               className="w-full py-4 text-center text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <i className="fas fa-trash-can mr-2"></i> ELIMINAR SESIÓN
                            </button>
                        )}
                    </>
                ) : (
                    <div className="mt-auto">
                        <hr className="my-8 border-slate-100" />
                        {(() => {
                           const isJoined = (localProps.alumnos || []).some(a => String(a.id) === String(window.AppConfig?.user?.id));
                           if (isJoined) {
                               return (
                                   <button 
                                      onClick={() => handleRemoveClient(window.AppConfig?.user?.id)}
                                      disabled={isSubmitting}
                                      className="w-full py-4 text-center text-sm font-black uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
                                   >
                                       <i className="fa-solid fa-user-xmark mr-2"></i> CANCELAR CLASE
                                   </button>
                               );
                           } else {
                               return (
                                   <button 
                                      onClick={() => handleAddClient(window.AppConfig?.user)}
                                      disabled={isSubmitting}
                                      className="w-full py-4 text-center text-sm font-black uppercase tracking-widest text-white bg-[#0f172a] hover:bg-[#1e293b] rounded-xl shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50"
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

        {/* Footer actions */}
        <div className="p-6 bg-white border-t border-slate-100 flex justify-center gap-4 pb-8">
           {window.IS_ADMIN && (
               <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex-1 px-10 py-3.5 font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 ${isEditing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
               >
                  <i className={`fa-solid ${isEditing ? 'fa-xmark' : 'fa-pen-to-square'}`}></i>
                  {isEditing ? 'CANCELAR EDICIÓN' : 'EDITAR SESIÓN'}
               </button>
           )}
           <button 
              onClick={onClose}
              className="flex-1 px-10 py-3.5 bg-[#0f172a] text-white font-bold text-xs uppercase tracking-widest rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto"
           >
              CERRAR PANEL
           </button>
        </div>

      </div>
    </div>
  );
}
