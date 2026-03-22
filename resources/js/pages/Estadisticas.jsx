import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/estadisticas', { headers: { Accept: 'application/json' } });
        setData(res.data);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
      } finally {
        setLoading(false);
      }
    };
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

  const centerChartData = {
    labels: data?.sesionesPorCentro?.map(d => d.centro) || [],
    datasets: [{
      label: 'Sesiones',
      data: data?.sesionesPorCentro?.map(d => d.total) || [],
      backgroundColor: [colors.turquesa, colors.rosa, colors.verdeClaro, colors.gris],
      borderRadius: 8
    }]
  };

  const centerChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { bodyFont: { size: 14 } } },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 12 } } },
      x: { ticks: { color: colors.gris, font: { size: 12 } } }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72 text-[0.85rem]">
        {/* Header */}
        <header className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3] rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setIsSidebarOpen(true)}>
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Panel de Estadísticas</h1>
              <p className="text-slate-400 mt-1 font-medium text-sm">Resumen general y métricas del gimnasio</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 sm:px-8 pb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
              <i className="fa-solid fa-spinner fa-spin text-3xl text-[#4BB7AE]"></i>
              <p className="font-medium animate-pulse">Cargando estadísticas...</p>
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
                    <p className="text-lg font-extrabold text-[#53565A] m-0">{data.kpis.totalClientes}</p>
                  </div>
                </Link>

                <Link to="/entrenadores" className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 border-l-4 hover:-translate-y-1 transition-transform border-[#EF5D7A]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg bg-[#EF5D7A]">
                    <i className="fa-solid fa-dumbbell"></i>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-[#959697] m-0">Entrenadores</h3>
                    <p className="text-lg font-extrabold text-[#53565A] m-0">{data.kpis.totalEntrenadores}</p>
                  </div>
                </Link>

                <Link to="/facturas" className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 border-l-4 hover:-translate-y-1 transition-transform border-[#A5EFE2]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#53565A] text-lg bg-[#A5EFE2]">
                    <i className="fa-solid fa-euro-sign"></i>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-[#959697] m-0">Ingresos del Mes</h3>
                    <p className="text-lg font-extrabold text-[#53565A] m-0">
                      {parseFloat(data.kpis.ingresosMes || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                    </p>
                  </div>
                </Link>

                <Link to="/calendario" className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 border-l-4 hover:-translate-y-1 transition-transform border-[#959697]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg bg-[#959697]">
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-[#959697] m-0">Sesiones del Mes</h3>
                    <p className="text-lg font-extrabold text-[#53565A] m-0">{data.kpis.sesionesMes}</p>
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

              {/* Gráficos 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm h-[350px] flex flex-col">
                  <h2 className="text-base font-bold text-[#53565A] mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-house-medical text-[#A5EFE2]"></i> Sesiones por Centro
                  </h2>
                  <div className="flex-1 relative">
                    <Bar data={centerChartData} options={centerChartOptions} />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm h-[350px] flex flex-col overflow-hidden">
                  <h2 className="text-base font-bold text-[#53565A] mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-clock-rotate-left text-[#959697]"></i> Últimos Pagos Registrados
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-100 text-xs text-[#959697] uppercase">
                        <tr>
                          <th className="py-2 px-3">Fecha</th>
                          <th className="py-2 px-3">Cliente</th>
                          <th className="py-2 px-3">Clase</th>
                          <th className="py-2 px-3">Importe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm">
                        {data.ultimosPagos?.length === 0 && (
                          <tr><td colSpan="4" className="text-center py-4 text-slate-400">Sin movimientos recientes</td></tr>
                        )}
                        {data.ultimosPagos?.map(pago => (
                          <tr key={pago.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-slate-600">{pago.fecha}</td>
                            <td className="py-2.5 px-3">{pago.cliente}</td>
                            <td className="py-2.5 px-3">
                              <span className="bg-[#4BB7AE]/10 text-[#4BB7AE] px-2 py-0.5 rounded-md font-medium text-xs">
                                  {pago.clase}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-700">
                              {parseFloat(pago.importe).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
