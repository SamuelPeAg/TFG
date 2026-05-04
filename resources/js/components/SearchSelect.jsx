import React, { useState, useEffect, useRef } from 'react';

/**
 * Reusable Searchable Select Component for Factomove
 * Fits the premium design system with custom search logic.
 */
export default function SearchSelect({ 
    options = [], 
    value = '', 
    onChange, 
    placeholder = 'Seleccionar...', 
    name = '',
    icon = 'fa-solid fa-search',
    className = '',
    searchable = true
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter(opt => 
        opt.label.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get the label of the currently selected value
    const selectedOption = options.find(opt => opt.value.toString() === value?.toString());
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when opening
    useEffect(() => {
        if (isOpen && searchInputRef.current && searchable) {
            searchInputRef.current.focus();
        }
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen, searchable]);

    const handleSelect = (option) => {
        onChange({ target: { name, value: option.value } });
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-all hover:bg-white hover:border-[#38C1A3] group ${isOpen ? 'ring-2 ring-[#38C1A3]/20 border-[#38C1A3] bg-white' : ''}`}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    {icon && <i className={`${icon} text-[10px] text-slate-400 group-hover:text-[#38C1A3] transition-colors`}></i>}
                    <span className={`text-xs font-bold truncate ${selectedOption ? 'text-slate-700' : 'text-slate-400'}`}>
                        {displayLabel}
                    </span>
                </div>
                <i className={`fas fa-chevron-down text-[10px] text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-[100] mt-2 w-full min-w-[200px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                    {/* Search Field */}
                    {searchable && (
                        <div className="p-3 border-b border-slate-50 sticky top-0 bg-white z-10">
                            <div className="relative">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                                <input 
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Escribe para buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#38C1A3]/10 focus:border-[#38C1A3] transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div 
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors flex items-center justify-between group/opt ${option.value.toString() === value?.toString() ? 'bg-teal-50 text-[#38C1A3]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value.toString() === value?.toString() && (
                                        <i className="fa-solid fa-check text-[10px]"></i>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No hay resultados</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
