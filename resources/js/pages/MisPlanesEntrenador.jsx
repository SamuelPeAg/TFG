import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

export default function MisPlanesEntrenador() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activePlan, setActivePlan] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Builder states
  const [motivation, setMotivation] = useState('');
  const [intensity, setIntensity] = useState('MEDIO');
  const [routine, setRoutine] = useState([]);
  
  // Custom templates states
  const [customTemplates, setCustomTemplates] = useState([]);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  const routineTemplates = [
    { 
      name: '🤰 Embarazadas', 
      data: [
        { ejercicio: 'Sentadillas con Fitball', series: '3', reps: '12', weight: 'Corporal', tools: 'Fitball', focus: 'FUERZA', imageFile: null, imagePreview: null, videoFile: null, videoPreview: null },
        { ejercicio: 'Elevación de pelvis', series: '3', reps: '15', weight: 'Corporal', tools: 'Esterilla', focus: 'CORE', imageFile: null, imagePreview: null, videoFile: null, videoPreview: null },
        { ejercicio: 'Paseo Ligero', series: '1', reps: '20 min', weight: '-', tools: 'Cinta', focus: 'CARDIO', imageFile: null, imagePreview: null, videoFile: null, videoPreview: null }
      ] 
    },
    { 
      name: '🔥 Perder Peso', 
      data: [
        { ejercicio: 'Burpees', series: '4', reps: '15', weight: 'Corporal', tools: 'Esterilla', focus: 'CARDIO', imageFile: null, imagePreview: null, videoFile: null, videoPreview: null },
        { ejercicio: 'Mountain Climbers', series: '4', reps: '45 seg', weight: 'Corporal', tools: 'Ninguna', focus: 'CARDIO', imageFile: null, imagePreview: null, videoFile: null, videoPreview: null },
        { ejercicio: 'Kettlebell Swings', series: '4', reps: '20', weight: '12kg', tools: 'Kettlebell', focus: 'FUERZA', imageFile: null, imagePreview: null, videoFile: null, videoPreview: null }
      ] 
    },
    { 
      name: '💪 Ganar Músculo', 
      data: [
        { ejercicio: 'Press Banca', series: '4', reps: '8', weight: '60kg', tools: 'Banco y Barra', focus: 'FUERZA', imageFile: null, imagePreview: null, videoFile: null, videoPreview: null },
        { ejercicio: 'Sentadilla Libre', series: '4', reps: '8', weight: '80kg', tools: 'Rack', focus: 'FUERZA', imageFile: null, imagePreview: null, videoFile: null, videoPreview: null },
        { ejercicio: 'Remo con Barra', series: '4', reps: '10', weight: '50kg', tools: 'Barra', focus: 'FUERZA', imageFile: null, imagePreview: null, videoFile: null, videoPreview: null }
      ] 
    },
    { 
      name: '🧘 Recuperación', 
      data: [
        { ejercicio: 'Estiramientos Dinámicos', series: '1', reps: '10 min', weight: 'Corporal', tools: 'Esterilla', focus: 'CORE', imageFile: null, imagePreview: null, videoFile: null, videoPreview: null },
        { ejercicio: 'Yoga Básico', series: '1', reps: '20 min', weight: 'Corporal', tools: 'Esterilla', focus: 'CORE', imageFile: null, imagePreview: null, videoFile: null, videoPreview: null }
      ] 
    }
  ];

  const handleAddRoutineTemplate = (templateDataArray) => {
    setRoutine([...routine, ...templateDataArray]);
  };

  const handleAddRoutineItem = () => {
    setRoutine([...routine, { ejercicio: '', series: '', reps: '', weight: '', tools: '', focus: 'FUERZA', imageFile: null, imagePreview: null, videoFile: null, videoPreview: null }]);
  };

  const handleUpdateRoutineItem = (index, field, value) => {
    const newRoutine = [...routine];
    newRoutine[index][field] = value;
    setRoutine(newRoutine);
  };

  const handleRemoveRoutineItem = (index) => {
    setRoutine(routine.filter((_, i) => i !== index));
  };

  const handleExerciseImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newRoutine = [...routine];
      newRoutine[index].imageFile = file;
      newRoutine[index].imagePreview = URL.createObjectURL(file);
      setRoutine(newRoutine);
    }
  };

  const handleExerciseVideoChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newRoutine = [...routine];
      newRoutine[index].videoFile = file;
      newRoutine[index].videoPreview = URL.createObjectURL(file);
      setRoutine(newRoutine);
    }
  };

  const fetchCustomTemplates = async () => {
    try {
      const res = await axios.get('/api/trainer-templates');
      setCustomTemplates(res.data);
    } catch (err) {
      console.error('Error fetching templates', err);
    }
  };

  const handleOpenSaveTemplateModal = () => {
    if (routine.length === 0) return;
    setNewTemplateName('');
    setShowSaveTemplateModal(true);
  };

  const handleConfirmSaveTemplate = async () => {
    if (!newTemplateName.trim()) return;

    setSavingTemplate(true);
    const routineDataForJson = routine.map(item => {
      const { imageFile, imagePreview, videoFile, videoPreview, ...rest } = item;
      return rest;
    });

    try {
      const response = await axios.post('/api/trainer-templates', {
        name: newTemplateName.trim(),
        data: routineDataForJson
      });
      setCustomTemplates([...customTemplates, response.data]);
      setShowSaveTemplateModal(false);
    } catch (error) {
      console.error(error);
      alert("Error al guardar la plantilla");
    } finally {
      setSavingTemplate(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchCustomTemplates();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/trainer/action-plans');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    setActivePlan(plan);
    setImages([]);
    setMeals([]);
    
    setLoadingMeals(true);
    try {
      const res = await axios.get(`/api/trainer/action-plans/${plan.id}/meals`);
      setMeals(res.data);
    } catch (err) {
      console.error('Error fetching meals', err);
    } finally {
      setLoadingMeals(false);
    }
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (routine.length === 0 && !motivation.trim()) return;
    
    setSubmitting(true);
    
    const routineDataForJson = routine.map(item => {
      const { imageFile, imagePreview, videoFile, videoPreview, ...rest } = item;
      return rest;
    });

    const finalResponse = JSON.stringify({
      is_structured_routine: true,
      motivation: motivation,
      intensity: intensity,
      routine: routineDataForJson
    });

    const formData = new FormData();
    formData.append('response', finalResponse);
    
    routine.forEach((item, index) => {
      if (item.imageFile) {
        formData.append(`routine_images_${index}`, item.imageFile);
      }
      if (item.videoFile) {
        formData.append(`routine_videos_${index}`, item.videoFile);
      }
    });

    images.forEach(img => {
      formData.append('images[]', img);
    });
    
    try {
      await axios.post(`/api/trainer/action-plans/${activePlan.id}/respond`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchPlans();
      setActivePlan(null);
    } catch (err) {
      console.error(err);
      alert('Error al enviar el plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
        <PageHeader 
            title="Solicitudes de Planes"
            subtitle="Asignación de Rutinas y Feedback"
            icon="fa-solid fa-clipboard-list"
            onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="flex-1 overflow-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Solicitudes Recientes</h3>
                {loading ? (
                  <div className="text-center py-8"><i className="fa-solid fa-spinner fa-spin text-[#38C1A3]"></i></div>
                ) : plans.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No tienes solicitudes pendientes.</p>
                ) : (
                  <div className="space-y-3">
                    {plans.map(plan => (
                      <div 
                        key={plan.id}
                        onClick={() => handleSelectPlan(plan)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${activePlan?.id === plan.id ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-800">{plan.user?.name}</span>
                          {plan.status === 'pending' ? (
                            <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-50 px-2 py-1 rounded-md">Pendiente</span>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Completado</span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-2"><i className="fa-solid fa-calendar-day mr-1"></i> {new Date(plan.target_date).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-600 line-clamp-2">"{plan.goal_message}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              {activePlan ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 mb-2">Plan para {activePlan.user?.name}</h2>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Mensaje del cliente:</p>
                      <p className="text-sm font-medium text-slate-700 italic">"{activePlan.goal_message}"</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Análisis de Nutrición ({new Date(activePlan.target_date).toLocaleDateString()})</h3>
                    {loadingMeals ? (
                      <div className="text-center py-4"><i className="fa-solid fa-spinner fa-spin text-[#38C1A3]"></i></div>
                    ) : meals.length === 0 ? (
                      <p className="text-sm text-slate-500">No hay comidas registradas para este día.</p>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <span className="block text-[9px] font-black text-slate-400 uppercase mb-1">Total Calorías</span>
                            <span className="text-lg font-black text-slate-800">{meals.reduce((sum, m) => sum + (m.calories_est || 0), 0)} <span className="text-[10px] text-slate-400">kcal</span></span>
                          </div>
                          <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                            <span className="block text-[9px] font-black text-rose-400 uppercase mb-1">Proteínas</span>
                            <span className="text-lg font-black text-rose-600">{meals.reduce((sum, m) => sum + (m.macros_est?.protein || 0), 0)} <span className="text-[10px] text-rose-300">g</span></span>
                          </div>
                          <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
                            <span className="block text-[9px] font-black text-teal-400 uppercase mb-1">Carbohidratos</span>
                            <span className="text-lg font-black text-teal-600">{meals.reduce((sum, m) => sum + (m.macros_est?.carbs || 0), 0)} <span className="text-[10px] text-teal-300">g</span></span>
                          </div>
                          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                            <span className="block text-[9px] font-black text-amber-400 uppercase mb-1">Grasas</span>
                            <span className="text-lg font-black text-amber-600">{meals.reduce((sum, m) => sum + (m.macros_est?.fats || 0), 0)} <span className="text-[10px] text-amber-300">g</span></span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desglose de Comidas</p>
                        {meals.map(meal => (
                          <div key={meal.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-lg shrink-0">
                                <i className={`fa-solid ${meal.meal_type === 'desayuno' ? 'fa-mug-saucer' : meal.meal_type === 'almuerzo' ? 'fa-utensils' : meal.meal_type === 'cena' ? 'fa-moon' : 'fa-cookie'}`}></i>
                            </div>
                            <div className="flex-1">
                              <span className="text-xs font-black uppercase text-slate-800">{meal.meal_type}</span>
                              <p className="text-sm text-slate-600 mb-2">{meal.meal_description}</p>
                              <div className="flex gap-4 text-xs font-bold text-slate-500">
                                <span>{meal.calories_est} Kcal</span>
                                <span className="text-rose-400">P: {meal.macros_est?.protein || 0}g</span>
                                <span className="text-[#38C1A3]">C: {meal.macros_est?.carbs || 0}g</span>
                                <span className="text-amber-500">G: {meal.macros_est?.fats || 0}g</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {activePlan.status === 'pending' ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tu Respuesta y Plan</h3>
                      </div>

                      <form onSubmit={handleSubmitResponse} className="space-y-4">
                          <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 space-y-6">
                            <div>
                               <div className="flex justify-between items-center mb-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mensaje / Motivación</label>
                                 <div className="flex gap-2">
                                   {['FÁCIL', 'MEDIO', 'INTENSO'].map(lvl => (
                                     <button 
                                       key={lvl} 
                                       type="button" 
                                       onClick={() => setIntensity(lvl)}
                                       className={`text-[8px] font-black px-2 py-1 rounded-md transition-all ${intensity === lvl ? (lvl === 'FÁCIL' ? 'bg-emerald-500 text-white' : lvl === 'MEDIO' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white') : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                     >
                                       {lvl}
                                     </button>
                                   ))}
                                 </div>
                               </div>
                               <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} placeholder="Ej: Has tenido una carga proteica elevada hoy; aprovechemos..." className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-medium italic resize-none h-20" />
                             </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ejercicios del Circuito</label>
                                <div className="flex gap-2 flex-wrap justify-end">
                                  {routineTemplates.map((tpl, i) => (
                                    <button key={i} type="button" onClick={() => handleAddRoutineTemplate(tpl.data)} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all border border-teal-100">
                                      + {tpl.name}
                                    </button>
                                  ))}
                                  {customTemplates.map((tpl, i) => (
                                    <button key={`custom-${i}`} type="button" onClick={() => handleAddRoutineTemplate(tpl.data)} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all border border-indigo-100">
                                      + {tpl.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                {routine.map((item, idx) => (
                                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group">
                                    <div className="flex gap-4 items-start">
                                      <div className="shrink-0 flex flex-col gap-2">
                                        <div className="w-24 h-24 bg-slate-50 rounded-xl border border-dashed border-slate-300 relative overflow-hidden flex items-center justify-center group/img cursor-pointer">
                                          {item.imagePreview ? (
                                            <img src={item.imagePreview} className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="text-center">
                                              <i className="fa-solid fa-camera text-slate-300 text-xl mb-1"></i>
                                              <p className="text-[8px] font-black uppercase text-slate-400">Foto</p>
                                            </div>
                                          )}
                                          <input type="file" accept="image/*" onChange={(e) => handleExerciseImageChange(idx, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                          {item.imagePreview && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                              <i className="fa-solid fa-pen text-white"></i>
                                            </div>
                                          )}
                                        </div>

                                        <div className="w-24 h-24 bg-slate-50 rounded-xl border border-dashed border-slate-300 relative overflow-hidden flex items-center justify-center group/vid cursor-pointer">
                                          {item.videoPreview ? (
                                            <video src={item.videoPreview} className="w-full h-full object-cover" muted />
                                          ) : (
                                            <div className="text-center">
                                              <i className="fa-solid fa-video text-slate-300 text-xl mb-1"></i>
                                              <p className="text-[8px] font-black uppercase text-slate-400">Vídeo</p>
                                            </div>
                                          )}
                                          <input type="file" accept="video/*" onChange={(e) => handleExerciseVideoChange(idx, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                          {item.videoPreview && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/vid:opacity-100 transition-opacity">
                                              <i className="fa-solid fa-pen text-white"></i>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex-1 space-y-3">
                                        <div className="flex gap-3">
                                          <input type="text" value={item.ejercicio} onChange={(e) => handleUpdateRoutineItem(idx, 'ejercicio', e.target.value)} placeholder="Nombre del Ejercicio (Ej: Sentadillas)" className="flex-1 bg-slate-50 border border-slate-100 text-xs font-black uppercase rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-teal-200" />
                                          <select value={item.focus} onChange={(e) => handleUpdateRoutineItem(idx, 'focus', e.target.value)} className="w-28 bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl px-2 py-2 outline-none appearance-none">
                                            <option value="FUERZA">Fuerza</option>
                                            <option value="CARDIO">Cardio</option>
                                            <option value="CORE">Core</option>
                                          </select>
                                        </div>
                                        <div className="grid grid-cols-4 gap-3">
                                          <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Series</label>
                                            <input type="text" value={item.series} onChange={(e) => handleUpdateRoutineItem(idx, 'series', e.target.value)} placeholder="Ej: 4" className="w-full bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 px-3 py-2 rounded-lg outline-none focus:bg-white" />
                                          </div>
                                          <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Repeticiones</label>
                                            <input type="text" value={item.reps} onChange={(e) => handleUpdateRoutineItem(idx, 'reps', e.target.value)} placeholder="Ej: 10-12" className="w-full bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 px-3 py-2 rounded-lg outline-none focus:bg-white" />
                                          </div>
                                          <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Peso</label>
                                            <input type="text" value={item.weight} onChange={(e) => handleUpdateRoutineItem(idx, 'weight', e.target.value)} placeholder="Ej: 20kg" className="w-full bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 px-3 py-2 rounded-lg outline-none focus:bg-white" />
                                          </div>
                                          <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Herramientas</label>
                                            <input type="text" value={item.tools} onChange={(e) => handleUpdateRoutineItem(idx, 'tools', e.target.value)} placeholder="Ej: Mancuernas" className="w-full bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 px-3 py-2 rounded-lg outline-none focus:bg-white" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveRoutineItem(idx)} className="absolute -right-3 -top-3 w-8 h-8 bg-white border border-rose-100 text-rose-500 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm hover:bg-rose-50"><i className="fa-solid fa-times"></i></button>
                                  </div>
                                ))}
                                <div className="flex gap-4">
                                  <button type="button" onClick={() => handleAddRoutineItem()} className="flex-1 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 hover:border-slate-300 transition-all">
                                    <i className="fa-solid fa-plus mr-2"></i> Añadir Ejercicio Manual
                                  </button>
                                  <button type="button" onClick={handleOpenSaveTemplateModal} disabled={routine.length === 0} className="px-6 py-3 border-2 border-indigo-100 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50">
                                    <i className="fa-solid fa-save mr-2"></i> Guardar Plantilla
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Adjuntar Fotos (Opcional)</label>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*"
                              onChange={handleFileChange}
                              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                            />
                          </div>

                          <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest py-4 px-8 rounded-2xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                          >
                            {submitting ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-paper-plane mr-2"></i>}
                            Enviar Plan
                          </button>
                      </form>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Respuesta Enviada</h3>
                      <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-900">
                        {(() => {
                            let isStructured = false;
                            let structuredData = null;
                            try {
                                const p = JSON.parse(activePlan.trainer_response);
                                if (p.is_structured_routine) {
                                    isStructured = true;
                                    structuredData = p;
                                }
                            } catch(e) {}

                            if (isStructured) {
                                return (
                                    <div className="bg-white border border-emerald-100 rounded-[2rem] p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            {structuredData.motivation ? (
                                                <p className="text-sm font-bold italic text-slate-700 flex-1 text-center">"{structuredData.motivation}"</p>
                                            ) : <div></div>}
                                            {structuredData.intensity && (
                                                <span className={`shrink-0 text-[9px] font-black uppercase px-3 py-1 rounded-full border ${structuredData.intensity === 'FÁCIL' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : structuredData.intensity === 'MEDIO' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                    {structuredData.intensity}
                                                </span>
                                            )}
                                        </div>
                                        {structuredData.routine && structuredData.routine.length > 0 && (
                                            <div className="space-y-6">
                                                {structuredData.routine.map((ex, i) => (
                                                    <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm relative overflow-hidden">
                                                        <div className="flex gap-6 relative z-10">
                                                        {(ex.image_url || ex.video_url) && (
                                                            <div className="shrink-0 flex flex-col gap-3">
                                                                {ex.image_url && (
                                                                    <div className="w-28 h-28 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                                                                        <img src={ex.image_url} alt={ex.ejercicio} className="w-full h-full object-cover" />
                                                                    </div>
                                                                )}
                                                                {ex.video_url && (
                                                                    <div className="w-28 h-28 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                                                                        <video src={ex.video_url} className="w-full h-full object-cover" controls />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div>
                                                                        <h4 className="text-sm font-black text-slate-800 uppercase">{ex.ejercicio}</h4>
                                                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">{ex.focus}</p>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                    <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                                                                        <span className="block text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Series</span>
                                                                        <span className="font-bold text-slate-700">{ex.series || '-'}</span>
                                                                    </div>
                                                                    <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                                                                        <span className="block text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Repeticiones</span>
                                                                        <span className="font-bold text-slate-700">{ex.reps || '-'}</span>
                                                                    </div>
                                                                    <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                                                                        <span className="block text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Peso</span>
                                                                        <span className="font-bold text-slate-700">{ex.weight || '-'}</span>
                                                                    </div>
                                                                    <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                                                                        <span className="block text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Material</span>
                                                                        <span className="font-bold text-slate-700">{ex.tools || '-'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            } else {
                                return <p className="whitespace-pre-wrap text-sm">{activePlan.trainer_response}</p>;
                            }
                        })()}
                        {activePlan.trainer_images && activePlan.trainer_images.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {activePlan.trainer_images.map((img, i) => (
                              <img key={i} src={img} alt="Adjunto" className="w-full h-32 object-cover rounded-xl shadow-sm" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center h-[500px]">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-2xl mb-4">
                    <i className="fa-solid fa-arrow-pointer"></i>
                  </div>
                  <h3 className="text-lg font-black text-slate-400 tracking-tight mb-1">Selecciona una solicitud</h3>
                  <p className="text-sm font-medium text-slate-500">Haz clic en una solicitud del panel izquierdo para ver los detalles y responder.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      {/* Modal Guardar Plantilla */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-500 mx-auto">
                <i className="fa-solid fa-save text-xl"></i>
              </div>
              <h3 className="text-center text-slate-800 font-black text-lg mb-2">Guardar Plantilla</h3>
              <p className="text-center text-slate-500 text-xs font-medium mb-6">Esta rutina se guardará en tu cuenta para que puedas insertarla rápidamente en el futuro.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nombre de la Plantilla</label>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="Ej: Glúteos y Pierna Nivel 2"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowSaveTemplateModal(false)}
                className="flex-1 py-3 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleConfirmSaveTemplate}
                disabled={savingTemplate || !newTemplateName.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {savingTemplate ? <i className="fa-solid fa-spinner fa-spin"></i> : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
