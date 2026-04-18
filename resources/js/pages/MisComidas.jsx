import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

export default function MisComidas() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [comidas, setComidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [mealText, setMealText] = useState('');
    const [mealType, setMealType] = useState('almuerzo');
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Rutinas AI
    const [routineGoal, setRoutineGoal] = useState('perder peso');
    const [generatingRoutine, setGeneratingRoutine] = useState(false);
    const [routinePlan, setRoutinePlan] = useState(null);
    const [routineError, setRoutineError] = useState(null);
    const [completedExercises, setCompletedExercises] = useState([]);
    
    // Calorías
    const [maintenanceCalories, setMaintenanceCalories] = useState(2500); // Input de mantenimiento

    useEffect(() => {
        fetchMeals();
    }, [selectedDate]);

    const fetchMeals = async () => {
        setLoading(true);
        setRoutinePlan(null); // Resetear rutina al cambiar fecha
        try {
            const { data } = await axios.get('/nutricion?date=' + selectedDate);
            setComidas(data.meals || []);
        } catch (err) {
            console.error('Error fetching meals:', err);
        } finally {
            setLoading(false);
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
            setRoutinePlan(null); // Obligar a regenerar la rutina porque los macros cambiaron
        } catch (err) {
            setError(err.response?.data?.error || 'Ocurrió un error con la IA.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGenerateRoutine = async () => {
        setGeneratingRoutine(true);
        setRoutineError(null);
        try {
            const { data } = await axios.post('/nutricion/routine', {
                date: selectedDate,
                goal: routineGoal
            });
            setRoutinePlan(data.plan);
            setCompletedExercises([]); // Reset checkboxes
        } catch (err) {
            setRoutineError(err.response?.data?.error || 'No se pudo generar el plan de acción.');
        } finally {
            setGeneratingRoutine(false);
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
        
        const burnedCalories = completedExercises.reduce((total, i) => {
            const ex = routinePlan?.routine[i];
            return total + (ex?.focus?.toLowerCase().includes('cardio') ? 80 : 50);
        }, 0);

        const netCalories = calories - burnedCalories;
        const isDeficit = maintenanceCalories > netCalories;
        const diffCalories = Math.abs(maintenanceCalories - netCalories);
        
        return { calories, protein, carbs, fats, burnedCalories, netCalories, isDeficit, diffCalories };
    };

    const totals = calculateTotals();

    const handleToggleExercise = (index) => {
        if (completedExercises.includes(index)) {
            setCompletedExercises(completedExercises.filter(i => i !== index));
        } else {
            setCompletedExercises([...completedExercises, index]);
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
                {/* Dashboard Header */}
                <header className="px-10 py-8 flex items-center justify-between bg-white border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-6">
                        <button className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3]" onClick={() => setIsSidebarOpen(true)}>
                            <i className="fa-solid fa-bars text-xl"></i>
                        </button>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-green-100/50">
                            🍎
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Alimentación <span className="text-[#38C1A3]">AI</span></h1>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">Control inteligente de tus macros</p>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-auto p-6 lg:p-10 space-y-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                            
                            {/* Columna Izquierda: Input y Listado */}
                            <div className="xl:col-span-2 space-y-10">
                                
                                {/* Tarjeta Registro */}
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:border-[#38C1A3]/30 transition-all duration-300 relative overflow-hidden group">
                                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-1.5 h-6 bg-[#38C1A3] rounded-full"></div>
                                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Registrar Comida</h2>
                                        </div>
                                        
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="flex gap-4">
                                                <select 
                                                    value={mealType} 
                                                    onChange={(e) => setMealType(e.target.value)}
                                                    className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#38C1A3] focus:border-[#38C1A3] outline-none text-slate-700 w-48 shadow-sm"
                                                >
                                                    <option value="desayuno">Desayuno</option>
                                                    <option value="almuerzo">Almuerzo</option>
                                                    <option value="cena">Cena</option>
                                                    <option value="snack">Snack</option>
                                                </select>
                                            </div>
                                            <div className="relative">
                                                <textarea
                                                    value={mealText}
                                                    onChange={(e) => setMealText(e.target.value)}
                                                    placeholder="Ej: He comido 200g de pollo a la plancha con un poco de arroz..."
                                                    rows="3"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 text-sm font-medium focus:ring-2 focus:ring-[#38C1A3] outline-none resize-none text-slate-700 shadow-inner"
                                                ></textarea>
                                            </div>
                                            
                                            {error && <p className="text-rose-500 text-xs font-bold px-2"><i className="fa-solid fa-triangle-exclamation mr-1"></i> {error}</p>}

                                            <div className="flex justify-end pt-2">
                                                <button 
                                                    type="submit" 
                                                    disabled={submitting || !mealText.trim()}
                                                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {submitting ? <i className="fa-solid fa-spinner fa-spin text-[#38C1A3]"></i> : <i className="fa-solid fa-paper-plane text-[#38C1A3]"></i>}
                                                    Analizar con IA
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Lista de Comidas */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Registros</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="date" 
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-500 px-3 py-1.5 rounded-lg">{comidas.length} Registros</span>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex justify-center py-10">
                                            <div className="w-10 h-10 border-4 border-[#38C1A3]/20 border-t-[#38C1A3] rounded-full animate-spin"></div>
                                        </div>
                                    ) : comidas.length === 0 ? (
                                        <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center shadow-sm">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-3xl shadow-inner">
                                                🍎
                                            </div>
                                            <p className="text-slate-500 font-black text-sm uppercase tracking-widest mb-1">Tu diario está vacío</p>
                                            <p className="text-slate-400 text-xs font-medium mt-1">Registra tu primera comida para ver el desglose.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            {comidas.map(meal => (
                                                <div key={meal.id} className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-all relative overflow-hidden">
                                                    
                                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-lg">
                                                                <i className={`fa-solid ${meal.meal_type === 'desayuno' ? 'fa-mug-saucer' : meal.meal_type === 'almuerzo' ? 'fa-utensils' : meal.meal_type === 'cena' ? 'fa-moon' : 'fa-cookie'}`}></i>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                                                                    {meal.meal_type}
                                                                </span>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                                    {new Date(meal.logged_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-center">
                                                            <span className="block text-lg font-black leading-none">{meal.calories_est || 0}</span>
                                                            <span className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">Kcal</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <p className="text-sm text-slate-600 font-medium mb-6 px-1 relative z-10">"{meal.meal_description}"</p>
                                                    
                                                    <div className="grid grid-cols-3 gap-3 mb-6 relative z-10 pt-5 border-t border-slate-50">
                                                        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                            <div className="text-[10px] text-rose-500 uppercase font-black tracking-widest flex items-center gap-1.5">
                                                                <div className="w-2 h-2 rounded-full bg-rose-500 line-clamp-1 truncate"></div>Pro
                                                            </div>
                                                            <div className="font-black text-slate-800 text-sm leading-none">{meal.macros_est?.protein || 0}g</div>
                                                        </div>
                                                        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                            <div className="text-[10px] text-[#38C1A3] uppercase font-black tracking-widest flex items-center gap-1.5">
                                                                <div className="w-2 h-2 rounded-full bg-[#38C1A3]"></div>Car
                                                            </div>
                                                            <div className="font-black text-slate-800 text-sm leading-none">{meal.macros_est?.carbs || 0}g</div>
                                                        </div>
                                                        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                            <div className="text-[10px] text-amber-500 uppercase font-black tracking-widest flex items-center gap-1.5">
                                                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>Fat
                                                            </div>
                                                            <div className="font-black text-slate-800 text-sm leading-none">{meal.macros_est?.fats || 0}g</div>
                                                        </div>
                                                    </div>

                                                    {meal.ai_feedback && (
                                                        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-[1.5rem] text-sm text-slate-700 relative z-10 flex gap-4 items-start shadow-inner">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                                                                <i className="fa-solid fa-robot text-xs"></i>
                                                            </div>
                                                            <p className="leading-relaxed font-medium pt-1">{meal.ai_feedback}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Generador de Rutinas (Movido a la izquierda) */}
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50 z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Plan de Acción AI</h3>
                                            </div>
                                            {routinePlan && (
                                                <span className="text-[10px] font-black bg-emerald-50 text-emerald-500 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                    {completedExercises.length} / {routinePlan.routine.length} Completados
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                                <div className="w-full">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Mi Objetivo Estratégico:</label>
                                                    <select 
                                                        value={routineGoal} 
                                                        onChange={(e) => setRoutineGoal(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                                    >
                                                        <option value="perder peso">Acelerar Déficit / Quemar Grasa</option>
                                                        <option value="ganar masa muscular">Hipertrofia / Ganancia Muscular</option>
                                                        <option value="mantenimiento y salud">Movilidad deportiva</option>
                                                    </select>
                                                </div>
                                                
                                                <button 
                                                    onClick={handleGenerateRoutine}
                                                    disabled={generatingRoutine || comidas.length === 0}
                                                    className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                                                >
                                                    {generatingRoutine ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt"></i>} 
                                                    {routinePlan ? 'Regenerar' : 'Generar Rutina AI'}
                                                </button>
                                            </div>
                                            
                                            {routineError && <p className="text-rose-500 text-xs font-bold mt-2"><i className="fa-solid fa-circle-exclamation mr-1"></i>{routineError}</p>}
                                            
                                            {routinePlan && (
                                                <div className="mt-6 animate-fade-in border border-indigo-100 rounded-[1.5rem] bg-indigo-50/20 overflow-hidden">
                                                    <div className="p-5 bg-indigo-50/80 border-b border-indigo-100/50 text-center">
                                                        <p className="text-sm text-indigo-900 font-bold italic px-2">"{routinePlan.motivation}"</p>
                                                    </div>
                                                    
                                                    <div className="p-0">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="bg-white/50 border-b border-indigo-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                    <th className="p-4 w-12 text-center">✓</th>
                                                                    <th className="p-4">Ejercicio Requerido</th>
                                                                    <th className="p-4">Series / Tiempo</th>
                                                                    <th className="p-4 text-right">Enfoque</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {routinePlan.routine.map((ex, i) => {
                                                                    const isDone = completedExercises.includes(i);
                                                                    return (
                                                                        <tr key={i} className={`border-b border-slate-50 last:border-0 transition-all ${isDone ? 'bg-emerald-50/50 opacity-80' : 'bg-white hover:bg-slate-50'}`}>
                                                                            <td className="p-4 text-center border-r border-slate-50">
                                                                                <button 
                                                                                    onClick={() => handleToggleExercise(i)}
                                                                                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 text-white shadow-inner' : 'bg-slate-100 text-transparent hover:bg-slate-200 border border-slate-200'}`}
                                                                                >
                                                                                    <i className="fa-solid fa-check text-xs"></i>
                                                                                </button>
                                                                            </td>
                                                                            <td className="p-4">
                                                                                <span className={`text-sm font-black transition-all ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{ex.ejercicio}</span>
                                                                            </td>
                                                                            <td className="p-4">
                                                                                <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-lg"><i className="fa-solid fa-fire-flame-curved mr-1.5 text-rose-300"></i>{ex.series}</span>
                                                                            </td>
                                                                            <td className="p-4 text-right">
                                                                                <span className="text-[9px] font-black uppercase text-indigo-500 bg-white border border-indigo-100 px-2.5 py-1 rounded-md">{ex.focus}</span>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Columna Derecha: Summaries */}
                            <div className="space-y-6">
                                <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-xl text-white relative overflow-hidden group">
                                    {/* Decoration */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#38C1A3] rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-700"></div>
                                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-700"></div>

                                    <div className="flex items-center justify-between mb-10 relative z-10">
                                        <h3 className="font-black text-xl tracking-tight leading-tight">Total Consumido<br/><span className="text-sm text-[#38C1A3] font-bold">{selectedDate === new Date().toISOString().split('T')[0] ? 'Hoy' : new Date(selectedDate).toLocaleDateString()}</span></h3>
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shrink-0">
                                            <i className="fa-solid fa-fire text-rose-400"></i>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-10 text-center relative z-10 border-b border-white/10 pb-8 border-dashed">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">Ingresa tu Meta Calórica (IMC/TDEE):</p>
                                        <div className="flex items-center justify-center bg-black/20 rounded-xl max-w-[200px] mx-auto p-1 border border-white/5">
                                            <input 
                                                type="number" 
                                                min="1000" max="6000" step="50"
                                                value={maintenanceCalories}
                                                onChange={(e) => setMaintenanceCalories(e.target.value)}
                                                className="bg-transparent text-white font-black text-xl text-center w-full outline-none py-1"
                                            />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-4">Kcal</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-center items-center mb-8 relative z-10">
                                        <div className="relative w-52 h-52 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-xl">
                                                <circle cx="104" cy="104" r="90" stroke="rgba(255,255,255,0.05)" strokeWidth="14" fill="none" />
                                                <circle cx="104" cy="104" r="90" stroke={totals.isDeficit ? "#38C1A3" : "#F35B5B"} strokeWidth="14" strokeLinecap="round" fill="none" strokeDasharray="565" strokeDashoffset={565 - (565 * Math.min(Math.max(0, totals.netCalories) / maintenanceCalories, 1))} className="transition-all duration-1000 ease-out" />
                                            </svg>
                                            <div className="absolute text-center flex flex-col items-center justify-center">
                                                <div className="text-5xl font-black tracking-tighter text-white drop-shadow-md">{totals.netCalories}</div>
                                                <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 bg-slate-800/50 px-3 py-1 rounded-full">{totals.isDeficit ? 'Netas' : 'EXCESO'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {totals.burnedCalories > 0 && (
                                        <div className="text-center mb-6 relative z-10 animate-fade-in">
                                            <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-emerald-500/30 shadow-inner inline-flex items-center gap-2">
                                                <i className="fa-solid fa-fire text-lg"></i> -{totals.burnedCalories} Kcal quemadas
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Indicador de Déficit */}
                                    <div className={`mb-10 text-center p-4 rounded-2xl border relative z-10 ${totals.isDeficit ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{totals.isDeficit ? 'Déficit Calórico Actual' : 'Superávit Calórico (Exceso)'}</p>
                                        <p className={`text-2xl font-black ${totals.isDeficit ? 'text-[#38C1A3]' : 'text-rose-400'}`}>
                                            {totals.isDeficit ? '-' : '+'}{totals.diffCalories} <span className="text-xs">Kcal</span>
                                        </p>
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        <div>
                                            <div className="flex justify-between text-xs mb-2.5 font-black uppercase tracking-widest">
                                                <span className="text-rose-400 flex items-center gap-2"><i className="fa-solid fa-drumstick-bite"></i> Proteína</span>
                                                <span className="text-white">{totals.protein}g</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden shadow-inner">
                                                <div className="bg-gradient-to-r from-rose-500 to-rose-400 h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${Math.min((totals.protein / 150) * 100, 100)}%` }}>
                                                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-2.5 font-black uppercase tracking-widest">
                                                <span className="text-[#38C1A3] flex items-center gap-2"><i className="fa-solid fa-wheat-awn"></i> Carbohidratos</span>
                                                <span className="text-white">{totals.carbs}g</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden shadow-inner">
                                                <div className="bg-gradient-to-r from-[#38C1A3] to-teal-400 h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${Math.min((totals.carbs / 250) * 100, 100)}%` }}>
                                                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-2.5 font-black uppercase tracking-widest">
                                                <span className="text-amber-400 flex items-center gap-2"><i className="fa-solid fa-bacon"></i> Grasas</span>
                                                <span className="text-white">{totals.fats}g</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden shadow-inner">
                                                <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${Math.min((totals.fats / 70) * 100, 100)}%` }}>
                                                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
