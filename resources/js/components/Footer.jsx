import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
          {/* Columna 1: Branding */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/img/logopng.png" alt="Factomove" className="h-8 w-auto" />
              <span className="font-bold text-lg">Factomove</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              La solución completa para la gestión de centros y entrenadoras personales.
            </p>
          </div>

          {/* Columna 2: Producto */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm sm:text-base">Producto</h3>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><Link to="/" className="hover:text-brandTeal transition">Inicio</Link></li>
              <li><Link to="/contacto" className="hover:text-brandTeal transition">Contacto</Link></li>
              <li><Link to="/login" className="hover:text-brandTeal transition">Acceder</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm sm:text-base">Legal</h3>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><Link to="/aviso-legal" className="hover:text-brandTeal transition">Aviso Legal</Link></li>
              <li><Link to="/politica-privacidad" className="hover:text-brandTeal transition">Privacidad</Link></li>
              <li><Link to="/politica-cookies" className="hover:text-brandTeal transition">Cookies</Link></li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm sm:text-base">Contacto</h3>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li>
                <a href="mailto:factomove@arenadaw.com.es" className="hover:text-brandTeal transition break-all">
                  factomove@arenadaw.com.es
                </a>
              </li>

            </ul>
          </div>
        </div>

        {/* Social/Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">&copy; {new Date().getFullYear()} Factomove. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-brandTeal transition text-lg sm:text-base">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-brandTeal transition text-lg sm:text-base">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-brandTeal transition text-lg sm:text-base">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
