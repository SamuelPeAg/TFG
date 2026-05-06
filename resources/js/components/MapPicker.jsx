import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ lat, lng, onSelect }) {
    const [position, setPosition] = useState(lat && lng ? [parseFloat(lat), parseFloat(lng)] : null);

    useEffect(() => {
        if (position) {
            onSelect(position[0], position[1]);
        }
    }, [position]);

    // Madrid default if no position
    const center = position || [40.4168, -3.7038];

    return (
        <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            <MapContainer 
                center={center} 
                zoom={position ? 15 : 6} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
            <div className="bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-200">
                Haz click en el mapa para situar la sede
            </div>
        </div>
    );
}
