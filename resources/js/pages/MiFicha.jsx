import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

export default function MiFicha() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = window.AppConfig?.user;
  const [profileData, setProfileData] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchFicha();
  }, [user]);

  const fetchFicha = async () => {
    try {
        const res = await axios.get(`/client-profile/${user.id}`);
        setProfileData(res.data.user);
        setFiles(res.data.files);
    } catch (error) {
        console.error("Error fetching ficha:", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 lg:pl-72">
        <header className="px-10 py-8 flex items-center justify-between bg-white border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-6">
                <button className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3]" onClick={() => setIsSidebarOpen(true)}>
                    <i className="fa-solid fa-bars text-xl"></i>
                </button>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#38C1A3] to-[#2D9B82] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-teal-100">
                    <i className="fa-solid fa-address-card"></i>
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mi Ficha y Salud</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">Consulta tu historial y documentos</p>
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-auto p-10 space-y-10">
            {loading ? (
                <div className="h-full flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-[#38C1A3]/20 border-t-[#38C1A3] rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* INFO COL */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                            <div className="text-center pb-6 border-b border-slate-50">
                                <div className="w-20 h-20 rounded-full bg-slate-50 mx-auto flex items-center justify-center text-3xl font-black text-[#38C1A3] mb-4 border-2 border-slate-100">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="font-black text-slate-800 text-lg">{user.name}</h2>
                                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">{profileData?.dni || 'DNI No asignado'}</p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Información de Contacto</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <i className="fa-solid fa-envelope text-slate-300 w-5"></i>
                                        <span className="text-slate-600 font-medium truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <i className="fa-solid fa-location-dot text-slate-300 w-5"></i>
                                        <span className="text-slate-600 font-medium">{profileData?.direccion || '---'}, {profileData?.ciudad || ''}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <i className="fa-solid fa-truck-ramp-box text-slate-300 w-5"></i>
                                        <span className="text-slate-600 font-medium">CP: {profileData?.codigo_postal || '---'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Atributos */}
                        <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100/50 space-y-4">
                            <h3 className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest">Notas Especiales</h3>
                            <div className="space-y-3">
                                {profileData?.additional_attributes?.length > 0 ? (
                                    profileData.additional_attributes.map((attr, i) => (
                                        <div key={i} className="flex flex-col">
                                            <span className="text-[10px] font-black text-emerald-700/60 uppercase">{attr.key}</span>
                                            <span className="text-sm font-bold text-slate-800">{attr.value}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 italic">No hay notas adicionales.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* FILES COL */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex-1 min-h-[500px]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                    Mis Documentos
                                    <span className="bg-slate-100 text-slate-400 text-xs px-2 py-0.5 rounded-full">{files.length}</span>
                                </h3>
                            </div>

                            {files.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-slate-50">
                                    <i className="fa-regular fa-folder-open text-3xl text-slate-200 mb-3"></i>
                                    <p className="text-slate-400 font-bold text-sm">Aún no se han compartido documentos contigo.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {files.map(file => (
                                        <div key={file.id} className="p-5 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 border border-transparent hover:border-slate-100 transition-all group">
                                            <div className="flex items-start justify-between">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                                    <i className={file.file_type === 'pdf' ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image'}></i>
                                                </div>
                                                <a 
                                                   href={`/client-file/${file.id}/download`}
                                                   className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-[#38C1A3] shadow-sm flex items-center justify-center transition-colors"
                                                   title="Descargar"
                                                >
                                                    <i className="fa-solid fa-download text-xs text-info"></i>
                                                </a>
                                            </div>
                                            <div className="mt-4">
                                                <h4 className="font-black text-slate-800 text-sm truncate" title={file.file_name}>{file.file_name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Subido por: {file.uploader?.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                </div>
            )}
        </div>
      </main>
    </div>
  );
}
