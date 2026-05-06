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
      <div className="flex justify-center items-center py-16 sm:py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#38C1A3] mx-auto mb-3"></div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = window.AppConfig?.baseUrl || '/';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    if (cleanPath.startsWith('storage/')) return baseUrl + cleanPath;
    return baseUrl + 'storage/' + cleanPath;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="facto-table w-full border-collapse">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-4 py-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  onChange={onSelectAll} 
                  checked={users.length > 0 && users.every(u => selectedIds.includes(u.id))}
                  className="w-4 h-4 text-[#38C1A3] bg-white border-slate-300 rounded focus:ring-[#38C1A3] cursor-pointer"
                />
              </th>
              <th className="text-left px-6 py-4 text-xs font-black text-slate-900 uppercase tracking-wider">Cliente</th>
              <th className="text-left px-6 py-4 text-xs font-black text-slate-900 uppercase tracking-wider">Contacto</th>
              <th className="text-left px-6 py-4 text-xs font-black text-slate-900 uppercase tracking-wider">Identificación</th>
              <th className="text-left px-6 py-4 text-xs font-black text-slate-900 uppercase tracking-wider">Saldo / Suscripciones</th>
              <th className="text-center px-6 py-4 text-xs font-black text-slate-900 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => onSelectUser(user.id)}
                      className="w-4 h-4 text-[#38C1A3] bg-white border-slate-300 rounded focus:ring-[#38C1A3] cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div 
                          className="w-10 h-10 rounded-full bg-[#38C1A3] flex items-center justify-center text-white font-black text-sm overflow-hidden border border-slate-100"
                        >
                          {user.foto_de_perfil ? (
                            <img 
                              src={getImageUrl(user.foto_de_perfil)} 
                              alt={user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                            />
                          ) : null}
                          <span className={user.foto_de_perfil ? 'hidden' : ''}>
                            {user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${user.activo ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-700 text-sm truncate">{user.name}</p>
                        <p className={`text-[10px] font-bold uppercase ${user.activo ? 'text-[#38C1A3]' : 'text-rose-400'}`}>
                          {user.activo ? 'Activo' : 'Pendiente'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-600 font-medium truncate max-w-[180px]">{user.email}</span>
                      <span className="text-[10px] text-slate-400">Desde {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{user.dni || 'SIN DNI'}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">
                        {user.iban ? (user.iban.length > 8 ? `${user.iban.substring(0,4)}...${user.iban.substring(user.iban.length-4)}` : user.iban) : 'PENDIENTE'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                      {(user.suscripciones && user.suscripciones.length > 0) ? (
                        user.suscripciones.map((su) => {
                          const isMensual = su.suscripcion?.periodo === 'mensual';
                          const colorClass = isMensual ? 'bg-emerald-50 text-[#38C1A3] border-emerald-100' : 'bg-indigo-50 text-indigo-500 border-indigo-100';
                          const saldos = su.saldos_por_tipo ? Object.values(su.saldos_por_tipo) : [];
                          
                          if (saldos.length === 0) {
                            return (
                              <span key={su.id} className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold ${colorClass}`}>
                                {su.suscripcion?.nombre || 'PACK'}
                              </span>
                            );
                          }

                          return saldos.map((s, idx) => (
                            <div key={`${su.id}-${idx}`} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${colorClass}`}>
                              <span className="font-black text-xs">{s.total ?? 0}</span>
                              <span className="text-[8px] font-bold uppercase truncate max-w-[60px]">{s.tipo_credito?.nombre || 'PACK'}</span>
                            </div>
                          ));
                        })
                      ) : (
                        <span className="text-slate-300 text-[10px] font-bold italic">Sin saldo activo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => onShowFicha && onShowFicha(user)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all" title="Ver Ficha">
                        <i className="fa-solid fa-address-card text-xs"></i>
                      </button>
                      <button onClick={() => onEdit(user)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-teal-50 text-[#38C1A3] hover:bg-[#38C1A3] hover:text-white transition-all" title="Editar">
                        <i className="fa-solid fa-pen-to-square text-xs"></i>
                      </button>
                      {!user.activo && (
                        <button onClick={() => handleSendActivation(user)} disabled={sendingId === user.id} className="w-8 h-8 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all" title="Activar">
                          <i className={`fas ${sendingId === user.id ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-xs`}></i>
                        </button>
                      )}
                      <button onClick={() => onDelete(user)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all" title="Eliminar">
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center">
                  <p className="text-slate-400 font-medium text-sm">No se han encontrado clientes registrados.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden divide-y divide-slate-100">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => onSelectUser(user.id)}
                    className="w-4 h-4 text-[#38C1A3] bg-white border-slate-300 rounded focus:ring-[#38C1A3]"
                  />
                  <div className="w-10 h-10 rounded-full bg-[#38C1A3] flex items-center justify-center text-white font-black text-sm overflow-hidden">
                    {user.foto_de_perfil ? (
                      <img src={getImageUrl(user.foto_de_perfil)} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{user.name}</p>
                    <p className="text-[10px] text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => onEdit(user)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-50 text-[#38C1A3]"><i className="fa-solid fa-pen text-xs"></i></button>
                  <button onClick={() => onDelete(user)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500"><i className="fa-solid fa-trash text-xs"></i></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {user.suscripciones?.map((su, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                    {su.suscripcion?.nombre}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-slate-400 text-sm">No hay clientes.</div>
        )}
      </div>
    </div>
  );
}
