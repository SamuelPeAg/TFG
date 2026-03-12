import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import axios from 'axios';
import '../../css/global.css';
import '../../css/calendario.css';

// Modales
import ModalDetalleEvento from '../components/modals/ModalDetalleEvento';
import ModalNuevaClase from '../components/modals/ModalNuevaClase';

export default function Calendario() {
    const [events, setEvents] = useState([]);
    const [centros, setCentros] = useState([]);
    const [selectedCentro, setSelectedCentro] = useState(localStorage.getItem('factomove_preferred_center') || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estados para modales
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [initialWizardDate, setInitialWizardDate] = useState(null);

    const calendarRef = useRef(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const response = await axios.get('/calendario', { headers: { 'Accept': 'application/json' } });
            setCentros(response.data.centros || []);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchEvents = async (fetchInfo, successCallback, failureCallback) => {
        setLoading(true);
        try {
            const response = await axios.get('/usuarios/Pagos', {
                params: {
                    start: fetchInfo.startStr,
                    end: fetchInfo.endStr,
                    centro: selectedCentro,
                    q: searchTerm
                }
            });
            successCallback(response.data.events);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            failureCallback(error);
            setLoading(false);
        }
    };

    const handleCentroChange = (e) => {
        const val = e.target.value;
        setSelectedCentro(val);
        localStorage.setItem('factomove_preferred_center', val);
        if (calendarRef.current) {
            calendarRef.current.getApi().refetchEvents();
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (calendarRef.current) {
                calendarRef.current.getApi().refetchEvents();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleEventClick = (info) => {
        setSelectedEvent(info.event);
        setIsDetailModalOpen(true);
    };

    const handleDateClick = (info) => {
        setInitialWizardDate(info.date);
        setIsWizardOpen(true);
    };

    const handleRefresh = () => {
        if (calendarRef.current) {
            calendarRef.current.getApi().refetchEvents();
        }
    };

    return (
        <div className="main-content">
            <div className="header-controls">
                <div className="title-section">
                    <h1>Historial de Pagos</h1>
                </div>

                <div className="controls-bar">
                    <div className="filters-group" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexGrow: 1, maxWidth: '600px' }}>
                        <div className="search-box" style={{ flex: 1 }}>
                            <i className="fa-solid fa-house-medical"></i>
                            <div className="search-anchor">
                                <select 
                                    id="filter-center" 
                                    className="modern-select-no-border" 
                                    style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', color: '#374151', fontSize: '14px' }}
                                    value={selectedCentro}
                                    onChange={handleCentroChange}
                                >
                                    <option value="">Todos los centros</option>
                                    {centros.map(c => (
                                        <option key={c.id} value={c.nombre}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="search-box" style={{ flex: 1.5 }}>
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <div className="search-anchor">
                                <input 
                                    type="text" 
                                    placeholder="Buscar usuario..." 
                                    autoComplete="off" 
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>
                    </div>

                    <button type="button" className="btn-design btn-solid-custom" onClick={() => { setInitialWizardDate(new Date()); setIsWizardOpen(true); }}>
                        <i className="fa-solid fa-plus"></i> <span>NUEVA CLASE</span>
                    </button>
                </div>
            </div>

            <section className="calendar-layout">
                <div className="calendar-panel">
                    <div className="calendar-container">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView={window.innerWidth < 768 ? "timeGridDay" : "timeGridWeek"}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            locale={esLocale}
                            firstDay={1}
                            slotMinTime="06:00:00"
                            slotMaxTime="23:00:00"
                            allDaySlot={false}
                            height="auto"
                            events={fetchEvents}
                            eventClick={handleEventClick}
                            dateClick={handleDateClick}
                            windowResize={(arg) => {
                                const api = calendarRef.current.getApi();
                                const newView = window.innerWidth < 768 ? "timeGridDay" : "timeGridWeek";
                                if (api.view.type !== newView) {
                                    api.changeView(newView);
                                }
                            }}
                        />
                    </div>
                    <div id="calendar-summary" className="calendar-summary">
                        {loading ? (
                            <p><i className="fa-solid fa-spinner fa-spin"></i> Cargando clases...</p>
                        ) : (
                            <p><i className="fa-solid fa-circle-info"></i> Haz clic en el calendario para añadir una clase o selecciona una existente.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Modales */}
            {isDetailModalOpen && (
                <ModalDetalleEvento 
                    event={selectedEvent} 
                    onClose={() => setIsDetailModalOpen(false)} 
                    onRefresh={handleRefresh}
                />
            )}

            {isWizardOpen && (
                <ModalNuevaClase 
                    initialDate={initialWizardDate} 
                    centros={centros}
                    defaultCentro={selectedCentro}
                    onClose={() => setIsWizardOpen(false)} 
                    onRefresh={handleRefresh}
                />
            )}
        </div>
    );
}
