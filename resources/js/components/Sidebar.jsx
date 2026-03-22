import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const user = window.AppConfig?.user;

  // Si no hay usuario, el sidebar no debería renderizar nada importante o debería redirigir
  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isTrainer = user.role === 'entrenador';

  // Helper para verificar ruta activa
  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/logout');
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      window.location.href = '/';
    }
  };

  const adminLinks = [
    { name: 'PANEL', path: '/estadisticas', icon: 'fa-solid fa-chart-line' },
    { name: 'ENTRENADORES', path: '/entrenadores', icon: 'fa-solid fa-dumbbell' },
    { name: 'CLIENTES', path: '/clientes', icon: 'fa-solid fa-users' },
    { name: 'CALENDARIO', path: '/calendario', icon: 'fa-solid fa-calendar-check' },
    { name: 'FACTURACIÓN', path: '/facturas', icon: 'fa-solid fa-file-invoice' },
    { name: 'NOMINAS-ADMIN', path: '/admin/nominas', icon: 'fa-solid fa-file-invoice' },
    { name: 'SUSCRIPCIONES', path: '/suscripciones', icon: 'fa-solid fa-ticket-alt' },
  ];

  const trainerLinks = [
    { name: 'CLIENTES', path: '/clientes', icon: 'fa-solid fa-users' },
    { name: 'CALENDARIO', path: '/calendario', icon: 'fa-solid fa-calendar-check' },
    { name: 'MIS NOMINAS', path: '/mis-nominas', icon: 'fa-solid fa-file-invoice' },
  ];

  const linksToShow = isAdmin ? adminLinks : trainerLinks;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-gray-900/50 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />
      
      <aside 
        style={{ backgroundImage: 'linear-gradient(to bottom, #4eb7ac, #334352)' }}
        className={`fixed top-0 left-0 h-full w-72 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-hidden shadow-2xl`}
      >
        <div className="pt-10 pb-6 flex flex-col items-center">
          <Link to="/" className="flex flex-col items-center gap-3 group">
            <img src="/img/logopng.png" alt="Factomove Logo" className="h-14 w-auto drop-shadow-md transition-transform group-hover:scale-105" />
            <h2 className="text-2xl font-black text-white tracking-tighter drop-shadow-sm">Factomove</h2>
          </Link>
        </div>

        <div className="px-8 py-4 flex items-center gap-4">
          <div 
            style={{ color: '#38C1A3' }}
            className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-xl shrink-0 overflow-hidden shadow-sm"
          >
            {user.photo ? (
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-extrabold truncate text-white text-[15px] drop-shadow-sm" title={user.name}>{user.name}</span>
            <span className="text-[10px] text-white/80 uppercase tracking-widest font-black drop-shadow-sm">{user.role}</span>
          </div>
        </div>

        <nav className="grow py-6 px-5 space-y-3 flex flex-col">
          {linksToShow.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-sm transition-colors ${
                isActive(link.path) 
                  ? 'bg-white text-[#38C1A3] shadow-md' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <i className={`${link.icon} w-5 text-center text-lg`}></i>
              <span className="tracking-wide">{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="px-5 py-8 border-t border-white/20 mt-auto space-y-2">
          <a href="/" className="flex items-center gap-4 px-5 py-3 rounded-2xl font-bold text-sm text-white hover:bg-white/10 transition-colors">
            <i className="fa-solid fa-house w-5 text-center text-lg"></i>
            <span className="tracking-wide">VOLVER</span>
          </a>
          <Link to="/configuracion" className="flex items-center gap-4 px-5 py-3 rounded-2xl font-bold text-sm text-white hover:bg-white/10 transition-colors">
            <i className="fa-solid fa-user-gear w-5 text-center text-lg"></i>
            <span className="tracking-wide">MI PERFIL</span>
          </Link>
          
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-sm text-rose-300 hover:text-white hover:bg-rose-500 transition-colors text-left tracking-wider">
            <i className="fa-solid fa-right-from-bracket w-5 text-center text-lg"></i>
            <span>SALIR</span>
          </button>
        </div>
      </aside>
    </>
  );
}
