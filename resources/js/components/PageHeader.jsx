import React from 'react';

const PageHeader = ({ 
    title, 
    subtitle, 
    icon, 
    actions, 
    onMenuClick 
}) => {
    return (
        <header className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button 
                    className="lg:hidden p-2 text-slate-500 hover:text-[#38C1A3] rounded-lg hover:bg-slate-100 transition-colors" 
                    onClick={onMenuClick}
                >
                    <i className="fa-solid fa-bars text-xl"></i>
                </button>
                
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#38C1A3]/20 to-[#38C1A3]/10 flex items-center justify-center flex-shrink-0 shadow-sm border border-[#38C1A3]/10 animate-in fade-in slide-in-from-left-4 duration-500">
                            {typeof icon === 'string' ? <i className={`${icon} text-[#38C1A3] text-lg md:text-xl`}></i> : icon}
                        </div>
                    )}
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">{title}</h1>
                        {subtitle && <p className="text-slate-400 mt-1.5 font-medium text-sm md:text-base opacity-80">{subtitle}</p>}
                    </div>
                </div>
            </div>
            
            {actions && (
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-[500px] sm:justify-end animate-in fade-in slide-in-from-right-4 duration-500">
                    {actions}
                </div>
            )}
        </header>
    );
};

export default PageHeader;
