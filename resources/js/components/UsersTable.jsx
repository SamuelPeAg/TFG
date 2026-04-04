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
      if (onAlert) onAlert('Error al enviar el correo de activación.', true, 'Error');
      else alert('Error al enviar el correo de activación.');
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
          <tr className="text-slate-400">
            <th className="text-left px-4 py-4 w-12">
              <input 
                type="checkbox" 
                onChange={onSelectAll} 
                checked={users.length > 0 && users.every(u => selectedIds.includes(u.id))}
                className="w-4 h-4 text-[#38C1A3] bg-slate-100 border-slate-300 rounded focus:ring-[#38C1A3] focus:ring-2 cursor-pointer"
              />
            </th>
            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-50">Cliente</th>
            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-50">Contacto</th>
            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-50">Clasificación</th>
            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-50">IBAN / Identificación</th>
            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-50">Saldo / Suscripciones</th>
            <th className="text-center px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-50">Acciones</th>
          </tr>
        </thead>
        <tbody className="space-y-2">
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className="bg-white hover:bg-slate-50 transition-all duration-300 group shadow-sm hover:shadow-md rounded-2xl overflow-hidden">
                <td className="px-4 py-5 first:rounded-l-2xl">
                  <input 
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => onSelectUser(user.id)}
                    className="w-4 h-4 text-[#38C1A3] bg-slate-100 border-slate-300 rounded focus:ring-[#38C1A3] focus:ring-2 cursor-pointer"
                  />
                </td>
                <td className="px-6 py-5" data-label="Cliente">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#38C1A3] to-[#2D9B82] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-100 group-hover:scale-110 transition-transform duration-300">
                        {user.foto_de_perfil ? (
                            <img 
                            src={`/storage/${user.foto_de_perfil}`} 
                            alt={user.name}
                            className="w-full h-full object-cover rounded-2xl"
                            onError={(e) => e.target.style.display = 'none'}
                            />
                        ) : (
                            <span>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${user.activo ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-rose-400'}`} title={user.activo ? 'Activado' : 'Pendiente'}></div>
                    </div>
                    <div>
                        <span className="font-black text-slate-800 text-sm block tracking-tight">{user.name}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${user.activo ? 'text-[#38C1A3]' : 'text-rose-400'}`}>
                            {user.activo ? 'Alumno Activo' : 'Pendiente de Alta'}
                        </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5" data-label="Clasificación">
                  <div className="flex flex-col gap-1">
                    {user.empresa && (
                        <div className="flex items-center gap-2">
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-tighter">
                                {user.empresa.nombre}
                            </span>
                        </div>
                    )}
                    {user.centro && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <i className="fa-solid fa-building text-[9px]"></i>
                            <span className="text-[10px] font-bold uppercase">{user.centro.nombre}</span>
                        </div>
                    )}
                    {!user.empresa && !user.centro && (
                        <span className="text-[10px] text-slate-300 font-bold italic">SIN CLASIFICAR</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5" data-label="Contacto">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{user.email}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Registrado el {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-5" data-label="IBAN">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-credit-card text-slate-300 text-xs"></i>
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 group-hover:bg-slate-100 transition-colors">
                        {user.iban || 'PENDIENTE'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5" data-label="Saldo">
                  {(user.suscripciones && user.suscripciones.length > 0) ? (
                    <div className="flex flex-wrap gap-2">
                      {user.suscripciones.map((su) => {
                        const isMensual = su.suscripcion?.periodo === 'mensual';
                        const badgeColor = isMensual ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white';
                        return (
                          <div key={su.id} className="group/saldo flex items-center bg-slate-50 border border-slate-100 rounded-xl px-2 py-1 gap-2 shadow-sm">
                            <span className={`${badgeColor} w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm`}>
                              {su.saldo_actual}
                            </span> 
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                              {su.suscripcion?.nombre || 'PACK'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                         <div className="w-1 h-1 bg-slate-200 rounded-full"></div> Sin Saldo
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 last:rounded-r-2xl" data-label="Acciones">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onShowFicha && onShowFicha(user)}
                      className="w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                      title="Ver Ficha Completa"
                    >
                      <i className="fa-solid fa-address-card"></i>
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="w-10 h-10 flex items-center justify-center rounded-2xl bg-teal-50 text-[#38C1A3] hover:bg-[#38C1A3] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                      title="Editar Perfil"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
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
