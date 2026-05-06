import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import EmpresaTable from '../components/EmpresaTable';
import CentroTable from '../components/CentroTable';
import TiposSesionTable from '../components/TiposSesionTable';
import TiposCreditoTable from '../components/TiposCreditoTable';
import PageHeader from '../components/PageHeader';

export default function Gestion() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.get('/api/gestion', { headers: { Accept: 'application/json' } });
      setData(res.data);
    } catch (err) {
      console.error('Error al cargar datos de gestión:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Error desconocido';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72 text-[0.85rem]">
        <PageHeader 
            title="Gestión de Configuración"
            subtitle="Empresas, Centros y Tipos de Sesión"
            icon="fa-solid fa-gears"
            onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="flex-1 overflow-auto px-6 sm:px-8 pb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
              <i className="fa-solid fa-spinner fa-spin text-3xl text-[#4BB7AE]"></i>
              <p className="font-medium animate-pulse">Cargando configuración...</p>
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
              <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
              <p className="font-medium text-center max-w-md">No se pudieron cargar los datos.</p>
              <p className="text-xs text-red-400 font-mono bg-red-50 px-4 py-2 rounded-lg max-w-xl text-center break-all">{errorMsg}</p>
              <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">Reintentar</button>
            </div>
          ) : !data ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
              <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
              <p className="font-medium">No hay datos disponibles.</p>
              <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">Reintentar</button>
            </div>
          ) : (
            <div className="w-full space-y-8 pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <EmpresaTable 
                  empresas={data.empresas || []} 
                  onUpdate={fetchData} 
                />
                <CentroTable 
                  centros={data.centros_list || []} 
                  empresas={data.empresas || []}
                  onUpdate={fetchData} 
                />
              </div>

              <div className="space-y-8">
                <TiposSesionTable 
                  tipos={data.tipos_sesion || []} 
                  centros={data.centros_list || []}
                  tiposCredito={data.tipos_credito || []}
                  onUpdate={fetchData}
                />
                <TiposCreditoTable
                  tipos={data.tipos_credito || []}
                  centros={data.centros_list || []}
                  tiposSesion={data.tipos_sesion || []}
                  onUpdate={fetchData}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
