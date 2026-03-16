import { Link } from 'react-router-dom'

export default function Header() {
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
              <Link to="/login" className="text-gray-700 dark:text-gray-200 font-bold hover:text-brandTeal transition">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
