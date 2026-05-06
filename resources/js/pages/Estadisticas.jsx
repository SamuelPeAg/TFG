import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MapaEstadisticas from '../components/MapaEstadisticas';
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
import { Line, Doughnut, Bar } from 'react-chartjs-2';

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

export default function Estadisticas() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Responder a notificaciones
  const [replyModal, setReplyModal] = useState({ open: false, notifId: null, text: '' });
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.get('/api/estadisticas', { headers: { Accept: 'application/json' } });
      setData(res.data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Error desconocido';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyModal.text.trim()) return;
    setReplyLoading(true);
    try {
      await axios.post(`/api/admin/notificaciones/${replyModal.notifId}/reply`, { respuesta: replyModal.text });
      setReplyModal({ open: false, notifId: null, text: '' });
      fetchData();
    } catch (err) {
      console.error('Error al responder:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const colors = {
    turquesa: '#4BB7AE',
    rosa: '#EF5D7A',
    verdeClaro: '#A5EFE2',
    gris: '#959697',
    texto: '#53565A',
    amarillo: '#FFCE56'
  };

  const revenueChartData = {
    labels: data?.ingresos6Meses?.map(d => d.mes) || [],
    datasets: [{
      label: 'Ingresos (€)',
      data: data?.ingresos6Meses?.map(d => d.total) || [],
      borderColor: colors.turquesa,
      backgroundColor: 'rgba(75, 183, 174, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointBackgroundColor: colors.turquesa
    }]
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { bodyFont: { size: 14 }, titleFont: { size: 16 } }
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: colors.gris, font: { size: 12 } } },
      x: { ticks: { color: colors.gris, font: { size: 12 } } }
    }
  };

  const classesChartData = {
    labels: data?.popularidadClases?.map(d => d.nombre_clase) || [],
    datasets: [{
      data: data?.popularidadClases?.map(d => d.total) || [],
      backgroundColor: [colors.turquesa, colors.rosa, colors.verdeClaro, colors.gris, colors.amarillo],
      borderWidth: 0
    }]
  };

  const classesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: colors.texto, font: { size: 14, weight: 'bold' }, padding: 20 } },
      tooltip: { bodyFont: { size: 14 } }
    }
  };

  const sesionesChartData = {
    labels: data?.sesionesPorCentro?.map(d => d.centro) || [],
    datasets: [{
      label: 'Sesiones',
      data: data?.sesionesPorCentro?.map(d => d.total) || [],
      backgroundColor: [colors.turquesa, colors.rosa, colors.verdeClaro],
      borderRadius: 8
    }]
  };

  const clientesChartData = {
    labels: data?.clientesPorCentro?.map(d => d.centro) || [],
    datasets: [{
      label: 'Clientes',
      data: data?.clientesPorCentro?.map(d => d.total) || [],
      backgroundColor: [colors.turquesa, colors.rosa, colors.verdeClaro],
      borderRadius: 8
    }]
  };

  const ingresosChartData = {
    labels: data?.ingresosPorCentro?.map(d => d.centro) || [],
    datasets: [{
      label: 'Ingresos (€)',
      data: data?.ingresosPorCentro?.map(d => d.total) || [],
      backgroundColor: [colors.turquesa, colors.rosa, colors.verdeClaro],
      borderRadius: 8
    }]
  };

  const centerChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }, 
      tooltip: { 
        bodyFont: { size: 12 },
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw}`
        }
      } 
    },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 10 }, stepSize: 1 } },
      x: { ticks: { color: colors.gris, font: { size: 11 } } }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72 text-[0.85rem]">
        <PageHeader 
            title="Panel de Estadísticas"
            subtitle="Resumen general y métricas del gimnasio"
            icon="fa-solid fa-chart-line"
            onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 sm:px-8 pb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
              <i className="fa-solid fa-spinner fa-spin text-3xl text-[#4BB7AE]"></i>
              <p className="font-medium animate-pulse">Cargando estadísticas...</p>
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
              <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
              <p className="font-medium text-center max-w-md">No se pudieron cargar las estadísticas.</p>
              <p className="text-xs text-red-400 font-mono bg-red-50 px-4 py-2 rounded-lg max-w-xl text-center break-all">{errorMsg}</p>
              <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">Reintentar</button>
            </div>
          ) : !data ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
              <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
              <p className="font-medium">No se pudieron cargar las estadísticas. Verifica la base de datos o las migraciones.</p>
              <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">Reintentar</button>
            </div>
          ) : (
            <div className="w-full space-y-5">
              
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <Link to="/clientes" className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 border-l-4 hover:-translate-y-1 transition-transform border-[#4BB7AE]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg bg-[#4BB7AE]">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-[#959697] m-0">Clientes Totales</h3>
                    <p className="text-lg font-extrabold text-[#53565A] m-0">{data?.kpis?.totalClientes || 0}</p>
                  </div>
                </Link>

                <Link to="/entrenadores" className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 border-l-4 hover:-translate-y-1 transition-transform border-[#EF5D7A]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg bg-[#EF5D7A]">
                    <i className="fa-solid fa-dumbbell"></i>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-[#959697] m-0">Entrenadores</h3>
                    <p className="text-lg font-extrabold text-[#53565A] m-0">{data?.kpis?.totalEntrenadores || 0}</p>
                  </div>
                </Link>

                <Link to="/facturas" className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 border-l-4 hover:-translate-y-1 transition-transform border-[#A5EFE2]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#53565A] text-lg bg-[#A5EFE2]">
                    <i className="fa-solid fa-euro-sign"></i>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-[#959697] m-0">Ingresos del Mes</h3>
                    <p className="text-lg font-extrabold text-[#53565A] m-0">
                      {parseFloat(data?.kpis?.ingresosMes || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                    </p>
                  </div>
                </Link>

                <Link to="/calendario" className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 border-l-4 hover:-translate-y-1 transition-transform border-[#959697]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg bg-[#959697]">
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-[#959697] m-0">Sesiones del Mes</h3>
                    <p className="text-lg font-extrabold text-[#53565A] m-0">{data?.kpis?.sesionesMes || 0}</p>
                  </div>
                </Link>
              </div>

              {/* Gráficos 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm lg:col-span-2 flex flex-col h-[400px]">
                  <h2 className="text-base font-bold text-[#53565A] mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-chart-line text-[#4BB7AE]"></i> Ingresos Mensuales (Últimos 6 meses)
                  </h2>
                  <div className="flex-1 relative">
                    <Line data={revenueChartData} options={revenueChartOptions} />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm h-[400px] flex flex-col">
                  <h2 className="text-base font-bold text-[#53565A] mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-chart-pie text-[#EF5D7A]"></i> Clases Populares
                  </h2>
                  <div className="flex-1 relative">
                    <Doughnut data={classesChartData} options={classesChartOptions} />
                  </div>
                </div>
              </div>

              {/* Métricas por Centro */}
              <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                      <i className="fa-solid fa-layer-group"></i>
                    </div>
                    Rendimiento por Sede
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Sesiones por Centro */}
                  <div className="bg-slate-50/50 p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sesiones Totales</h3>
                      <i className="fa-solid fa-calendar-check text-[#4BB7AE]"></i>
                    </div>
                    <div className="h-44 relative">
                      <Bar data={sesionesChartData} options={centerChartOptions} />
                    </div>
                  </div>

                  {/* Clientes por Centro */}
                  <div className="bg-slate-50/50 p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes Activos</h3>
                      <i className="fa-solid fa-users text-[#EF5D7A]"></i>
                    </div>
                    <div className="h-44 relative">
                      <Bar data={clientesChartData} options={centerChartOptions} />
                    </div>
                  </div>

                  {/* Ingresos por Centro */}
                  <div className="bg-slate-50/50 p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos Acumulados</h3>
                      <i className="fa-solid fa-euro-sign text-[#A5EFE2]"></i>
                    </div>
                    <div className="h-44 relative">
                      <Bar data={ingresosChartData} options={centerChartOptions} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tablas Inferiores: Movimientos y Notificaciones */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Últimos Movimientos */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm h-[450px] flex flex-col overflow-hidden border border-slate-100">
                    <h2 className="text-base font-bold text-[#53565A] mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-clock-rotate-left text-[#959697]"></i> Últimos Pagos Registrados
                    </h2>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                          <thead className="border-b border-slate-100 text-[10px] text-[#959697] uppercase tracking-wider font-black">
                            <tr>
                              <th className="py-2 px-3">Fecha</th>
                              <th className="py-2 px-3">Cliente</th>
                              <th className="py-2 px-3">Clase</th>
                              <th className="py-2 px-3">Importe</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-[13px]">
                            {data?.ultimosPagos?.length === 0 && (
                              <tr><td colSpan="4" className="text-center py-10 text-slate-400 font-medium italic">Sin movimientos recientes</td></tr>
                            )}
                            {data?.ultimosPagos?.map(pago => (
                              <tr key={pago.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 px-3 font-bold text-slate-500">{pago.fecha}</td>
                                <td className="py-2.5 px-3 font-semibold text-slate-700">{pago.cliente}</td>
                                <td className="py-2.5 px-3">
                                  <span className="bg-[#4BB7AE]/10 text-[#4BB7AE] px-2 py-0.5 rounded-md font-bold text-[11px] uppercase">
                                      {pago.clase}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-black text-slate-800">
                                  {parseFloat(pago.importe).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                  </div>

                  {/* Notificaciones de Entrenadores */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm h-[450px] flex flex-col overflow-hidden border border-slate-100">
                    <h2 className="text-base font-bold text-[#53565A] mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-paper-plane text-blue-500"></i> Mensajes de Entrenadores
                      </div>
                      {data?.notificaciones?.filter(n => !n.leido).length > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                          {data.notificaciones.filter(n => !n.leido).length} pendientes
                        </span>
                      )}
                    </h2>
                    <div className="overflow-y-auto pr-1 space-y-3 flex-1 custom-scrollbar pb-2">
                      {data?.notificaciones?.length === 0 && (
                        <div className="text-center py-20 text-slate-400 font-medium italic">No hay notificaciones registradas.</div>
                      )}
                      {data?.notificaciones?.map(notif => (
                        <div key={notif.id} className={`p-4 rounded-2xl border transition-all ${notif.leido ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-white border-blue-100 shadow-sm shadow-blue-50 hover:border-blue-200'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                notif.tipo === 'incidencia' ? 'bg-rose-100 text-rose-600' : 
                                notif.tipo === 'clase' ? 'bg-amber-100 text-amber-600' : 
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {notif.tipo}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">{new Date(notif.created_at).toLocaleString()}</span>
                            </div>
                            {!notif.leido && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-200"></div>
                            )}
                          </div>
                          <h4 className="text-sm font-black text-slate-800 mb-1">{notif.titulo}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2 hover:line-clamp-none transition-all">{notif.mensaje}</p>
                          <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-extrabold text-slate-500">
                                {notif.entrenador?.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-[11px] font-bold text-slate-500">{notif.entrenador?.name}</span>
                            </div>
                            {!notif.leido ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setReplyModal({ open: true, notifId: notif.id, text: '' })}
                                  className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-700 hover:underline decoration-2 underline-offset-4"
                                >
                                  Contestar
                                </button>
                                <button 
                                  onClick={async () => {
                                    try {
                                      await axios.post(`/api/admin/notificaciones/${notif.id}/read`);
                                      fetchData();
                                    } catch (e) { console.error(e); }
                                  }}
                                  className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600"
                                >
                                  Marcar leída
                                </button>
                              </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {notif.respuesta && (
                                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md uppercase">Respondido</span>
                                    )}
                                    <span className="text-[9px] font-bold text-slate-400 italic">Leído</span>
                                </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>

              {/* Mapa de Sedes */}
              <div className="pt-4 pb-8">
                  <MapaEstadisticas centers={data?.centros_list || []} />
              </div>

            </div>
          )}
        </div>

        {/* Modal de Respuesta */}
        {replyModal.open && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReplyModal({ ...replyModal, open: false })}></div>
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black tracking-tight">Responder a Entrenador</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Comunicación oficial</p>
                        </div>
                        <button onClick={() => setReplyModal({ ...replyModal, open: false })} className="text-white/50 hover:text-white transition-colors">
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>
                    <form onSubmit={handleReplySubmit} className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tu Respuesta</label>
                            <textarea
                                value={replyModal.text}
                                onChange={(e) => setReplyModal({ ...replyModal, text: e.target.value })}
                                required
                                rows="5"
                                placeholder="Escribe aquí tu respuesta para el entrenador..."
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 resize-none"
                            ></textarea>
                        </div>
                        <button 
                            type="submit" 
                            disabled={replyLoading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {replyLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                            Enviar Respuesta
                        </button>
                    </form>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
