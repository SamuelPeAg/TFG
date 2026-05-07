import React from 'react';

/**
 * Reusable IBAN Input Component
 * Handles 24-character input with strict auto-formatting:
 * - First 2 characters MUST be letters.
 * - Remaining 22 characters MUST be numbers.
 * Format: XX 0000 0000 0000 0000 0000
 */
export default function IbanInput({ value, onChange, name, className, placeholder = 'Introduce tu IBAN...' }) {
    
    // Filters input: forces 2 letters, then 22 numbers max
    const filterIbanInput = (val) => {
        let clean = val.replace(/\s+/g, '').toUpperCase();
        let result = '';
        
        for (let i = 0; i < clean.length && result.length < 24; i++) {
            const char = clean[i];
            if (result.length < 2) {
                // First two chars must be letters
                if (/[A-Z]/.test(char)) {
                    result += char;
                }
            } else {
                // The rest must be numbers
                if (/[0-9]/.test(char)) {
                    result += char;
                }
            }
        }
        return result;
    };

    const formatIban = (raw) => {
        let formatted = '';
        if (raw.length > 0) {
            formatted += raw.substring(0, 2);
            if (raw.length > 2) {
                const rest = raw.substring(2);
                for (let i = 0; i < rest.length; i++) {
                    if (i % 4 === 0) formatted += ' ';
                    formatted += rest[i];
                }
            }
        }
        return formatted;
    };

    const handleChange = (e) => {
        const rawValue = filterIbanInput(e.target.value);
        // We call parent onChange with the RAW value (clean) but we display the formatted one
        onChange({
            target: {
                name: name,
                value: rawValue
            }
        });
    };

    return (
        <div className="relative group">
            <input 
                type="text" 
                name={name} 
                value={formatIban(value || '')} 
                onChange={handleChange} 
                maxLength={29} // 24 chars + 5 spaces
                className={className} 
                placeholder={placeholder} 
            />
            <i className="fa-solid fa-building-columns absolute right-8 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-[#38C1A3] transition-colors"></i>
        </div>
    );
}
