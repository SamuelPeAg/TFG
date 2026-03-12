import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    const user = window.FactomoveUser;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/logout');
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error', error);
        }
    };

    // Ajuste de altura moderado
    const headerStyle = {
        paddingTop: scrolled ? '20px' : '40px',
        paddingBottom: scrolled ? '20px' : '40px',
        transition: 'all 0.3s ease-in-out',
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : '#f8fafc',
    };

    return (
        <header 
            style={headerStyle}
            className={`fixed w-full z-[100] top-0 border-b border-gray-100 shadow-sm`}
        >
            <div>
                <nav className="flex items-center justify-between">
                    
                    {/* LOGO IZQUIERDA */}
                    <div className="flex-shrink-0" style={{ marginLeft: '70px' }}>
                        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <img src="/img/logopng.png" alt="Factomove" className="h-10 w-auto" />
                            <span className="font-black text-2xl tracking-tighter text-gray-900">
                                Facto<span className="text-[#4BB7AE]">move</span>
                            </span>
                        </Link>
                    </div>

                    {/* DERECHA: NAV + LOGIN */}
                    <div className="hidden md:flex items-center gap-10" style={{ marginRight: '100px' }}>
                        <div className="flex items-center gap-8 border-r border-gray-200 pr-10" >
                            <a href="https://movertedavida.com/cordoba/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 font-bold text-lg transition-colors">
                                Nosotros
                            </a>
                            <a href="/contacto" className="text-gray-500 hover:text-gray-900 font-bold text-lg transition-colors">
                                Contacto
                            </a>
                        </div>

                        {!user ? (
                            <Link 
                                to="/login" 
                                className="text-[#4BB7AE] hover:text-[#EF5D7A] font-black text-lg transition-all"
                            >
                                Iniciar Sesión
                            </Link>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link to="/calendario" className="flex items-center gap-3">
                                    <div className="text-right flex flex-col justify-center">
                                        <span className="font-black text-gray-900 text-sm leading-none">{user.name}</span>
                                        <span className="text-[10px] text-[#4BB7AE] font-black uppercase tracking-widest mt-1">Dashboard</span>
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-[#4BB7AE] text-white flex items-center justify-center font-black overflow-hidden border border-white shadow-sm">
                                        {user.foto_de_perfil 
                                            ? <img src={`/storage/${user.foto_de_perfil}`} className="h-full w-full object-cover" />
                                            : user.name.charAt(0)
                                        }
                                    </div>
                                </Link>
                                <button onClick={handleLogout} className="text-gray-300 hover:text-[#EF5D7A] transition-colors">
                                    <i className="fa-solid fa-power-off"></i>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button onClick={toggleMobileMenu} className="md:hidden text-gray-900">
                        <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-2xl`}></i>
                    </button>
                </nav>
            </div>

            {/* MOBILE MENU */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-[80px] bg-white z-[90] md:hidden p-10 flex flex-col gap-6">
                    <Link to="/" onClick={toggleMobileMenu} className="text-3xl font-black text-gray-900">Inicio</Link>
                    <a href="https://movertedavida.com/cordoba/" onClick={toggleMobileMenu} className="text-3xl font-black text-gray-900">Nosotros</a>
                    <a href="/contacto" onClick={toggleMobileMenu} className="text-3xl font-black text-gray-900">Contacto</a>
                    <div className="h-px bg-gray-100 my-4"></div>
                    {!user ? (
                        <Link to="/login" onClick={toggleMobileMenu} className="text-3xl font-black text-[#4BB7AE]">Iniciar Sesión</Link>
                    ) : (
                        <Link to="/calendario" onClick={toggleMobileMenu} className="text-3xl font-black text-[#4BB7AE]">Dashboard</Link>
                    )}
                </div>
            )}
        </header>
    );
}
