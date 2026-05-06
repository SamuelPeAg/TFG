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
  
  const [response, setResponse] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const exerciseTemplates = [
    { name: 'Fuerza Básica', text: '💪 RUTINA FUERZA:\n- Sentadillas: 4 x 10 (Peso: [XX] kg)\n- Press Banca: 4 x 8 (Peso: [XX] kg)\n- Peso Muerto: 4 x 8 (Peso: [XX] kg)' },
    { name: 'HIIT Cardio', text: '🔥 RUTINA HIIT:\n- Burpees: 5 x 20 seg (10 seg descanso)\n- Mountain Climbers: 5 x 20 seg\n- Jumping Jacks: 5 x 30 seg' },
    { name: 'Pierna Pesado', text: '🦵 RUTINA PIERNAS:\n- Prensa: 5 x 10 (Peso: [XX] kg)\n- Zancadas: 4 x 12 c/u\n- Curl Femoral: 4 x 15 (Peso: [XX] kg)' },
    { name: 'Burpees 5x4', text: '- Burpees: 5 series x 4 repeticiones\n- Descanso: 45 segundos' },
    { name: 'Core & Abdomen', text: '🛡️ RUTINA CORE:\n- Plancha Abdominal: 4 x 45 seg\n- Crunches: 4 x 20\n- Elevación de Piernas: 4 x 15' }
  ];

  const handleInsertTemplate = (templateText) => {
    setResponse(prev => prev + (prev ? '\n\n' : '') + templateText);
  };

  useEffect(() => {
    fetchPlans();
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
    setResponse('');
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
    if (!response.trim() && images.length === 0) return;
    
    setSubmitting(true);
    const formData = new FormData();
    formData.append('response', response);
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
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Comidas del {new Date(activePlan.target_date).toLocaleDateString()}</h3>
                    {loadingMeals ? (
                      <div className="text-center py-4"><i className="fa-solid fa-spinner fa-spin text-[#38C1A3]"></i></div>
                    ) : meals.length === 0 ? (
                      <p className="text-sm text-slate-500">No hay comidas registradas para este día.</p>
                    ) : (
                      <div className="space-y-3">
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
                    )}
                  </div>

                  {activePlan.status === 'pending' ? (
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Tu Respuesta y Plan</h3>
                      <form onSubmit={handleSubmitResponse} className="space-y-4">
                        
                        <div className="mb-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3"><i className="fa-solid fa-bolt text-indigo-400 mr-1"></i> Plantillas Rápidas (Haz clic para insertar):</p>
                          <div className="flex flex-wrap gap-2">
                            {exerciseTemplates.map((tpl, i) => (
                              <button 
                                key={i}
                                type="button"
                                onClick={() => handleInsertTemplate(tpl.text)}
                                className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-lg transition-all border border-indigo-100 active:scale-95"
                              >
                                {tpl.name} <i className="fa-solid fa-plus opacity-50 ml-1"></i>
                              </button>
                            ))}
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Sustituye los [XX] por el peso deseado tras insertar la plantilla.</p>
                        </div>

                        <textarea
                          required
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          placeholder="Escribe la rutina, consejos o el plan de acción aquí..."
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[300px] resize-y text-sm leading-relaxed"
                        />
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
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest py-4 px-8 rounded-2xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
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
                        <p className="whitespace-pre-wrap text-sm">{activePlan.trainer_response}</p>
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
    </div>
  );
}
