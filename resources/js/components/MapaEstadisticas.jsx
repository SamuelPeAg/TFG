import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default marker icons in React/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Componente interno para manejar el auto-zoom y centrado
 */
function ChangeView({ centers }) {
    const map = useMap();
    
    useEffect(() => {
        if (centers && centers.length > 0) {
            const validCenters = centers.filter(c => c.lat && c.lng);
            if (validCenters.length > 0) {
                const bounds = L.latLngBounds(validCenters.map(c => [parseFloat(c.lat), parseFloat(c.lng)]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [centers, map]);
    
    return null;
}

export default function MapaEstadisticas({ centers }) {
    const validCenters = centers ? centers.filter(c => c.lat && c.lng) : [];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <i className="fa-solid fa-map-location-dot"></i>
                </div>
                Distribución Geográfica de Sedes
            </h2>
            
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 h-[500px] z-0">
                <MapContainer 
                    center={[40.4168, -3.7038]} 
                    zoom={6} 
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {validCenters.map(center => (
                        <Marker 
                            key={center.id} 
                            position={[parseFloat(center.lat), parseFloat(center.lng)]}
                        >
                            <Popup>
                                <div className="font-sans">
                                    <h4 className="font-black text-slate-800 m-0">{center.nombre}</h4>
                                    <p className="text-xs text-slate-500 m-0 mt-1">{center.direccion}</p>
                                    {center.ciudad && <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">{center.ciudad}</p>}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    
                    <ChangeView centers={validCenters} />
                </MapContainer>
            </div>
        </div>
    );
}
