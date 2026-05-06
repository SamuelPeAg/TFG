import React from 'react';
import { Line } from 'react-chartjs-2';

export default function PhysicalProgress({ 
    peso, 
    setPeso, 
    altura, 
    setAltura, 
    measurements, 
    onSave, 
    isSubmitting 
}) {
    const weightVal = parseFloat(peso);
    const heightVal = parseFloat(altura);
    const currentIMC = (weightVal > 0 && heightVal > 0) ? (weightVal / (heightVal * heightVal)).toFixed(2) : null;

    return (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-10 relative overflow-hidden group">
            {/* Decoration Icon */}
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-8xl text-[#38C1A3] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <i className="fa-solid fa-heart-pulse"></i>
            </div>
            
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-3xl bg-teal-50 text-[#38C1A3] flex items-center justify-center text-2xl shadow-inner">
                        📈
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Evolución Física</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control de peso &amp; IMC</p>
                    </div>
                </div>
                
                {currentIMC && (
                    <div className={`px-5 py-2.5 rounded-[1.2rem] flex flex-col items-center justify-center border-2 transition-all duration-500 ${
                        currentIMC < 18.5 ? 'bg-rose-50 border-rose-100 text-rose-500' : 
                        (currentIMC > 25 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-500')
                    }`}>
                        <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">Tu IMC</span>
                        <span className="text-base font-black tracking-widest leading-none mt-1">{currentIMC}</span>
                    </div>
                )}
            </div>

            <form onSubmit={onSave} className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Peso (kg)</label>
                        <div className="relative">
                            <input 
                                step="0.1" 
                                className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner no-spinner" 
                                placeholder="0.0" 
                                type="number" 
                                value={peso} 
                                onChange={(e) => setPeso(e.target.value)} 
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">kg</span>
                        </div>
                    </div>
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Altura (m)</label>
                        <div className="relative">
                            <input 
                                step="0.01" 
                                className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-700 focus:bg-white focus:border-[#38C1A3] outline-none transition-all shadow-inner no-spinner" 
                                placeholder="0.00" 
                                type="number" 
                                value={altura} 
                                onChange={(e) => setAltura(e.target.value)} 
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">m</span>
                        </div>
                    </div>
                </div>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-[#38C1A3] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] hover:bg-teal-500 shadow-xl shadow-teal-500/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    {isSubmitting ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                        <><i className="fa-solid fa-fire-pulse text-lg"></i> Registrar Progreso</>
                    )}
                </button>
            </form>

            <div className="pt-6 border-t border-slate-100">
                <div className="h-56 w-full">
                    {measurements.length > 0 ? (
                        <Line 
                            data={{
                                labels: [...measurements].reverse().map(m => new Date(m.measured_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })),
                                datasets: [{
                                    label: 'Peso',
                                    data: [...measurements].reverse().map(m => m.peso),
                                    borderColor: '#38C1A3',
                                    backgroundColor: 'rgba(56, 193, 163, 0.1)',
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 6,
                                    pointBackgroundColor: '#fff',
                                    pointBorderColor: '#38C1A3',
                                    pointBorderWidth: 3,
                                    pointHoverRadius: 8,
                                    pointHoverBackgroundColor: '#38C1A3',
                                    pointHoverBorderColor: '#fff',
                                    pointHoverBorderWidth: 3
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { 
                                    legend: { display: false },
                                    tooltip: {
                                        backgroundColor: '#1E293B',
                                        titleFont: { size: 10, weight: 'bold' },
                                        bodyFont: { size: 12, weight: 'black' },
                                        padding: 12,
                                        cornerRadius: 12,
                                        displayColors: false
                                    }
                                },
                                scales: { 
                                    x: { 
                                        grid: { display: false },
                                        ticks: { font: { weight: 'bold', size: 9 }, color: '#94A3B8' }
                                    }, 
                                    y: { 
                                        grid: { color: '#F1F5F9', drawBorder: false },
                                        ticks: { font: { weight: 'bold', size: 9 }, color: '#94A3B8' } 
                                    } 
                                }
                            }}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <i className="fa-solid fa-chart-line text-4xl mb-3 opacity-20"></i>
                            <p className="text-[9px] font-black uppercase tracking-widest">Sin historial de peso</p>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .no-spinner::-webkit-inner-spin-button, 
                .no-spinner::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                .no-spinner {
                    -moz-appearance: textfield;
                }
            `}} />
        </div>
    );
}
