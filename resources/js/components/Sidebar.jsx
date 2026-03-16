import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const user = window.AppConfig?.user;

  // Si no hay usuario, el sidebar no debería renderizar nada importante o debería redirigir
  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isTrainer = user.role === 'entrenador';

  // Helper para verificar ruta activa
  const isActive = (path) => location.pathname.startsWith(path);

  const adminLinks = [
    { name: 'ENTRENADORES', path: '/entrenadores', icon: 'fa-solid fa-dumbbell' },
    { name: 'CLIENTES', path: '/clientes', icon: 'fa-solid fa-users' },
    { name: 'CALENDARIO', path: '/calendario', icon: 'fa-solid fa-calendar-check' },
    { name: 'FACTURACIÓN', path: '/facturas', icon: 'fa-solid fa-file-invoice' },
    { name: 'NOMINAS-ADMIN', path: '/admin/nominas', icon: 'fa-solid fa-file-invoice' },
  ];

  const trainerLinks = [
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
        style={{ backgroundColor: '#38C1A3' }}
        className={`fixed top-0 left-0 h-full w-64 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-y-auto shadow-2xl`}
      >
        <div className="p-6 flex flex-col items-center border-b border-white/10">
          <Link to="/" className="flex flex-col items-center gap-2 group">
            <div className="bg-white p-2 rounded-xl shadow-lg transition-transform group-hover:scale-110">
              <img src="/img/logopng.png" alt="Factomove Logo" className="h-10 w-auto" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tighter">Factomove</h2>
          </Link>
        </div>

        <div className="p-6 flex items-center gap-4 bg-white/10">
          <div 
            style={{ color: '#38C1A3' }}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden shadow-md"
          >
            {user.photo ? (
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold truncate text-white" title={user.name}>{user.name}</span>
            <span className="text-xs text-teal-50 uppercase tracking-widest font-semibold opacity-80">{user.role}</span>
          </div>
        </div>

        <nav className="grow py-4 px-2 space-y-1">
          {linksToShow.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive(link.path) 
                  ? 'bg-white shadow-lg scale-105 mx-2' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              style={isActive(link.path) ? { color: '#38C1A3' } : {}}
              onClick={() => setIsOpen(false)}
            >
              <i className={`${link.icon} w-5 text-center`}></i>
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-white/90 hover:bg-white/10 hover:text-white transition-all">
            <i className="fa-solid fa-house w-5 text-center"></i>
            <span>VOLVER</span>
          </Link>
          <Link to="/configuracion" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-white/90 hover:bg-white/10 hover:text-white transition-all">
            <i className="fa-solid fa-user-gear w-5 text-center"></i>
            <span>MI PERFIL</span>
          </Link>
          
          <form method="POST" action="/logout" className="m-0">
            <input type="hidden" name="_token" value={document.head.querySelector('meta[name="csrf-token"]')?.content || ''} />
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-white hover:bg-rose-500 transition-all text-left">
              <i className="fa-solid fa-right-from-bracket w-5 text-center"></i>
              <span>SALIR</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
