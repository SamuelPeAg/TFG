import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from './Button';

// 1. Modal Generar
export function GenerarNomiModal({ isOpen, onClose, onSuccess, currentYear, currentMonth }) {
    const [formData, setFormData] = useState({
        mes: currentMonth.toString(),
        anio: currentYear.toString(),
        fecha_inicio: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
        fecha_fin: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    // Update form dates when mes or anio change
    useEffect(() => {
        const y = parseInt(formData.anio);
        const m = parseInt(formData.mes);
        const lastDay = new Date(y, m, 0).getDate();
        setFormData(prev => ({
            ...prev,
            fecha_inicio: `${y}-${String(m).padStart(2,'0')}-01`,
            fecha_fin: `${y}-${String(m).padStart(2,'0')}-${lastDay}`,
        }));
    }, [formData.mes, formData.anio]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/admin/nominas/generar', formData, {
                headers: { Accept: 'application/json' }
            });
            onSuccess(res.data.message || 'Nóminas generadas correctamente');
            onClose();
        } catch (error) {
            alert('Error generando nóminas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-2000 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                    <i className="fas fa-times"></i>
                </button>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-teal-50 text-[#38C1A3] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
                        <i className="fas fa-calendar-alt"></i>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cálculo de Nóminas</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Selecciona el rango de sesiones a procesar</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mes</label>
                            <select name="mes" value={formData.mes} onChange={handleChange} className="w-full text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:border-[#38C1A3] focus:ring-1 focus:ring-[#38C1A3] outline-none">
                                {[
                                    {v:'1',n:'Enero'}, {v:'2',n:'Febrero'}, {v:'3',n:'Marzo'}, {v:'4',n:'Abril'},
                                    {v:'5',n:'Mayo'}, {v:'6',n:'Junio'}, {v:'7',n:'Julio'}, {v:'8',n:'Agosto'},
                                    {v:'9',n:'Septiembre'}, {v:'10',n:'Octubre'}, {v:'11',n:'Noviembre'}, {v:'12',n:'Diciembre'}
                                ].map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Año</label>
                            <select name="anio" value={formData.anio} onChange={handleChange} className="w-full text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:border-[#38C1A3] focus:ring-1 focus:ring-[#38C1A3] outline-none">
                                {[...Array(5)].map((_, i) => <option key={i} value={currentYear - i}>{currentYear - i}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Rango de fechas</h4>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500">Desde el día:</label>
                            <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} 
                                   className="w-full text-sm font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-[#38C1A3] focus:ring-1 outline-none" required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500">Hasta el día:</label>
                            <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} 
                                   className="w-full text-sm font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-[#38C1A3] focus:ring-1 outline-none" required />
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <Button type="submit" variant="primary" disabled={loading} className="w-full py-3 text-sm">
                            {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
                            {loading ? 'Calculando...' : 'Procesar y Generar Borradores'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// 2. Modal Revisar Nómina
export function RevisarNominaModal({ isOpen, onClose, nomina, onSuccess }) {
    if (!isOpen || !nomina) return null;

    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [detalles, setDetalles] = useState({
        horas_trabajadas: nomina.detalles?.horas_trabajadas || 0,
        salario_bruto: nomina.detalles?.salario_bruto || 0,
        irpf: nomina.detalles?.irpf || 0,
    });
    const [extras, setExtras] = useState( nomina.detalles?.extras || [] );

    const sstPorcentaje = nomina.detalles?.porcentajes?.ss_trab ? parseFloat(nomina.detalles.porcentajes.ss_trab) / 100 : 0.0635;
    const ssePorcentaje = nomina.detalles?.porcentajes?.ss_emp ? parseFloat(nomina.detalles.porcentajes.ss_emp) / 100 : 0.3140;

    const calculateTotals = () => {
        const brutoBase = parseFloat(detalles.salario_bruto) || 0;
        const totalExtras = extras.reduce((acc, curr) => acc + (parseFloat(curr.importe) || 0), 0);
        const brutoTotal = brutoBase + totalExtras;
        
        const ss_trabajador = brutoBase * sstPorcentaje; // Extras usually aren't taxed by SS here if they are generic, but if they are, modify this logic
        const irpf = brutoTotal * (parseFloat(detalles.irpf) / 100 || 0); // Flat percentage or flat amount? Assuming IRPF is a direct flat flat flat amount here.
        // Wait, the blade view uses IRPF as a flat number input for deduction amount: IRPF (0%) input[value]
        // Let's stick to the amount in EUR.
        const irpfAmount = parseFloat(detalles.irpf) || 0;
        
        const neto = brutoTotal - ss_trabajador - irpfAmount;
        const ss_empresa = brutoBase * ssePorcentaje;
        const coste_total = brutoTotal + ss_empresa;

        return {
            brutoTotal,
            ss_trabajador,
            irpfAmount,
            neto,
            ss_empresa,
            coste_total
        };
    };

    const totals = calculateTotals();

    const handleSubmit = async (e, accion) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('accion', accion);
        formData.append('user_id', nomina.user_id);
        formData.append('importe', totals.neto);
        formData.append('salario_bruto', detalles.salario_bruto);
        formData.append('ss_trabajador', totals.ss_trabajador);
        formData.append('irpf', totales.irpfAmount);
        formData.append('ss_empresa', totals.ss_empresa);
        formData.append('coste_total', totals.coste_total);
        formData.append('horas_trabajadas', detalles.horas_trabajadas);

        extras.forEach(ex => {
            formData.append('extra_conceptos[]', ex.concepto);
            formData.append('extra_importes[]', ex.importe);
        });

        if (file) {
            formData.append('archivo', file);
        }

        try {
            const res = await axios.post(`/admin/nominas/${nomina.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' }
            });
            onSuccess(res.data.message || (accion === 'confirmar' ? 'Nómina publicada.' : 'Borrador actualizado.'));
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error al procesar la nómina');
        } finally {
            setLoading(false);
        }
    };

    const addExtra = () => setExtras([...extras, { concepto: '', importe: 0 }]);
    const removeExtra = (idx) => setExtras(extras.filter((_, i) => i !== idx));
    const updateExtra = (idx, field, value) => {
        const newExtras = [...extras];
        newExtras[idx][field] = value;
        setExtras(newExtras);
    };

    const { ss_trabajador, irpfAmount, neto, ss_empresa, coste_total } = totals;

    return (
        <div className="fixed inset-0 z-2000 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10">
                    <i className="fas fa-times"></i>
                </button>
                
                <div className="bg-slate-50 border-b border-slate-100 px-8 py-6 text-center">
                    <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl shadow-sm">
                        <i className="fas fa-calculator"></i>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cálculo Detallado</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">{nomina.user.name} - Periodo: {nomina.mes}/{nomina.anio}</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Base */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Datos Base</h4>
                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Horas Trabajadas</label>
                                <input type="number" step="0.01" value={detalles.horas_trabajadas} onChange={(e) => setDetalles({...detalles, horas_trabajadas: e.target.value})} 
                                       className="w-full text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:border-[#38C1A3] focus:bg-white outline-none" />
                            </div>
                        </div>

                        {/* Economics */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Desglose Económico</h4>
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-xs font-bold text-slate-600">Salario Bruto (€)</label>
                                <input type="number" step="0.01" value={detalles.salario_bruto} onChange={(e) => setDetalles({...detalles, salario_bruto: e.target.value})} 
                                      className="w-32 bg-slate-50 p-2 text-sm rounded-xl border border-slate-200 text-right font-black text-slate-700 outline-none focus:border-[#38C1A3]" />
                            </div>
                            <div className="flex items-center justify-between text-rose-500">
                                <label className="text-[11px] font-bold uppercase">- SS Trab ({(sstPorcentaje*100).toFixed(2)}%)</label>
                                <span className="font-bold text-sm tracking-wide">{ss_trabajador.toFixed(2)} €</span>
                            </div>
                            <div className="flex items-center justify-between text-rose-500">
                                <label className="text-[11px] font-bold uppercase">- Monto IRPF (€)</label>
                                <input type="number" step="0.01" value={detalles.irpf} onChange={(e) => setDetalles({...detalles, irpf: e.target.value})} 
                                      className="w-24 bg-rose-50/50 p-2 text-xs rounded-xl border border-rose-100 text-right font-black outline-none focus:border-rose-300" />
                            </div>
                        </div>
                    </div>

                    {/* Extras */}
                    <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extras y Bonos</h4>
                            <button onClick={addExtra} className="text-[10px] font-black bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors uppercase tracking-wider">
                                <i className="fas fa-plus"></i> Añadir
                            </button>
                        </div>
                        <div className="space-y-3">
                            {extras.map((ex, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <input type="text" placeholder="Concepto (ej. Bono Objetivos)" value={ex.concepto} onChange={(e) => updateExtra(idx, 'concepto', e.target.value)} 
                                           className="flex-1 px-3 py-2 text-sm font-semibold border border-slate-200 rounded-xl bg-white focus:border-[#38C1A3] outline-none" />
                                    <input type="number" step="0.01" value={ex.importe} onChange={(e) => updateExtra(idx, 'importe', e.target.value)} 
                                           className="w-28 px-3 py-2 text-sm font-black text-right border border-slate-200 rounded-xl bg-white focus:border-[#38C1A3] outline-none" />
                                    <button onClick={() => removeExtra(idx)} className="w-10 h-10 shrink-0 flex items-center justify-center bg-white text-rose-400 hover:text-white hover:bg-rose-500 rounded-xl border border-slate-200 transition-colors">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                            {extras.length === 0 && <p className="text-xs text-slate-400 font-medium">No se han añadido conceptos extra.</p>}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 flex flex-col justify-center">
                            <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Salario Neto (A Pagar)</label>
                            <span className="text-4xl font-black text-teal-700 tracking-tighter">{neto.toFixed(2)} €</span>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-2xl text-white flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase mt-1">SS Empresa (31.4%):</span>
                                <span className="font-bold tracking-wide">{ss_empresa.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                                <span className="text-xs font-black text-white uppercase tracking-wider">COSTE TOTAL:</span>
                                <span className="text-xl font-black text-[#38C1A3] tracking-tight">{coste_total.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>

                    {/* PDF Upload */}
                    <div className="mb-8">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Documento PDF (Opcional)</label>
                        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])}
                               className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 border border-dashed border-slate-200 rounded-xl p-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button type="button" onClick={(e) => handleSubmit(e, 'guardar')} disabled={loading} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 text-sm">
                            <i className="fas fa-save mr-2"></i> Solo Guardar
                        </Button>
                        <Button type="button" onClick={(e) => handleSubmit(e, 'confirmar')} variant="primary" disabled={loading} className="py-3 text-sm flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                            <i className="fas fa-check-circle mr-2"></i> Confirmar y Publicar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 3. Modal Detalles (Historial)
export function DetalleNominaModal({ isOpen, onClose, nomina }) {
    if (!isOpen || !nomina) return null;
    const detalles = nomina.detalles || {};
    const extras = detalles.extras || [];

    return (
        <div className="fixed inset-0 z-2000 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                    <i className="fas fa-times"></i>
                </button>
                
                <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-5">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-xl shrink-0">
                        <i className="fas fa-file-invoice"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Detalle de Nómina</h2>
                        <p className="text-slate-500 text-sm font-bold">{nomina.user?.name} · {nomina.mes}/{nomina.anio}</p>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">Salario Bruto Base:</span>
                        <span className="font-black text-slate-800">{Number(detalles.salario_bruto || 0).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm text-amber-600">
                        <span className="font-bold">- SS Trabajador:</span>
                        <span className="font-black">{Number(detalles.ss_trabajador || 0).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm text-amber-600">
                        <span className="font-bold">- IRPF:</span>
                        <span className="font-black">{Number(detalles.irpf || 0).toFixed(2)} €</span>
                    </div>
                    
                    {extras.length > 0 && (
                        <div className="border-t border-slate-200 pt-3 mt-3 space-y-2">
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Extras</div>
                             {extras.map((ex, i) => (
                                 <div key={i} className="flex justify-between text-xs text-sky-600 font-bold">
                                     <span>+ {ex.concepto}:</span>
                                     <span className="font-black">{Number(ex.importe || 0).toFixed(2)} €</span>
                                 </div>
                             ))}
                        </div>
                    )}

                    <div className="border-t border-slate-200 pt-3 mt-3">
                         <div className="flex justify-between items-center text-[#38C1A3]">
                             <span className="text-xs font-black uppercase tracking-wider">Total Neto Abonado:</span>
                             <span className="text-xl font-black">{Number(nomina.importe).toFixed(2)} €</span>
                         </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-2xl p-5 text-white">
                     <div className="flex justify-between text-xs text-slate-400 font-bold mb-1">
                          <span>SS Empresa:</span>
                          <span>{Number(detalles.ss_empresa || 0).toFixed(2)} €</span>
                     </div>
                     <div className="flex justify-between text-sm pt-2 border-t border-slate-700 mt-2">
                          <span className="font-black text-slate-200 uppercase tracking-wider text-[11px] pt-1">Coste Total Empresa:</span>
                          <span className="font-black text-[#38C1A3] text-lg">{Number(detalles.coste_total || 0).toFixed(2)} €</span>
                     </div>
                </div>
            </div>
        </div>
    );
}

// 4. Modal PDF Preview
export function PdfPreviewModal({ isOpen, onClose, nomina }) {
    const [pdfLoading, setPdfLoading] = useState(true);

    if (!isOpen || !nomina) {
        if(pdfLoading === false) setPdfLoading(true);
        return null;
    }

    const previewUrl = `/nominas/${nomina.id}/preview`; // assuming this returns PDF stream
    const downloadUrl = `/nominas/${nomina.id}/download`;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-3000 flex flex-col animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shadow-md z-10 w-full shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-teal-500/20 text-[#38C1A3] w-10 h-10 rounded-xl flex items-center justify-center">
                        <i className="fas fa-file-pdf text-xl"></i>
                    </div>
                    <div>
                        <h3 className="font-black text-lg tracking-tight">Nómina - {nomina.user?.name}</h3>
                        <p className="text-xs font-bold text-slate-400">{nomina.mes}/{nomina.anio}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <a href={downloadUrl} className="flex items-center gap-2 px-4 py-2 bg-[#38C1A3] hover:bg-teal-500 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-teal-500/20">
                        <i className="fas fa-download"></i> <span className="hidden sm:inline">Descargar</span>
                    </a>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>
            
            <div className="flex-1 w-full bg-slate-800 relative flex justify-center p-4 sm:p-8">
                {pdfLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-slate-800/80">
                        <div className="w-12 h-12 border-4 border-slate-600 border-t-[#38C1A3] rounded-full animate-spin"></div>
                        <p className="text-[#38C1A3] font-black text-xs uppercase tracking-widest">Generando Documento...</p>
                    </div>
                )}
                <iframe 
                    src={previewUrl} 
                    className="w-full max-w-5xl h-full bg-white rounded-xl shadow-2xl overflow-hidden border-0"
                    onLoad={() => setPdfLoading(false)}
                ></iframe>
            </div>
        </div>
    );
}
