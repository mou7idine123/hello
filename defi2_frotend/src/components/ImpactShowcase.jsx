import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight, Star, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ImpactShowcase = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [impacts, setImpacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:8000/api/impact_needs.php')
            .then(res => setImpacts(res.data))
            .catch(err => console.error("Error fetching impacts:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading || impacts.length === 0) return null;

    return (
        <section className="section bg-gray-50" id="impact">
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                            <Heart size={14} fill="var(--primary)" /> IMPACT RÉEL
                        </div>
                        <h2 className="section-title" style={{ margin: 0, textAlign: 'left' }}>Dernières Remises Effectuées</h2>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    {impacts.map(item => (
                        <div key={item.id} className="dashboard-panel" style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.3s ease', cursor: 'pointer' }}
                            onClick={() => {
                                const id = item.representative_donation_id || item.id;
                                const path = item.representative_donation_id ? `/impact/${id}` : `/needs/${id}`;
                                navigate(path);
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ position: 'relative', height: '240px' }}>
                                <img
                                    src={`http://localhost:8000/${item.remise_proof_path}`}
                                    alt={item.type}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                                    backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.05)',
                                }} />
                                <div style={{
                                    position: 'absolute', top: '1rem', left: '1rem',
                                    backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', padding: '0.4rem 0.8rem',
                                    borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem'
                                }}>
                                    <ShieldCheck size={12} /> Vérifié
                                </div>
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                                    padding: '2rem 1.25rem 1rem', color: '#fff'
                                }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{item.type}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{new Date(item.remise_time).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <blockquote style={{
                                    borderLeft: '3px solid var(--primary)', paddingLeft: '1rem', margin: '0 0 1.25rem 0',
                                    color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.6,
                                    display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                }}>
                                    « {item.remise_message} »
                                </blockquote>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                                            {item.validator_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.validator_name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontSize: '0.7rem' }}>
                                                <Star size={10} fill="#f59e0b" /> {item.validator_score} pts
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const id = item.representative_donation_id || item.id;
                                            const path = item.representative_donation_id ? `/impact/${id}` : `/needs/${id}`;
                                            navigate(path);
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                        Preuve d'impact <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ImpactShowcase;
