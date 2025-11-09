// src/components/HotelMap.tsx

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import the default Leaflet CSS

// Fix for default Leaflet marker icons not showing up in Webpack/Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


interface HotelMapProps {
    latitude: number;
    longitude: number;
    name: string;
}

const HotelMap: React.FC<HotelMapProps> = ({ latitude, longitude, name }) => {
    // Leaflet requires coordinates as a [lat, lng] array
    const position: [number, number] = [latitude, longitude];

    return (
        <div style={{ height: '400px', width: '100%' }}>
            <MapContainer 
                center={position} 
                zoom={14} // Zoom level (13 is typical for a city)
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                {/* Use OpenStreetMap tiles */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Marker at the hotel's location */}
                <Marker position={position}>
                    <Popup>{name}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default HotelMap;