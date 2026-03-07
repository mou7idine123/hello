import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    MapPin, Users, ShieldCheck, Star, ArrowLeft,
    Heart, CheckCircle2, AlertCircle, TrendingUp, CalendarDays, ChevronRight
} from 'lucide-react';

/* NeedDetail — Fiche détaillée d'un besoin */

const NeedDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [need, setNeed] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:8000/api/needs.php`)
            .then(res => {
                const found = res.data.find(n => String(n.id) === String(id));
                setNeed(found || null);
            })
            .catch(() => setNeed(null))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Chargement…</div>
        </section>
    );

    if (!need) return (
        <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <AlertCircle size={48} color="var(--primary)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Besoin introuvable</h2>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Retour au catalogue</button>
        </section>
    );

    const percent = Math.min(Math.round((need.collected_mru / need.required_mru) * 100), 100);
    const isOpen = need.status === 'Open';

    const validator = {
        name: need.validator || 'Validateur IHSAN',
        score: need.validator_score || 94,
        confirmedDeliveries: need.confirmed_deliveries || 0,
    };

    return (
        <>
            <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)' }}>
                <div className="container" style={{ maxWidth: '900px' }}>

                    {/* Breadcrumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ArrowLeft size={16} /> Catalogue
                        </Link>
                        <ChevronRight size={14} />
                        <span>{need.type} — {need.district}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

                        {/* ─── Left Column ─── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* Header card */}
                            <div className="dashboard-panel">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                                            {need.type}
                                        </div>
                                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
                                            {need.description || `Aide en ${need.type.toLowerCase()} — ${need.district}`}
                                        </h1>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            <MapPin size={15} color="var(--primary)" />
                                            <span>{need.district}</span>
                                        </div>
                                    </div>
                                    <span className={`badge ${isOpen ? 'badge-open' : 'badge-funded'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', flexShrink: 0 }}>
                                        {isOpen ? '🟢 Ouvert' : '✅ Financé'}
                                    </span>
                                </div>

                                {/* Beneficiaries */}
                                {need.beneficiaries && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        <Users size={16} color="var(--secondary)" />
                                        <span><strong style={{ color: 'var(--text)' }}>{need.beneficiaries}</strong> bénéficiaires</span>
                                    </div>
                                )}

                                {/* Date */}
                                {need.date && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                        <CalendarDays size={15} />
                                        <span>Soumis le {need.date}</span>
                                    </div>
                                )}
                            </div>

                            {/* Impact Proof Section (Show only if completed) */}
                            {need.status === 'complete' && need.remise_proof_path && (
                                <div className="dashboard-panel" style={{ padding: 0, overflow: 'hidden', border: '2px solid var(--primary)' }}>
                                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1rem' }}>Impact Réel & Vérifié</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remise effectuée le {new Date(need.remise_time).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={`http://localhost:8000/${need.remise_proof_path}`}
                                            alt="Preuve de remise"
                                            style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block' }}
                                        />
                                        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.7rem', backdropFilter: 'blur(4px)' }}>
                                            Visages protégés pour la dignité
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: 'var(--surface)' }}>
                                        <blockquote style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1.25rem', margin: 0, color: 'var(--text-main)', fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.6 }}>
                                            « {need.remise_message} »
                                        </blockquote>
                                    </div>
                                </div>
                            )}

                            {/* Full description */}
                            {need.full_description && (
                                <div className="dashboard-panel">
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Description complète</h2>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '0.95rem' }}>
                                        {need.full_description}
                                    </p>
                                </div>
                            )}

                            {/* Validator profile */}
                            <div className="dashboard-panel">
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldCheck size={20} color="var(--primary)" /> Validateur certifié
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.4rem', fontWeight: 800, color: '#fff', flexShrink: 0
                                    }}>
                                        {validator.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>{validator.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            {validator.confirmedDeliveries} remises confirmées
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                                            <Star size={18} color="#f59e0b" fill="#f59e0b" />
                                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{validator.score}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>/100</span>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Score de réputation</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ─── Right Column (sticky) ─── */}
                        <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* Progress & Donate */}
                            <div className="dashboard-panel">
                                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <TrendingUp size={18} color="var(--primary)" /> Financement
                                </h2>

                                {/* Progress bar */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <span>Collecté</span>
                                        <span style={{ fontWeight: 700, color: percent === 100 ? '#10b981' : 'var(--primary)' }}>{percent}%</span>
                                    </div>
                                    <div style={{ height: '10px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${percent}%`,
                                            borderRadius: '999px',
                                            background: percent === 100
                                                ? 'linear-gradient(90deg, #10b981, #34d399)'
                                                : 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                            transition: 'width 0.8s ease',
                                        }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                                            {need.collected_mru.toLocaleString()} MRU
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>collectés</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                                            {need.required_mru.toLocaleString()} MRU
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>objectif</div>
                                    </div>
                                </div>

                                {isOpen ? (
                                    <button
                                        className="btn btn-primary w-full"
                                        style={{ padding: '0.85rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        onClick={() => navigate(`/donate/${id}`)}
                                    >
                                        <Heart size={20} /> Donner maintenant
                                    </button>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <CheckCircle2 size={18} /> Ce besoin est entièrement financé
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default NeedDetail;
