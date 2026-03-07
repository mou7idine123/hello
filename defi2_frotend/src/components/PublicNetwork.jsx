import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Building2, MapPin, Clock, Star, Users } from 'lucide-react';

const PublicNetwork = () => {
    const [validators, setValidators] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get('http://localhost:8000/api/public_validators.php'),
            axios.get('http://localhost:8000/api/public_partners.php')
        ]).then(([valRes, partRes]) => {
            setValidators(valRes.data || []);
            setPartners(partRes.data || []);
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching network data:", err);
            setLoading(false);
        });
    }, []);

    if (loading) return null;

    return (
        <section className="section bg-background" style={{ padding: '6rem 0', backgroundColor: '#f8fafc' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--text-main)' }}>Notre Réseau de Confiance</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                        IHSAN repose sur des validateurs terrains assermentés et des partenaires commerciaux locaux pour garantir la transparence totale.
                    </p>
                </div>

                {/* Validators Section */}
                <div style={{ marginBottom: '5rem' }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShieldCheck size={28} color="var(--primary)" /> Nos Validateurs Terrains
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {validators.map(v => (
                            <div key={v.id} style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 800, color: '#fff', flexShrink: 0
                                }}>
                                    {v.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{v.full_name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                                        <Star size={16} fill="#f59e0b" /> {v.score} pts
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <ShieldCheck size={14} /> {v.completed_deliveries || 0} remises confirmées
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Partners Section */}
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Building2 size={28} color="var(--emerald)" /> Nos Partenaires Locaux
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {partners.map(p => (
                            <div key={p.id} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '120px', backgroundColor: 'var(--emerald)', backgroundImage: p.photo_path ? `url(http://localhost:8000/${p.photo_path})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
                                    <div style={{ position: 'absolute', bottom: '1rem', left: '1.25rem', right: '1.25rem' }}>
                                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>{p.business_name}</h4>
                                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Géré par {p.owner_name}</div>
                                    </div>
                                </div>
                                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    {p.location && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                            <MapPin size={16} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <span><strong>Quartier:</strong> {p.location}</span>
                                        </div>
                                    )}
                                    {p.specialties && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                            <Star size={16} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <span><strong>Spécialités:</strong> {p.specialties}</span>
                                        </div>
                                    )}
                                    {p.opening_hours && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                            <Clock size={16} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <span><strong>Horaires:</strong> {p.opening_hours}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <MapPin size={16} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <span>
                                            <strong>GPS:</strong> {p.address ? (
                                                <a href={`https://www.google.com/maps/search/?api=1&query=${p.address}`} target="_blank" rel="noreferrer" style={{ color: 'var(--emerald)' }}>
                                                    Voir sur la carte
                                                </a>
                                            ) : 'Non spécifié'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PublicNetwork;
