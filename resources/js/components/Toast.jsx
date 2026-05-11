import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const config = {
        success: {
            icon: 'fa-circle-check',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-100',
            iconColor: 'text-emerald-500'
        },
        error: {
            icon: 'fa-circle-exclamation',
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            border: 'border-rose-100',
            iconColor: 'text-rose-500'
        },
        info: {
            icon: 'fa-circle-info',
            bg: 'bg-indigo-50',
            text: 'text-indigo-700',
            border: 'border-indigo-100',
            iconColor: 'text-indigo-500'
        }
    };

    const style = config[type] || config.success;

    return (
        <div className={`fixed top-8 right-8 z-[9999] animate-in fade-in slide-in-from-right-8 duration-500`}>
            <div className={`${style.bg} ${style.border} border p-4 pr-12 rounded-[1.5rem] shadow-2xl flex items-center gap-4 min-w-[300px] relative`}>
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg ${style.iconColor} shadow-sm`}>
                    <i className={`fa-solid ${style.icon}`}></i>
                </div>
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest opacity-50`}>{type}</p>
                    <p className={`text-sm font-black ${style.text}`}>{message}</p>
                </div>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
                {/* Barra de progreso de tiempo */}
                <div className="absolute bottom-0 left-0 h-1 bg-current opacity-10 rounded-b-full transition-all duration-[3000ms] w-0 animate-[progress_3s_linear]" style={{ animationName: 'toast-progress' }}></div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes toast-progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}} />
        </div>
    );
}
