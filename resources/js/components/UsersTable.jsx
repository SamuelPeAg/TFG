import React from 'react';

export default function UsersTable({ users, onEdit, onDelete, loading }) {
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
            <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Firma</th>
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
                      className="w-10 h-10 rounded-full bg-linear-to-br from-[#38C1A3] to-[#E65C9C] flex items-center justify-center text-white font-black text-sm relative overflow-hidden shadow-sm"
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
                <td className="px-6 py-4" data-label="Firma">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.firma_digital ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {user.firma_digital ? 'VINCULADA' : 'PENDIENTE'}
                  </span>
                </td>
                <td className="px-6 py-4" data-label="Acciones">
                  <div className="flex justify-center gap-2">
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
              <td colSpan="5" className="px-6 py-20 text-center">
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
