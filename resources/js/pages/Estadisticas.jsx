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
    rojo: '#EF5D7A',
    verdeClaro: '#A5EFE2',
    gris: '#53565A',
    texto: '#1e293b',
    fondo: '#f8fafc'
  };

  // 1. Gráfica Multi-Centro Revenue
  const revenueChartData = {
    labels: data?.multiCenterRevenue?.[0]?.data?.map(d => d.mes) || [],
    datasets: data?.multiCenterRevenue?.map((c, idx) => ({
      label: c.centro,
      data: c.data.map(d => d.total),
      borderColor: [colors.turquesa, colors.rojo, '#3b82f6', colors.gris][idx % 4],
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 6
    })) || []
  };

  // 2. Gráfica Churn (Nuevos vs Inactivos)
  const churnChartData = {
    labels: data?.churnData?.map(d => d.mes) || [],
    datasets: [
      {
        label: 'Nuevos Clientes',
        data: data?.churnData?.map(d => d.altas) || [],
        borderColor: colors.turquesa,
        backgroundColor: colors.turquesa + '20',
        fill: true,
        tension: 0.4,
        borderWidth: 3
      },
      {
        label: 'Inactividad Detectada',
        data: data?.churnData?.map(d => d.bajas) || [],
        borderColor: colors.rojo,
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        borderWidth: 2
      }
    ]
  };

  // 3. Eficiencia de Ocupación
  const occupancyChartData = {
    labels: data?.occupancyByClass?.map(d => d.nombre) || [],
    datasets: [{
      label: 'Ocupación (%)',
      data: data?.occupancyByClass?.map(d => d.ratio) || [],
      backgroundColor: data?.occupancyByClass?.map(d => 
        d.ratio > 80 ? colors.turquesa : (d.ratio > 50 ? colors.verdeClaro : colors.gris + '40')
      ),
      borderRadius: 12
    }]
  };

  // 4. Popularidad de Planes (Doughnut)
  const popularityChartData = {
    labels: data?.subscriptionPopularity?.map(d => d.nombre) || [],
    datasets: [{
      data: data?.subscriptionPopularity?.map(d => d.total) || [],
      backgroundColor: [colors.turquesa, colors.rojo, '#3b82f6', '#f59e0b', '#8b5cf6', colors.gris],
      borderWidth: 0,
      hoverOffset: 15
    }]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10, weight: '900' }, usePointStyle: true, boxWidth: 6, color: '#64748b' } },
      tooltip: { 
        padding: 12, 
        backgroundColor: '#1e293b', 
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 12
      }
    },
    scales: {
      y: { grid: { display: true, color: '#f1f5f9' }, ticks: { font: { size: 10 }, color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8' } }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
        <PageHeader 
            title="Panel de Gestión"
            subtitle="Estadísticas generales y rendimiento de centros"
            icon="fa-solid fa-chart-simple"
            onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 pb-12 pt-6 space-y-8">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Cargando métricas...</p>
             </div>
          ) : errorMsg ? (
             <div className="bg-white p-12 rounded-[3rem] text-center shadow-xl shadow-slate-200/50 border border-slate-100 max-w-2xl mx-auto">
                <i className="fa-solid fa-triangle-exclamation text-5xl text-rose-500 mb-6"></i>
                <h3 className="text-xl font-black text-slate-800 mb-2">Error de Sincronización</h3>
                <button onClick={fetchData} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Reintentar</button>
             </div>
          ) : (
            <>
              {/* KPIs Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Clientes Totales', value: data.kpis.totalClientes, icon: 'fa-users', color: 'bg-[#4BB7AE]', link: '/clientes' },
                  { label: 'Staff / Coaches', value: data.kpis.totalEntrenadores, icon: 'fa-dumbbell', color: 'bg-[#A5EFE2] !text-[#53565A]', link: '/entrenadores' },
                  { label: 'Ingresos del Mes', value: `${parseFloat(data.kpis.ingresosMes).toLocaleString()}€`, icon: 'fa-euro-sign', color: 'bg-[#53565A]', link: '/facturas' },
                  { label: 'Sesiones Totales', value: data.kpis.sesionesMes, icon: 'fa-calendar-check', color: 'bg-[#EF5D7A]', link: '/calendario' }
                ].map((kpi, idx) => (
                  <Link to={kpi.link} key={idx} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 ${kpi.color} text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-inherit/20`}>
                        <i className={`fa-solid ${kpi.icon}`}></i>
                      </div>
                      <i className="fa-solid fa-chevron-right text-slate-200 group-hover:text-slate-400 transition-colors"></i>
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-tighter mb-1">{kpi.label}</h3>
                      <p className="text-3xl font-black text-[#53565A] tracking-tighter">{kpi.value}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Main Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Comparison */}
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
                  <div className="mb-8">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Ingresos por Centro</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Comparativa histórica de facturación</p>
                  </div>
                  <div className="flex-1 relative">
                    <Line data={revenueChartData} options={commonOptions} />
                  </div>
                </div>

                {/* Churn Analysis */}
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
                  <div className="mb-8">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Evolución de Clientes</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Análisis de retención y nuevos usuarios</p>
                  </div>
                  <div className="flex-1 relative">
                    <Line data={churnChartData} options={commonOptions} />
                  </div>
                </div>
              </div>

              {/* Occupancy and Customer Care */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Occupancy Bar */}
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-[500px] lg:col-span-2">
                  <div className="mb-8">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Ocupación de Clases</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Clases con mayor ratio de asistencia</p>
                  </div>
                  <div className="flex-1 relative">
                    <Bar data={occupancyChartData} options={{...commonOptions, indexAxis: 'y'}} />
                  </div>
                </div>

                {/* Subscription Popularity */}
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-[500px]">
                  <div className="mb-8">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Distribución de Planes</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Suscripciones más contratadas (Activas)</p>
                  </div>
                  <div className="flex-1 relative flex items-center justify-center">
                    <div className="w-full h-full max-h-[250px]">
                      <Doughnut 
                        data={popularityChartData} 
                        options={{
                          ...commonOptions,
                          cutout: '70%',
                          plugins: {
                            ...commonOptions.plugins,
                            legend: {
                              position: 'bottom',
                              labels: { padding: 20, font: { size: 9, weight: 'bold' } }
                            }
                          }
                        }} 
                      />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-3xl font-black text-slate-800">{data?.subscriptionPopularity?.reduce((a, b) => a + b.total, 0) || 0}</span>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Activas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions and Coach Messages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Last Transactions */}
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-lg font-black text-[#53565A] tracking-tight">Últimos Pagos</h3>
                      <Link to="/facturas" className="text-[10px] font-black text-[#4BB7AE] uppercase tracking-widest hover:underline transition-colors">Historial</Link>
                    </div>
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-4 py-4">Cliente</th>
                            <th className="px-4 py-4">Clase</th>
                            <th className="px-4 py-4 text-right">Importe</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {data.ultimosPagos.map(pago => (
                            <tr key={pago.id} className="group hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200">
                                    {pago.foto ? <img src={pago.foto} className="w-full h-full object-cover" /> : pago.cliente.charAt(0)}
                                  </div>
                                  <span className="text-xs font-bold text-[#53565A]">{pago.cliente}</span>
                                </div>
                              </td>
                              <td className="px-4 py-5">
                                <span className="px-3 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-[10px] font-black uppercase">{pago.clase}</span>
                              </td>
                              <td className="px-4 py-5 text-right">
                                 <span className="text-sm font-black text-[#4BB7AE]">+{parseFloat(pago.importe).toFixed(2)}€</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Coach Messages (REINSTATED) */}
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-lg font-black text-[#53565A] tracking-tight">Mensajes del Staff</h3>
                      {data.notificaciones?.filter(n => !n.leido).length > 0 && (
                        <span className="bg-[#4BB7AE] text-white text-[10px] px-2 py-0.5 rounded-full">
                          {data.notificaciones.filter(n => !n.leido).length} nuevos
                        </span>
                      )}
                    </div>
                    <div className="overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                      {data.notificaciones?.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 text-sm font-bold italic">No hay mensajes recientes</div>
                      ) : (
                        data.notificaciones.map(notif => (
                          <div key={notif.id} className={`p-5 rounded-3xl border transition-all ${notif.leido ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-[#A5EFE2] shadow-sm shadow-blue-50'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(notif.created_at).toLocaleDateString()}</span>
                                {!notif.leido && <div className="w-2 h-2 rounded-full bg-[#4BB7AE]"></div>}
                            </div>
                            <h4 className="text-sm font-black text-[#53565A] mb-1">{notif.titulo}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-4">{notif.mensaje}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                                    {notif.entrenador?.name?.charAt(0)}
                                  </div>
                                  <span className="text-[11px] font-black text-slate-500">{notif.entrenador?.name}</span>
                                </div>
                                {!notif.leido && (
                                  <button 
                                    onClick={() => setReplyModal({ open: true, notifId: notif.id, text: '' })}
                                    className="text-[10px] font-black uppercase text-[#4BB7AE] hover:underline"
                                  >
                                    Responder
                                  </button>
                                )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
              </div>
            </>
          )}
        </div>

        {/* Modal de Respuesta (Mantenido) */}
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
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-[#4BB7AE]/10 focus:border-[#4BB7AE] outline-none transition-all placeholder:text-slate-300 resize-none"
                            ></textarea>
                        </div>
                        <button 
                            type="submit" 
                            disabled={replyLoading}
                            className="w-full py-4 bg-[#4BB7AE] hover:bg-[#3da199] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
