import { Link } from 'react-router-dom'

export default function Header() {
  const user = window.AppConfig?.user;

  return (
    <nav className="fixed w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm transition-all duration-300 top-0 border-b border-transparent dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          <div className="shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img src="/img/logopng.png" alt="Factomove Logo" className="h-10 w-auto" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">Factomove</span>
            </Link>
          </div>

          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/contacto" className="text-gray-600 dark:text-gray-300 hover:text-brandTeal font-medium transition">
              Contacto
            </Link>

            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-brandTeal font-medium transition">
              Inicio
            </Link>
            
            <div className="flex items-center gap-4 ml-4 border-l pl-6 border-gray-200 dark:border-gray-700">
              {user ? (
                <>
                  <div className="flex items-center gap-2 mr-2">
                    {user.photo ? (
                      <img src={user.photo} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#38C1A3] text-white flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hidden lg:block">
                      Hola, {user.name.split(' ')[0]}
                    </span>
                  </div>
                  <Link to="/calendario" className="bg-[#38C1A3] hover:bg-teal-500 text-white px-5 py-2.5 rounded-full font-bold transition shadow-md hover:shadow-lg">
                    Dashboard
                  </Link>
                </>
              ) : (
                <Link to="/login" className="text-gray-700 dark:text-gray-200 font-bold hover:text-[#38C1A3] transition">
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
