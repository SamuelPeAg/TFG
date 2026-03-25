import React from 'react';

export default function UsersTable({ users, onEdit, onDelete, onManageSubscriptions, onShowFicha, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandTeal"></div>
      </div>
    );
  }

  return (
    <div className="table-container bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="facto-table w-full border-collapse">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Cliente</th>
            <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Email</th>
            <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">IBAN</th>
            <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Saldo</th>
            <th className="text-center px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                <td className="px-6 py-4" data-label="Cliente">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-full bg-[#38C1A3] flex items-center justify-center text-white font-black text-sm relative overflow-hidden shadow-sm"
                    >
                      {user.foto_de_perfil ? (
                        <img 
                          src={`/storage/${user.foto_de_perfil}`} 
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={user.foto_de_perfil ? 'hidden' : ''}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-bold text-slate-700">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium" data-label="Email">
                  {user.email}
                </td>
                <td className="px-6 py-4" data-label="IBAN">
                  <span className="font-mono text-sm text-slate-500 bg-slate-50 px-2 py-1 rounded">
                    {user.iban || '---'}
                  </span>
                </td>
                <td className="px-6 py-4" data-label="Saldo">
                  {(user.suscripciones && user.suscripciones.length > 0) ? (
                    <div className="flex flex-col gap-1.5">
                      {user.suscripciones.map((su) => {
                        const isMensual = su.suscripcion?.periodo === 'mensual';
                        const badgeColor = isMensual ? 'bg-emerald-500 border-emerald-600' : 'bg-amber-500 border-amber-600';
                        return (
                          <div key={su.id} className="text-[10px] flex items-center gap-2 group/saldo">
                            <span className={`${badgeColor} text-white px-2 py-0.5 rounded-lg border font-black shadow-sm min-w-[24px] text-center`}>
                              {su.saldo_actual}
                            </span> 
                            <span className="text-slate-500 font-bold uppercase tracking-tight">
                              {su.suscripcion?.nombre || 'Suscripción'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic font-medium">Sin saldo</span>
                  )}
                </td>
                <td className="px-6 py-4" data-label="Acciones">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onShowFicha && onShowFicha(user)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300"
                      title="Ver Ficha Cliente"
                    >
                      <i className="fas fa-address-card text-sm"></i>
                    </button>
                    <button
                      onClick={() => onManageSubscriptions && onManageSubscriptions(user)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#4BB7AE] text-white hover:bg-[#3f9c94] transition-all duration-300 shadow-sm"
                      title="Gestionar Suscripciones"
                    >
                      <i className="fas fa-ticket-alt text-sm"></i>
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-50 text-[#38C1A3] hover:bg-[#38C1A3] hover:text-white transition-all duration-300"
                      title="Editar cliente"
                    >
                      <i className="fas fa-pencil-alt text-sm"></i>
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-[#EF5D7A] hover:bg-[#EF5D7A] hover:text-white transition-all duration-300"
                      title="Eliminar cliente"
                    >
                      <i className="fas fa-trash-alt text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-20 text-center">
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
