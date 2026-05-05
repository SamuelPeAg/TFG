import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

    // Rutinas AI
    const [routineGoal, setRoutineGoal] = useState('perder peso');
    const [generatingRoutine, setGeneratingRoutine] = useState(false);
    const [routinePlan, setRoutinePlan] = useState(null);
    const [routineError, setRoutineError] = useState(null);
    const [completedExercises, setCompletedExercises] = useState([]);
    
    // Entrenador Plan
    const [planType, setPlanType] = useState('ai'); // 'ai' o 'trainer'
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState('');
    const [trainerMessage, setTrainerMessage] = useState('');
    const [clientPlans, setClientPlans] = useState([]);
    const [submittingPlan, setSubmittingPlan] = useState(false);
    
    // Calorías
    const [maintenanceCalories, setMaintenanceCalories] = useState(2500);

    useEffect(() => {
        fetchMeals();
        fetchClientPlans();
        fetchFicha();
    }, [selectedDate]);

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const { data } = await axios.get('/api/client/trainers');
                setTrainers(data);
                if(data.length > 0) setSelectedTrainer(data[0].id);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTrainers();
    }, []);

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

    const fetchClientPlans = async () => {
        try {
            const { data } = await axios.get('/api/action-plans?date=' + selectedDate);
            setClientPlans(data);
        } catch (err) {
            console.error(err);
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
            setRoutinePlan(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Ocurrió un error con la IA.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleProgressSubmit = async (e) => {
        e.preventDefault();
        setSubmittingProgress(true);
        try {
            const userRes = await axios.get('/configuracion');
            const userId = userRes.data.user.id;
            await axios.post(`/client-profile/${userId}/progress`, { peso, altura });
            fetchFicha();
        } catch (err) {
            alert('Error al registrar el progreso');
        } finally {
            setSubmittingProgress(false);
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
            setCompletedExercises([]);
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

    const weightVal = parseFloat(peso);
    const heightVal = parseFloat(altura);
    const currentIMC = (weightVal > 0 && heightVal > 0) ? (weightVal / (heightVal * heightVal)).toFixed(2) : null;

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
                <header className="px-10 py-8 flex items-center justify-between bg-white border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-6">
                        <button className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3]" onClick={() => setIsSidebarOpen(true)}>
                            <i className="fa-solid fa-bars text-xl"></i>
                        </button>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brandCoral to-rose-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-rose-100/50">
                            🍎
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Nutrición <span className="text-[#38C1A3]">&amp; Evolución</span></h1>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">Control inteligente de macros y físico</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 lg:p-10 space-y-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                            
                            {/* Columna Izquierda: Input y Listado */}
                            <div className="xl:col-span-2 space-y-10">
                                
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:border-[#38C1A3]/30 transition-all duration-300 relative overflow-hidden group">
                                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-1.5 h-6 bg-[#38C1A3] rounded-full"></div>
                                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Registrar Comida</h2>
                                        </div>
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="flex gap-4">
                                                <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#38C1A3] outline-none text-slate-700 w-48 shadow-sm">
                                                    <option value="desayuno">Desayuno</option>
                                                    <option value="almuerzo">Almuerzo</option>
                                                    <option value="cena">Cena</option>
                                                    <option value="snack">Snack</option>
                                                </select>
                                            </div>
                                            <textarea value={mealText} onChange={(e) => setMealText(e.target.value)} placeholder="Ej: 200g de pollo con arroz..." rows="3" className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 text-sm font-medium focus:ring-2 focus:ring-[#38C1A3] outline-none resize-none text-slate-700 shadow-inner" />
                                            {error && <p className="text-rose-500 text-xs font-bold px-2"><i className="fa-solid fa-triangle-exclamation mr-1"></i> {error}</p>}
                                            <div className="flex justify-end pt-2">
                                                <button type="submit" disabled={submitting || !mealText.trim()} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-slate-900/10 hover:-translate-y-0.5">
                                                    {submitting ? <i className="fa-solid fa-spinner fa-spin text-[#38C1A3]"></i> : <i className="fa-solid fa-paper-plane text-[#38C1A3]"></i>} Analizar con IA
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Registros Diario</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer" />
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-[#38C1A3]/20 border-t-[#38C1A3] rounded-full animate-spin"></div></div>
                                    ) : comidas.length === 0 ? (
                                        <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center shadow-sm">
                                            <p className="text-slate-500 font-black text-sm uppercase tracking-widest mb-1">Sin comidas registradas</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            {comidas.map(meal => (
                                                <div key={meal.id} className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-lg">
                                                                <i className={`fa-solid ${meal.meal_type === 'desayuno' ? 'fa-mug-saucer' : meal.meal_type === 'almuerzo' ? 'fa-utensils' : meal.meal_type === 'cena' ? 'fa-moon' : 'fa-cookie'}`}></i>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-black uppercase text-slate-800">{meal.meal_type}</span>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(meal.logged_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-100 text-center">
                                                            <span className="block text-lg font-black leading-none">{meal.calories_est || 0}</span>
                                                            <span className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">Kcal</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-600 font-medium mb-6 px-1 italic">"{meal.meal_description}"</p>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                            <span className="text-[10px] text-rose-500 uppercase font-black tracking-widest">Pro</span>
                                                            <span className="font-black text-slate-800 text-sm">{meal.macros_est?.protein || 0}g</span>
                                                        </div>
                                                        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                            <span className="text-[10px] text-[#38C1A3] uppercase font-black tracking-widest">Car</span>
                                                            <span className="font-black text-slate-800 text-sm">{meal.macros_est?.carbs || 0}g</span>
                                                        </div>
                                                        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                            <span className="text-[10px] text-amber-500 uppercase font-black tracking-widest">Fat</span>
                                                            <span className="font-black text-slate-800 text-sm">{meal.macros_est?.fats || 0}g</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Columna Derecha: Summaries & Evolución */}
                            <div className="space-y-10">
                                
                                {/* Resumen Calorías */}
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden group">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#38C1A3] rounded-full opacity-20 blur-3xl"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="font-black text-lg uppercase tracking-widest">Balance Hoy</h3>
                                            <i className="fa-solid fa-fire text-rose-400"></i>
                                        </div>
                                        <div className="flex justify-center mb-8">
                                            <div className="relative w-44 h-44 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="88" cy="88" r="78" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                                                    <circle cx="88" cy="88" r="78" stroke={totals.isDeficit ? "#38C1A3" : "#F35B5B"} strokeWidth="12" strokeLinecap="round" fill="none" strokeDasharray="490" strokeDashoffset={490 - (490 * Math.min(Math.max(0, totals.netCalories) / maintenanceCalories, 1))} className="transition-all duration-1000" />
                                                </svg>
                                                <div className="absolute text-center">
                                                    <div className="text-4xl font-black">{totals.netCalories}</div>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Netas</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-center p-3 rounded-xl border ${totals.isDeficit ? 'bg-emerald-500/10 border-emerald-500/20 text-[#38C1A3]' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} font-black text-xs uppercase tracking-widest`}>
                                            {totals.isDeficit ? 'En Déficit: ' : 'Exceso: '} {totals.diffCalories} Kcal
                                        </div>
                                    </div>
                                </div>

                                {/* IMC y Evolución Física */}
                                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-8xl text-[#38C1A3] pointer-events-none group-hover:scale-110 transition-transform duration-700"><i className="fa-solid fa-heart-pulse"></i></div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-3xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-gauge-high"></i></div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Evolución Física</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control de peso &amp; IMC</p>
                                            </div>
                                        </div>
                                    </div>
                                    <form onSubmit={handleProgressSubmit} className="space-y-6 relative z-10">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2 group">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Peso (kg)</label>
                                                <div className="relative">
                                                    <input step="0.1" className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="0.0" type="number" value={peso} onChange={(e) => setPeso(e.target.value)} />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">kg</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Altura (m)</label>
                                                <div className="relative">
                                                    <input step="0.01" className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner" placeholder="0.00" type="number" value={altura} onChange={(e) => setAltura(e.target.value)} />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">m</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button type="submit" disabled={submittingProgress} className="w-full py-5 bg-[#38C1A3] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] hover:bg-teal-500 shadow-xl shadow-teal-500/30 active:scale-95 transition-all flex items-center justify-center gap-3">
                                            {submittingProgress ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-fire-pulse text-lg"></i> Registrar Progreso</>}
                                        </button>
                                    </form>
                                    <div className="pt-6 border-t border-slate-100">
                                        <div className="h-56 w-full">
                                            {measurements.length > 0 ? (
                                                <Line 
                                                    data={{
                                                        labels: [...measurements].reverse().map(m => new Date(m.measured_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })),
                                                        datasets: [{
                                                            label: 'Peso',
                                                            data: [...measurements].reverse().map(m => m.peso),
                                                            borderColor: '#38C1A3',
                                                            backgroundColor: 'rgba(56, 193, 163, 0.1)',
                                                            fill: true,
                                                            tension: 0.45,
                                                            pointRadius: 6,
                                                            pointBackgroundColor: '#fff',
                                                            pointBorderColor: '#38C1A3',
                                                            pointBorderWidth: 3
                                                        }]
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: { legend: { display: false }, tooltip: { cornerRadius: 12, padding: 12 } },
                                                        scales: { 
                                                            x: { display: true, grid: { display: false }, ticks: { font: { weight: 'bold', size: 9 }, color: '#94A3B8' } }, 
                                                            y: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 9 }, color: '#94A3B8' } } 
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                                    <i className="fa-solid fa-chart-line text-4xl mb-3 opacity-20"></i>
                                                    <p className="text-[9px] font-black uppercase tracking-widest">Sin historial de peso</p>
                                                </div>
                                            )}
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
