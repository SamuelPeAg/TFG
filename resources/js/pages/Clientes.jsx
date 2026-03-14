import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/global.css';

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Modals state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', password_confirmation: '', iban: '', firma_digital: ''
    });

    const fetchClientes = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/users', { headers: { 'Accept': 'application/json' } });
            setClientes(res.data.users || []);
        } catch (error) {
            console.error('Error fetching clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredClientes = clientes.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/users', formData, { headers: { 'Accept': 'application/json' } });
            setShowCreateModal(false);
            setFormData({ name: '', email: '', password: '', password_confirmation: '', iban: '', firma_digital: '' });
            fetchClientes();
        } catch (error) {
            console.error('Error creating cliente:', error);
            alert(error.response?.data?.message || 'Error al crear cliente');
        }
    };

    const openEditModal = (cliente) => {
        setSelectedCliente(cliente);
        setFormData({
            name: cliente.name,
            email: cliente.email,
            iban: cliente.iban || '',
            firma_digital: cliente.firma_digital || '',
            password: '',
            password_confirmation: ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/users/${selectedCliente.id}`, formData, { headers: { 'Accept': 'application/json' } });
            setShowEditModal(false);
            fetchClientes();
        } catch (error) {
            console.error('Error updating cliente:', error);
            alert(error.response?.data?.message || 'Error al actualizar cliente');
        }
    };

    const openDeleteModal = (cliente) => {
        setSelectedCliente(cliente);
        setShowDeleteModal(true);
    };

    const handleDeleteSubmit = async () => {
        try {
            await axios.delete(`/users/${selectedCliente.id}`, { headers: { 'Accept': 'application/json' } });
            setShowDeleteModal(false);
            fetchClientes();
        } catch (error) {
            console.error('Error deleting cliente:', error);
            alert('Error al eliminar cliente');
        }
    };

    return (
        <div className="main-content">
            <div className="header-controls">
                <div className="title-section">
                    <h1>Gestión de Clientes</h1>
                </div>

                <div className="controls-bar">
                    <div className="search-container">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar cliente por nombre o email..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <button className="btn-design btn-solid-custom" onClick={() => setShowCreateModal(true)}>
                        <i className="fas fa-plus"></i> <span>Añadir cliente</span>
                    </button>
                </div>
            </div>

            <div className="content-wrapper">
                <div className="table-container">
                    <table className="facto-table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Email</th>
                                <th>IBAN</th>
                                <th>Firma</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Cargando...</td></tr>
                            ) : filteredClientes.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay clientes encontrados.</td></tr>
                            ) : (
                                filteredClientes.map(cliente => (
                                    <tr key={cliente.id}>
                                        <td data-label="Cliente">
                                            <div className="user-info">
                                                <div className="avatar-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {cliente.foto_de_perfil ? (
                                                        <img src={`/storage/${cliente.foto_de_perfil}`} alt={cliente.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                                    ) : (
                                                        cliente.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <span>{cliente.name}</span>
                                            </div>
                                        </td>
                                        <td data-label="Email">{cliente.email}</td>
                                        <td data-label="IBAN" style={{ fontFamily: 'monospace' }}>{cliente.iban || '---'}</td>
                                        <td data-label="Firma" style={{ fontFamily: 'monospace' }}>{cliente.firma_digital || 'No'}</td>
                                        <td data-label="Acciones">
                                            <div className="action-buttons">
                                                <button className="btn-icon btn-edit" onClick={() => openEditModal(cliente)}>
                                                    <i className="fas fa-pencil-alt"></i>
                                                </button>
                                                <button className="btn-icon btn-delete" onClick={() => openDeleteModal(cliente)}>
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

            {/* Modales */}
            {showCreateModal && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
                    <div className="modal-card" style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <button className="close-btn" style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowCreateModal(false)}>&times;</button>
                        <h2 style={{ marginBottom: '20px' }}><i className="fas fa-user-plus" style={{ marginRight: '10px', color: '#0e7490' }}></i> Crear Cliente</h2>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Nombre</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-user" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} placeholder="Ej. Juan Pérez" required />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Email</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-envelope" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} placeholder="usuario@email.com" required />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Contraseña</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-lock" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} placeholder="Contraseña..." required />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>IBAN</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-credit-card" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="text" name="iban" value={formData.iban} onChange={handleInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} placeholder="ES00 0000 0000..." />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Firma Digital</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-pen-nib" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="text" name="firma_digital" value={formData.firma_digital} onChange={handleInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} placeholder="Código de firma..." />
                                </div>
                            </div>
                            <button type="submit" className="btn-facto" style={{ width: '100%', padding: '12px', background: '#0e7490', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Crear Cliente</button>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && selectedCliente && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
                    <div className="modal-card" style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <button className="close-btn" style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowEditModal(false)}>&times;</button>
                        <h2 style={{ marginBottom: '20px' }}><i className="fas fa-user-edit" style={{ marginRight: '10px', color: '#0e7490' }}></i> Editar Cliente</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Nombre</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-user" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} required />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Email</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-envelope" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} required />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Nueva Contraseña (Opcional)</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-lock" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} placeholder="Dejar en blanco para no cambiar" />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>IBAN</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-credit-card" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="text" name="iban" value={formData.iban} onChange={handleInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Firma Digital</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                                    <i className="fas fa-pen-nib" style={{ color: '#9ca3af', marginRight: '10px' }}></i>
                                    <input type="text" name="firma_digital" value={formData.firma_digital} onChange={handleInputChange} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} />
                                </div>
                            </div>
                            <button type="submit" className="btn-facto" style={{ width: '100%', padding: '12px', background: '#0e7490', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Actualizar Cliente</button>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && selectedCliente && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
                    <div className="modal-card" style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '400px', textAlign: 'center', position: 'relative' }}>
                        <button className="close-btn" style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowDeleteModal(false)}>&times;</button>
                        <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#EF5D7A', marginBottom: '20px' }}></i>
                        <h2 style={{ color: '#EF5D7A', marginBottom: '10px' }}>¿Eliminar Cliente?</h2>
                        <p style={{ marginBottom: '20px', color: '#555' }}>Estás a punto de eliminar a:<br /><strong style={{ fontSize: '18px', color: '#333' }}>{selectedCliente.name}</strong></p>
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
