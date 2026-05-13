import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function VistaTarjetas({ centroFiltro, userFiltro, onlyMyClasses, onClickEvent }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Carga eventos desde hoy hasta los próximos 30 días
        const today = new Date();
        const start = today.toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);
        const end = nextMonth.toISOString().split('T')[0];
        
        const baseUrl = window.AppConfig?.baseUrl || '/';
        let url = `${baseUrl}traer-clases-calendario?start=${start}&end=${end}`;
        if (centroFiltro) url += `&centro=${encodeURIComponent(centroFiltro)}`;
        if (userFiltro) url += `&q=${encodeURIComponent(userFiltro)}`;
        if (onlyMyClasses) url += `&only_my_classes=1`;

        axios.get(url)
            .then(res => {
                setEvents(res.data.events || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [centroFiltro, userFiltro, onlyMyClasses]);

    if(loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-[#4BB7AE]"></i>
                <p className="font-medium animate-pulse">Cargando clases disponibles...</p>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-2xl mb-4">
                    <i className="fa-regular fa-calendar-xmark"></i>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">No hay clases programadas</h3>
                <p className="text-slate-500 text-sm">No se encontraron sesiones para los próximos 30 días.</p>
            </div>
        );
    }

    const grouped = events.reduce((acc, ev) => {
        const dateStr = ev.start.split('T')[0]; // YYYY-MM-DD
        if(!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(ev);
        return acc;
    }, {});

    const onClickButton = (ev) => {
        if(onClickEvent) onClickEvent(ev);
    }

    return (
        <div className="w-full space-y-8 pb-10">
            {Object.keys(grouped).sort().map(date => {
                const dayEvents = grouped[date];
                const dateObj = new Date(date + "T00:00:00");
                const dayNameStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                const dayName = dayNameStr.charAt(0).toUpperCase() + dayNameStr.slice(1);
                const dayNum = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

                return (
                    <div key={date}>
                        <h3 className="font-black text-slate-800 text-lg mb-4 border-b border-slate-200 pb-2 flex items-baseline gap-2">
                            <span>{dayName}</span>
                            <span className="text-slate-400 text-sm font-semibold">{dayNum}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {dayEvents.map(ev => {
                                const props = ev.extendedProps;
                                const isJoined = Array.isArray(props.alumnos) && props.alumnos.some(a => a.id === window.AppConfig?.user?.id);
                                return (
                                    <div key={ev.groupId} 
                                         className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all flex flex-col relative overflow-hidden group cursor-pointer"
                                         onClick={() => onClickButton(ev)}>
                                        <div className="absolute top-0 left-0 w-2 h-full" style={{backgroundColor: ev.backgroundColor}}></div>
                                        
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-slate-800 text-lg sm:text-xl leading-none tracking-tight">{props.clase_nombre}</h4>
                                            {isJoined && (
                                                <span className="bg-[#4BB7AE]/10 text-[#4BB7AE] text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">APUNTADO</span>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                                                <i className="fa-regular fa-clock mr-1 text-slate-400"></i> {props.hora}
                                            </span>
                                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                                                <i className="fa-solid fa-location-dot mr-1 text-slate-400"></i> {props.centro}
                                            </span>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                                            <div className="flex -space-x-2 relative z-10 w-full max-w-[120px]">
                                                {(Array.isArray(props.alumnos) ? props.alumnos : []).slice(0, 3).map((a, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm">
                                                        {a.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                                {Array.isArray(props.alumnos) && props.alumnos.length > 3 && (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                                                        +{props.alumnos.length - 3}
                                                    </div>
                                                )}
                                                {(!Array.isArray(props.alumnos) || props.alumnos.length === 0) && (
                                                    <span className="text-xs font-semibold text-slate-400 italic">0 asistentes</span>
                                                )}
                                            </div>
                                            
                                            <button className="px-5 py-2.5 bg-slate-900 border border-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest group-hover:bg-[#4BB7AE] group-hover:border-[#4BB7AE] group-hover:-translate-y-0.5 group-hover:shadow-md transition-all">
                                                DETALLES
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
