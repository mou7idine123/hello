import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
    ShieldCheck, PlusCircle, AlertCircle,
    CheckCircle, Clock, ChefHat, MapPin,
    X, Send, ArrowRight, Map, List, Eye, Building2, Utensils
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});
import MapComponent from '../components/MapComponent';

const ValidatorDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ordering logic states
    const [partners, setPartners] = useState([]);
    const [selectedNeed, setSelectedNeed] = useState(null);
    const [selectedPartnerId, setSelectedPartnerId] = useState('');
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [orderedSuccess, setOrderedSuccess] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [viewingNeed, setViewingNeed] = useState(null);

    useEffect(() => {
        fetchDashboard();
        fetchPartners();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/validator/dashboard.php');
            setStats(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching validator dashboard", error);
            setLoading(false);
        }
    };

    const fetchPartners = async () => {
        try {
            const res = await api.get('/validator/list_partners.php');
            setPartners(res.data || []);
        } catch (error) {
            console.error("Error fetching partners", error);
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!selectedNeed || !selectedPartnerId) return;

        setIsSubmittingOrder(true);
        try {
            await api.post('/validator/place_order.php', {
                need_id: selectedNeed.id,
                partner_id: selectedPartnerId,
                scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') // Default +2h
            });
            setOrderedSuccess(true);
            setTimeout(() => {
                setSelectedNeed(null);
                setOrderedSuccess(false);
                setSelectedPartnerId('');
                fetchDashboard(); // Refresh
            }, 2000);
        } catch (error) {
            console.error("Order placement failed", error);
            alert("Erreur lors de la commande.");
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    if (loading || !stats) return (
        <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner-border" style={{ marginRight: '1rem' }}></div>
            Chargement de votre espace...
        </div>
    );

    return (
        <div className="dashboard-full-width" style={{ padding: '3rem', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            {/* Elegant Header Section */}
            <div className="admin-card-glass" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2.5rem 3rem', borderRadius: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--text-main)', marginBottom: '0.5rem', background: 'linear-gradient(90deg, #0F172A, #2D61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Espace Validateur
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: 500 }}>Tableau de bord de gestion et suivi des collectes.</p>
                </div>
                <button
                    onClick={() => navigate('/validator/create-need')}
                    className="btn btn-primary"
                    style={{
                        padding: '1.25rem 2.5rem',
                        borderRadius: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '1.125rem',
                        fontWeight: 800,
                        boxShadow: '0 12px 30px rgba(45, 97, 255, 0.3)',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                >
                    <PlusCircle size={24} />
                    Publier un Besoin
                </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="admin-kpi-grid-new" style={{ marginBottom: '4rem' }}>
                <div className="admin-card-glass tab-green" style={{ borderTop: 'none', borderLeft: '6px solid var(--emerald)' }}>
                    <div className="kpi-card-inner">
                        <div className="kpi-content">
                            <span className="kpi-label">Score Validateur</span>
                            <div className="kpi-value-large">{stats.validator_score} <span style={{ fontSize: '1.125rem', color: 'var(--text-muted)', fontWeight: 600 }}>pts</span></div>
                            <span className="kpi-subtext" style={{ fontSize: '0.875rem' }}>Indice de performance terrain</span>
                        </div>
                        <div className="progress-circle-wrap">
                            <svg viewBox="0 0 36 36" className="progress-circle green">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle" strokeDasharray={`${Math.min(100, (stats.validator_score / 50) * 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <ShieldCheck size={18} className="center-icon" color="var(--emerald)" />
                        </div>
                    </div>
                </div>

                <div className="admin-card-glass tab-blue" style={{ borderTop: 'none', borderLeft: '6px solid var(--primary)' }}>
                    <div className="kpi-card-inner">
                        <div className="kpi-content">
                            <span className="kpi-label">Besoins actifs</span>
                            <div className="kpi-value-large">{stats.active_needs}</div>
                            <span className="kpi-subtext" style={{ fontSize: '0.875rem' }}>Collectes en cours</span>
                        </div>
                        <div className="progress-circle-wrap">
                            <svg viewBox="0 0 36 36" className="progress-circle blue">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle" strokeDasharray="65, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <Clock size={18} className="center-icon" color="var(--primary)" />
                        </div>
                    </div>
                </div>

                <div className="admin-card-glass tab-amber" style={{ borderTop: 'none', borderLeft: '6px solid var(--warning)' }}>
                    <div className="kpi-card-inner">
                        <div className="kpi-content">
                            <span className="kpi-label">À remettre</span>
                            <div className="kpi-value-large" style={{ color: stats.donations_to_process > 0 ? 'var(--warning)' : 'inherit' }}>
                                {stats.donations_to_process}
                            </div>
                            <span className="kpi-subtext" style={{ fontSize: '0.875rem' }}>Dons financés urgents</span>
                        </div>
                        <div className="progress-circle-wrap">
                            <svg viewBox="0 0 36 36" className={`progress-circle ${stats.donations_to_process > 0 ? 'amber' : 'blue'}`}>
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle" strokeDasharray={stats.donations_to_process > 0 ? "100, 100" : "0, 100"} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <AlertCircle size={18} className="center-icon" color={stats.donations_to_process > 0 ? 'var(--warning)' : 'var(--text-muted)'} />
                        </div>
                    </div>
                </div>

                <div className="admin-card-glass tab-blue" style={{ borderTop: 'none', borderLeft: '6px solid #8b5cf6' }}>
                    <div className="kpi-card-inner">
                        <div className="kpi-content">
                            <span className="kpi-label">Impact Total</span>
                            <div className="kpi-value-large">{stats.total_families_helped}</div>
                            <span className="kpi-subtext" style={{ fontSize: '0.875rem' }}>Familles assistées</span>
                        </div>
                        <div className="progress-circle-wrap">
                            <svg viewBox="0 0 36 36" className="progress-circle blue">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <CheckCircle size={18} className="center-icon" color="var(--primary)" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Needs Section */}
            <div className="admin-card-glass" style={{ padding: '3rem', borderRadius: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h2 className="admin-section-title" style={{ marginBottom: 0, fontSize: '1.75rem', fontWeight: 900 }}>Vos besoins publiés</h2>
                    <div className="view-toggle" style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '12px' }}>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
                                background: viewMode === 'list' ? 'white' : 'transparent',
                                color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                fontWeight: 600, transition: 'all 0.2s',
                                boxShadow: viewMode === 'list' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            <List size={18} /> Liste
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
                                background: viewMode === 'map' ? 'white' : 'transparent',
                                color: viewMode === 'map' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                fontWeight: 600, transition: 'all 0.2s',
                                boxShadow: viewMode === 'map' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            <Map size={18} /> Carte
                        </button>
                    </div>
                </div>

                {viewMode === 'map' ? (
                    <MapComponent needs={stats.needs_list} />
                ) : (
                    <>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Besoin</th>
                                    <th>Quartier</th>
                                    <th style={{ width: '300px' }}>Progression des fonds</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.needs_list.map((n) => (
                                    <tr key={n.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '12px',
                                                    background: 'var(--primary-light)', color: 'var(--primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: '1rem'
                                                }}>
                                                    {n.type.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{n.type}</div>
                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{n.beneficiaries} familles</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{n.district}</span>
                                        </td>
                                        <td>
                                            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                                                <span style={{ fontWeight: 700 }}>{Number(n.collected_mru).toLocaleString()} MRU</span>
                                                <span style={{ color: 'var(--text-muted)' }}>Cible: {Number(n.required_mru).toLocaleString()}</span>
                                            </div>
                                            <div style={{ width: '100%', backgroundColor: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${Math.min(100, (n.collected_mru / n.required_mru) * 100)}%`,
                                                    background: 'linear-gradient(90deg, var(--primary), #6366f1)',
                                                    height: '100%',
                                                    borderRadius: '4px',
                                                    boxShadow: '0 0 10px rgba(45, 97, 255, 0.2)'
                                                }}></div>
                                            </div>
                                        </td>
                                        <td>
                                            {n.status === 'ouvert' ? (
                                                <span className="admin-badge badge-blue">
                                                    <Clock size={14} style={{ marginRight: '4px' }} /> En collecte (Ouvert)
                                                </span>
                                            ) : (n.order_status === 'pret_pour_collecte') ? (
                                                <span className="admin-badge badge-green" style={{ background: 'var(--emerald-light)', color: 'var(--emerald)' }}>
                                                    <CheckCircle size={14} style={{ marginRight: '4px' }} /> Prête pour collecte
                                                </span>
                                            ) : (n.order_status === 'en_preparation' || n.order_status === 'en_attente') ? (
                                                <span className="admin-badge badge-blue" style={{ background: '#fef3c7', color: '#92400e' }}>
                                                    <Clock size={14} style={{ marginRight: '4px' }} /> En préparation
                                                </span>
                                            ) : n.status === 'finance' && !n.order_status ? (
                                                <span className="admin-badge badge-green" style={{ background: 'var(--emerald-light)', color: 'var(--emerald)' }}>
                                                    <CheckCircle size={14} style={{ marginRight: '4px' }} /> Financé (En attente partenaire)
                                                </span>
                                            ) : n.status === 'complete' ? (
                                                <span className="admin-badge badge-green" style={{ background: 'var(--emerald-light)', color: 'var(--emerald)' }}>
                                                    <CheckCircle size={14} style={{ marginRight: '4px' }} /> Terminé (Livré)
                                                </span>
                                            ) : (
                                                <span className="admin-badge badge-blue" style={{ background: '#f8fafc', color: 'var(--text-muted)' }}>
                                                    {n.order_status || n.status}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => setViewingNeed(n)}
                                                className="btn btn-outline"
                                                title="Voir les détails"
                                                style={{ padding: '0.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {(n.status === 'finance' || n.status === 'en_cours') && !n.order_status && (
                                                <button
                                                    onClick={() => setSelectedNeed(n)}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                >
                                                    <ChefHat size={16} /> Commander
                                                </button>
                                            )}
                                            {n.order_status === 'pret_pour_collecte' && (
                                                <button
                                                    onClick={() => navigate(`/confirm-delivery/${n.order_id}`, { state: { type: 'order' } })}
                                                    className="btn btn-primary"
                                                    style={{ background: 'var(--emerald)', whiteSpace: 'nowrap', padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                >
                                                    <ArrowRight size={16} /> Confirmer la remise
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {stats.needs_list.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Vous n'avez pas encore publié de besoin.</div>
                    </div>
                )}
            </div>

            {/* Order Selection Modal */}
            {selectedNeed && (
                <div className="admin-modal-overlay" onClick={() => setSelectedNeed(null)}>
                    <div className="admin-card-soft" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedNeed(null)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Commander le Besoin</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Sélectionnez un partenaire pour préparer les {selectedNeed.beneficiaries} {selectedNeed.type}.</p>
                        </div>

                        {orderedSuccess ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '20px', background: 'var(--emerald-light)', color: 'var(--emerald)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                                }}>
                                    <CheckCircle size={32} />
                                </div>
                                <h4 style={{ fontWeight: 800, color: 'var(--text-main)' }}>Commande Envoyée !</h4>
                                <p style={{ color: 'var(--text-muted)' }}>Le partenaire a été notifié.</p>
                            </div>
                        ) : (
                            <form onSubmit={handlePlaceOrder}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label className="admin-label">Choisir un Partenaire</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {partners.map(p => (
                                            <label key={p.id} style={{
                                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                                                border: '1px solid ' + (selectedPartnerId === p.id ? 'var(--primary)' : 'var(--border)'),
                                                borderRadius: 'var(--radius-xl)', cursor: 'pointer',
                                                background: selectedPartnerId === p.id ? 'var(--primary-light)' : 'white',
                                                transition: 'all 0.2s'
                                            }}>
                                                <input
                                                    type="radio"
                                                    name="partner"
                                                    value={p.id}
                                                    checked={selectedPartnerId === p.id}
                                                    onChange={() => setSelectedPartnerId(p.id)}
                                                    style={{ display: 'none' }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {p.business_name}
                                                    </div>
                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                                        <MapPin size={12} /> {p.address}
                                                    </div>
                                                </div>
                                                {selectedPartnerId === p.id && <CheckCircle size={20} color="var(--primary)" />}
                                            </label>
                                        ))}
                                        {partners.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Aucun partenaire disponible pour le moment.</p>}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!selectedPartnerId || isSubmittingOrder}
                                    style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-xl)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                                >
                                    {isSubmittingOrder ? <div className="spinner-border" style={{ width: '20px', height: '20px' }}></div> : <><Send size={18} /> Envoyer la commande</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {viewingNeed && (
                <div className="admin-modal-overlay" onClick={() => setViewingNeed(null)}>
                    <div className="admin-card-soft" style={{ width: '100%', maxWidth: '600px', height: '85vh', overflowY: 'auto', padding: '2.5rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setViewingNeed(null)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1.5rem', paddingRight: '2rem' }}>Diffusé: {viewingNeed.type}</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="admin-field">
                                <label className="admin-label">Quartier</label>
                                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={18} color="var(--primary)" /> {viewingNeed.district}
                                </div>
                            </div>
                            <div className="admin-field">
                                <label className="admin-label">Bénéficiaires</label>
                                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>{viewingNeed.beneficiaries} familles</div>
                            </div>
                        </div>

                        <div className="admin-field" style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">Description Rapide</label>
                            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-muted)', minHeight: '80px' }}>
                                {viewingNeed.description}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', background: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
                            <div>
                                <label className="admin-label" style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>Montant Requis</label>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{Number(viewingNeed.required_mru).toLocaleString()} <span style={{ fontSize: '1rem' }}>MRU</span></div>
                            </div>
                            <div>
                                <label className="admin-label" style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>Montant Collecté</label>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{Number(viewingNeed.collected_mru).toLocaleString()} <span style={{ fontSize: '1rem' }}>MRU</span></div>
                            </div>
                        </div>

                        {viewingNeed.gps_coordinates && (
                            <div className="admin-field" style={{ marginBottom: '1.5rem' }}>
                                <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <MapPin size={14} color="var(--primary)" /> Emplacement du Besoin
                                </label>
                                <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <MapContainer
                                        center={[parseFloat(viewingNeed.gps_coordinates.split(',')[0]), parseFloat(viewingNeed.gps_coordinates.split(',')[1])]}
                                        zoom={15}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={[parseFloat(viewingNeed.gps_coordinates.split(',')[0]), parseFloat(viewingNeed.gps_coordinates.split(',')[1])]} />
                                    </MapContainer>
                                </div>
                            </div>
                        )}

                        {viewingNeed.partner_name && (
                            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Building2 size={18} /> Partenaire Assigné
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="admin-field">
                                        <label className="admin-label">Établissement</label>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{viewingNeed.partner_name}</div>
                                    </div>
                                    <div className="admin-field">
                                        <label className="admin-label">Horaires</label>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{viewingNeed.partner_hours || 'Non spécifiés'}</div>
                                    </div>
                                    {viewingNeed.partner_specialties && (
                                        <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                                            <label className="admin-label">Spécialités</label>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{viewingNeed.partner_specialties}</div>
                                        </div>
                                    )}
                                    <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                                        <label className="admin-label">Adresse du Partenaire</label>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <MapPin size={14} /> {viewingNeed.partner_address}
                                        </div>
                                    </div>
                                    {viewingNeed.scheduled_time && (
                                        <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                                            <label className="admin-label">Heure de Collecte Prévue</label>
                                            <div style={{ fontWeight: 800, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={16} /> {new Date(viewingNeed.scheduled_time).toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {viewingNeed.partner_gps && (
                            <div className="admin-field" style={{ marginBottom: '1rem' }}>
                                <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Building2 size={14} color="var(--primary)" /> Localisation du Partenaire
                                </label>
                                <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <MapContainer
                                        center={[parseFloat(viewingNeed.partner_gps.split(',')[0]), parseFloat(viewingNeed.partner_gps.split(',')[1])]}
                                        zoom={15}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={[parseFloat(viewingNeed.partner_gps.split(',')[0]), parseFloat(viewingNeed.partner_gps.split(',')[1])]} />
                                    </MapContainer>
                                </div>
                            </div>
                        )}


                        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setViewingNeed(null)}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            <style>

                {`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spinner-border {
                    display: inline-block;
                    width: 2rem;
                    height: 2rem;
                    vertical-align: text-bottom;
                    border: 0.25em solid currentColor;
                    border-right-color: transparent;
                    border-radius: 50%;
                    animation: spin .75s linear infinite;
                }
                `}
            </style>
        </div>
    );
};

export default ValidatorDashboard;
