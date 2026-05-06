import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PhysicalProgress from '../components/PhysicalProgress';
import AlertModal from '../components/AlertModal';
import PageHeader from '../components/PageHeader';

export default function MisComidas() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [comidas, setComidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [mealText, setMealText] = useState('');
    const [mealType, setMealType] = useState('almuerzo');
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    // IMC y Evolución
    const [peso, setPeso] = useState('');
    const [altura, setAltura] = useState('');
    const [measurements, setMeasurements] = useState([]);
    const [submittingProgress, setSubmittingProgress] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', isError: false });
    const showAlert = (message, isError = false, title = isError ? "Error" : "Éxito") => {
        setAlertConfig({ isOpen: true, title, message, isError });
    };

    // Calorías
    const [maintenanceCalories, setMaintenanceCalories] = useState(2500);

    useEffect(() => {
        fetchMeals();
        fetchFicha();
    }, [selectedDate]);

    const fetchMeals = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/nutricion?date=' + selectedDate);
            setComidas(data.meals || []);
        } catch (err) {
            console.error('Error fetching meals:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFicha = async () => {
        try {
            const userRes = await axios.get('/configuracion');
            const userId = userRes.data.user.id;
            const res = await axios.get(`/client-profile/${userId}`);
            setPeso(res.data.client?.peso || '');
            setAltura(res.data.client?.altura || '');
            setMeasurements(res.data.measurements || []);
        } catch (error) {
            console.error('Error fetching physical data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mealText.trim()) return;
        setSubmitting(true);
        setError(null);
        try {
            const { data } = await axios.post('/nutricion/log', {
                meal_type: mealType,
                meal_description: mealText,
                target_date: selectedDate
            });
            setComidas([data.meal, ...comidas]);
            setMealText('');
        } catch (err) {
            setError(err.response?.data?.error || 'Ocurrió un error con la IA.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleProgressSave = async (e) => {
        e.preventDefault();

        if (!peso || !altura || parseFloat(peso) <= 0 || parseFloat(altura) <= 0) {
            showAlert('Debes completar el peso y la altura correctamente antes de registrar tu progreso.', true, 'Datos incompletos');
            return;
        }

        setSubmittingProgress(true);
        try {
            const userRes = await axios.get('/configuracion');
            const userId = userRes.data.user.id;
            await axios.post(`/client-profile/${userId}/progress`, { peso, altura });
            showAlert('¡Genial! Tu evolución física se ha registrado correctamente.');
            fetchFicha();
        } catch (err) {
            showAlert('No hemos podido registrar tu progreso en este momento. Por favor, inténtalo más tarde.', true);
        } finally {
            setSubmittingProgress(false);
        }
    };

    const calculateTotals = () => {
        let calories = 0, protein = 0, carbs = 0, fats = 0;
        comidas.forEach(meal => {
            calories += Number(meal.calories_est || 0);
            protein += Number(meal.macros_est?.protein || 0);
            carbs += Number(meal.macros_est?.carbs || 0);
            fats += Number(meal.macros_est?.fats || 0);
        });
        const burnedCalories = 0; // Simplified for now
        const netCalories = calories - burnedCalories;
        const isDeficit = maintenanceCalories > netCalories;
        const diffCalories = Math.abs(maintenanceCalories - netCalories);
        return { calories, protein, carbs, fats, burnedCalories, netCalories, isDeficit, diffCalories };
    };

    const totals = calculateTotals();

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900 custom-select-arrows">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
                <PageHeader 
                    title="Nutrición & Evolución"
                    subtitle="Control inteligente de macros y físico"
                    icon="🍎"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <div className="flex-1 overflow-auto p-6 lg:p-10 space-y-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                            
                            {/* Columna Izquierda: Input y Listado */}
                            <div className="xl:col-span-8 space-y-10">
                                
                                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/20 border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-xl shadow-inner"><i className="fa-solid fa-pizza-slice"></i></div>
                                            <div>
                                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">¿Qué has comido hoy?</h2>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">La IA desglosará tus macros automáticamente</p>
                                            </div>
                                        </div>
                                        
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="relative inline-block w-full md:w-56 group">
                                                    <select 
                                                        value={mealType} 
                                                        onChange={(e) => setMealType(e.target.value)} 
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black focus:bg-white focus:ring-4 focus:ring-[#38C1A3]/10 focus:border-[#38C1A3] outline-none text-slate-700 shadow-inner appearance-none cursor-pointer transition-all"
                                                    >
                                                        <option value="desayuno">Desayuno</option>
                                                        <option value="almuerzo">Almuerzo</option>
                                                        <option value="cena">Cena</option>
                                                        <option value="snack">Merienda / Snack</option>
                                                    </select>
                                                    <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none group-hover:text-[#38C1A3] transition-colors"></i>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <textarea 
                                                    value={mealText} 
                                                    onChange={(e) => setMealText(e.target.value)} 
                                                    placeholder="Ej: He desayunado una tostada de aguacate con 2 huevos revueltos y un café con leche..." 
                                                    rows="3" 
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-7 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-[#38C1A3]/10 focus:border-[#38C1A3] outline-none resize-none transition-all shadow-inner" 
                                                />
                                            </div>
                                            {error && <p className="text-rose-500 text-xs font-black px-4"><i className="fa-solid fa-triangle-exclamation mr-1.5 animate-bounce"></i> {error}</p>}
                                            <div className="flex justify-end">
                                                <button 
                                                    type="submit" 
                                                    disabled={submitting || !mealText.trim()} 
                                                    className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] transition-all flex items-center gap-3 shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
                                                >
                                                    {submitting ? <i className="fa-solid fa-spinner fa-spin text-[#38C1A3]"></i> : <i className="fa-solid fa-wand-magic-sparkles text-[#38C1A3]"></i>} 
                                                    Analizar Comida
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner"><i className="fa-solid fa-clock-rotate-left"></i></div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Registros del Día</h3>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="relative group">
                                                <input 
                                                    type="date" 
                                                    value={selectedDate} 
                                                    onChange={(e) => setSelectedDate(e.target.value)} 
                                                    className="bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-[0.15em] px-6 py-3 rounded-2xl outline-none focus:border-[#38C1A3] focus:ring-4 focus:ring-[#38C1A3]/5 cursor-pointer shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 w-full sm:w-auto min-w-[160px] text-center" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-[#38C1A3]/20 border-t-[#38C1A3] rounded-full animate-spin shadow-lg"></div></div>
                                    ) : comidas.length === 0 ? (
                                        <div className="bg-white p-16 rounded-[3.5rem] border border-dashed border-slate-200 text-center shadow-sm">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner opacity-40">🍽️</div>
                                            <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Tu diario está en ayunas</p>
                                            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Registra algo para empezar el análisis</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-8">
                                            {comidas.map(meal => (
                                                <div key={meal.id} className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] transition-all group-hover:bg-teal-50"></div>
                                                    
                                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-xl shadow-inner">
                                                                <i className={`fa-solid ${meal.meal_type === 'desayuno' ? 'fa-mug-hot' : meal.meal_type === 'almuerzo' ? 'fa-bowl-food' : meal.meal_type === 'cena' ? 'fa-moon' : 'fa-cookie-bite'}`}></i>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-black uppercase text-slate-800 tracking-tight">{meal.meal_type}</span>
                                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(meal.logged_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl shadow-slate-900/20 text-center">
                                                            <span className="block text-xl font-black leading-none">{meal.calories_est || 0}</span>
                                                            <span className="block text-[9px] font-black uppercase text-teal-400 tracking-widest mt-1">Kcal</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-base text-slate-600 font-bold mb-8 px-2 leading-relaxed relative z-10 italic">"{meal.meal_description}"</p>
                                                    <div className="grid grid-cols-3 gap-6 relative z-10">
                                                        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex flex-col items-center">
                                                            <span className="text-[10px] text-rose-500 uppercase font-black tracking-widest mb-1">Proteína</span>
                                                            <span className="font-black text-slate-800 text-lg">{meal.macros_est?.protein || 0}g</span>
                                                        </div>
                                                        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex flex-col items-center">
                                                            <span className="text-[10px] text-[#38C1A3] uppercase font-black tracking-widest mb-1">Carbos</span>
                                                            <span className="font-black text-slate-800 text-lg">{meal.macros_est?.carbs || 0}g</span>
                                                        </div>
                                                        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex flex-col items-center">
                                                            <span className="text-[10px] text-amber-500 uppercase font-black tracking-widest mb-1">Grasas</span>
                                                            <span className="font-black text-slate-800 text-lg">{meal.macros_est?.fats || 0}g</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Columna Derecha: Summaries & Evolución */}
                            <div className="xl:col-span-4 space-y-10">
                                
                                {/* Resumen Calorías */}
                                <div className="bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl text-white relative overflow-hidden group">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#38C1A3] rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-10">
                                            <h3 className="font-black text-xl tracking-tight uppercase tracking-widest">Meta Diaria</h3>
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm"><i className="fa-solid fa-bullseye text-teal-400"></i></div>
                                        </div>
                                        <div className="flex justify-center mb-10">
                                            <div className="relative w-48 h-48 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90 filter drop-shadow-xl">
                                                    <circle cx="96" cy="96" r="86" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                                                    <circle cx="96" cy="96" r="86" stroke={totals.isDeficit ? "#38C1A3" : "#F35B5B"} strokeWidth="12" strokeLinecap="round" fill="none" strokeDasharray="540" strokeDashoffset={540 - (540 * Math.min(Math.max(0, totals.netCalories) / maintenanceCalories, 1))} className="transition-all duration-1000 ease-out" />
                                                </svg>
                                                <div className="absolute text-center flex flex-col items-center">
                                                    <div className="text-5xl font-black tracking-tighter">{totals.netCalories}</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 bg-white/5 px-4 py-1.5 rounded-full">Consumidas</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ajustar Mantenimiento</div>
                                            <div className="flex items-center bg-black/20 rounded-2xl p-2 border border-white/5">
                                                <input 
                                                    type="number" 
                                                    className="w-full bg-transparent text-white text-center font-black text-lg outline-none no-spinner" 
                                                    value={maintenanceCalories} 
                                                    onChange={(e) => setMaintenanceCalories(e.target.value)} 
                                                />
                                                <span className="pr-4 text-[10px] font-black text-slate-500 uppercase">Kcal</span>
                                            </div>
                                        </div>

                                        <div className={`mt-8 text-center p-5 rounded-[2rem] border-2 transition-all ${totals.isDeficit ? 'bg-emerald-500/10 border-emerald-500/20 text-[#38C1A3]' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} font-black text-sm uppercase tracking-widest shadow-inner`}>
                                            {totals.isDeficit ? 'Déficit' : 'Superávit'}: {totals.diffCalories} Kcal
                                        </div>
                                    </div>
                                </div>

                                {/* IMC y Evolución Física - COMPONENTE */}
                                <PhysicalProgress 
                                    peso={peso}
                                    setPeso={setPeso}
                                    altura={altura}
                                    setAltura={setAltura}
                                    measurements={measurements}
                                    onSave={handleProgressSave}
                                    isSubmitting={submittingProgress}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                /* 1. Eliminar SOLO la flecha de Select2, manteniendo bordes y fondo */
                .select2-container .select2-selection__arrow {
                    display: none !important;
                }
                .select2-container--default .select2-selection--single {
                    height: auto !important;
                    border: 1px solid #f1f5f9 !important; /* border-slate-100 */
                    background-color: #f8fafc !important; /* bg-slate-50 */
                    border-radius: 1rem !important; /* rounded-2xl */
                    padding: 0.5rem 1rem !important;
                }
                .select2-container--default .select2-selection--single .select2-selection__rendered {
                    line-height: 2.5rem !important;
                    color: #334155 !important; /* text-slate-700 */
                    font-weight: 900 !important;
                    font-size: 0.875rem !important;
                }

                /* 2. Eliminar flecha nativa del navegador */
                select {
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    appearance: none !important;
                }

                /* 3. Eliminar icono nativo del calendario y hacerlo clicable en toda el área */
                input[type="date"]::-webkit-calendar-picker-indicator {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    opacity: 0 !important;
                    cursor: pointer !important;
                    background: none !important;
                }
                
                input[type="date"] {
                    position: relative !important;
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    appearance: none !important;
                }

                .no-spinner::-webkit-inner-spin-button, 
                .no-spinner::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                .no-spinner {
                    -moz-appearance: textfield;
                }
            `}} />

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
