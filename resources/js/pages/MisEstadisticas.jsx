import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MisEstadisticas() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const user = window.AppConfig?.user || null;
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (user?.id) fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`/client-profile/${user.id}/statistics`);
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const colors = {
        primary: '#38C1A3',
        secondary: '#6366F1',
        tertiary: '#F43F5E',
        quaternary: '#F59E0B',
        bg: '#F8FAFC',
        card: '#FFFFFF'
    };

    // Datos Asistencia
    const attendanceChartData = {
        labels: stats?.attendance?.map(d => d.mes) || [],
        datasets: [{
            label: 'Clases asistidas',
            data: stats?.attendance?.map(d => d.total) || [],
            backgroundColor: colors.primary + '20',
            borderColor: colors.primary,
            borderWidth: 3,
            borderRadius: 12,
            hoverBackgroundColor: colors.primary
        }]
    };

    const attendanceChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1E293B',
                titleFont: { size: 14, weight: '900' },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 12,
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { display: false },
                ticks: { font: { weight: 'bold' }, color: '#94A3B8', stepSize: 1 }
            },
            x: {
                grid: { display: false },
                ticks: { font: { weight: 'bold' }, color: '#94A3B8' }
            }
        }
    };

    // Datos Tipos de Sesión
    const typesChartData = {
        labels: stats?.sessionTypes?.map(d => d.tipo_clase) || [],
        datasets: [{
            data: stats?.sessionTypes?.map(d => d.total) || [],
            backgroundColor: [colors.primary, colors.secondary, colors.tertiary, colors.quaternary],
            borderWidth: 0,
            hoverOffset: 12
        }]
    };

    const typesChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 25,
                    font: { size: 11, weight: 'bold' },
                    color: '#64748B'
                }
            }
        }
    };

    // Datos Evolución de Peso con Bandas de Salud
    const measurementsX = stats?.measurements?.map(m => new Date(m.measured_at).toLocaleDateString()) || [];
    
    // Plugin para dibujar las zonas de salud de fondo
    const healthZonesPlugin = {
        id: 'healthZones',
        beforeDraw: (chart) => {
            const { ctx, chartArea: { top, bottom, left, right }, scales: { y } } = chart;
            
            const drawZone = (min, max, color) => {
                const yMin = y.getPixelForValue(min);
                const yMax = y.getPixelForValue(max);
                ctx.fillStyle = color;
                ctx.fillRect(left, Math.max(yMax, top), right - left, Math.min(yMin - yMax, bottom - top));
            };

            // Definimos zonas estéticas (se podrían ajustar según altura del usuario si estuviera disponible)
            // Aquí usamos rangos de ejemplo para un usuario promedio
            drawZone(0, 60, '#F1F5F9');      // Zona baja
            drawZone(60, 80, '#F0FDF4');    // Zona Saludable (Verde suave)
            drawZone(80, 95, '#FFFBEB');    // Sobrepeso (Amarillo suave)
            drawZone(95, 200, '#FEF2F2');   // Alerta (Rojo suave)
        }
    };

    const healthChartData = {
        labels: measurementsX,
        datasets: [
            {
                label: 'Peso Corporal (kg)',
                data: stats?.measurements?.map(m => m.peso) || [],
                borderColor: '#6366F1',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                    return gradient;
                },
                fill: true,
                tension: 0.5,
                pointRadius: 6,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#6366F1',
                pointBorderWidth: 3,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#6366F1',
                pointHoverBorderColor: '#FFFFFF',
                pointHoverBorderWidth: 4,
            }
        ]
    };

    const healthChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { 
                backgroundColor: '#1E293B',
                padding: 16,
                cornerRadius: 16,
                titleFont: { size: 14, weight: '800' },
                bodyFont: { size: 13, weight: '600' },
                displayColors: false,
                callbacks: {
                    label: (context) => ` ${context.parsed.y} kg`
                }
            },
        },
        scales: {
            y: { 
                type: 'linear', 
                display: true, 
                grid: { color: '#F1F5F9', borderDash: [5, 5] },
                ticks: { 
                    font: { weight: 'bold', size: 11 }, 
                    color: '#94A3B8',
                    callback: (value) => value + ' kg'
                } 
            },
            x: { 
                grid: { display: false },
                ticks: { font: { weight: 'bold', size: 11 }, color: '#94A3B8' }
            }
        }
    };

    // Calcular si el último IMC es bajo
    const lastMeasurement = stats?.measurements?.[stats.measurements.length - 1];
    const isLowBMI = lastMeasurement && lastMeasurement.imc < 18.5;

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
                <PageHeader 
                    title="Mis Estadísticas"
                    subtitle="Análisis de rendimiento y actividad"
                    icon="fa-solid fa-chart-simple"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <div className="flex-1 overflow-auto p-6 lg:p-10">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto space-y-10">
                            
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                                    <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                                        <i className="fa-solid fa-calendar-check text-7xl"></i>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clases este Mes</p>
                                    <p className="text-4xl font-black text-[#38C1A3] tracking-tighter">{stats?.kpis?.clasesMes || 0}</p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="text-[10px] font-black bg-teal-50 text-[#38C1A3] px-2 py-0.5 rounded-lg">ACTIVO</span>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                                    <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                                        <i className="fa-solid fa-ticket-alt text-7xl"></i>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Créditos Totales</p>
                                    <p className="text-4xl font-black text-indigo-500 tracking-tighter">{stats?.kpis?.totalCredits || 0}</p>
                                    <p className="mt-4 text-[9px] font-black text-slate-400 uppercase">Suma de todos tus lotes activos</p>
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                                    <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                                        <i className="fa-solid fa-hourglass-half text-7xl"></i>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Próximo Vencimiento</p>
                                    <p className="text-4xl font-black text-rose-500 tracking-tighter">
                                        {stats?.kpis?.nextExpiration === 'N/A' ? 'N/A' : new Date(stats.kpis.nextExpiration).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    </p>
                                    <p className="mt-4 text-[9px] font-black text-slate-400 uppercase">Primer cierre de lote próximo</p>
                                </div>
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                
                                {/* Attendance Chart */}
                                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[450px] flex flex-col">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Progreso de Asistencia</h3>
                                            <p className="text-sm text-slate-400 font-bold italic">Últimos 6 meses de actividad real</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#38C1A3] flex items-center justify-center">
                                            <i className="fa-solid fa-chart-column"></i>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <Bar data={attendanceChartData} options={attendanceChartOptions} />
                                    </div>
                                </div>

                                {/* Session Types Chart */}
                                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[450px] flex flex-col items-center">
                                    <div className="w-full flex items-center justify-between mb-10">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Distribución por Tipo</h3>
                                            <p className="text-sm text-slate-400 font-bold italic">Tu enfoque habitual de entrenamiento</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                            <i className="fa-solid fa-circle-notch"></i>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full relative">
                                        <Doughnut data={typesChartData} options={typesChartOptions} />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Total Clases</span>
                                            <span className="text-3xl font-black text-slate-800">{stats?.sessionTypes?.reduce((acc, curr) => acc + curr.total, 0) || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Weight & IMC Evolution Chart */}
                                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[450px] flex flex-col xl:col-span-2">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                                <i className="fa-solid fa-weight-scale text-xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Evolución de Peso e IMC</h3>
                                                <p className="text-sm text-slate-400 font-bold italic">Tus registros físicos a lo largo del tiempo</p>
                                            </div>
                                        </div>
                                        {isLowBMI && (
                                            <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-2xl flex items-center gap-2 animate-pulse">
                                                <i className="fa-solid fa-circle-exclamation text-rose-500"></i>
                                                <span className="text-[10px] font-black text-rose-600 uppercase">IMC por debajo del rango ideal</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-h-[300px]">
                                        {stats?.measurements?.length > 1 ? (
                                            <Line data={healthChartData} options={healthChartOptions} plugins={[healthZonesPlugin]} />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                                <i className="fa-solid fa-chart-line text-4xl mb-2 opacity-20"></i>
                                                <p className="text-xs font-bold uppercase tracking-widest">Registra más pesos en "Mi Ficha" para ver la gráfica</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* Trajectory & Subscription History */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-4 bg-[#6366F1] p-10 rounded-[3rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                                    <i className="fa-solid fa-history absolute -bottom-10 -right-10 text-[15rem] opacity-10"></i>
                                    <h3 className="text-xl font-black mb-2 relative z-10">Mi Trayectoria</h3>
                                    <p className="text-indigo-100 text-sm font-bold mb-8 relative z-10 opacity-80">Desde que te uniste a nosotros</p>
                                    
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                                                <i className="fa-solid fa-star"></i>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-100/60 uppercase">Día de Alta</p>
                                                <p className="font-black text-lg">{stats?.kpis?.primerDia || '---'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                                                <i className="fa-solid fa-trophy"></i>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-100/60 uppercase">Tiempo con nosotros</p>
                                                <p className="font-black text-lg">{stats?.kpis?.mesesTotales || 0} Meses</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight mb-8">Historial de Planes</h3>
                                    <div className="space-y-4">
                                        {stats?.subscriptionHistory?.map((h, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center font-black">
                                                        {h.nombre.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 text-sm">{h.nombre}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">Iniciado el {h.fecha_inicio}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black text-slate-500 bg-slate-200/50 px-2 py-1 rounded-lg uppercase">
                                                        {h.meses} Meses
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Credit Batches Detail (linked to DB) */}
                            <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight mb-8">Detalle de mis Créditos (Activos)</h3>
                                
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lote ID</th>
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Inicial</th>
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Disponible</th>
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Caducidad</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {stats?.creditBatches?.length > 0 ? (
                                                stats.creditBatches.map(batch => (
                                                    <tr key={batch.id} className="group hover:bg-slate-50/50 transition-all">
                                                        <td className="py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">#{batch.id}</div>
                                                                <span className="text-sm font-bold text-slate-600 uppercase tracking-tighter">Créditos de entrenamiento</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-5 text-center text-sm font-bold text-slate-400">{batch.cantidad_inicial}</td>
                                                        <td className="py-5 text-center">
                                                            <span className={`text-sm font-black ${batch.cantidad_actual > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>{batch.cantidad_actual}</span>
                                                        </td>
                                                        <td className="py-5 text-right">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-slate-700">{new Date(batch.fecha_vencimiento).toLocaleDateString()}</span>
                                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">A las 23:59</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="py-20 text-center">
                                                        <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">Sin lotes de crédito disponibles</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden space-y-3">
                                    {stats?.creditBatches?.length > 0 ? (
                                        stats.creditBatches.map(batch => (
                                            <div key={batch.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">#{batch.id}</div>
                                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">Créditos</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Caducidad</p>
                                                        <p className="text-xs font-black text-slate-700">{new Date(batch.fecha_vencimiento).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Inicial</p>
                                                        <p className="text-lg font-black text-slate-800">{batch.cantidad_inicial}</p>
                                                    </div>
                                                    <div className="flex-1 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                                        <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Disponible</p>
                                                        <p className="text-lg font-black text-indigo-600">{batch.cantidad_actual}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Sin lotes disponibles</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
