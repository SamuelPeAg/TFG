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
        <div className="px-8 pt-8 pb-6 bg-white border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                <i className="fas fa-shield-alt text-2xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-none tracking-tight">Permisos de Acceso</h3>
                <p className="text-slate-500 font-bold text-[11px] mt-1.5 uppercase tracking-widest">Configurando a {entrenador?.name}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
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
              <p className="text-slate-900 font-bold text-xs uppercase tracking-widest">Cargando permisos...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {permissions.map((perm) => (
                <div 
                  key={perm.id}
                  className={`flex items-center justify-between p-5 rounded-[22px] border transition-all duration-300 ${
                    assigned.includes(perm.id) 
                      ? 'bg-indigo-50/40 border-indigo-100 shadow-sm' 
                      : 'bg-slate-50 border-slate-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                      assigned.includes(perm.id) ? 'bg-indigo-500 text-white shadow-md shadow-indigo-100' : 'bg-white text-slate-300 border border-slate-100'
                    }`}>
                      <i className={`fas ${
                        perm.id === 'acceder_nominas_admin' ? 'fa-file-invoice-dollar' :
                        perm.id === 'acceder_facturacion' ? 'fa-money-bill-wave' :
                        perm.id === 'crear_clases' ? 'fa-calendar-plus' : 'fa-ticket-alt'
                      } text-base`}></i>
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-wider text-slate-900">
                        {perm.label}
                      </p>
                      <p className="text-[12px] text-slate-900 font-bold mt-1 opacity-70">
                        {perm.id === 'acceder_nominas_admin' && 'Permite ver y gestionar nóminas de todo el equipo.'}
                        {perm.id === 'acceder_facturacion' && 'Acceso total a la sección de facturación y tickets.'}
                        {perm.id === 'crear_clases' && 'Habilita la creación de nuevas sesiones en el calendario.'}
                        {perm.id === 'acceder_suscripciones' && 'Gestión de bonos y planes de suscripción.'}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleToggle(perm.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none shrink-0 ${
                      assigned.includes(perm.id) ? 'bg-indigo-500 shadow-inner' : 'bg-slate-200 shadow-inner'
                    }`}
                  >
                    <span 
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                        assigned.includes(perm.id) ? 'translate-x-[22px]' : 'translate-x-0.5'
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
            className="flex-1 px-6 py-3.5 bg-slate-50 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
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
