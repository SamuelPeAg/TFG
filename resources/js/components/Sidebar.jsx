import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const [user, setUser] = useState(window.AppConfig?.user);
  const [loading, setLoading] = useState(!window.AppConfig?.user);
  const [imgError, setImgError] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);

  useEffect(() => {
    if (!user) {
      axios.get('/configuracion')
        .then(res => {
          if (res.data.user) {
            setUser(res.data.user);
            if (window.AppConfig) window.AppConfig.user = res.data.user;
          }
        })
        .catch(err => console.error('Error fetching user for sidebar:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const handleUpdate = () => {
      setUser({ ...window.AppConfig?.user });
      setImgError(false);
    };
    window.addEventListener('user-updated', handleUpdate);
    return () => window.removeEventListener('user-updated', handleUpdate);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    fetchNotifications();
  }, [location.pathname, setIsOpen]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      if (user.role === 'admin') {
        const res = await axios.get('/api/admin/notificaciones');
        setHasUnreadAlerts(res.data.some(n => !n.leido));
      } else if (user.role === 'entrenador') {
        const res = await axios.get('/notificaciones-entrenador');
        // Unread means leido is false and we are the destinatario, or maybe just any unread in our inbox
        setHasUnreadAlerts(res.data.some(n => !n.leido && n.destinatario_id === user.id));
      } else {
        const res = await axios.get('/api/user-notifications');
        setHasUnreadAlerts(res.data.notifications.length > 0);
      }
    } catch (err) {
      console.error('Error fetching notifications for sidebar:', err);
    }
  };

  if (loading) return null;
  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isTrainer = user.role === 'entrenador';

  const hasPermission = (perm) => {
    if (isAdmin) return true;
    if (!user.permissions) return false;
    return user.permissions.includes(perm);
  };

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
    { name: 'ESTADÍSTICAS', path: '/estadisticas', icon: 'fa-solid fa-chart-column text-emerald-300' },
    { name: 'GESTIÓN', path: '/gestion', icon: 'fa-solid fa-gears text-slate-300' },
    { name: 'ENTRENADORES', path: '/entrenadores', icon: 'fa-solid fa-user-tie text-blue-300' },
    { name: 'CLIENTES', path: '/clientes', icon: 'fa-solid fa-user-group text-amber-300' },
    { name: 'CALENDARIO', path: '/calendario', icon: 'fa-solid fa-calendar-days text-[#38C1A3]' },
    { name: 'FACTURACIÓN', path: '/facturas', icon: 'fa-solid fa-receipt text-rose-300' },
    { name: 'NÓMINAS', path: '/admin/nominas', icon: 'fa-solid fa-money-check-dollar text-indigo-300' },
    { name: 'SUSCRIPCIONES', path: '/suscripciones', icon: 'fa-solid fa-credit-card text-purple-300' },
    { name: 'VACACIONES', path: '/admin/vacaciones', icon: 'fa-solid fa-sun text-yellow-300' },
    { name: 'ERRORES', path: '/admin/errores', icon: 'fa-solid fa-bug text-rose-500' },
  ];

  const trainerLinks = [
    { name: 'CALENDARIO', path: '/calendario', icon: 'fa-solid fa-calendar-days text-[#38C1A3]' },
    { name: 'CLIENTES', path: '/clientes', icon: 'fa-solid fa-user-group text-violet-400' },
    { name: 'NOTIFICAR', path: '/notificaciones', icon: 'fa-solid fa-envelope text-sky-400' },
    { name: 'PLANES', path: '/trainer/planes', icon: 'fa-solid fa-clipboard-list text-rose-400' },
    { name: 'MIS NÓMINAS', path: '/mis-nominas', icon: 'fa-solid fa-money-check-dollar text-emerald-400' },
    { name: 'MIS VACACIONES', path: '/mis-vacaciones', icon: 'fa-solid fa-sun text-amber-400' },
    { name: 'FACTURACIÓN', path: '/facturas', icon: 'fa-solid fa-receipt text-rose-300', permission: 'acceder_facturacion' },
    { name: 'NÓMINAS', path: '/admin/nominas', icon: 'fa-solid fa-money-check-dollar text-indigo-300', permission: 'acceder_nominas_admin' },
    { name: 'SUSCRIPCIONES', path: '/suscripciones', icon: 'fa-solid fa-credit-card text-purple-300', permission: 'acceder_suscripciones' },
  ];

  const clientLinks = [
    { name: 'CALENDARIO', path: '/calendario', icon: 'fa-solid fa-calendar-days text-[#38C1A3]' },
    { name: 'MIS CLASES', path: '/mis-clases', icon: 'fa-solid fa-person-running text-amber-300' },
    { name: 'NUTRICIÓN & EVOLUCIÓN', path: '/mis-comidas', icon: 'fa-solid fa-dna text-rose-300' },
    { name: 'ESTADÍSTICAS', path: '/mis-estadisticas', icon: 'fa-solid fa-chart-line text-blue-400' },
  ];

  const linksToShow = isAdmin
    ? adminLinks
    : (isTrainer
      ? trainerLinks.filter(link => !link.permission || hasPermission(link.permission))
      : clientLinks);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = window.AppConfig?.baseUrl || '/';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    if (cleanPath.startsWith('storage/')) {
      return baseUrl + cleanPath;
    }
    return baseUrl + 'storage/' + cleanPath;
  };

  const renderAvatar = () => {
    if (user?.photo && !imgError) {
      // Ensure it's not just the root storage path
      const photoUrl = getImageUrl(user.photo);
      const isRootStorage = photoUrl.endsWith('/storage') || photoUrl.endsWith('/storage/');

      if (!isRootStorage) {
        return (
          <img
            src={photoUrl}
            alt={user.name}
            className="w-full h-full object-cover shadow-inner bg-white"
            onError={() => setImgError(true)}
          />
        );
      }
    }
    return (
      <span className="text-[#38C1A3]">
        {user?.name ? user.name.trim().charAt(0).toUpperCase() : '?'}
      </span>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-gray-900/50 z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        style={{ backgroundImage: 'linear-gradient(to bottom, #4eb7ac, #334352)' }}
        className={`fixed top-0 left-0 h-full w-64 sm:w-72 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-hidden shadow-2xl`}
      >
        <div className="pt-8 sm:pt-10 pb-4 sm:pb-6 flex flex-col items-center px-4">
          <Link to="/" className="flex flex-col items-center gap-2 sm:gap-3 group w-full" onClick={() => setIsOpen(false)}>
            <img src={`${window.AppConfig?.baseUrl || '/'}img/logopng.png`} alt="Factomove Logo" className="h-12 sm:h-14 w-auto drop-shadow-md transition-transform group-hover:scale-105" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter drop-shadow-sm">Factomove</h2>
          </Link>
        </div>

        <Link
          to="/configuracion"
          onClick={() => setIsOpen(false)}
          className="px-4 sm:px-8 py-4 sm:py-6 mb-2 flex items-center gap-3 sm:gap-4 bg-white/5 hover:bg-white/10 rounded-[32px] mx-3 sm:mx-4 border border-white/10 shadow-inner transition-colors group"
        >
          <div
            className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-white flex items-center justify-center font-black text-lg sm:text-xl shrink-0 overflow-hidden shadow-lg border-2 border-white/20 transition-transform group-hover:scale-105"
          >
            {renderAvatar()}
          </div>
          <div className="flex flex-col overflow-hidden min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold truncate text-white text-sm sm:text-[15px] leading-tight mb-0.5 tracking-tight group-hover:text-emerald-300 transition-colors" title={user.name}>{user.name}</span>
              {hasUnreadAlerts && (
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse border border-white/20"></div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></div>
              <span className="text-[9px] text-white/60 uppercase tracking-[0.15em] font-black whitespace-nowrap">{user.role}</span>
            </div>
          </div>
        </Link>

        <nav className="grow py-2 sm:py-3 px-3 sm:px-5 space-y-1.5 sm:space-y-2 flex flex-col overflow-y-auto custom-scrollbar">
          {linksToShow.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-colors ${isActive(link.path)
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
            {hasUnreadAlerts && (
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse ml-auto"></div>
            )}
          </Link>

          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm text-rose-300 hover:text-white hover:bg-rose-500 transition-all text-left tracking-widest group shadow-sm">
            <i className="fa-solid fa-right-from-bracket w-4 text-center text-sm sm:text-lg flex-shrink-0 group-hover:scale-110 transition-transform"></i>
            <span className="truncate">CERRAR SESIÓN</span>
          </button>
        </div>
      </aside>
    </>
  );
}
