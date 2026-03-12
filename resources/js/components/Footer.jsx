import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer-premium bg-[#0b1120] text-white pt-32 pb-16 overflow-hidden">
            <div className="container-custom relative">
                {/* Decorative blob */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brandTeal/5 blur-[120px] rounded-full -z-10"></div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
                    
                    {/* COL 1: BRAND */}
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center p-2.5">
                                <img src="/img/logopng.png" alt="F" className="h-full w-auto" />
                            </div>
                            <span className="font-black text-3xl tracking-tighter">
                                Facto<span className="text-brandTeal">move</span>
                            </span>
                        </div>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                            La plataforma definitiva para centros de alto rendimiento que buscan automatizar su gestión y potenciar el rendimiento de sus usuarios.
                        </p>
                        
                        <div className="flex gap-4 mt-8">
                            {['instagram', 'facebook', 'linkedin'].map(social => (
                                <a 
                                    key={social} 
                                    href="#" 
                                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl hover:bg-brandTeal hover:text-white transition-all duration-300"
                                >
                                    <i className={`fa-brands fa-${social}`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* COL 2: NAV */}
                    <div className="md:col-span-2">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-brandTeal mb-8">Navegación</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Inicio</Link></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Características</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Precios</a></li>
                            <li><a href="/contacto" className="text-gray-400 hover:text-white transition-colors">Contacto</a></li>
                        </ul>
                    </div>

                    {/* COL 3: CENTROS */}
                    <div className="md:col-span-2">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-brandCoral mb-8">Centros</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Córdoba</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Granada</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Puente Genil</a></li>
                        </ul>
                    </div>

                    {/* COL 4: LEGAL */}
                    <div className="md:col-span-3">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-8">Legal</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Términos de Servicio</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacidad</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a></li>
                        </ul>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="pt-16 border-t border-white/5 flex flex-col md:row items-center justify-between gap-8">
                    <p className="text-gray-500 text-sm font-medium">
                        &copy; {new Date().getFullYear()} Factomove System. Diseñado para la excelencia.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-brandTeal animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Server Status: Online</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
