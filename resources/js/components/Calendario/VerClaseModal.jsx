import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function VerClaseModal({ isOpen, onClose, selectedEvent, centros, entrenadores, users, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for selectors
  const [selectedTrainerToAdd, setSelectedTrainerToAdd] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  // We keep a local copy of extendedProps to do optimistic UI updates easily
  const [localProps, setLocalProps] = useState(null);

  useEffect(() => {
    if (isOpen && selectedEvent) {
      setLocalProps(JSON.parse(JSON.stringify(selectedEvent.extendedProps)));
      setSelectedTrainerToAdd('');
      setClientSearchTerm('');
      setShowClientSuggestions(false);
    } else {
      setLocalProps(null);
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
        // Unfortunately add-client doesn't return the full updated array, so we trigger a refetch
        if (onSuccess) onSuccess();
        // Optimistic close of the suggestions
        setClientSearchTerm('');
        setShowClientSuggestions(false);
        // Force the modal to close and reopen or just rely on the background refetch
        onClose(); // Easier workflow: close and let them click again or assume it's there
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


  // Helper Formatting
  // Convert fullcalendar 'start' property to the header text
  const rawDate = selectedEvent.start;
  const days = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'];
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  
  const dayName = rawDate ? days[rawDate.getDay()] : '...';
  const dayNum = rawDate ? rawDate.getDate() : '...';
  const monthName = rawDate ? months[rawDate.getMonth()] : '...';

  // Extract client matches for search
  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) &&
      !(localProps.alumnos || []).find(a => a.id === u.id)
  ).slice(0, 5); // Limit suggestions

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      
      {/* Modal Container */}
      <div className="w-full max-w-4xl bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - Navy Dark */}
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

        {/* Two Column Layout Grid */}
        <div className="flex flex-col md:flex-row min-h-[500px]">
           
           {/* Left Column (Main Details) */}
           <div className="flex-1 p-8 md:pr-10 bg-white">
              
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-5">
                  {localProps.clase_nombre || "Clase sin Nombre"}
              </h2>

              {/* Pills */}
              <div className="flex flex-wrap gap-3 mb-10">
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
              </div>

              {/* Attendees */}
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  ASISTENTES CONFIRMADOS ({(localProps.alumnos || []).length})
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
                                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{alum.pago || "TARJETA"}</div>
                                 </div>
                             </div>
                             <div className="flex items-center gap-5">
                                 <div className="font-black text-slate-900 text-sm">
                                     €{Number(alum.coste || 0).toFixed(2)}
                                 </div>
                                 <button 
                                     onClick={() => handleRemoveClient(alum.id)}
                                     disabled={isSubmitting}
                                     className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                                     title="Eliminar Alumno"
                                 >
                                    <i className="fa-solid fa-trash-can"></i>
                                 </button>
                             </div>
                         </div>
                     ))
                 )}
              </div>

              {/* Add Client Dotted Button */}
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
                  
                  {/* Suggestions Box */}
                  {showClientSuggestions && clientSearchTerm && (
                      <div className="absolute top-14 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
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
           </div>

           {/* Right Column (Trainers & Danger Zone) */}
           <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-slate-100 bg-white flex flex-col pt-8 pb-10 px-8 relative">
                
                {/* Equipo Técnico */}
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
                                <button 
                                    onClick={() => handleRemoveTrainer(t.id)}
                                    disabled={isSubmitting}
                                    className="text-slate-300 hover:text-rose-500 transition-colors hidden group-hover/trainer:block disabled:opacity-50"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Asignar Personal */}
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

                {/* Separator */}
                <hr className="my-8 border-slate-100" />

                {/* Eliminar Sesion */}
                <button 
                   onClick={handleDeleteSession}
                   disabled={isSubmitting}
                   className="w-full py-4 text-center text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                >
                    <i className="fas fa-trash-can mr-2"></i> ELIMINAR SESIÓN
                </button>

           </div>
        </div>

        {/* Footer actions for closing modal */}
        <div className="p-6 bg-white border-t border-slate-100 flex justify-center pb-8">
           <button 
              onClick={onClose}
              className="px-10 py-3.5 bg-[#0f172a] text-white font-bold text-xs uppercase tracking-widest rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto"
           >
              CERRAR PANEL
           </button>
        </div>

      </div>
    </div>
  );
}
