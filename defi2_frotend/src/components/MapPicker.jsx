import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const MapPicker = ({ onLocationSelected, defaultLocation }) => {
    const [position, setPosition] = useState(defaultLocation || { lat: 18.079021, lng: -15.965662 }); // Default Nouakchott

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                setPosition(e.latlng);
                if (onLocationSelected) {
                    onLocationSelected(`${e.latlng.lat}, ${e.latlng.lng}`);
                }
            },
        });

        return position === null ? null : (
            <Marker position={position}></Marker>
        );
    };

    return (
        <MapContainer center={position} zoom={12} style={{ height: '300px', width: '100%', borderRadius: '0.5rem', zIndex: 0 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
        </MapContainer>
    );
};

export default MapPicker;
