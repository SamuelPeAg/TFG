import React, { useState } from 'react';
import axios from 'axios';

export default function UsersTable({ users, onEdit, onDelete, onShowFicha, loading, onUpdate, selectedIds = [], onSelectUser, onSelectAll, onAlert }) {
  const [sendingId, setSendingId] = useState(null);

  const handleSendActivation = async (user) => {
    setSendingId(user.id);
    try {
      await axios.post(`/users/${user.id}/send-activation`);
      if (onAlert) onAlert('Correo de activación enviado correctamente a ' + user.email, false, 'Enviado');
      else alert('Correo de activación enviado correctamente a ' + user.email);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error al enviar el correo de activación.';
      alert(msg);
    } finally {
      setSendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#38C1A3]/20 border-t-[#38C1A3] rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cargando registros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container bg-transparent overflow-hidden">
      <table className="facto-table w-full border-separate border-spacing-y-2 px-4">
        <thead>
          <tr className="text-slate-900">
            <th className="text-left px-4 py-4 w-12">
              <input 
                type="checkbox" 
                onChange={onSelectAll} 
                checked={users.length > 0 && users.every(u => selectedIds.includes(u.id))}
                className="w-4 h-4 text-[#38C1A3] bg-slate-100 border-slate-300 rounded focus:ring-[#38C1A3] focus:ring-2 cursor-pointer"
              />
            </th>
            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest w-[25%]">Cliente</th>
            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest w-[20%]">Contacto</th>
            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest w-[15%]">Identificación</th>
            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest w-[25%]">Saldo / Suscripciones</th>
            <th className="text-center px-6 py-4 text-[10px] font-black uppercase tracking-widest w-[15%]">Acciones</th>
          </tr>
        </thead>
        <tbody className="space-y-3">
          {users.length > 0 ? (
            users.map((user) => {
              const getImageUrl = (path) => {
                if (!path) return null;
                if (path.startsWith('http')) return path;
                const baseUrl = window.AppConfig?.baseUrl || '/';
                const cleanPath = path.startsWith('/') ? path.substring(1) : path;
                if (cleanPath.startsWith('storage/')) return baseUrl + cleanPath;
                return baseUrl + 'storage/' + cleanPath;
              };

              return (
                <tr key={user.id} className="bg-white hover:bg-slate-50 transition-all duration-500 group shadow-sm hover:shadow-xl hover:shadow-slate-200/20 rounded-[2rem] overflow-hidden">
                  <td className="px-5 py-6 first:rounded-l-[2rem]">
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => onSelectUser(user.id)}
                        className="w-5 h-5 text-[#38C1A3] bg-slate-50 border-slate-200 rounded-lg focus:ring-[#38C1A3] focus:ring-offset-0 cursor-pointer transition-all"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-6" data-label="Cliente">
                    <div className="flex items-center gap-5">
                      <div className="relative shrink-0">
                          <div 
                            className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-100/50 group-hover:scale-110 group-hover:rotate-2 transition-all duration-500 overflow-hidden relative border-2 border-white"
                            style={{ background: 'linear-gradient(135deg, #38C1A3, #2D9B82)' }}
                          >
                            {user.foto_de_perfil ? (
                              <img 
                                src={getImageUrl(user.foto_de_perfil)} 
                                alt={user.name}
                                className="w-full h-full object-cover absolute inset-0 z-10"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span className="relative z-0 pointer-events-none opacity-40">
                              {user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-[3px] border-white rounded-full ${user.activo ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-rose-400'} z-20 transition-transform group-hover:scale-125`} title={user.activo ? 'Activado' : 'Pendiente'}></div>
                      </div>
                      <div className="min-w-0">
                          <span className="font-black text-slate-800 text-base block tracking-tight truncate max-w-[200px]">{user.name}</span>
                          <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-lg border ${user.activo ? 'text-[#38C1A3] bg-teal-50 border-teal-100/50' : 'text-rose-400 bg-rose-50 border-rose-100/50'}`}>
                              {user.activo ? 'Alumno Activo' : 'Pendiente Alta'}
                          </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6" data-label="Contacto">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                          <span className={`text-xs font-black transition-colors uppercase tracking-tight ${user.email && user.email.includes('factomove.es') ? 'text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100/50 flex items-center gap-2' : 'text-slate-500 group-hover:text-slate-900 truncate max-w-[180px]'}`}>
                              {user.email && user.email.includes('factomove.es') && <i className="fa-solid fa-user-secret text-[10px] animate-pulse"></i>}
                              {user.email}
                          </span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Desde {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6" data-label="Identificación">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-fingerprint text-slate-200 text-[10px]"></i>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.dni || 'SIN DNI'}</span>
                      </div>
                      <div className="flex items-center gap-2 group/iban cursor-help">
                        <i className="fa-solid fa-credit-card text-slate-300 text-[10px]"></i>
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 group-hover/iban:bg-indigo-50 group-hover/iban:text-indigo-600 group-hover/iban:border-indigo-100 transition-all">
                            {user.iban ? (user.iban.length > 8 ? `${user.iban.substring(0,4)}...${user.iban.substring(user.iban.length-4)}` : user.iban) : 'PENDIENTE'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6" data-label="Saldo">
                    <div className="flex flex-wrap gap-2 max-w-[280px]">
                      {(user.suscripciones && user.suscripciones.length > 0) ? (
                        user.suscripciones.map((su) => {
                          const isMensual = su.suscripcion?.periodo === 'mensual';
                          const badgeBase = isMensual ? 'bg-emerald-50 border-emerald-100 text-[#38C1A3]' : 'bg-indigo-50 border-indigo-100 text-indigo-500';
                          const saldos = su.saldos_por_tipo ? Object.values(su.saldos_por_tipo) : [];
                          
                          if (saldos.length === 0) {
                              return (
                                <div key={su.id} className={`flex items-center border rounded-xl px-2.5 py-1.5 gap-2 shadow-sm ${badgeBase}`}>
                                  <span className="font-black text-lg leading-none">0</span> 
                                  <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">
                                    {su.suscripcion?.nombre || 'PACK'}
                                  </span>
                                </div>
                              );
                          }

                          return saldos.map((s, idx) => (
                            <div key={`${su.id}-${idx}`} className={`flex items-center border rounded-2xl px-3 py-2 gap-2.5 shadow-sm hover:scale-105 transition-all ${badgeBase}`}>
                              <span className="font-black text-xl leading-none">
                                {s.total ?? 0}
                              </span> 
                              <div className="flex flex-col leading-none">
                                <span className="text-[8px] font-black uppercase tracking-[0.1em] opacity-60">CRÉDITOS</span>
                                <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[80px]" title={s.tipo_credito?.nombre}>
                                  {s.tipo_credito?.nombre || 'PACK'}
                                </span>
                              </div>
                            </div>
                          ));
                        })
                      ) : (
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 border-dashed">
                             <div className="w-2 h-2 bg-slate-200 rounded-full"></div> 
                             <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Sin Saldo Activo</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6 last:rounded-r-[2rem]" data-label="Acciones">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => onShowFicha && onShowFicha(user)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all duration-300 hover:scale-110 shadow-sm border border-indigo-100/50"
                        title="Ver Ficha Completa"
                      >
                        <i className="fa-solid fa-address-card text-lg"></i>
                      </button>
                      <button
                        onClick={() => onEdit(user)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-teal-50 text-[#38C1A3] hover:bg-[#38C1A3] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm border border-teal-100/50"
                        title="Editar Perfil"
                      >
                        <i className="fa-solid fa-pen-to-square text-lg"></i>
                      </button>
                    {!user.activo && (
                      <button
                        onClick={() => handleSendActivation(user)}
                        disabled={sendingId === user.id}
                        className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300 hover:scale-110 shadow-sm ${sendingId === user.id ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-600 hover:text-white'}`}
                        title="Enviar Email de Activación"
                      >
                        <i className={`fas ${sendingId === user.id ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(user)}
                      className="w-10 h-10 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                      title="Archivar / Eliminar"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                    <i className="fas fa-users text-slate-200 text-2xl"></i>
                  </div>
                  <p className="text-slate-400 font-medium">No se han encontrado clientes registrados.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
