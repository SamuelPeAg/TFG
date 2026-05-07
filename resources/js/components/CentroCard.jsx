import React from 'react';

export default function CentroCard({ centro, tag, icon }) {
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centro.nombre + " " + centro.direccion)}`;
  
  // Si el link de Google Maps no es un embed (contiene /embed o /maps/embed), usamos el buscador
  const isEmbed = centro.google_maps_link?.includes('/embed') || centro.google_maps_link?.includes('pb=');
  const embedUrl = isEmbed 
    ? centro.google_maps_link 
    : `https://maps.google.com/maps?q=${encodeURIComponent(centro.direccion)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden group hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
        {/* Map Section */}
        <div className="h-56 relative overflow-hidden bg-slate-100 shrink-0">
            {centro.google_maps_link || centro.direccion ? (
                <iframe
                    className="absolute inset-0 w-full h-[150%] -top-1/4 pointer-events-none grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                    src={embedUrl}
                    style={{ border: '0' }}
                    allowFullScreen=""
                    loading="lazy"
                    title={centro.nombre}
                ></iframe>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                    <i className="fa-solid fa-map-marked-alt text-4xl text-slate-200"></i>
                </div>
            )}
            
            {/* Overlay shadow for UI contrast */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-6">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-sm">
                    <i className="fa-solid fa-location-dot"></i>
                </div>
            </div>
        </div>
        
        {/* Content Section */}
        <div className="p-8 relative flex-1 flex flex-col">
            {/* Decorative accent */}
            <div className="absolute top-0 left-8 -translate-y-1/2 w-12 h-1 bg-[#38C1A3] rounded-full shadow-sm"></div>

            <h3 className="text-xl font-black text-slate-800 mb-2 truncate" title={centro.nombre}>
                {centro.nombre}
            </h3>
            
            <div className="space-y-3 mt-6 flex-1">
                <div className="flex items-start gap-4 text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 mt-0.5">
                        <i className="fa-solid fa-map-pin text-xs text-[#eb567a]"></i>
                    </div>
                    <p className="font-bold text-sm leading-relaxed pt-1.5 line-clamp-2">
                        {centro.direccion || 'Dirección no disponible'}
                    </p>
                </div>
                
                {tag && (
                    <div className="flex items-start gap-4 text-slate-600">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 mt-0.5">
                            <i className={`fa-solid ${icon || 'fa-info-circle'} text-xs text-[#38C1A3]`}></i>
                        </div>
                        <p className="font-bold text-sm leading-relaxed pt-1.5">{tag}</p>
                    </div>
                )}
            </div>
            
            {/* Footer view map button */}
            <a 
                href={mapsSearchUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-sm font-black text-slate-400 hover:text-[#38C1A3] transition-colors group/link w-full"
            >
                ABRIR EN MAPS
                <i className="fa-solid fa-arrow-right-long group-hover/link:translate-x-1 transition-transform text-lg"></i>
            </a>
        </div>
    </div>
  );
}
