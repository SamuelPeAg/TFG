import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';

const TIPOS_PERMITIDOS = ['ep', 'duo', 'trio', 'privado', 'grupo especial', 'grupo'];
const METROS_RESET = [
    { value: 1, label: '1 Mes (Solo el mes actual)' },
    { value: 2, label: '2 Meses' },
    { value: 3, label: '3 Meses' },
    { value: 6, label: '6 Meses' },
    { value: 12, label: '1 Año' },
    { value: 0, label: 'Nunca caducan' },
];

const EMPTY_FORM = {
    nombre: '',
    tipo_credito: '',
    id_centro: '',
    creditos_por_periodo: '',
    periodo: 'semanal',
    limite_acumulacion: 0,
    meses_reset: 1,
};

export default function Suscripciones() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [suscripciones, setSuscripciones] = useState([]);
    const [centros, setCentros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/suscripciones', { headers: { Accept: 'application/json' } });
            setSuscripciones(res.data.suscripciones || []);
            setCentros(res.data.centros || []);
        } catch (e) {
            console.error('Error cargando suscripciones:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setFormErrors({});
        setModalOpen(true);
    };

    const openEdit = (s) => {
        setEditingId(s.id);
        setForm({
            nombre: s.nombre || '',
            tipo_credito: s.tipo_credito || '',
            id_centro: s.id_centro || '',
            creditos_por_periodo: s.creditos_por_periodo || '',
            periodo: s.periodo || 'semanal',
            limite_acumulacion: s.limite_acumulacion || 0,
            meses_reset: s.meses_reset ?? 1,
        });
        setFormErrors({});
        setModalOpen(true);
    };

    const closeModal = () => { setModalOpen(false); };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
        if (!form.tipo_credito) errs.tipo_credito = 'Obligatorio.';
        if (!form.creditos_por_periodo) errs.creditos_por_periodo = 'Obligatorio.';
        if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

        setSaving(true);
        try {
            if (editingId) {
                await axios.put(`/suscripciones/${editingId}`, form);
            } else {
                await axios.post('/suscripciones', form);
            }
            closeModal();
            fetchData();
        } catch (err) {
            if (err.response?.status === 422) {
                const errsObj = {};
                Object.entries(err.response.data.errors || {}).forEach(([k, v]) => { errsObj[k] = v[0]; });
                setFormErrors(errsObj);
            } else {
                alert('Error al guardar la suscripción.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta suscripción?')) return;
        try {
            await axios.delete(`/suscripciones/${id}`);
            fetchData();
        } catch {
            alert('Error al eliminar.');
        }
    };

    const filtered = suscripciones.filter(s => {
        const q = search.toLowerCase();
        return !q || s.nombre?.toLowerCase().includes(q) || s.tipo_credito?.toLowerCase().includes(q);
    });

    const getBadgeColor = (tipo) => {
        const t = (tipo || '').toLowerCase();
        if (t.includes('ep')) return { bg: 'bg-rose-500', label: 'EP' };
        if (t.includes('duo')) return { bg: 'bg-violet-500', label: 'Dúo' };
        if (t.includes('trio')) return { bg: 'bg-amber-500', label: 'Trío' };
        if (t.includes('privado')) return { bg: 'bg-blue-500', label: 'Privado' };
        return { bg: 'bg-teal-500', label: tipo };
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
                {/* Header */}
                <header className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <button className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3] rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setIsSidebarOpen(true)}>
                            <i className="fa-solid fa-bars text-xl"></i>
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Suscripciones</h1>
                            <p className="text-slate-400 mt-1 font-medium text-sm">Gestión de bonos y paquetes de créditos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-[400px]">
                        {/* Buscador */}
                        <div className="relative flex-1 w-full" style={{ maxWidth: '400px' }}>
                            <div className="absolute inset-y-0 left-0 pl-[15px] flex items-center pointer-events-none">
                                <i className="fa-solid fa-magnifying-glass text-[#9CA3AF]"></i>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por nombre o tipo..."
                                className="w-full pl-[45px] pr-4 h-[45px] bg-white border outline-none transition-colors text-sm text-slate-700 font-medium placeholder:text-slate-400"
                                style={{ borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none', transition: 'border-color 0.2s' }}
                                onFocus={(e) => e.target.style.borderColor = '#4BB7AE'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                            />
                        </div>
                        <button 
                            onClick={openCreate}
                            className="h-[45px] px-5 flex items-center justify-center gap-2 whitespace-nowrap text-white font-bold transition-colors"
                            style={{ backgroundColor: '#4BB7AE', border: 'none', borderRadius: '12px' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#3f9c94'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#4BB7AE'}
                        >
                            <i className="fas fa-plus pointer-events-none"></i> <span className="pointer-events-none">Añadir</span>
                        </button>
                    </div>
                </header>

                {/* Table Area */}
                <section className="flex-1 overflow-auto px-6 sm:px-8 pb-8">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
                                <i className="fa-solid fa-spinner fa-spin text-3xl text-teal-400"></i>
                                <p className="font-medium animate-pulse">Cargando suscripciones...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
                                <i className="fa-solid fa-ticket-alt text-4xl text-slate-200"></i>
                                <p className="font-bold text-slate-500">No hay suscripciones</p>
                                <p className="text-sm">Crea la primera haciendo clic en "Añadir"</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left facto-table">
                                    <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Nombre</th>
                                            <th className="px-6 py-4">Tipo Clase</th>
                                            <th className="px-6 py-4">Centro</th>
                                            <th className="px-6 py-4 text-center">Créditos / Periodo</th>
                                            <th className="px-6 py-4 text-center">Límite</th>
                                            <th className="px-6 py-4 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filtered.map(s => {
                                            const badge = getBadgeColor(s.tipo_credito);
                                            return (
                                                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-800 text-sm" data-label="Nombre">{s.nombre}</td>
                                                    <td className="px-6 py-4" data-label="Tipo">
                                                        <span className={`${badge.bg} text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full`}>
                                                            {badge.label || s.tipo_credito}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium" data-label="Centro">
                                                        {s.centro?.nombre || <span className="text-slate-400 italic">Global</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-700" data-label="Créditos">
                                                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg">{s.creditos_por_periodo} / {s.periodo}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-slate-600" data-label="Límite">
                                                        {s.limite_acumulacion ? s.limite_acumulacion : <span className="text-slate-400 text-xs italic">Sin límite</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-center" data-label="Acciones">
                                                        <div className="inline-flex gap-2">
                                                            <button onClick={() => openEdit(s)} className="w-9 h-9 bg-slate-100 hover:bg-teal-50 hover:text-teal-600 text-slate-500 rounded-xl flex items-center justify-center transition-colors shadow-sm">
                                                                <i className="fas fa-pencil-alt text-sm"></i>
                                                            </button>
                                                            <button onClick={() => handleDelete(s.id)} className="w-9 h-9 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl flex items-center justify-center transition-colors shadow-sm">
                                                                <i className="fas fa-trash text-sm"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Footer Count */}
                        {!loading && filtered.length > 0 && (
                            <div className="px-6 py-3 border-t border-slate-50 text-xs text-slate-400 font-medium bg-slate-50/50">
                                {filtered.length} suscripción{filtered.length !== 1 ? 'es' : ''}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* ——— MODAL CREAR / EDITAR ——— */}
            {modalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="bg-slate-50 px-8 py-7 text-center border-b border-slate-100 relative">
                            <button onClick={closeModal} className="absolute top-5 right-5 w-9 h-9 bg-white text-slate-400 hover:text-slate-700 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                                <i className="fas fa-ticket-alt text-2xl text-[#38C1A3]"></i>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingId ? 'Editar Suscripción' : 'Nueva Suscripción'}</h2>
                            <p className="text-slate-400 text-sm mt-1 font-medium">Configura las reglas de créditos para tus alumnos.</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5 max-h-[70vh] overflow-y-auto">
                            
                            {/* Información General */}
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <i className="fas fa-info-circle text-[#38C1A3]"></i> Información General
                            </p>

                            {/* Nombre */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600">Nombre de la Suscripción</label>
                                <input type="text" name="nombre" value={form.nombre} onChange={handleFormChange}
                                    placeholder="Ej: Bono Mensual EP"
                                    className={`w-full bg-slate-50 border ${formErrors.nombre ? 'border-rose-400' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-[#38C1A3]`} />
                                {formErrors.nombre && <p className="text-xs text-rose-500 font-bold">{formErrors.nombre}</p>}
                            </div>

                            {/* Tipo + Centro */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-600">Tipo de Clase/Servicio</label>
                                    <select name="tipo_credito" value={form.tipo_credito} onChange={handleFormChange}
                                        className={`w-full bg-slate-50 border ${formErrors.tipo_credito ? 'border-rose-400' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-[#38C1A3]`}>
                                        <option value="">-- Selecciona Tipo --</option>
                                        {TIPOS_PERMITIDOS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                    {formErrors.tipo_credito && <p className="text-xs text-rose-500 font-bold">{formErrors.tipo_credito}</p>}
                                    <p className="text-[10px] text-slate-400">Jerarquía: EP › Privado › Dúo › Trío › Especial › Grupo</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-600">Centro asignado</label>
                                    <select name="id_centro" value={form.id_centro} onChange={handleFormChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-[#38C1A3]">
                                        <option value="">Global (Todos)</option>
                                        {centros.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Ciclo de Créditos */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Ciclo de Créditos</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-600">¿Cuántos créditos?</label>
                                        <input type="number" name="creditos_por_periodo" value={form.creditos_por_periodo} onChange={handleFormChange} min="1"
                                            className={`w-full bg-white border ${formErrors.creditos_por_periodo ? 'border-rose-400' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-[#38C1A3]`} />
                                        {formErrors.creditos_por_periodo && <p className="text-xs text-rose-500 font-bold">{formErrors.creditos_por_periodo}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-600">¿Cuándo se entregan?</label>
                                        <select name="periodo" value={form.periodo} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-[#38C1A3]">
                                            <option value="semanal">Semanal</option>
                                            <option value="mensual">Mensual</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Ahorro y Caducidad */}
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 pt-1">
                                <i className="fas fa-clock-rotate-left text-[#38C1A3]"></i> Ahorro y Caducidad
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-600">Límite Acumulación</label>
                                    <input type="number" name="limite_acumulacion" value={form.limite_acumulacion} onChange={handleFormChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-[#38C1A3]" />
                                    <p className="text-[10px] text-slate-400">0 = sin límite</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-600">Caducidad</label>
                                    <select name="meses_reset" value={form.meses_reset} onChange={handleFormChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-[#38C1A3]">
                                        {METROS_RESET.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={saving}
                                className="w-full py-3.5 bg-gradient-to-r from-[#38C1A3] to-[#4BB7AE] text-white font-black rounded-2xl shadow-lg shadow-teal-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2">
                                {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                                {saving ? 'Guardando...' : 'Guardar Configuración'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
