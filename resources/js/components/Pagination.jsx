import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems }) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center gap-4 py-8 border-t border-slate-100 mt-12">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#38C1A3] animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-[#38C1A3]/20"></div>
          <div className="w-2 h-2 rounded-full bg-[#38C1A3]/10"></div>
        </div>
        {totalItems !== undefined && (
          <span className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] ml-2">
            Mostrando el listado completo ({totalItems} registros)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 w-full py-10 border-t border-slate-100 mt-14 px-8">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">Registros en sistema</h4>
        <p className="text-xl font-black text-slate-800 tracking-tighter">
          {totalItems} <span className="text-[#38C1A3]">ITEMS</span>
        </p>
      </div>
      
      <div className="flex items-center gap-5">
        <button 
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-500 font-black text-[11px] uppercase tracking-widest shadow-lg shadow-slate-200/50 active:scale-95"
        >
          <i className="fa-solid fa-chevron-left text-[10px] transition-transform group-hover:-translate-x-1.5"></i>
          PÁGINA ANTERIOR
        </button>
        
        <div className="flex flex-col items-center">
             <div className="flex items-center bg-slate-100/50 rounded-2xl px-6 py-4 shadow-inner border border-slate-100 backdrop-blur-sm">
                <span className="text-lg font-black text-[#38C1A3] drop-shadow-sm">
                    {currentPage}
                </span>
                <span className="mx-3 text-slate-300 font-black text-sm opacity-50">/</span>
                <span className="text-sm font-black text-slate-400">
                    {totalPages}
                </span>
            </div>
            <div className="w-full mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-[#38C1A3] to-[#2D9B82] transition-all duration-700 ease-out"
                    style={{ width: `${(currentPage / totalPages) * 100}%` }}
                ></div>
            </div>
        </div>
        
        <button 
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white border-2 border-[#38C1A3] text-[#38C1A3] hover:text-white hover:bg-[#38C1A3] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-500 font-black text-[11px] uppercase tracking-widest shadow-lg shadow-teal-100/50 active:scale-95"
        >
          SIGUIENTE PÁGINA
          <i className="fa-solid fa-chevron-right text-[10px] transition-transform group-hover:translate-x-1.5"></i>
        </button>
      </div>
    </div>
  );
}
