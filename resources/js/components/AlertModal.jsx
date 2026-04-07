import React from 'react';

export default function AlertModal({ isOpen, onClose, title = "Aviso", message, buttonText = "Entendido", isError = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${isError ? 'bg-rose-50 text-rose-500 shadow-rose-100/50' : 'bg-[#38C1A3]/10 text-[#38C1A3] shadow-teal-100/50'}`}>
            <i className={`fa-solid text-2xl ${isError ? 'fa-circle-xmark' : 'fa-circle-info'}`}></i>
          </div>
          
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <button 
            onClick={onClose}
            className={`w-full py-3 px-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
              isError 
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' 
              : 'bg-[#38C1A3] hover:bg-[#2eaa8f] shadow-teal-200'
            }`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
