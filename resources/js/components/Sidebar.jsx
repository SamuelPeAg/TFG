import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const [user, setUser] = useState(window.AppConfig?.user);

  useEffect(() => {
    const handleUpdate = () => {
      setUser({ ...window.AppConfig.user });
    };
    window.addEventListener('user-updated', handleUpdate);
    return () => window.removeEventListener('user-updated', handleUpdate);
  }, []);

  // Cerrar sidebar cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  // Si no hay usuario, el sidebar no debería renderizar nada importante o debería redirigir
  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isTrainer = user.role === 'entrenador';

  const hasPermission = (perm) => {
    if (isAdmin) return true;
    if (!user.permissions) return false;
    return user.permissions.includes(perm);
  };

  // Helper para verificar ruta activa
  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async (e) => {
    e.preventDefault();
    const baseUrl = window.AppConfig?.baseUrl || '/';
    try {
      await axios.post(`${baseUrl}logout`);
      window.location.href = baseUrl;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      window.location.href = baseUrl;
    }
  };

  const adminLinks = [
    { name: 'ESTADÍSTICAS', path: '/estadisticas', icon: 'fa-solid fa-chart-line' },
    { name: 'ENTRENADORES', path: '/entrenadores', icon: 'fa-solid fa-dumbbell' },
    { name: 'CLIENTES', path: '/clientes', icon: 'fa-solid fa-users' },
    { name: 'CALENDARIO', path: '/calendario', icon: 'fa-solid fa-calendar-check' },
    { name: 'FACTURACIÓN', path: '/facturas', icon: 'fa-solid fa-file-invoice' },
    { name: 'NOMINAS', path: '/admin/nominas', icon: 'fa-solid fa-file-invoice' },
    { name: 'SUSCRIPCIONES', path: '/suscripciones', icon: 'fa-solid fa-ticket-alt' },
  ];

  const trainerLinks = [
    { name: 'CLIENTES', path: '/clientes', icon: 'fa-solid fa-users' },
    { name: 'CALENDARIO', path: '/calendario', icon: 'fa-solid fa-calendar-check' },
    { name: 'FACTURACIÓN', path: '/facturas', icon: 'fa-solid fa-file-invoice', permission: 'acceder_facturacion' },
    { name: 'NOMINAS', path: '/admin/nominas', icon: 'fa-solid fa-file-invoice', permission: 'acceder_nominas_admin' },
    { name: 'SUSCRIPCIONES', path: '/suscripciones', icon: 'fa-solid fa-ticket-alt', permission: 'acceder_suscripciones' },
    { name: 'MIS NOMINAS', path: '/mis-nominas', icon: 'fa-solid fa-file-invoice' },
  ];

  const clientLinks = [
    { name: 'MI FICHA', path: '/mi-ficha', icon: 'fa-solid fa-folder-open text-[#38C1A3]' },
    { name: 'CALENDARIO', path: '/calendario', icon: 'fa-solid fa-calendar-check' },
  ];

  const linksToShow = isAdmin 
    ? adminLinks 
    : (isTrainer 
        ? trainerLinks.filter(link => !link.permission || hasPermission(link.permission)) 
        : clientLinks);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-gray-900/50 z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />
      
      <aside 
        style={{ backgroundImage: 'linear-gradient(to bottom, #4eb7ac, #334352)' }}
        className={`fixed top-0 left-0 h-full w-64 sm:w-72 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-hidden shadow-2xl`}
      >
        <div className="pt-8 sm:pt-10 pb-4 sm:pb-6 flex flex-col items-center px-4">
          <Link to="/" className="flex flex-col items-center gap-2 sm:gap-3 group w-full" onClick={() => setIsOpen(false)}>
            <img src={`${window.AppConfig?.baseUrl || '/'}img/logopng.png`} alt="Factomove Logo" className="h-12 sm:h-14 w-auto drop-shadow-md transition-transform group-hover:scale-105" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter drop-shadow-sm">Factomove</h2>
          </Link>
        </div>

        <div className="px-4 sm:px-8 py-4 sm:py-6 mb-2 flex items-center gap-3 sm:gap-4 bg-white/5 rounded-[32px] mx-3 sm:mx-4 border border-white/10 shadow-inner">
          <div 
            className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-white flex items-center justify-center font-black text-lg sm:text-xl shrink-0 overflow-hidden shadow-lg border-2 border-white/20"
          >
            {user.photo ? (
              <img 
                src={user.photo} 
                alt={user.name} 
                className="w-full h-full object-cover shadow-inner" 
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="text-[#38C1A3]">${user.name.charAt(0).toUpperCase()}</span>`;
                }}
              />
            ) : (
              <span className="text-[#38C1A3]">{user.name.trim().charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="font-extrabold truncate text-white text-sm sm:text-[15px] leading-tight mb-0.5 tracking-tight" title={user.name}>{user.name}</span>
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></div>
                <span className="text-[9px] text-white/60 uppercase tracking-[0.15em] font-black whitespace-nowrap">{user.role}</span>
            </div>
          </div>
        </div>

        <nav className="grow py-2 sm:py-3 px-3 sm:px-5 space-y-1.5 sm:space-y-2 flex flex-col">
          {linksToShow.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-colors ${
                isActive(link.path) 
                  ? 'bg-white text-[#38C1A3] shadow-md' 
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <i className={`${link.icon} w-4 text-center text-sm sm:text-lg flex-shrink-0`}></i>
              <span className="tracking-wide truncate">{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="px-3 sm:px-5 py-3 sm:py-4 border-t border-white/20 mt-auto space-y-1.5">
          <a href="/" className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-white hover:bg-white/10 transition-colors" onClick={() => setIsOpen(false)}>
            <i className="fa-solid fa-house w-4 text-center text-sm sm:text-lg flex-shrink-0"></i>
            <span className="tracking-wide truncate">VOLVER</span>
          </a>
          <Link to="/configuracion" className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-white hover:bg-white/10 transition-colors" onClick={() => setIsOpen(false)}>
            <i className="fa-solid fa-user-gear w-4 text-center text-sm sm:text-lg flex-shrink-0"></i>
            <span className="tracking-wide truncate">MI PERFIL</span>
          </Link>
          
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm text-rose-300 hover:text-white hover:bg-rose-500 transition-colors text-left tracking-wider">
            <i className="fa-solid fa-right-from-bracket w-4 text-center text-sm sm:text-lg flex-shrink-0"></i>
            <span className="truncate">SALIR</span>
          </button>
        </div>
      </aside>
    </>
  );
}
