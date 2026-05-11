import React from 'react';

export default function EntrenadoresTable({ entrenadores, onEdit, onDelete, onPermissions, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 sm:py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-brandTeal mx-auto mb-3"></div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
      {/* Desktop/Tablet View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="facto-table w-full border-collapse">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs font-black text-slate-900 uppercase tracking-wider">Entrenador</th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs font-black text-slate-900 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs font-black text-slate-900 uppercase tracking-wider hidden md:table-cell">IBAN</th>
              <th className="text-center px-4 sm:px-6 py-3 sm:py-4 text-xs font-black text-slate-900 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entrenadores.length > 0 ? (
              entrenadores.map((entrenador) => (
                <tr key={entrenador.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                  <td className="px-4 sm:px-6 py-3 sm:py-4" data-label="Entrenador">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-[#38C1A3] font-black text-xs sm:text-sm relative overflow-hidden shadow-sm flex-shrink-0 border border-slate-100"
                      >
                        {entrenador.photo ? (
                          <img 
                            src={entrenador.photo} 
                            alt={entrenador.name}
                            className="w-full h-full object-cover bg-white"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className={entrenador.photo ? 'hidden' : ''}>
                          {entrenador.name ? entrenador.name.trim().charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <span className="font-bold text-slate-700 text-xs sm:text-sm truncate">{entrenador.name}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 font-medium truncate" data-label="Email">
                    {entrenador.email}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell" data-label="IBAN">
                    <span className="font-mono text-xs sm:text-sm text-slate-500 bg-slate-50 px-2 py-1 rounded line-clamp-1">
                      {entrenador.iban || '---'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4" data-label="Acciones">
                    <div className="flex justify-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => onPermissions(entrenador)}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all duration-300 flex-shrink-0"
                        title="Gestionar permisos"
                      >
                        <i className="fas fa-shield-alt text-xs sm:text-sm"></i>
                      </button>
                      <button
                        onClick={() => onEdit(entrenador)}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-teal-50 text-[#38C1A3] hover:bg-[#38C1A3] hover:text-white transition-all duration-300 flex-shrink-0"
                        title="Editar entrenador"
                      >
                        <i className="fas fa-pencil-alt text-xs sm:text-sm"></i>
                      </button>
                      <button
                        onClick={() => onDelete(entrenador)}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-rose-50 text-[#EF5D7A] hover:bg-[#EF5D7A] hover:text-white transition-all duration-300 flex-shrink-0"
                        title="Eliminar entrenador"
                      >
                        <i className="fas fa-trash-alt text-xs sm:text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-4 sm:px-6 py-16 sm:py-20 text-center">
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-50 flex items-center justify-center">
                      <i className="fas fa-users text-slate-200 text-lg sm:text-2xl"></i>
                    </div>
                    <p className="text-slate-400 font-medium text-xs sm:text-sm">No se han encontrado entrenadores registrados.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden divide-y divide-slate-100">
        {entrenadores.length > 0 ? (
          entrenadores.map((entrenador) => (
            <div key={entrenador.id} className="p-5 hover:bg-slate-50 transition-colors duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#38C1A3] font-black text-base relative overflow-hidden shadow-sm flex-shrink-0 border border-slate-100"
                  >
                    {entrenador.photo ? (
                      <img 
                        src={entrenador.photo} 
                        alt={entrenador.name}
                        className="w-full h-full object-cover bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={entrenador.photo ? 'hidden' : ''}>
                      {entrenador.name ? entrenador.name.trim().charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-800 text-sm truncate">{entrenador.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{entrenador.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onPermissions(entrenador)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 border border-indigo-100 transition-all duration-300"
                    title="Gestionar permisos"
                  >
                    <i className="fas fa-shield-alt text-xs"></i>
                  </button>
                  <button
                    onClick={() => onEdit(entrenador)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-50 text-[#38C1A3] border border-teal-100 transition-all duration-300"
                    title="Editar entrenador"
                  >
                    <i className="fas fa-pencil-alt text-xs"></i>
                  </button>
                </div>
              </div>
              
              {entrenador.iban && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">IBAN de Cobro</p>
                  <p className="font-mono text-xs text-slate-600 truncate">{entrenador.iban}</p>
                </div>
              )}

              <button
                onClick={() => onDelete(entrenador)}
                className="w-full py-2.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <i className="fas fa-trash-alt"></i>
                Eliminar del Equipo
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
              <i className="fas fa-users text-slate-200 text-xl"></i>
            </div>
            <p className="text-slate-400 font-medium text-sm">No hay entrenadores registrados.</p>
          </div>
        </div>
      )}
    </div>
  );
}
