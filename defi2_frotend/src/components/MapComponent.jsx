import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default center (Nouakchott, Mauritania)
const DEFAULT_CENTER = [18.0735, -15.9582];

const MapComponent = ({ needs = [] }) => {
    // Basic mapping of districts to coordinates in Nouakchott
    const districtCoords = {
        'tevragh zeina': [18.0947, -15.9757],
        'ksar': [18.0872, -15.9680],
        'sebkha': [18.0714, -15.9897],
        'el mina': [18.0617, -15.9814],
        'dar naim': [18.1064, -15.9347],
        'teyarett': [18.1250, -15.9530],
        'toujounine': [18.0880, -15.9080],
        'arafat': [18.0460, -15.9520],
        'riyad': [18.0160, -15.9650]
    };

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', marginBottom: '2rem' }}>
            <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {needs.map((need) => {
                    const district = need.district?.toLowerCase();
                    const position = districtCoords[district] || DEFAULT_CENTER;

                    return (
                        <Marker key={need.id} position={position}>
                            <Popup>
                                <div style={{ padding: '0.5rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{need.type}</h4>
                                    <p style={{ margin: '0', fontSize: '0.875rem' }}><strong>Quartier:</strong> {need.district}</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}><strong>Bénéficiaires:</strong> {need.beneficiaries} familles</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}><strong>Progression:</strong> {Math.round((need.collected_mru / need.required_mru) * 100)}%</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
