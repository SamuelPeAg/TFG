import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/global.css';

export default function Entrenadores() {
    const [entrenadores, setEntrenadores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Modals state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEntrenador, setSelectedEntrenador] = useState(null);

    // Form data
    const [createData, setCreateData] = useState({ nombre: '', email: '' });
    const [editData, setEditData] = useState({ password: '', password_confirmation: '', iban: '' });

    const fetchEntrenadores = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/entrenadores', { headers: { 'Accept': 'application/json' } });
            setEntrenadores(res.data.entrenadores || []);
        } catch (error) {
            console.error('Error fetching entrenadores:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntrenadores();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredEntrenadores = entrenadores.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateInputChange = (e) => {
        setCreateData({ ...createData, [e.target.name]: e.target.value });
    };

    const handleEditInputChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/entrenadores', createData, { headers: { 'Accept': 'application/json' } });
            setShowCreateModal(false);
            setCreateData({ nombre: '', email: '' });
            alert(response.data.message || 'Entrenador creado correctamente.');
            fetchEntrenadores();
        } catch (error) {
            console.error('Error creating entrenador:', error);
            alert(error.response?.data?.message || 'Error al crear entrenador');
        }
    };

    const openEditModal = (entrenador) => {
        setSelectedEntrenador(entrenador);
        setEditData({
            password: '',
            password_confirmation: '',
            iban: entrenador.iban || ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/entrenadores/${selectedEntrenador.id}`, editData, { headers: { 'Accept': 'application/json' } });
            setShowEditModal(false);
            fetchEntrenadores();
        } catch (error) {
            console.error('Error updating entrenador:', error);
            alert(error.response?.data?.message || 'Error al actualizar entrenador');
        }
    };

    const openDeleteModal = (entrenador) => {
        setSelectedEntrenador(entrenador);
        setShowDeleteModal(true);
    };

    const handleDeleteSubmit = async () => {
        try {
            await axios.delete(`/entrenadores/${selectedEntrenador.id}`, { headers: { 'Accept': 'application/json' } });
            setShowDeleteModal(false);
            fetchEntrenadores();
        } catch (error) {
            console.error('Error deleting entrenador:', error);
            alert('Error al eliminar entrenador');
        }
    };

    return (
        <div className="main-content">
            <div className="header-controls">
                <div className="title-section">
                    <h1>Gestión de Entrenadores</h1>
                </div>

                <div className="controls-bar">
                    <div className="search-container">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar entrenador por nombre o email..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <button className="btn-design btn-solid-custom" onClick={() => setShowCreateModal(true)}>
                        <i className="fas fa-plus"></i> <span>Añadir Entrenador</span>
                    </button>
                </div>
            </div>

            <div className="content-wrapper">
                <div className="table-container">
                    <table className="facto-table">
                        <thead>
                            <tr>
                                <th>Entrenador</th>
                                <th>Email</th>
                                <th>IBAN</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>Cargando...</td></tr>
                            ) : filteredEntrenadores.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay entrenadores registrados aún.</td></tr>
                            ) : (
                                filteredEntrenadores.map(entrenador => (
                                    <tr key={entrenador.id}>
                                        <td data-label="Entrenador">
                                            <div className="user-info">
                                                <div className="avatar-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {entrenador.foto_de_perfil ? (
                                                        <img src={`/storage/${entrenador.foto_de_perfil}`} alt={entrenador.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                                    ) : (
                                                        entrenador.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <span>{entrenador.name}</span>
                                            </div>
                                        </td>
                                        <td data-label="Email">{entrenador.email}</td>
                                        <td data-label="IBAN" style={{ fontFamily: 'monospace' }}>{entrenador.iban || '---'}</td>
                                        <td data-label="Acciones">
                                            <div className="action-buttons">
                                                <a href={`/Pagos?entrenador=${entrenador.id}`} className="btn-icon" style={{ color: '#4BB7AE' }} title="Ver Pagos">
                                                    <i className="fas fa-calendar-check"></i>
                                                </a>

                                                <button className="btn-icon btn-edit" onClick={() => openEditModal(entrenador)}>
                                                    <i className="fas fa-pencil-alt"></i>
                                                </button>

                                                <button className="btn-icon btn-delete" onClick={() => openDeleteModal(entrenador)}>
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Crear */}
            {showCreateModal && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
                    <div className="modal-card" style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <button className="close-btn" style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowCreateModal(false)}>&times;</button>
                        <h2 style={{ marginBottom: '5px' }}><i className="fas fa-user-plus" style={{ marginRight: '10px', color: '#0e7490' }}></i> Crear Entrenador</h2>
                        <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>Se le enviará un correo para completar su registro.</p>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Nombre</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-user" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="text" name="nombre" value={createData.nombre} onChange={handleCreateInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} placeholder="Nombre completo" required />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Correo Electrónico</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-envelope" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="email" name="email" value={createData.email} onChange={handleCreateInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} placeholder="correo@ejemplo.com" required />
                                </div>
                            </div>
                            <button type="submit" className="btn-facto" style={{ width: '100%', padding: '12px', background: '#0e7490', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Añadir Entrenador</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Editar */}
            {showEditModal && selectedEntrenador && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
                    <div className="modal-card" style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <button className="close-btn" style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowEditModal(false)}>&times;</button>
                        <h2 style={{ marginBottom: '20px' }}><i className="fas fa-user-edit" style={{ marginRight: '10px', color: '#0e7490' }}></i> Editar Entrenador</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>IBAN</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-credit-card" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="text" name="iban" value={editData.iban} onChange={handleEditInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} placeholder="ES00 0000 0000 0000 0000 0000" />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Nueva Contraseña (Opcional)</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-lock" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="password" name="password" value={editData.password} onChange={handleEditInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} placeholder="Nueva contraseña" />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Confirmar Contraseña</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-check-double" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="password" name="password_confirmation" value={editData.password_confirmation} onChange={handleEditInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} placeholder="Repite la contraseña" />
                                </div>
                            </div>
                            <button type="submit" className="btn-facto" style={{ width: '100%', padding: '12px', background: '#0e7490', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Actualizar</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Eliminar */}
            {showDeleteModal && selectedEntrenador && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
                    <div className="modal-card" style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '400px', textAlign: 'center', position: 'relative' }}>
                        <button className="close-btn" style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowDeleteModal(false)}>&times;</button>
                        <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#EF5D7A', marginBottom: '20px' }}></i>
                        <h2 style={{ color: '#EF5D7A', marginBottom: '10px' }}>¿Eliminar Entrenador?</h2>
                        <p style={{ marginBottom: '20px', color: '#555' }}>Estás a punto de eliminar a:<br /><strong style={{ fontSize: '18px', color: '#333' }}>{selectedEntrenador.name}</strong></p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => setShowDeleteModal(false)} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                            <button onClick={handleDeleteSubmit} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#EF5D7A', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Sí, Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
