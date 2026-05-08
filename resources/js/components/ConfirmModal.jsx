import React from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = "Confirmación", message, confirmText = "Aceptar", cancelText = "Cancelar", isDestructive = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${isDestructive ? 'bg-rose-50 text-rose-500 shadow-rose-100/50' : 'bg-indigo-50 text-indigo-500 shadow-indigo-100/50'}`}>
            <i className={`fa-solid text-2xl ${isDestructive ? 'fa-triangle-exclamation' : 'fa-circle-question'}`}></i>
          </div>
          
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="flex gap-3 px-6 pb-6 sm:px-8 sm:pb-8">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
          >
            {cancelText}
          </button>
          <button 
            onClick={async () => {
              const result = await onConfirm();
              if (result !== false) {
                onClose();
              }
            }}
            className={`flex-1 py-3 px-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
              isDestructive 
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' 
              : 'bg-[#38C1A3] hover:bg-[#2eaa8f] shadow-teal-200'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
