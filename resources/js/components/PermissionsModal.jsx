import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PermissionsModal({ isOpen, onClose, entrenador }) {
  const [permissions, setPermissions] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && entrenador) {
      fetchPermissions();
    }
  }, [isOpen, entrenador]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/entrenadores/${entrenador.id}/permissions`);
      setPermissions(response.data.all);
      setAssigned(response.data.assigned);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (permId) => {
    if (assigned.includes(permId)) {
      setAssigned(assigned.filter(id => id !== permId));
    } else {
      setAssigned([...assigned, permId]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`/entrenadores/${entrenador.id}/permissions`, {
        permissions: assigned
      });
      onClose();
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('Error al guardar los permisos.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-indigo-500 to-indigo-600">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <i className="fas fa-shield-alt text-2xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-white leading-none">Permisos de Acceso</h3>
                <p className="text-indigo-100 text-sm mt-1.5 font-bold">Configurando a {entrenador?.name}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cargando permisos...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {permissions.map((perm) => (
                <div 
                  key={perm.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    assigned.includes(perm.id) 
                      ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' 
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      assigned.includes(perm.id) ? 'bg-indigo-500 text-white' : 'bg-white text-slate-300'
                    }`}>
                      <i className={`fas ${
                        perm.id === 'acceder_nominas_admin' ? 'fa-file-invoice-dollar' :
                        perm.id === 'acceder_facturacion' ? 'fa-money-bill-wave' :
                        perm.id === 'crear_clases' ? 'fa-calendar-plus' : 'fa-ticket-alt'
                      } text-sm`}></i>
                    </div>
                    <div>
                      <p className={`font-black text-xs uppercase tracking-wider ${
                        assigned.includes(perm.id) ? 'text-indigo-900' : 'text-slate-500'
                      }`}>
                        {perm.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {perm.id === 'acceder_nominas_admin' && 'Permite ver y gestionar nóminas de todo el equipo.'}
                        {perm.id === 'acceder_facturacion' && 'Acceso total a la sección de facturación y tickets.'}
                        {perm.id === 'crear_clases' && 'Habilita la creación de nuevas sesiones en el calendario.'}
                        {perm.id === 'acceder_suscripciones' && 'Gestión de bonos y planes de suscripción.'}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleToggle(perm.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      assigned.includes(perm.id) ? 'bg-indigo-500' : 'bg-slate-200'
                    }`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        assigned.includes(perm.id) ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3.5 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
          >
            CANCELAR
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-[2] px-6 py-3.5 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <i className="fas fa-circle-notch animate-spin"></i>
            ) : (
              <i className="fas fa-check"></i>
            )}
            {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </div>
    </div>
  );
}
