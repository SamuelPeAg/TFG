import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function GuidedTutorial() {
    const user = window.AppConfig?.user;
    
    // Solo mostramos a no administradores que no hayan completado el tutorial
    const shouldShow = user && !user.tutorial_completado && user.role !== 'admin';
    
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (shouldShow) {
            // Un pequeño delay para que la pantalla de inicio cargue antes de mostrar el modal
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [shouldShow]);

    const isClient = user?.role === 'cliente';
    const baseUrl = window.AppConfig?.baseUrl || '/';

    // Textos y configuraciones del modal guiado
    const stepsData = isClient ? [
        {
            title: "¡Bienvenido a Factomove!",
            text: "Estamos listos para empezar a monitorizar tu progreso. En este breve tutorial te explicaremos las bases.",
            icon: "logo"
        },
        {
            title: "Reservas y Calendario",
            text: "Cuando accedas a tu panel, recuerda que tienes la sección 'Calendario' para apuntarte a tus próximas clases.",
            icon: "fa-solid fa-calendar-check text-[#38C1A3]"
        },
        {
            title: "Tu Evolución",
            text: "En 'Mis Estadísticas' verás gráficos con tu progreso y en 'Mi Ficha' aparecerán los planes de tus entrenadores.",
            icon: "fa-solid fa-chart-line text-blue-500"
        },
        {
            title: "Cómo Acceder al Dashboard",
            text: "Para empezar a utilizar el sistema, simplemente tienes que darle al botón '¡Empezar!' o pulsar 'Dashboard' en la parte superior.",
            icon: "fa-solid fa-rocket text-indigo-400"
        }
    ] : [
        {
            title: "¡Bienvenido al Equipo!",
            text: "Como nuevo entrenador, Factomove centralizará tus sesiones y comunicación de forma sencilla.",
            icon: "logo"
        },
        {
            title: "Gestión de Sesiones",
            text: "Dentro del 'Calendario' podrás consultar quién asiste a tus clases y pasar asistencia desde cualquier dispositivo.",
            icon: "fa-solid fa-clipboard-check text-[#38C1A3]"
        },
        {
            title: "Comunicación y Notificaciones",
            text: "La pestaña 'Notificar' te permite gestionar incidencias con administración o enviar mensajes a tus compañeros rápidamente.",
            icon: "fa-solid fa-paper-plane text-blue-500"
        },
        {
            title: "Cómo Acceder al Dashboard",
            text: "Ya conoces lo básico. Para acceder finalmente a tu panel privado de trabajo, dale a '¡Empezar!' en este modal.",
            icon: "fa-solid fa-rocket text-indigo-400"
        }
    ];

    const completeTutorial = async () => {
        setLoading(true);
        try {
            await axios.post('/tutorial/complete');
            if (window.AppConfig?.user) {
                window.AppConfig.user.tutorial_completado = true;
            }
            setIsOpen(false);
        } catch (error) {
            console.error("Error al completar el tutorial", error);
            setIsOpen(false);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => {}}></div>
            
            <div className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header del modal */}
                <div className="bg-slate-900 p-6 text-white text-center rounded-t-3xl border-b-4 border-[#38C1A3] relative">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20 p-2 relative overflow-hidden">
                        {stepsData[step].icon === 'logo' ? (
                            <img src={`${baseUrl}img/logopng.png`} alt="Factomove" className="w-full h-full object-contain" />
                        ) : (
                            <i className={`${stepsData[step].icon} text-4xl drop-shadow-md`}></i>
                        )}
                    </div>
                    <h2 className="text-xl font-black tracking-tight">{stepsData[step].title}</h2>
                </div>

                {/* Contenido / Texto */}
                <div className="p-8 text-center min-h-[160px] flex items-center justify-center">
                    <p className="text-slate-600 font-medium text-[15px] leading-relaxed">
                        {stepsData[step].text}
                    </p>
                </div>

                {/* Footer (Navegación) */}
                <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-center gap-2 mb-2">
                        {stepsData.map((_, i) => (
                            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-[#38C1A3]' : 'w-2 bg-slate-200'}`}></div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {step > 0 ? (
                            <button 
                                onClick={() => setStep(step - 1)}
                                className="py-3 px-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors"
                            >
                                Atrás
                            </button>
                        ) : (
                            <button 
                                onClick={completeTutorial}
                                disabled={loading}
                                className="py-3 px-4 bg-white border border-slate-200 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors"
                            >
                                Saltar
                            </button>
                        )}

                        {step < stepsData.length - 1 ? (
                            <button 
                                onClick={() => setStep(step + 1)}
                                className="py-3 px-4 bg-[#38C1A3] text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#2fa38a] shadow-lg shadow-emerald-100 transition-all active:scale-95"
                            >
                                Siguiente <i className="fa-solid fa-arrow-right ml-1"></i>
                            </button>
                        ) : (
                            <button 
                                onClick={completeTutorial}
                                disabled={loading}
                                className="py-3 px-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-slate-800 shadow-xl disabled:opacity-50 transition-all active:scale-95"
                            >
                                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : '¡Empezar!'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
