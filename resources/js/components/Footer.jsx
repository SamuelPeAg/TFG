import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="w-full bg-gray-900 text-white py-10 border-t border-gray-800 transition-colors duration-300 flex justify-center">
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">

                <div className="w-full flex flex-col md:flex-row justify-center md:justify-around lg:justify-center lg:gap-32 items-center md:items-start text-center">

                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center gap-2 justify-center">
                            <img src="/img/logopng.png" alt="Factomove Logo" className="h-6 w-auto brightness-0 invert" />
                            <span className="font-bold text-xl tracking-tight">Factomove</span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">
                            Simplificando la gestión de usuarios y potenciando tu bienestar.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <a href="https://www.instagram.com/movertedavida/?hl=es" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brandCoral hover:text-white transition-all duration-300">
                                <i className="fa-brands fa-instagram text-sm"></i>
                            </a>
                            <a href="https://movertedavida.com/cordoba/" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brandTeal hover:text-white transition-all duration-300" title="Web Oficial">
                                <i className="fa-solid fa-globe text-sm"></i>
                            </a>
                            <a href="https://www.facebook.com/movertedavida/?locale=es_ES" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                                <i className="fa-brands fa-facebook text-sm"></i>
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <h4 className="font-bold text-base text-white mb-4">Navegación</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link to="/" className="hover:text-brandTeal transition">Inicio</Link></li>
                            <li><a href="https://movertedavida.com/cordoba/" target="_blank" rel="noreferrer" className="hover:text-brandTeal transition">Nosotros</a></li>
                            <li><Link to="/contacto" className="hover:text-brandTeal transition">Contacto</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col items-center">
                        <h4 className="font-bold text-base text-white mb-4">Centros Moverte</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><a href="https://movertedavida.com/cordoba/" target="_blank" rel="noreferrer" className="hover:text-brandTeal transition">Córdoba</a></li>
                            <li><a href="https://movertedavida.com/puente-genil/" target="_blank" rel="noreferrer" className="hover:text-brandTeal transition">Puente Genil</a></li>
                            <li><a href="https://movertedavida.com/granada/" target="_blank" rel="noreferrer" className="hover:text-brandTeal transition">Granada</a></li>
                        </ul>
                    </div>

                    <div className="flex flex-col items-center">
                        <h4 className="font-bold text-base text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link to="/politica-cookies" className="hover:text-brandCoral transition">Política de Cookies</Link></li>
                            <li><Link to="/politica-privacidad" className="hover:text-brandCoral transition">Política de Privacidad</Link></li>
                            <li><Link to="/aviso-legal" className="hover:text-brandCoral transition">Aviso Legal</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="w-full mt-12 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Factomove. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}