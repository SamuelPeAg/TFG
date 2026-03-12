import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function ModalDetalleEvento({ event, onClose, onRefresh }) {
    const p = event.extendedProps;
    const sessionKey = p.session_key;
    const userInfo = window.FactomoveUser;
    const isAdmin = userInfo?.roles?.some(r => r.name === 'admin');
    const isTrainer = userInfo?.roles?.some(r => r.name === 'entrenador');
    const currentUserId = userInfo?.id;

    const [trainers, setTrainers] = useState(p.entrenadores || []);
    const [alumnos, setAlumnos] = useState(p.alumnos || []);
    const [allTrainers, setAllTrainers] = useState([]);
    const [selectedTrainerToAdd, setSelectedTrainerToAdd] = useState('');
    const [loading, setLoading] = useState(false);

    // Filter center/users list for adding (simplified for now as inline search)
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        fetchData();
        if (isAdmin) {
            axios.get('/calendario', { headers: { 'Accept': 'application/json' } }).then(res => {
                setAllUsers(res.data.users || []);
                setAllTrainers(res.data.entrenadores || []);
            });
        }
    }, []);

    const fetchData = () => {
        setTrainers(p.entrenadores || []);
        setAlumnos(p.alumnos || []);
    };

    const handleAddTrainer = async () => {
        if (!selectedTrainerToAdd) return;
        setLoading(true);
        try {
            const res = await axios.post('/Pagos/add-trainer', {
                trainer_id: selectedTrainerToAdd,
                ...sessionKey
            });
            if (res.data.success) {
                setTrainers(res.data.trainers);
                setSelectedTrainerToAdd('');
                onRefresh();
                Swal.fire({ icon: 'success', title: 'Añadido', text: 'Entrenador asignado correctamente.', timer: 1500, showConfirmButton: false });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo añadir al entrenador.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveTrainer = async (trainerId) => {
        const result = await Swal.fire({
            title: '¿Quitar entrenador?',
            text: "¿Estás seguro de quitar a este entrenador de la sesión?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, quitar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const res = await axios.post('/Pagos/remove-trainer', {
                trainer_id: trainerId,
                ...sessionKey
            });
            if (res.data.success) {
                setTrainers(res.data.trainers);
                onRefresh();
                Swal.fire({ icon: 'success', title: 'Quitado', text: 'Entrenador retirado correctamente.', timer: 1500, showConfirmButton: false });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo quitar al entrenador.' });
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSession = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/Pagos/add-trainer', {
                trainer_id: currentUserId,
                ...sessionKey
            });
            if (res.data.success) {
                setTrainers(res.data.trainers);
                onRefresh();
                Swal.fire({ icon: 'success', title: '¡Inscrito!', text: 'Te has unido a la sesión correctamente.', timer: 1500, showConfirmButton: false });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveClient = async (userId) => {
        const result = await Swal.fire({
            title: '¿Eliminar alumno?',
            text: "¿Estás seguro de eliminar a este alumno de la clase?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const res = await axios.post('/Pagos/remove-client', {
                user_id: userId,
                ...sessionKey
            });
            if (res.data.success) {
                setAlumnos(prev => prev.filter(a => a.id !== userId));
                onRefresh();
                Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Alumno eliminado de la sesión.', timer: 1500, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar al alumno.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFullSession = async () => {
        const result = await Swal.fire({
            title: '¿ELIMINAR SESIÓN COMPLETA?',
            text: "Esta acción borrará la sesión y todos sus pagos asociados. ¡No se puede deshacer!",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'SÍ, ELIMINAR TODO',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const res = await axios.post('/Pagos/delete-session', { ...sessionKey });
            if (res.data.success) {
                onClose();
                onRefresh();
                Swal.fire({ icon: 'success', title: 'Sesión eliminada', text: 'Se han borrado todos los registros de esta sesión.' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la sesión.' });
        } finally {
            setLoading(false);
        }
    };

    const fechaObj = event.start;
    const diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
    const diaNum = fechaObj.getDate();
    const mes = fechaObj.toLocaleDateString('es-ES', { month: 'long' });

    return (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box modal-expanded" style={{ maxWidth: '850px', padding: 0, overflow: 'hidden' }}>
                <button type="button" className="close-icon" onClick={onClose} style={{ color: 'white', zIndex: 10 }}>&times;</button>
                
                <div style={{ background: "linear-gradient(135deg, #00897b 0%, #0e7490 100%)", color: 'white', padding: '30px 20px', textAlign: 'center', textTransform: 'capitalize' }}>
                    <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 400, opacity: 0.9 }}>{diaSemana}</span>
                    <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, letterSpacing: '-1px' }}>{diaNum} de {mes}</span>
                </div>

                <div className="modal-grid">
                    <div className="modal-main" style={{ padding: '32px', background: 'white', flex: 2 }}>
                        <div>
                            <h3 className="class-title" style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 12px 0' }}>{p.clase_nombre}</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                <span className="meta-pill" style={{ background: '#f3f4f6', padding: '6px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-clock" style={{ color: '#0e7490' }}></i> {p.hora}
                                </span>
                                <span className="meta-pill" style={{ background: '#f3f4f6', padding: '6px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-building" style={{ color: '#0e7490' }}></i> {p.centro}
                                </span>
                                {p.tipo_clase && (
                                    <span className="meta-pill" style={{ background: '#f3f4f6', padding: '6px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <i className="fa-solid fa-layer-group" style={{ color: '#0e7490' }}></i> {p.tipo_clase}
                                    </span>
                                )}
                            </div>
                        </div>

                        <h4 className="section-header" style={{ fontSize: '12px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '32px', marginBottom: '16px' }}>
                            Asistentes confirmados ({alumnos.length})
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {alumnos.length > 0 ? alumnos.map(alum => (
                                <div key={alum.id} className="participant-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="modal-avatar" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #39c5a7, #eb567a)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                            {alum.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#1f2937', fontSize: '15px' }}>{alum.nombre}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Método: {alum.pago}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ fontWeight: 700, color: '#000', fontSize: '15px' }}>€{Number(alum.coste).toFixed(2)}</div>
                                        {isAdmin && (
                                            <button type="button" onClick={() => handleRemoveClient(alum.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
                                    <i className="fa-solid fa-users-slash" style={{ color: '#d1d5db', fontSize: '24px', marginBottom: '10px' }}></i>
                                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>No hay alumnos inscritos aún.</p>
                                </div>
                            )}
                        </div>

                        {isAdmin && (
                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #e5e7eb' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '10px' }}>AÑADIR ALUMNO</label>
                                <p style={{ fontSize: '11px', color: '#9ca3af' }}>(Funcionalidad simplificada para este paso: usa el botón "Nueva Clase" para gestión masiva)</p>
                            </div>
                        )}
                    </div>

                    <div className="modal-sidebar" style={{ background: '#f8fafc', padding: '32px', borderLeft: '1px solid #f3f4f6', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h4 className="section-header" style={{ fontSize: '12px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', marginTop: 0 }}>
                            Equipo Técnico
                        </h4>
                        
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {trainers.length > 0 ? trainers.map(t => (
                                <div key={t.id} className="trainer-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                                    <div className="t-avatar" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #39c5a7, #eb567a)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                        {t.initial || t.name.charAt(0)}
                                    </div>
                                    <span style={{ flex: 1, fontSize: '14px', color: '#374151', fontWeight: 500 }}>{t.name}</span>
                                    {(isAdmin || (isTrainer && t.id === currentUserId)) && (
                                        <button type="button" onClick={() => handleRemoveTrainer(t.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    )}
                                </div>
                            )) : (
                                <div style={{ padding: '10px', border: '1px dashed #e5e7eb', borderRadius: '8px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>Sin asignación</div>
                            )}
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            {isAdmin ? (
                                <>
                                    <label className="section-header" style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '10px' }}>Gestionar Personal</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <select 
                                            value={selectedTrainerToAdd} 
                                            onChange={(e) => setSelectedTrainerToAdd(e.target.value)}
                                            className="modern-input" 
                                            style={{ padding: '10px', fontSize: '13px', height: '40px' }}
                                        >
                                            <option value="">Añadir entrenador...</option>
                                            {allTrainers.filter(at => !trainers.some(t => t.id === at.id)).map(at => (
                                                <option key={at.id} value={at.id}>{at.name}</option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button" 
                                            onClick={handleAddTrainer}
                                            style={{ background: '#0e7490', color: 'white', border: 'none', width: '40px', borderRadius: '8px', cursor: 'pointer' }}
                                        >
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                </>
                            ) : (isTrainer && !trainers.some(t => t.id === currentUserId)) ? (
                                <button 
                                    type="button" 
                                    onClick={handleJoinSession}
                                    style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}
                                >
                                    <i className="fa-solid fa-user-plus"></i> Inscribirme
                                </button>
                            ) : isTrainer && trainers.some(t => t.id === currentUserId) ? (
                                <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#166534', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <i className="fa-solid fa-circle-check"></i> <span>Estás asignado a esta clase</span>
                                </div>
                            ) : null}
                        </div>

                        {isAdmin && (
                            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
                                <button 
                                    type="button" 
                                    onClick={handleDeleteFullSession}
                                    style={{ width: '100%', padding: '12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <i className="fa-solid fa-trash"></i> ELIMINAR SESIÓN
                                </button>
                                <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px', textAlign: 'center' }}>Esta acción eliminará todos los pagos asociados.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer" style={{ padding: '15px 32px', borderTop: '1px solid #f3f4f6', background: 'white' }}>
                    <button type="button" onClick={onClose} style={{ background: '#eb567a', color: 'white', border: 'none', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', padding: '14px', borderRadius: '10px', width: '100%', boxShadow: '0 4px 12px rgba(235, 86, 122, 0.3)' }}>
                        CERRAR
                    </button>
                </div>
            </div>
        </div>
    );
}
