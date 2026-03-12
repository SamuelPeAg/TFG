import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/global.css';

export default function Pagos() {
    const [type, setType] = useState('user'); // 'user' or 'trainer'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const [allUsers, setAllUsers] = useState([]);
    const [allTrainers, setAllTrainers] = useState([]);

    useEffect(() => {
        axios.get('/Pagos', { headers: { 'Accept': 'application/json' } }).then(res => {
            setAllUsers(res.data.users || []);
            setAllTrainers(res.data.entrenadores || []);
        });
    }, []);

    const handleSearchChange = (e) => {
        const q = e.target.value;
        setSearchTerm(q);
        if (q.length < 1) {
            setSuggestions([]);
            return;
        }

        const data = type === 'user' ? allUsers : allTrainers;
        const filtered = data.filter(u =>
            u.name.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 10);
        setSuggestions(filtered);
    };

    const selectPerson = (u) => {
        setSelectedId(u.id);
        setSearchTerm(u.name);
        setSuggestions([]);
    };

    const handleGenerateReport = async () => {
        if (!selectedId) {
            alert('Debes seleccionar una persona de la lista.');
            return;
        }
        if (!dateStart || !dateEnd) {
            alert('Selecciona un rango de fechas.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get('/Pagos/reporte', {
                params: {
                    type,
                    id: selectedId,
                    start: dateStart,
                    end: dateEnd
                }
            });
            setResults(res.data);
        } catch (error) {
            console.error(error);
            alert('Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content">
            <div className="header-section" style={{ marginBottom: '30px', textAlign: 'left' }}>
                <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800, color: '#333' }}>Panel de Reportes</h1>
                <p className="page-subtitle" style={{ color: '#6b7280' }}>Consulta histórica detallada por persona</p>
            </div>

            {/* Selector de Tipo */}
            <div className="selection-cards" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div 
                    className={`card-type ${type === 'user' ? 'active' : ''}`} 
                    onClick={() => { setType('user'); setSelectedId(null); setSearchTerm(''); setResults(null); }}
                    style={{ 
                        flex: 1, padding: '24px', background: 'white', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', 
                        border: type === 'user' ? '2px solid #0e7490' : '2px solid transparent',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', transition: '0.2s'
                    }}
                >
                    <div style={{ fontSize: '24px', marginBottom: '10px', color: type === 'user' ? '#0e7490' : '#9ca3af' }}>
                        <i className="fa-solid fa-user"></i>
                    </div>
                    <div style={{ fontWeight: 700 }}>Buscar Alumno</div>
                </div>
                <div 
                    className={`card-type ${type === 'trainer' ? 'active' : ''}`} 
                    onClick={() => { setType('trainer'); setSelectedId(null); setSearchTerm(''); setResults(null); }}
                    style={{ 
                        flex: 1, padding: '24px', background: 'white', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', 
                        border: type === 'trainer' ? '2px solid #0e7490' : '2px solid transparent',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', transition: '0.2s'
                    }}
                >
                    <div style={{ fontSize: '24px', marginBottom: '10px', color: type === 'trainer' ? '#0e7490' : '#9ca3af' }}>
                        <i className="fa-solid fa-dumbbell"></i>
                    </div>
                    <div style={{ fontWeight: 700 }}>Buscar Entrenador</div>
                </div>
            </div>

            {/* Panel de Búsqueda */}
            <div className="control-panel" style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '30px', textAlign: 'left' }}>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '20px', alignItems: 'end' }}>
                    <div className="input-group search-group" style={{ position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' }}>
                            {type === 'user' ? 'BUSCAR ALUMNO' : 'BUSCAR ENTRENADOR'}
                        </label>
                        <div className="search-wrapper" style={{ position: 'relative' }}>
                            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '16px', top: '14px', color: '#9ca3af' }}></i>
                            <input 
                                type="text" 
                                className="modern-input" 
                                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none' }}
                                placeholder="Escribe el nombre..." 
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            {suggestions.length > 0 && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', zIndex: 100, marginTop: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                                    {suggestions.map(s => (
                                        <div key={s.id} onClick={() => selectPerson(s)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}>
                                            {s.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' }}>DESDE</label>
                        <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' }}>HASTA</label>
                        <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    </div>

                    <button 
                        onClick={handleGenerateReport} 
                        style={{ background: '#0e7490', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt"></i>} GENERAR REPORTE
                    </button>
                </div>
            </div>

            {/* Resultados */}
            {results && (
                <div className="results-section" style={{ textAlign: 'left' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Resultados para: <span style={{ color: '#0e7490', fontWeight: 800 }}>{results.persona}</span></h3>

                    <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        <div className="metric-card" style={{ padding: '24px', background: 'white', borderRadius: '16px', borderLeft: '6px solid #0e7490', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 600 }}>Total Sesiones</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>{results.resumen.sesiones}</div>
                        </div>
                        <div className="metric-card" style={{ padding: '24px', background: 'white', borderRadius: '16px', borderLeft: '6px solid #be123c', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 600 }}>Importe Total</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#be123c' }}>€{results.resumen.total}</div>
                        </div>
                    </div>

                    <div className="data-table-container" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <tr>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#6b7280' }}>FECHA</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#6b7280' }}>CLASE</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#6b7280' }}>CENTRO</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#6b7280' }}>ALUMNO / DETALLE</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#6b7280' }}>MÉTODO</th>
                                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 800, color: '#6b7280' }}>IMPORTE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.detalles.map((d, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '16px', fontSize: '14px' }}>{d.fecha}</td>
                                        <td style={{ padding: '16px', fontSize: '14px' }}>{d.clase}</td>
                                        <td style={{ padding: '16px', fontSize: '14px' }}>{d.centro}</td>
                                        <td style={{ padding: '16px', fontSize: '14px' }}>{d.alumno}</td>
                                        <td style={{ padding: '16px', fontSize: '14px' }}>{d.metodo}</td>
                                        <td style={{ padding: '16px', fontSize: '14px', textAlign: 'right', fontWeight: 700 }}>€{Number(d.importe).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
