import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PhysicalProgress from '../components/PhysicalProgress';
import AlertModal from '../components/AlertModal';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/PageHeader';
import SearchSelect from '../components/SearchSelect';

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
    const [senzuMode, setSenzuMode] = useState(false);
    
    // Ficha
    const [clientProfile, setClientProfile] = useState(null);
    const [files, setFiles] = useState([]);
    const [specialistNotes, setSpecialistNotes] = useState('');
    
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', isError: false });
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [uploading, setUploading] = useState(false);
    
    const showAlert = (message, isError = false, title = isError ? "Error" : "Éxito") => {
        setAlertConfig({ isOpen: true, title, message, isError });
    };

    // Plan de Acción & Rutinas IA
    const [activeTab, setActiveTab] = useState('ia');
    const [aiGoal, setAiGoal] = useState('Perder Grasa');
    const [aiRoutine, setAiRoutine] = useState(null);
    const [generatingRoutine, setGeneratingRoutine] = useState(false);
    
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState('');
    const [trainerMessage, setTrainerMessage] = useState('');
    const [sendingPlan, setSendingPlan] = useState(false);
    const [actionPlans, setActionPlans] = useState([]);

    const fetchTrainers = async () => {
        try {
            const { data } = await axios.get('/api/client/trainers');
            setTrainers(data || []);
            if (data?.length > 0) setSelectedTrainer(data[0].id);
        } catch (err) {
            console.error('Error fetching trainers', err);
        }
    };

    useEffect(() => {
        if (activeTab === 'entrenador' && trainers.length === 0) {
            fetchTrainers();
        }
    }, [activeTab]);

    const handleGenerateRoutine = async () => {
        setGeneratingRoutine(true);
        try {
            const { data } = await axios.post('/nutricion/routine', {
                date: selectedDate,
                goal: aiGoal
            });
            setAiRoutine(data.plan);
        } catch (err) {
            showAlert(err.response?.data?.error || 'Error al generar la rutina.', true);
        } finally {
            setGeneratingRoutine(false);
        }
    };

    const handleSendToTrainer = async (e) => {
        e.preventDefault();
        if (!selectedTrainer || !trainerMessage.trim()) return;
        setSendingPlan(true);
        try {
            const { data } = await axios.post('/api/action-plans', {
                trainer_id: selectedTrainer,
                target_date: selectedDate,
                goal_message: trainerMessage
            });
            setActionPlans([data, ...actionPlans]);
            setTrainerMessage('');
            showAlert('Solicitud enviada a tu entrenador correctamente.');
        } catch (err) {
            showAlert('Error al enviar la solicitud.', true);
        } finally {
            setSendingPlan(false);
        }
    };

    // Edición de macros
    const [editingMealId, setEditingMealId] = useState(null);
    const [editForm, setEditForm] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });

    const extractTime = (dateStr) => {
        if (!dateStr) return '00:00';
        const match = dateStr.match(/[T\s](\d{2}:\d{2})/);
        return match ? match[1] : '00:00';
    };

    const handleEditClick = (meal) => {
        setEditingMealId(meal.id);
        const timeValue = extractTime(meal.logged_at);
        setEditForm({
            calories: meal.calories_est || 0,
            protein: meal.macros_est?.protein || 0,
            carbs: meal.macros_est?.carbs || 0,
            fats: meal.macros_est?.fats || 0,
            time: timeValue
        });
    };

    const handleMacroChange = (field, val) => {
        if (val === '') {
            setEditForm({ ...editForm, [field]: '' });
            return;
        }
        if (!/^\d*\.?\d*$/.test(val)) return;
        setEditForm({ ...editForm, [field]: val });
    };

    const handleEditSave = async (mealId) => {
        try {
            const { data } = await axios.put(`/nutricion/log/${mealId}`, {
                calories_est: editForm.calories,
                protein: editForm.protein,
                carbs: editForm.carbs,
                fats: editForm.fats,
                time: editForm.time
            });
            setComidas(comidas.map(m => m.id === mealId ? data.meal : m));
            setEditingMealId(null);
            showAlert('Macros actualizados correctamente.');
        } catch (err) {
            showAlert('Error al actualizar los macros.', true);
        }
    };

    // Calorías
    const [maintenanceCalories, setMaintenanceCalories] = useState(2500);

    const handleMaintenanceChange = (e) => {
        const val = e.target.value;
        if (val === '') {
            setMaintenanceCalories('');
            return;
        }
        if (!/^\d+$/.test(val)) return;
        const num = parseInt(val, 10);
        if (num > 6000) {
            showAlert("El máximo de calorías permitidas es 6000 kcal.", true, "Límite excedido");
            return;
        }
        setMaintenanceCalories(num);
    };

    useEffect(() => {
        fetchMeals();
        fetchFicha();
        fetchActionPlans();
    }, [selectedDate]);

    const fetchActionPlans = async () => {
        try {
            const { data } = await axios.get('/api/action-plans?date=' + selectedDate);
            setActionPlans(data || []);
        } catch (err) {
            console.error('Error fetching action plans', err);
        }
    };

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
            setClientProfile(res.data.user);
            setPeso(res.data.user?.peso || '');
            setAltura(res.data.user?.altura ? Math.round(res.data.user.altura * 100) : '');
            setMeasurements(res.data.measurements || []);
            setFiles(res.data.files || []);
            setSpecialistNotes(res.data.user?.notas_especialista || '');
        } catch (error) {
            console.error('Error fetching physical data:', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !clientProfile) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('nombre', file.name);

        setUploading(true);
        try {
            await axios.post(`/client-profile/${clientProfile.id}/upload`, formData);
            fetchFicha();
        } catch (error) {
            showAlert('Error al subir el archivo', true);
        } finally {
            setUploading(false);
        }
    };

    const deleteFile = (fileId) => {
        setConfirmConfig({
            isOpen: true,
            title: "Eliminar Archivo",
            message: "¿Seguro que quieres eliminar este archivo? No se podrá recuperar.",
            onConfirm: async () => {
                try {
                    await axios.delete(`/client-profile/file/${fileId}`);
                    fetchFicha();
                    showAlert('Archivo eliminado.');
                } catch (err) {
                    showAlert('Error al eliminar el archivo.', true);
                }
            }
        });
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
            
            if (data.is_senzu) {
                setSenzuMode(true);
                setTimeout(() => setSenzuMode(false), 5000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Ocurrió un error con la IA.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMeal = (mealId) => {
        setConfirmConfig({
            isOpen: true,
            title: "Eliminar Registro",
            message: "¿Seguro que quieres eliminar esta comida de tu diario? No se podrá recuperar.",
            onConfirm: async () => {
                try {
                    await axios.delete(`/nutricion/log/${mealId}`);
                    setComidas(comidas.filter(m => m.id !== mealId));
                    showAlert('Comida eliminada.');
                } catch (err) {
                    showAlert('Error al eliminar la comida.', true);
                }
            }
        });
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
            await axios.post(`/client-profile/${userId}/progress`, { peso, altura: altura / 100 });
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
                    icon={<span>🍕</span>}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10 space-y-12 pb-24 lg:pb-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                            
                            {/* Columna Izquierda: Input y Listado */}
                            <div className="xl:col-span-8 space-y-10">
                                
                                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/20 border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-xl shadow-inner">🍕</div>
                                            <div>
                                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">¿Qué has comido hoy?</h2>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">La IA desglosará tus macros automáticamente</p>
                                            </div>
                                        </div>
                                        
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="relative inline-block w-full md:w-56 group z-50">
                                                    <SearchSelect
                                                        options={[
                                                            { value: 'desayuno', label: 'Desayuno' },
                                                            { value: 'almuerzo', label: 'Almuerzo' },
                                                            { value: 'cena', label: 'Cena' },
                                                            { value: 'snack', label: 'Merienda / Snack' }
                                                        ]}
                                                        value={mealType}
                                                        onChange={(e) => setMealType(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <textarea 
                                                    value={mealText} 
                                                    onChange={(e) => setMealText(e.target.value)} 
                                                    placeholder="Ej: He desayunado una tostada de aguacate con 2 huevos revueltos y un café con leche..." 
                                                    rows="3" 
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-7 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-[#38C1A3]/10 focus:border-[#38C1A3] outline-none resize-none transition-all shadow-inner" 
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
                                        <div className="bg-white p-10 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] border border-dashed border-slate-200 text-center shadow-sm">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner opacity-40">🍽️</div>
                                            <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Tu diario está en ayunas</p>
                                            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Registra algo para empezar el análisis</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-8">
                                            {comidas.map(meal => editingMealId === meal.id ? (
                                                <div key={meal.id} className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-[#38C1A3]/30 flex flex-col relative">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm"><i className="fa-solid fa-pen-to-square text-[#38C1A3] mr-2"></i> Editar Macros</h4>
                                                        <button onClick={() => setEditingMealId(null)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors"><i className="fa-solid fa-times"></i></button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest block mb-2">Hora de comida</label>
                                                                <input type="time" value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 font-black text-slate-700 transition-all text-center" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Calorías Totales (Kcal)</label>
                                                                <input type="text" inputMode="decimal" value={editForm.calories} onChange={e => handleMacroChange('calories', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-[#38C1A3] focus:ring-4 focus:ring-[#38C1A3]/10 font-black text-slate-700 transition-all text-center" />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase text-rose-500 tracking-widest block mb-2">Proteínas (g)</label>
                                                                <input type="text" inputMode="decimal" value={editForm.protein} onChange={e => handleMacroChange('protein', e.target.value)} className="w-full bg-rose-50/50 border border-rose-100 rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-400/10 font-black text-slate-700 transition-all text-center" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase text-[#38C1A3] tracking-widest block mb-2">Carbos (g)</label>
                                                                <input type="text" inputMode="decimal" value={editForm.carbs} onChange={e => handleMacroChange('carbs', e.target.value)} className="w-full bg-teal-50/50 border border-teal-100 rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-[#38C1A3] focus:ring-4 focus:ring-[#38C1A3]/10 font-black text-slate-700 transition-all text-center" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest block mb-2">Grasas (g)</label>
                                                                <input type="text" inputMode="decimal" value={editForm.fats} onChange={e => handleMacroChange('fats', e.target.value)} className="w-full bg-amber-50/50 border border-amber-100 rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 font-black text-slate-700 transition-all text-center" />
                                                            </div>
                                                        </div>
                                                        <div className="pt-4 flex justify-end">
                                                            <button onClick={() => handleEditSave(meal.id)} className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2">
                                                                <i className="fa-solid fa-check text-[#38C1A3]"></i> Guardar Cambios
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div key={meal.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] transition-all group-hover:bg-teal-50"></div>
                                                    
                                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-xl shadow-inner">
                                                                <span>
                                                                    {meal.meal_type === 'desayuno' ? '☕' : 
                                                                     meal.meal_type === 'almuerzo' ? '🥗' : 
                                                                     meal.meal_type === 'cena' ? '🌙' : '🍎'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-black uppercase text-slate-800 tracking-tight">{meal.meal_type}</span>
                                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{extractTime(meal.logged_at)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl shadow-slate-900/20 text-center relative">
                                                                <span className="block text-xl font-black leading-none">{meal.calories_est || 0}</span>
                                                                <span className="block text-[9px] font-black uppercase text-teal-400 tracking-widest mt-1">Kcal</span>
                                                            </div>
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                                <button onClick={() => handleEditClick(meal)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#38C1A3] transition-colors flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                                    <i className="fa-solid fa-pen"></i> Editar
                                                                </button>
                                                                <button onClick={() => handleDeleteMeal(meal.id)} className="text-[10px] font-black uppercase tracking-widest text-rose-300 hover:text-rose-500 transition-colors flex items-center justify-center w-8 h-8 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <i className="fa-solid fa-trash-can"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-base text-slate-600 font-bold mb-8 px-2 leading-relaxed relative z-10 italic">"{meal.meal_description}"</p>
                                                    <div className="grid grid-cols-3 gap-6 relative z-10">
                                                        <div className="bg-slate-50 rounded-2xl md:rounded-3xl p-3 md:p-5 border border-slate-100 flex flex-col items-center">
                                                            <span className="text-[10px] text-rose-500 uppercase font-black tracking-widest mb-1">Proteína</span>
                                                            <span className="font-black text-slate-800 text-lg">{meal.macros_est?.protein || 0}g</span>
                                                        </div>
                                                        <div className="bg-slate-50 rounded-2xl md:rounded-3xl p-3 md:p-5 border border-slate-100 flex flex-col items-center">
                                                            <span className="text-[10px] text-[#38C1A3] uppercase font-black tracking-widest mb-1">Carbos</span>
                                                            <span className="font-black text-slate-800 text-lg">{meal.macros_est?.carbs || 0}g</span>
                                                        </div>
                                                        <div className="bg-slate-50 rounded-2xl md:rounded-3xl p-3 md:p-5 border border-slate-100 flex flex-col items-center">
                                                            <span className="text-[10px] text-amber-500 uppercase font-black tracking-widest mb-1">Grasas</span>
                                                            <span className="font-black text-slate-800 text-lg">{meal.macros_est?.fats || 0}g</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Plan de Acción & Rutina */}
                                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/20 border border-slate-100 relative overflow-hidden">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl shadow-inner">🏋️</div>
                                        <div>
                                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Plan de Acción</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Obtén tu rutina personalizada en cualquier momento</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mb-8 p-1 bg-slate-50 rounded-2xl">
                                        <button onClick={() => setActiveTab('ia')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ia' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>IA Rápida</button>
                                        <button onClick={() => setActiveTab('entrenador')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'entrenador' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Mi Entrenador</button>
                                    </div>

                                    {activeTab === 'ia' ? (
                                        <div className="space-y-6">
                                            <div className="flex gap-4 z-40 relative">
                                                <div className="flex-1">
                                                    <SearchSelect
                                                        options={[
                                                            { value: 'Perder Grasa', label: 'Perder Grasa' },
                                                            { value: 'Ganar Masa Muscular', label: 'Ganar Masa Muscular' },
                                                            { value: 'Mantenimiento y Salud', label: 'Mantenimiento y Salud' }
                                                        ]}
                                                        value={aiGoal}
                                                        onChange={(e) => setAiGoal(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <button onClick={handleGenerateRoutine} disabled={generatingRoutine} className="w-full bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 transition-all flex justify-center items-center gap-3 disabled:opacity-50">
                                                {generatingRoutine ? <i className="fa-solid fa-spinner fa-spin text-[#38C1A3]"></i> : <i className="fa-solid fa-wand-magic-sparkles text-[#38C1A3]"></i>} 
                                                Generar Circuito IA
                                            </button>

                                            {aiRoutine && (
                                                <div className="mt-6 bg-teal-50/50 border border-teal-100 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8">
                                                    <p className="text-sm font-bold italic text-slate-700 mb-6 text-center">"{aiRoutine.motivation}"</p>
                                                    <div className="space-y-4">
                                                        {aiRoutine.routine?.map((ex, i) => (
                                                            <div key={i} className="bg-white rounded-2xl p-4 flex items-center justify-between border border-teal-50 shadow-sm">
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-800 uppercase">{ex.ejercicio}</h4>
                                                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">{ex.focus}</p>
                                                                </div>
                                                                <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-xl text-xs font-black uppercase">{ex.series}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {trainers.length === 0 ? (
                                                <div className="text-center p-6 bg-slate-50 rounded-2xl"><p className="text-xs font-black uppercase text-slate-400">No hay entrenadores disponibles</p></div>
                                            ) : (
                                                <>
                                                    <div className="z-30 relative mb-6">
                                                        <SearchSelect
                                                            options={trainers.map(t => ({ value: t.id, label: t.name }))}
                                                            value={selectedTrainer}
                                                            onChange={(e) => setSelectedTrainer(e.target.value)}
                                                            placeholder="Selecciona un entrenador"
                                                        />
                                                    </div>
                                                    <textarea value={trainerMessage} onChange={(e) => setTrainerMessage(e.target.value)} placeholder="Ej: Hola, hoy me gustaría enfocarme en pierna, ¿me pasas una rutina?" rows="3" className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-7 text-sm font-bold text-slate-700 focus:bg-white outline-none resize-none shadow-inner" />
                                                    <button onClick={handleSendToTrainer} disabled={sendingPlan || !trainerMessage.trim()} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 transition-all flex justify-center items-center gap-3 disabled:opacity-50">
                                                        {sendingPlan ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>} 
                                                        Solicitar Plan
                                                    </button>
                                                </>
                                            )}
                                            
                                            {/* Historial de Planes */}
                                            {actionPlans.length > 0 && (
                                                <div className="mt-8 space-y-6">
                                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Respuestas del Entrenador</h3>
                                                    {actionPlans.map(plan => (
                                                        <div key={plan.id} className="bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-sm">
                                                            <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-4">
                                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${plan.status === 'completed' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'}`}>{plan.status === 'completed' ? 'Respondido' : 'Pendiente'}</span>
                                                            </div>
                                                            <p className="text-sm text-slate-600 font-bold italic mb-4">"{plan.goal_message}"</p>
                                                            {plan.trainer_response && (
                                                                <div className="bg-indigo-50/50 rounded-2xl p-5 mt-4">
                                                                    <div className="flex items-center gap-2 mb-3 text-indigo-500 text-xs font-black uppercase tracking-widest"><i className="fa-solid fa-reply"></i> Respuesta del Entrenador</div>
                                                                    
                                                                    {(() => {
                                                                        let isStructured = false;
                                                                        let structuredData = null;
                                                                        try {
                                                                            const p = JSON.parse(plan.trainer_response);
                                                                            if (p.is_structured_routine) {
                                                                                isStructured = true;
                                                                                structuredData = p;
                                                                            }
                                                                        } catch(e) {}

                                                                        if (isStructured) {
                                                                            return (
                                                                                <div className="bg-white border border-indigo-100 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 mt-2">
                                                                                    {structuredData.motivation && (
                                                                                        <p className="text-sm font-bold italic text-slate-700 mb-6 text-center">"{structuredData.motivation}"</p>
                                                                                    )}
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
                                                                            return <p className="text-sm text-slate-700 whitespace-pre-wrap">{plan.trainer_response}</p>;
                                                                        }
                                                                    })()}

                                                                    {plan.trainer_images && plan.trainer_images.length > 0 && (
                                                                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                                                            {plan.trainer_images.map((img, idx) => (
                                                                                <img key={idx} src={img} className="w-24 h-24 object-cover rounded-xl border border-indigo-100 shadow-sm" alt="Trainer attachment" />
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Columna Derecha: Summaries & Evolución */}
                            <div className="xl:col-span-4 space-y-10">
                                
                                {/* Resumen Calorías */}
                                <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl text-white relative overflow-hidden group">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#38C1A3] rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-10">
                                            <h3 className="font-black text-xl tracking-tight uppercase tracking-widest">Meta Diaria</h3>
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm"><i className="fa-solid fa-bullseye text-teal-400"></i></div>
                                        </div>
                                        <div className="flex justify-center mb-10">
                                            <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90 filter drop-shadow-xl">
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
                                                    type="text" 
                                                    className="w-full bg-transparent text-white text-center font-black text-lg outline-none no-spinner" 
                                                    value={maintenanceCalories} 
                                                    onChange={handleMaintenanceChange} 
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
                                    showAlert={showAlert}
                                />

                            </div>
                        </div>

                        {/* MI FICHA / EXPEDIENTE Y NOTAS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
                            {/* DIGITAL DOSSIER / FILES */}
                            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-8xl text-[#38C1A3] pointer-events-none group-hover:scale-110 transition-transform duration-700"><i className="fa-solid fa-folder-tree"></i></div>
                                <div className="flex items-center justify-between mb-10 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-folder-tree"></i></div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Expediente Digital</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Solo imágenes y vídeos</p>
                                        </div>
                                    </div>
                                    <label className={`cursor-pointer ${uploading ? 'bg-slate-400' : 'bg-[#38C1A3] hover:bg-teal-500'} text-white px-6 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-lg shadow-teal-500/20 active:scale-95 group-hover:-translate-y-1`}>
                                        {uploading ? (
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                        ) : (
                                            <i className="fa-solid fa-cloud-arrow-up"></i>
                                        )}
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{uploading ? 'Subiendo...' : 'Subir Archivo'}</span>
                                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/*,video/*" />
                                    </label>
                                </div>

                                {uploading && (
                                    <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                            <div className="h-full bg-gradient-to-r from-[#38C1A3] to-teal-400 animate-progress origin-left"></div>
                                        </div>
                                        <p className="text-[9px] font-black text-[#38C1A3] uppercase tracking-widest mt-2 text-center animate-pulse">Procesando documento...</p>
                                    </div>
                                )}

                                <div className="flex-1 space-y-4 relative z-10">
                                    {files.length === 0 ? (
                                        <div className="h-64 border-4 border-dashed border-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 space-y-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl shadow-inner"><i className="fa-solid fa-folder-open opacity-30"></i></div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sin archivos disponibles</p>
                                        </div>
                                    ) : (
                                        files.map(file => (
                                            <div key={file.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group/file">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-400 shadow-sm">
                                                        <i className={`fa-solid ${['mp4', 'mov', 'webm'].includes(file.file_type?.toLowerCase()) ? 'fa-file-video' : 'fa-file-image'} text-xl`}></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-700 truncate max-w-[150px] md:max-w-xs">{file.file_name || file.nombre}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(file.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <a href={`/storage/${file.file_path}`} target="_blank" rel="noreferrer" className="p-3 bg-white text-slate-400 hover:text-indigo-500 rounded-xl shadow-sm transition-colors"><i className="fa-solid fa-eye"></i></a>
                                                    <button onClick={() => deleteFile(file.id)} className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-xl shadow-sm transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* SPECIALIST NOTES */}
                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-8xl text-indigo-500 pointer-events-none group-hover:scale-110 transition-transform duration-700"><i className="fa-solid fa-notes-medical"></i></div>
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-user-doctor"></i></div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Notas del Especialista</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Observaciones y recomendaciones</p>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 min-h-[300px] shadow-inner">
                                        {specialistNotes ? (
                                            <p className="text-slate-600 text-sm leading-relaxed font-medium whitespace-pre-wrap">{specialistNotes}</p>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                                                <i className="fa-solid fa-comment-slash text-4xl mb-4 opacity-20"></i>
                                                <p className="text-[9px] font-black uppercase tracking-widest">Aún no hay notas registradas</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                @keyframes progress {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
                .animate-progress {
                    animation: progress 2s infinite ease-in-out;
                }
            `}} />

            <AlertModal 
                isOpen={alertConfig.isOpen} 
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} 
                title={alertConfig.title} 
                message={alertConfig.message} 
                isError={alertConfig.isError} 
            />

            {/* Easter Egg Senzu Mode */}
            {senzuMode && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none bg-yellow-500/40 animate-pulse mix-blend-color-dodge">
                    <div className="animate-bounce scale-150 transform transition-transform duration-75 text-center">
                        <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] italic">
                            ¡MODO SUPERSAIYAN!
                        </h1>
                        <p className="text-4xl font-black text-yellow-300 drop-shadow-lg mt-4 animate-pulse">9999 KCAL</p>
                    </div>
                </div>
            )}
            <ConfirmModal 
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText="Eliminar"
                isDestructive={true}
            />
        </div>
    );
}
