import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const user = window.AppConfig?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <nav className="fixed w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm transition-all duration-300 top-0 border-b border-transparent dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center">
          
          <div className="shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1 sm:gap-2">
              <img 
                src={`${window.AppConfig?.baseUrl || '/'}img/logopng.png`} 
                alt="Factomove Logo" 
                className="h-8 sm:h-10 w-auto" 
              />
              <span className="hidden sm:block font-bold text-base sm:text-lg text-gray-900 dark:text-white">Factomove</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            {isHome && (
              <>
                <Link to="/contacto" className="text-gray-600 dark:text-gray-300 hover:text-brandTeal font-medium transition text-sm lg:text-base">
                  Contacto
                </Link>
                <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-brandTeal font-medium transition text-sm lg:text-base">
                  Inicio
                </Link>
              </>
            )}
            
            <div className="flex items-center gap-3 lg:gap-4 ml-4 border-l pl-4 lg:pl-6 border-gray-200 dark:border-gray-700">
              {user ? (
                <>
                  <div className="flex items-center gap-2 mr-2">
                    {user.photo ? (
                      <img src={user.photo} alt="Avatar" className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#38C1A3] text-white flex items-center justify-center font-bold text-xs lg:text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs lg:text-sm font-bold text-gray-700 dark:text-gray-200 hidden lg:block">
                      Hola, {user.name.split(' ')[0]}
                    </span>
                  </div>
                  <Link to="/calendario" className="bg-[#38C1A3] hover:bg-teal-500 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-full font-bold text-sm transition shadow-md hover:shadow-lg whitespace-nowrap">
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 dark:text-gray-200 font-bold hover:text-[#38C1A3] transition px-3 text-sm">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="bg-[#38C1A3] hover:bg-teal-500 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-full font-bold transition shadow-md hover:shadow-lg flex items-center gap-1 lg:gap-2 text-sm whitespace-nowrap">
                    <i className="fa-solid fa-user-plus text-xs lg:text-sm"></i>
                    <span>Crear Cuenta</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl text-gray-600 dark:text-gray-300`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {isHome && (
              <>
                <Link 
                  to="/contacto" 
                  className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-brandTeal font-medium text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contacto
                </Link>
                <Link 
                  to="/" 
                  className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-brandTeal font-medium text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inicio
                </Link>
              </>
            )}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 flex items-center gap-2">
                    {user.photo ? (
                      <img src={user.photo} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#38C1A3] text-white flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      Hola, {user.name.split(' ')[0]}
                    </span>
                  </div>
                  <Link 
                    to="/calendario" 
                    className="block w-full bg-[#38C1A3] hover:bg-teal-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm text-center transition shadow-md hover:shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 font-bold hover:text-[#38C1A3] text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    to="/register" 
                    className="block w-full bg-[#38C1A3] hover:bg-teal-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm text-center transition shadow-md hover:shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Crear Cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
