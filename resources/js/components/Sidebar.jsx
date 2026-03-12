import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/sidebar.css';

export default function Sidebar() {
    const navigate = useNavigate();
    const user = window.FactomoveUser;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Determines if the user is an admin by checking the roles array
    const isAdmin = user?.roles?.some(role => role.name === 'admin');

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/logout'); // Assuming you have standard Laravel logout endpoint
            // Optional: reset factomoveuser or redirect 
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login'; // Redirect anyway usually works
        }
    };

    const closeMobileMenu = () => {
        if (window.innerWidth < 1024) {
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <>
            {/* Botón Hamburguesa (solo visible en móvil/tablet) */}
            <button
                className={`menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Abrir menú"
                style={{ zIndex: 10000 }}
            >
                <i className={`fa-solid ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>

            {/* Overlay oscuro */}
            <div
                className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            ></div>

            <aside className={`sidebar-container ${isMobileMenuOpen ? 'active' : ''}`}>
                <div className="sidebar-logo">
                    <NavLink to="/">
                        <img src="/img/logopng.png" alt="Logo Factomove" />
                        <h2>Factomove</h2>
                    </NavLink>
                </div>

                <div className="user-profile-card">
                    <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {user?.foto_de_perfil ? (
                            <img src={`/storage/${user.foto_de_perfil}`}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                            />
                        ) : null}
                        <span style={{ display: user?.foto_de_perfil ? 'none' : 'block' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="user-info-text hover:opacity-80 transition-opacity">
                        <span className="name">{user?.name}</span>
                        <span className="role">{isAdmin ? 'Administrador' : 'Entrenador'}</span>
                    </div>
                </div>

                <nav className="main-menu">
                    {isAdmin && (
                        <NavLink to="/entrenadores" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                            <i className="fa-solid fa-dumbbell"></i>
                            <span>ENTRENADORES</span>
                        </NavLink>
                    )}

                    <NavLink to="/users" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <i className="fa-solid fa-users"></i>
                        <span>CLIENTES</span>
                    </NavLink>

                    {isAdmin && (
                        <NavLink to="/facturas" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                            <i className="fa-solid fa-file-invoice"></i>
                            <span>FACTURACIÓN</span>
                        </NavLink>
                    )}

                    {isAdmin ? (
                        <NavLink to="/admin/nominas" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                            <i className="fa-solid fa-money-bill"></i>
                            <span>NÓMINAS ADMIN</span>
                        </NavLink>
                    ) : (
                        <NavLink to="/nominas-e" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                            <i className="fa-solid fa-money-bill"></i>
                            <span>NÓMINAS</span>
                        </NavLink>
                    )}

                    <NavLink to="/calendario" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <i className="fa-solid fa-calendar-check"></i>
                        <span>CALENDARIO</span>
                    </NavLink>

                </nav>

                <div className="sidebar-footer">
                    <NavLink to="/" className="menu-item">
                        <i className="fa-solid fa-house"></i>
                        <span>VOLVER AL INICIO</span>
                    </NavLink>

                    <NavLink to="/configuracion" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <i className="fa-solid fa-user-gear"></i>
                        <span>MI PERFIL</span>
                    </NavLink>

                    <a href="#" className="menu-item logout-btn" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>SALIR</span>
                    </a>
                </div>
            </aside>
        </>
    );
}
