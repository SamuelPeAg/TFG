import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import PageHeader from '../components/PageHeader';


const METROS_RESET = [
    { value: 1, label: '1 Mes (Solo el mes actual)' },
    { value: 15, label: '1 Mes desde que se entregan los créditos' },
    { value: 2, label: '2 Meses' },
    { value: 3, label: '3 Meses' },
    { value: 6, label: '6 Meses' },
    { value: 12, label: '1 Año' },
    { value: 0, label: 'Nunca caducan' },
];

const EMPTY_FORM = {
    nombre: '',
    precio: '',
    periodo: 'semanal',
    limite_acumulacion: 0,
    meses_reset: 1,
    domiciliacion: false,
    creditos: [{ tipo_credito_id: '', cantidad: 1, dias_caducidad: 30 }],
};

export default function Suscripciones() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [suscripciones, setSuscripciones] = useState([]);
    const [centros, setCentros] = useState([]);
    const [tiposCredito, setTiposCredito] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [alert, setAlert] = useState({ show: false, title: '', message: '', isError: false });

    const periodoRef = useRef(null);
    const resetRef = useRef(null);

    // Initializer for Select2
    useEffect(() => {
        if (!modalOpen) return;

        const checkInterval = setInterval(() => {
            const $ = window.$;
            if ($ && typeof $.fn.select2 === 'function' && periodoRef.current && resetRef.current) {
                clearInterval(checkInterval);

                const options = {
                    width: '100%',
                    dropdownParent: $(periodoRef.current).parent(),
                    placeholder: 'Selecciona...',
                    language: { noResults: () => "Sin resultados" }
                };

                $(periodoRef.current).select2({ ...options, minimumResultsForSearch: -1 }).on('change', (e) => {
                    handleFormChange({ target: { name: 'periodo', value: e.target.value } });
                });
                $(resetRef.current).select2({ ...options, minimumResultsForSearch: -1 }).on('change', (e) => {
                    handleFormChange({ target: { name: 'meses_reset', value: e.target.value } });
                });

                // Sync initial values
                $(periodoRef.current).val(form.periodo).trigger('change.select2');
                $(resetRef.current).val(form.meses_reset).trigger('change.select2');
            }
        }, 100);

        return () => {
            clearInterval(checkInterval);
            const $ = window.$;
            if ($ && typeof $.fn.select2 === 'function') {
                if (periodoRef.current) $(periodoRef.current).select2('destroy');
                if (resetRef.current) $(resetRef.current).select2('destroy');
            }
        };
    }, [modalOpen]);

    // React state -> Select2 sync
    useEffect(() => {
        if ($ && $(periodoRef.current).data('select2') && $(periodoRef.current).val() !== form.periodo) $(periodoRef.current).val(form.periodo).trigger('change.select2');
        if ($ && $(resetRef.current).data('select2') && $(resetRef.current).val() !== String(form.meses_reset)) $(resetRef.current).val(form.meses_reset).trigger('change.select2');
    }, [form.periodo, form.meses_reset, modalOpen]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/suscripciones', { headers: { Accept: 'application/json' } });
            setSuscripciones(res.data.suscripciones || []);
            setCentros(res.data.centros || []);
            setTiposCredito(res.data.tipos_credito || []);
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
            precio: s.precio || '',
            periodo: s.periodo || 'semanal',
            limite_acumulacion: s.limite_acumulacion || 0,
            meses_reset: s.meses_reset ?? 1,
            domiciliacion: !!s.domiciliacion,
            creditos: s.creditos && s.creditos.length > 0 ? s.creditos.map(c => ({
                tipo_credito_id: c.tipo_credito_id,
                cantidad: c.cantidad,
                dias_caducidad: c.dias_caducidad
            })) : [{ tipo_credito_id: '', cantidad: 1, dias_caducidad: 30 }],
        });
        setFormErrors({});
        setModalOpen(true);
    };

    const closeModal = () => { setModalOpen(false); };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;

        if (name === 'precio') {
            newValue = value.replace(/[^0-9.]/g, '');
        } else if (name === 'limite_acumulacion') {
            newValue = value.replace(/[^0-9]/g, '');
        }

        setForm(prev => ({ ...prev, [name]: newValue }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleCreditoChange = (index, field, value) => {
        let newValue = value;
        if (field === 'cantidad' || field === 'dias_caducidad') {
            newValue = value.replace(/[^0-9]/g, '');
        }
        const updatedCreditos = [...form.creditos];
        updatedCreditos[index][field] = newValue;
        setForm(prev => ({ ...prev, creditos: updatedCreditos }));
    };

    const addCreditoRow = () => {
        setForm(prev => ({ ...prev, creditos: [...prev.creditos, { tipo_credito_id: '', cantidad: 1, dias_caducidad: 30 }] }));
    };

    const removeCreditoRow = (index) => {
        if (form.creditos.length === 1) return;
        setForm(prev => ({ ...prev, creditos: prev.creditos.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
        if (!form.precio) errs.precio = 'El precio es obligatorio.';
        
        let hasCreditoErrors = false;
        form.creditos.forEach((c, idx) => {
            if (!c.tipo_credito_id || !c.cantidad) {
                hasCreditoErrors = true;
            }
        });
        if (hasCreditoErrors) {
            errs.creditos = 'Rellena todos los campos de los beneficios de crédito.';
        }

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
                setAlert({ show: true, title: 'Error', message: 'No se pudo guardar la suscripción.', isError: true });
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`/suscripciones/${deleteId}`);
            setAlert({ show: true, title: '¡Éxito!', message: 'Suscripción eliminada correctamente.', isError: false });
            fetchData();
        } catch {
            setAlert({ show: true, title: 'Error', message: 'No se pudo eliminar la suscripción.', isError: true });
        } finally {
            setDeleteId(null);
            setShowDeleteModal(false);
        }
    };

    const filtered = suscripciones.filter(s => {
        const q = search.toLowerCase();
        return !q || s.nombre?.toLowerCase().includes(q);
    });

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
                <PageHeader 
                    title="Suscripciones"
                    subtitle="Gestión de bonos y paquetes de créditos"
                    icon="fa-solid fa-ticket-alt"
                    onMenuClick={() => setIsSidebarOpen(true)}
                    actions={
                        <>
                            <div className="relative flex-1 w-full" style={{ maxWidth: '400px' }}>
                                <div className="absolute inset-y-0 left-0 pl-[15px] flex items-center pointer-events-none">
                                    <i className="fa-solid fa-magnifying-glass text-[#9CA3AF]"></i>
                                </div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por nombre..."
                                    className="w-full pl-[45px] pr-4 h-[45px] bg-white border outline-none transition-colors text-sm text-slate-700 font-medium placeholder:text-slate-400"
                                    style={{ borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none', transition: 'border-color 0.2s' }}
                                    onFocus={(e) => e.target.style.borderColor = '#4BB7AE'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>
                            <button 
                                onClick={openCreate}
                                className="h-[45px] px-6 flex items-center justify-center gap-2 whitespace-nowrap bg-[#38C1A3] hover:bg-teal-500 text-white font-black rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all"
                            >
                                <i className="fas fa-plus pointer-events-none"></i> <span className="pointer-events-none whitespace-nowrap">Añadir Suscripción</span>
                            </button>
                        </>
                    }
                />

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
                            <>
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left facto-table">
                                        <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4">Nombre</th>
                                                <th className="px-6 py-4 text-center">Precio</th>
                                                <th className="px-6 py-4 text-center">Créditos / Periodo</th>
                                                <th className="px-6 py-4 text-center">Límite</th>
                                                <th className="px-6 py-4 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filtered.map(s => (
                                                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-800 text-sm" data-label="Nombre">
                                                        <div className="flex items-center gap-2">
                                                            {s.nombre}
                                                            {s.domiciliacion ? (
                                                                <span title="Domiciliación Bancaria" className="text-blue-500 hover:scale-110 transition-transform cursor-help">
                                                                    <i className="fa-solid fa-building-columns text-[10px]"></i>
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-black text-slate-800 text-sm">
                                                        {Number(s.precio || 0).toFixed(2)} €
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-700" data-label="Créditos">
                                                        <div className="flex flex-col gap-1">
                                                            {s.creditos && s.creditos.map((c, idx) => {
                                                                const tipo = tiposCredito.find(t => t.id == c.tipo_credito_id);
                                                                return (
                                                                    <span key={idx} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs w-max">
                                                                        {c.cantidad}x {tipo ? tipo.nombre : 'Crédito'} ({c.dias_caducidad > 0 ? c.dias_caducidad + ' días' : 'Sin cad.'})
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
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
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View */}
                                <div className="md:hidden divide-y divide-slate-100">
                                    {filtered.map(s => (
                                        <div key={s.id} className="p-5">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black text-slate-800 text-base truncate">{s.nombre}</p>
                                                        {s.domiciliacion && <i className="fa-solid fa-building-columns text-blue-500 text-xs"></i>}
                                                    </div>
                                                    <p className="text-lg font-black text-[#38C1A3] mt-1">{Number(s.precio || 0).toFixed(2)} €</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEdit(s)} className="w-10 h-10 bg-teal-50 text-[#38C1A3] rounded-xl flex items-center justify-center border border-teal-100">
                                                        <i className="fas fa-pencil-alt"></i>
                                                    </button>
                                                    <button onClick={() => handleDelete(s.id)} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center border border-rose-100">
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficios de Crédito</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {s.creditos && s.creditos.map((c, idx) => {
                                                        const tipo = tiposCredito.find(t => t.id == c.tipo_credito_id);
                                                        return (
                                                            <div key={idx} className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl flex flex-col">
                                                                <span className="font-black text-slate-700 text-xs">{c.cantidad}x {tipo ? tipo.nombre : 'Crédito'}</span>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{c.dias_caducidad > 0 ? c.dias_caducidad + ' días' : 'Sin caducidad'}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {s.limite_acumulacion > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                                                    <i className="fa-solid fa-layer-group text-slate-300 text-xs"></i>
                                                    <p className="text-[10px] font-bold text-slate-500">Límite de acumulación: <span className="text-slate-800">{s.limite_acumulacion}</span></p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
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
                        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
                            <div className="px-8 py-7 space-y-7 overflow-y-auto flex-1 custom-scrollbar">
                                
                                {/* Información General */}
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-[#38C1A3] flex items-center gap-2 mb-4">
                                        <i className="fas fa-info-circle"></i> Información General
                                    </p>
                                    
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Nombre */}
                                            <div className="space-y-1.5 flex-1">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Nombre de la Suscripción</label>
                                                <input type="text" name="nombre" value={form.nombre} onChange={handleFormChange}
                                                    placeholder="Ej: Bono Mensual EP"
                                                    className={`w-full bg-slate-50 border ${formErrors.nombre ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-[#38C1A3]'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all focus:bg-white`} />
                                                {formErrors.nombre && <p className="text-[10px] text-rose-500 font-bold pl-1">{formErrors.nombre}</p>}
                                            </div>

                                            {/* Precio */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Precio (€)</label>
                                                <input type="number" step="0.01" name="precio" value={form.precio} onChange={handleFormChange}
                                                    placeholder="0.00"
                                                    className={`w-full bg-slate-50 border ${formErrors.precio ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-[#38C1A3]'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all focus:bg-white`} />
                                                {formErrors.precio && <p className="text-[10px] text-rose-500 font-bold pl-1">{formErrors.precio}</p>}
                                            </div>

                                            {/* Periodo de Facturación */}
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Frecuencia de Facturación y Entrega</label>
                                                <select ref={periodoRef} name="periodo" value={form.periodo} onChange={handleFormChange}
                                                    className="w-full bg-white select2-ignore border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all focus:border-[#38C1A3]">
                                                    <option value="semanal">Semanal</option>
                                                    <option value="mensual">Mensual</option>
                                                </select>
                                            </div>

                                            {/* Domiciliación Bancaria */}
                                            <div className="md:col-span-2 pt-2">
                                                <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-white hover:border-blue-200 transition-all group">
                                                    <div className="relative flex items-center">
                                                        <input 
                                                            type="checkbox" 
                                                            name="domiciliacion" 
                                                            checked={form.domiciliacion} 
                                                            onChange={handleFormChange}
                                                            className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white checked:bg-blue-500 checked:border-blue-500 transition-all"
                                                        />
                                                        <i className="fa-solid fa-check absolute opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs pointer-events-none"></i>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors">Domiciliación Bancaria</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Habilitar cobro automático por remesa bancaria</span>
                                                    </div>
                                                    <div className="ml-auto text-blue-100 group-hover:text-blue-500 transition-colors">
                                                        <i className="fa-solid fa-building-columns text-xl"></i>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Beneficios de la Suscripción */}
                                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-[#38C1A3] flex items-center gap-2 m-0">
                                            <i className="fas fa-coins"></i> Beneficios de Crédito
                                        </p>
                                        <button type="button" onClick={addCreditoRow} className="text-[10px] font-black uppercase tracking-widest text-[#38C1A3] hover:text-teal-600 px-3 py-1.5 bg-teal-50 rounded-lg transition-colors">
                                            <i className="fas fa-plus"></i> Añadir Crédito
                                        </button>
                                    </div>
                                    
                                    {formErrors.creditos && <p className="text-[10px] text-rose-500 font-bold mb-2">{formErrors.creditos}</p>}

                                    <div className="space-y-3">
                                        {form.creditos.map((c, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative">
                                                <div className="flex-1 w-full space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Crédito</label>
                                                    <select value={c.tipo_credito_id} onChange={(e) => handleCreditoChange(idx, 'tipo_credito_id', e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none transition-all focus:border-[#38C1A3]">
                                                        <option value="">Selecciona crédito...</option>
                                                        {tiposCredito.map(t => (
                                                            <option key={t.id} value={t.id}>{t.nombre}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-full sm:w-24 space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Cantidad</label>
                                                    <input type="number" min="1" value={c.cantidad} onChange={(e) => handleCreditoChange(idx, 'cantidad', e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none transition-all focus:border-[#38C1A3]" />
                                                </div>
                                                <div className="w-full sm:w-32 space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Días Caducidad</label>
                                                    <input type="number" min="0" value={c.dias_caducidad} onChange={(e) => handleCreditoChange(idx, 'dias_caducidad', e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none transition-all focus:border-[#38C1A3]" />
                                                </div>
                                                {form.creditos.length > 1 && (
                                                    <button type="button" onClick={() => removeCreditoRow(idx)} className="mt-4 sm:mt-0 w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                                        <i className="fas fa-trash text-xs"></i>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Ahorro y Caducidad General */}
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                                        <i className="fas fa-clock-rotate-left text-[#38C1A3]"></i> Ahorro y Caducidad
                                    </p>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Límite Acumulación</label>
                                            <input type="number" name="limite_acumulacion" value={form.limite_acumulacion} onChange={handleFormChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all focus:border-[#38C1A3] focus:bg-white" />
                                            <p className="text-[10px] text-slate-400 font-medium pl-1">0 = sin límite de crédito acumulable</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Reinicio Forzado</label>
                                            <select ref={resetRef} name="meses_reset" value={form.meses_reset} onChange={handleFormChange}
                                                className="w-full bg-slate-50 select2-ignore border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all focus:border-[#38C1A3] focus:bg-white">
                                                {METROS_RESET.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Modal Footer */}
                            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    className="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="px-8 py-3 bg-[#38C1A3] hover:bg-teal-500 text-white font-black rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 min-w-[180px] justify-center"
                                >
                                    {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                                    {saving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Suscripción'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)} 
                onConfirm={confirmDelete}
                title="Eliminar Suscripción"
                message="¿Estás seguro de que deseas eliminar esta suscripción? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                isDestructive={true}
            />

            <AlertModal 
                isOpen={alert.show} 
                onClose={() => setAlert({ ...alert, show: false })} 
                title={alert.title} 
                message={alert.message} 
                isError={alert.isError} 
            />
        </div>
    );
}
