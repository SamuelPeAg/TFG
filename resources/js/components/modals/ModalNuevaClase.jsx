import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function ModalNuevaClase({ initialDate, centros, defaultCentro, onClose, onRefresh }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        centro: defaultCentro || '',
        nombre_clase: '',
        tipo_clase: 'EP',
        fecha_hora: initialDate ? new Date(initialDate.getTime() - (initialDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '',
        trainers: [],
        precio_base: 0,
    });

    const [selectedClients, setSelectedClients] = useState([]);
    const [participants, setParticipants] = useState([]); // Array of {user_id, precio, metodo_pago}

    // Helper Data
    const [allUsers, setAllUsers] = useState([]);
    const [allTrainers, setAllTrainers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        axios.get('/calendario', { headers: { 'Accept': 'application/json' } }).then(res => {
            setAllUsers(res.data.users || []);
            setAllTrainers(res.data.entrenadores || []);
        });
    }, []);

    const getMaxClients = (tipo) => {
        if (tipo === 'EP') return 1;
        if (tipo === 'DUO') return 2;
        if (tipo === 'TRIO') return 3;
        if (tipo === 'GRUPO' || tipo === 'GRUPO_PRIVADO') return 6;
        return 100;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'tipo_clase') {
            const max = getMaxClients(value);
            if (selectedClients.length > max) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Límite excedido',
                    text: `El tipo de clase ${value} solo admite ${max} alumnos. Se eliminarán los sobrantes.`,
                    confirmButtonColor: '#3085d6',
                });
                setSelectedClients(prev => prev.slice(0, max));
            }
        }
        if (name === 'precio_base' && value < 0) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTrainerToggle = (id) => {
        setFormData(prev => {
            const exists = prev.trainers.includes(id);
            if (exists) return { ...prev, trainers: prev.trainers.filter(tid => tid !== id) };
            return { ...prev, trainers: [...prev.trainers, id] };
        });
    };

    const handleSearchChange = (e) => {
        const q = e.target.value;
        setSearchTerm(q);
        if (q.length < 1) {
            setSuggestions([]);
            return;
        }
        const alreadyIds = new Set(selectedClients.map(u => u.id));
        const filtered = allUsers.filter(u =>
            u.name.toLowerCase().includes(q.toLowerCase()) && !alreadyIds.has(u.id)
        ).slice(0, 10);
        setSuggestions(filtered);
    };

    const addClient = (u) => {
        const max = getMaxClients(formData.tipo_clase);
        if (selectedClients.length >= max) {
            if (max === 1) {
                setSelectedClients([u]);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Límite alcanzado',
                    text: `El límite para ${formData.tipo_clase} es de ${max} alumnos.`,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                return;
            }
        } else {
            setSelectedClients(prev => [...prev, u]);
        }
        setSearchTerm('');
        setSuggestions([]);
    };

    const removeClient = (id) => {
        setSelectedClients(prev => prev.filter(u => u.id !== id));
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!formData.centro || !formData.nombre_clase) {
                Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor, selecciona un centro y el nombre de la clase.' });
                return;
            }
        }
        if (currentStep === 2) {
            if (selectedClients.length === 0) {
                Swal.fire({ icon: 'warning', title: 'Sin participantes', text: 'Selecciona al menos un alumno para la sesión.' });
                return;
            }
            if (formData.precio_base === '' || Number(formData.precio_base) < 0) {
                Swal.fire({ icon: 'warning', title: 'Precio inválido', text: 'Ingresa un precio base válido.' });
                return;
            }
            
            // Prepare participants for step 3
            setParticipants(selectedClients.map(u => ({
                user_id: u.id,
                nombre: u.name,
                precio: formData.precio_base,
                metodo_pago: 'TPV'
            })));
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevStep = () => setCurrentStep(prev => prev - 1);

    const handleParticipantChange = (idx, field, value) => {
        if (field === 'precio' && value < 0) return; // Prevent negative prices
        setParticipants(prev => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: value };
            return copy;
        });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (currentStep < 3) return; // Prevent submission by Enter key in earlier steps
        setLoading(true);
        try {
            const payload = {
                centro: formData.centro,
                nombre_clase: formData.nombre_clase,
                tipo_clase: formData.tipo_clase,
                fecha_hora: formData.fecha_hora,
                trainers: formData.trainers,
                participants: participants.map(({ user_id, precio, metodo_pago }) => ({
                    user_id: Number(user_id),
                    precio: Number(precio),
                    metodo_pago: metodo_pago
                }))
            };
            const res = await axios.post('/Pagos', payload);
            if (res.data.success) {
                Swal.fire({ 
                    icon: 'success', 
                    title: '¡Clase Guardada!', 
                    text: 'La sesión se ha registrado correctamente.',
                    confirmButtonColor: '#39c5a7'
                }).then(() => {
                    onRefresh();
                    onClose();
                });
            }
        } catch (error) {
            let errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al guardar la clase';
            if (error.response?.data?.errors) {
                errorMsg = Object.values(error.response.data.errors).flat().join('\n');
            }
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: errorMsg,
                confirmButtonColor: '#eb567a',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box modal-expanded" style={{ maxWidth: '1000px', height: '85vh', padding: 0, display: 'flex', flexDirection: 'row', overflow: 'hidden', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                
                {/* SIDEBAR */}
                <div className="wizard-sidebar" style={{ width: '280px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '32px 24px' }}>
                    <div className="sidebar-header" style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ padding: '8px', background: 'linear-gradient(135deg, #39c5a7, #eb567a)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(57, 197, 167, 0.2)' }}>
                            <img src="/img/logopng.png" alt="Logo" style={{ width: '24px', height: '24px' }} />
                        </div>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '18px', letterSpacing: '-0.5px' }}>FACTOMOVE</span>
                    </div>

                    <div className="wizard-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[1, 2, 3].map(step => (
                            <div key={step} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '16px', 
                                padding: '12px 16px', 
                                borderRadius: '14px',
                                transition: 'all 0.3s ease',
                                background: currentStep === step ? 'rgba(57, 197, 167, 0.08)' : 'transparent',
                                border: currentStep === step ? '1px solid rgba(57, 197, 167, 0.2)' : '1px solid transparent'
                            }}>
                                <div className="nav-step-icon" style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '14px', position: 'relative', flexShrink: 0,
                                    background: currentStep === step ? 'linear-gradient(135deg, #39c5a7, #eb567a)' : (currentStep > step ? '#39c5a7' : '#fff'),
                                    color: (currentStep === step || currentStep > step) ? '#fff' : '#94a3b8',
                                    border: currentStep === step ? 'none' : (currentStep > step ? 'none' : '2px solid #e2e8f0'),
                                    boxShadow: currentStep === step ? '0 4px 12px rgba(57, 197, 167, 0.3)' : 'none',
                                    transition: 'all 0.4s ease'
                                }}>
                                    {currentStep > step ? (
                                        <i className="fa-solid fa-check" style={{ fontSize: '14px' }}></i>
                                    ) : step}
                                </div>
                                <div className="nav-step-info" style={{ overflow: 'hidden' }}>
                                    <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: currentStep === step ? '#0f172a' : (currentStep > step ? '#334155' : '#94a3b8'), transition: 'color 0.3s', whiteSpace: 'nowrap' }}>
                                        {step === 1 ? 'Configuración' : step === 2 ? 'Planificación' : 'Facturación'}
                                    </span>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: currentStep === step ? '#64748b' : '#cbd5e1', transition: 'color 0.3s', whiteSpace: 'nowrap' }}>
                                        {step === 1 ? 'Centro y Personal' : step === 2 ? 'Horario y Alumnos' : 'Detalles de cobro'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
                        <p>© {new Date().getFullYear()} Factomove</p>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="wizard-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', position: 'relative' }}>
                    <button type="button" className="close-icon" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, color: '#64748b', background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>

                    <div className="wizard-header" style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', textAlign: 'left', background: 'white' }}>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>Agendar Nueva Clase</h2>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Completa los detalles para crear una sesión.</p>
                    </div>

                    <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && currentStep < 3) e.preventDefault(); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div className="wizard-body" style={{ flex: 1, overflowY: 'auto', padding: '32px', textAlign: 'left' }}>
                            
                            {/* STEP 1 */}
                            {currentStep === 1 && (
                                <div className="wizard-step">
                                    <div className="form-section-title" style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>DETALLES GENERALES</div>
                                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="input-group-clean">
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Centro Deportivo</label>
                                            <select name="centro" value={formData.centro} onChange={handleInputChange} className="input-clean" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <option value="" disabled>Selecciona centro...</option>
                                                {centros.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="input-group-clean">
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Nombre de la Clase</label>
                                            <input 
                                                type="text" 
                                                name="nombre_clase" 
                                                value={formData.nombre_clase} 
                                                onChange={handleInputChange} 
                                                className="input-clean" 
                                                placeholder="Ej. Pilates Reformer" 
                                                required 
                                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', transition: 'all 0.2s', fontSize: '14px' }} 
                                                onFocus={(e) => { e.target.style.borderColor = '#39c5a7'; e.target.style.boxShadow = '0 0 0 3px rgba(57, 197, 167, 0.1)'; }}
                                                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Tipo de Sesión</label>
                                        <select name="tipo_clase" value={formData.tipo_clase} onChange={handleInputChange} className="input-clean" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <option value="EP">EP (Individual)</option>
                                            <option value="DUO">DUO</option>
                                            <option value="TRIO">TRIO</option>
                                            <option value="GRUPO_PRIVADO">GRUPO PRIVADO</option>
                                            <option value="GRUPO">GRUPO</option>
                                        </select>
                                    </div>

                                    <div style={{ marginTop: '32px' }}>
                                        <div className="form-section-title" style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>EQUIPO TÉCNICO</div>
                                        <div className="trainers-grid-clean" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                                            {allTrainers.map(coach => (
                                                <label key={coach.id} className="trainer-card-clean" style={{ cursor: 'pointer', position: 'relative' }}>
                                                    <input type="checkbox" checked={formData.trainers.includes(coach.id)} onChange={() => handleTrainerToggle(coach.id)} style={{ position: 'absolute', opacity: 0 }} />
                                                    <div className="t-card-content" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: formData.trainers.includes(coach.id) ? '#f0fdfa' : 'white', borderColor: formData.trainers.includes(coach.id) ? '#39c5a7' : '#e2e8f0' }}>
                                                        <div className="t-avatar" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #39c5a7, #eb567a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '13px', overflow: 'hidden' }}>
                                                            {coach.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="t-info" style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span className="t-name" style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{coach.name}</span>
                                                            <span className="t-role" style={{ fontSize: '11px', color: '#94a3b8' }}>Entrenador</span>
                                                        </div>
                                                        {formData.trainers.includes(coach.id) && <div style={{ marginLeft: 'auto', color: '#39c5a7' }}><i className="fa-solid fa-circle-check"></i></div>}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2 */}
                            {currentStep === 2 && (
                                <div className="wizard-step">
                                    <div className="form-section-title" style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>AGENDA Y PRECIOS</div>
                                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="input-group-clean">
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Fecha y Hora</label>
                                            <input 
                                                type="datetime-local" 
                                                name="fecha_hora" 
                                                value={formData.fecha_hora} 
                                                onChange={handleInputChange} 
                                                className="input-clean" 
                                                required 
                                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} 
                                            />
                                        </div>
                                        <div className="input-group-clean">
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Precio Base por Persona (€)</label>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                min="0"
                                                name="precio_base" 
                                                value={formData.precio_base} 
                                                onChange={handleInputChange} 
                                                className="input-clean" 
                                                placeholder="0.00" 
                                                required 
                                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }} 
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '40px' }}>
                                        <div className="form-section-title" style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>
                                            PARTICIPANTES {selectedClients.length > 0 && `(${selectedClients.length})`}
                                        </div>
                                        
                                        <div style={{ position: 'relative', marginBottom: '24px' }}>
                                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', zIndex: 1, display: 'flex', alignItems: 'center' }}>
                                                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '16px' }}></i>
                                            </div>
                                            <input 
                                                type="text" 
                                                value={searchTerm} 
                                                onChange={handleSearchChange} 
                                                className="input-clean-search" 
                                                style={{ paddingLeft: '48px', width: '100%', padding: '14px 14px 14px 48px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', transition: 'all 0.2s', fontSize: '14px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} 
                                                placeholder="Buscar alumno por nombre..." 
                                                autoComplete="off" 
                                                onFocus={(e) => { e.target.style.borderColor = '#39c5a7'; e.target.style.boxShadow = '0 0 0 4px rgba(57, 197, 167, 0.1)'; e.target.style.background = '#fff'; }}
                                                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                                            />
                                            {suggestions.length > 0 && (
                                                <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', maxHeight: '200px', overflowY: 'auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 50, marginTop: '4px' }}>
                                                    {suggestions.map(u => (
                                                        <div key={u.id} onClick={() => addClient(u)} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '24px', height: '24px', background: '#e2e8f0', borderRadius: '50%', color: '#64748b', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{u.name.charAt(0)}</div>
                                                            {u.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="participants-grid-clean" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                            {selectedClients.length > 0 ? selectedClients.map(u => (
                                                <div key={u.id} className="client-chip" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '30px' }}>
                                                    <div style={{ width: '28px', height: '28px', fontSize: '12px', background: 'linear-gradient(135deg, #39c5a7, #eb567a)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{u.name.charAt(0)}</div>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155', flex: 1 }}>{u.name}</span>
                                                    <button type="button" onClick={() => removeClient(u.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                                                </div>
                                            )) : (
                                                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#cbd5e1', padding: '40px', border: '2px dashed #f1f5f9', borderRadius: '12px' }}>
                                                    <i className="fa-solid fa-users-slash" style={{ fontSize: '24px', marginBottom: '8px' }}></i>
                                                    <p>Busca y selecciona alumnos</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3 */}
                            {currentStep === 3 && (
                                <div className="wizard-step">
                                    <div className="form-section-title" style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>DETALLES DE PAGO INDIVIDUAL</div>
                                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Revisa los importes y métodos de pago para cada asistente.</p>
                                    
                                    <div className="payments-table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                        <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', background: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                            <span>Alumno</span>
                                            <span>Precio (€)</span>
                                            <span>Método</span>
                                        </div>
                                        <div className="table-body">
                                            {participants.map((p, idx) => (
                                                <div key={idx} className="payment-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #39c5a7, #eb567a)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{p.nombre.charAt(0)}</div>
                                                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{p.nombre}</div>
                                                    </div>
                                                    <input type="number" step="0.01" min="0" value={p.precio} onChange={(e) => handleParticipantChange(idx, 'precio', e.target.value)} className="input-clean" style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', textAlign: 'right' }} />
                                                    <select value={p.metodo_pago} onChange={(e) => handleParticipantChange(idx, 'metodo_pago', e.target.value)} className="input-clean" style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', cursor: 'pointer' }}>
                                                        <option value="TPV">TPV</option>
                                                        <option value="EF">Efectivo</option>
                                                        <option value="DD">Domiciliación</option>
                                                        <option value="CC">Cuenta</option>
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* FOOTER ACTIONS */}
                        <div className="wizard-footer" style={{ flexShrink: 0, padding: '20px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                            {currentStep > 1 && (
                                <button type="button" onClick={handlePrevStep} style={{ background: 'transparent', color: '#64748b', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                                    <i className="fa-solid fa-arrow-left"></i> Anterior
                                </button>
                            )}
                            
                            <div style={{ marginLeft: 'auto' }}>
                                {currentStep < 3 ? (
                                    <button type="button" onClick={handleNextStep} style={{ background: '#0f172a', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Siguiente <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                ) : (
                                    <button type="submit" disabled={loading} style={{ background: 'linear-gradient(90deg, #39c5a7 0%, #eb567a 100%)', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(235, 86, 122, 0.2)' }}>
                                        {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>} CONFIRMAR Y GUARDAR
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
