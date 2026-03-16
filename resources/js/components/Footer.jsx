import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Columna 1: Branding */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/img/logopng.png" alt="Factomove" className="h-8 w-auto" />
              <span className="font-bold text-lg">Factomove</span>
            </div>
            <p className="text-gray-400 text-sm">
              La solución completa para la gestión de centros y entrenadoras personales.
            </p>
          </div>

          {/* Columna 2: Producto */}
          <div>
            <h3 className="font-bold text-white mb-4">Producto</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-brandTeal transition">Inicio</Link></li>
              <li><Link to="/contacto" className="hover:text-brandTeal transition">Contacto</Link></li>
              <li><Link to="/login" className="hover:text-brandTeal transition">Acceder</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h3 className="font-bold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/aviso-legal" className="hover:text-brandTeal transition">Aviso Legal</Link></li>
              <li><Link to="/politica-privacidad" className="hover:text-brandTeal transition">Privacidad</Link></li>
              <li><Link to="/politica-cookies" className="hover:text-brandTeal transition">Cookies</Link></li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="font-bold text-white mb-4">Contacto</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="mailto:hola@factomove.com" className="hover:text-brandTeal transition">
                  hola@factomove.com
                </a>
              </li>
              <li>
                <a href="tel:+34912345678" className="hover:text-brandTeal transition">
                  +34 912 345 678
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social/Bottom */}
        <div className="border-t border-gray-800 pt-8 flex justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Factomove. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-brandTeal transition">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-brandTeal transition">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-brandTeal transition">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
