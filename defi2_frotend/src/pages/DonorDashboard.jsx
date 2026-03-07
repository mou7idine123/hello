import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Heart, Activity, CheckCircle, Bell, ExternalLink, Image as ImageIcon, Clock, CheckCircle2, ShieldCheck, Upload, ArrowLeft, ArrowRight, MapPin, XCircle, X, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DonorDashboard = () => {
    const { t } = useTranslation();
    const [summary, setSummary] = useState({
        totalDonated: 0,
        donationCount: 0,
        familiesHelped: 0
    });
    const [currentDonations, setCurrentDonations] = useState([]);
    const [openNeeds, setOpenNeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!user) {
            window.location.href = '/auth?mode=login';
            return;
        }

        const fetchData = async () => {
            try {
                const res = await api.get(`/user_donations.php`);
                const donations = res.data;
                setCurrentDonations(donations);

                const total = donations.reduce((acc, d) => acc + parseFloat(d.amount), 0);
                const uniqueNeeds = new Set(donations.map(d => d.need_id)).size;

                setSummary({
                    totalDonated: total,
                    donationCount: donations.length,
                    familiesHelped: uniqueNeeds // simplified
                });

                // Fetch All Needs & Filter Open ones
                const needsRes = await api.get('/needs.php');
                const open = needsRes.data.filter(n => n.status === 'ouvert');
                setOpenNeeds(open);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Only show in the Impact gallery if the NEED itself is fully delivered (complete)
    const confirmedDonations = currentDonations.filter(d => d.need_status === 'complete');

    const getStatusBadge = (status) => {
        const transStatus = t(`dashboard.status.${status}`) || status;
        switch (status) {
            case 'en_attente':
                return <span className="badge badge-in-progress" style={{ backgroundColor: '#cce5ff', color: '#004085' }}><Clock size={12} className="inline mr-1" /> {transStatus}</span>;
            case 'verifie':
                return <span className="badge badge-success" style={{ backgroundColor: '#d4edda', color: '#155724' }}><ShieldCheck size={12} className="inline mr-1" /> {transStatus}</span>;
            case 'refuse':
                return <span className="badge badge-danger" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}><XCircle size={12} className="inline mr-1" /> {transStatus}</span>;
            case 'Remis':
            case 'complete':
                return <span className="badge badge-success" style={{ backgroundColor: '#d4edda', color: '#155724' }}><CheckCircle2 size={12} className="inline mr-1" /> {status === 'complete' ? 'Livré / Terminé' : transStatus}</span>;
            default:
                return <span className="badge" style={{ backgroundColor: '#f8fafc', color: 'var(--text-muted)' }}>{status}</span>;
        }
    };

    const renderDonationModal = () => {
        if (!selectedDonation) return null;
        const don = selectedDonation;
        const progress = Math.min(100, (parseFloat(don.collected_mru) / parseFloat(don.required_mru)) * 100);

        return (
            <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                <div className="admin-modal" onClick={e => e.stopPropagation()}>
                    <div className="admin-modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Détails du Don</h2>
                        <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="admin-modal-body" style={{ padding: '1.5rem' }}>
                        {/* Need Context Section */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Heart size={18} color="var(--primary)" /> À propos du besoin
                                </h3>
                                <span className={`badge badge-${don.status === 'ouvert' ? 'open' : 'finance'}`} style={{ fontSize: '0.75rem' }}>
                                    {don.status === 'ouvert' ? '🟢 Ouvert' : '🔵 Financé'}
                                </span>
                            </div>
                            <div style={{ background: 'var(--background)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{don.type}</div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>{don.district}</div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>{don.description}</p>

                                <div className="progress-container">
                                    <div className="progress-bar-bg" style={{ height: '8px', marginBottom: '0.5rem' }}>
                                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span style={{ fontWeight: 600 }}>{parseFloat(don.collected_mru).toLocaleString()} MRU / {parseFloat(don.required_mru).toLocaleString()} MRU</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{don.beneficiaries} bénéficiaires</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Donation Details Section */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShieldCheck size={18} color="var(--secondary)" /> Détails de votre contribution
                            </h3>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                {[
                                    { label: 'Date', value: new Date(don.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) },
                                    { label: 'Montant', value: `${parseFloat(don.amount).toLocaleString()} MRU`, highlight: true },
                                    { label: 'Statut', value: getStatusBadge(don.status) },
                                    { label: 'Banque choisie', value: don.selected_bank || 'Non spécifié' },
                                    { label: 'Référence bancaire', value: <code style={{ fontSize: '0.8rem' }}>{don.bank_reference || 'N/A'}</code> },
                                    { label: 'ID de suivi', value: <code style={{ fontSize: '0.8rem' }}>{don.tracking_id}</code> },
                                ].map((row, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderBottom: idx === 5 ? 'none' : '1px solid var(--border)' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{row.label}</span>
                                        <span style={{ fontWeight: row.highlight ? 800 : 600, color: row.highlight ? 'var(--primary)' : 'inherit', fontSize: '0.9rem' }}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                            {don.sha256_hash && (
                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '4px', border: '1px dashed var(--border)' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Empreinte Numérique (SHA-256)</div>
                                    <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{don.sha256_hash}</code>
                                </div>
                            )}
                        </div>

                        {/* Evidence Section */}
                        {(don.receipt_path || don.delivery_photo_path || don.remise_proof_path) && (
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ImageIcon size={18} color="#10b981" /> Preuves & Justificatifs
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: (don.receipt_path && (don.delivery_photo_path || don.remise_proof_path)) ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                                    {don.receipt_path && (
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Votre reçu bancaire</div>
                                            <img
                                                src={`http://localhost:8000/${don.receipt_path}`}
                                                alt="Reçu"
                                                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'zoom-in' }}
                                                onClick={() => window.open(`http://localhost:8000/${don.receipt_path}`, '_blank')}
                                            />
                                        </div>
                                    )}
                                    {(don.delivery_photo_path || don.remise_proof_path) && (
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: '#10b981' }}>Preuve de remise</div>
                                            <img
                                                src={`http://localhost:8000/${don.remise_proof_path || don.delivery_photo_path}`}
                                                alt="Preuve"
                                                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid #10b981', cursor: 'zoom-in' }}
                                                onClick={() => window.open(`http://localhost:8000/${don.remise_proof_path || don.delivery_photo_path}`, '_blank')}
                                            />
                                        </div>
                                    )}
                                </div>
                                {(don.delivery_message || don.remise_message) && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16,185,129,0.05)', borderLeft: '4px solid #10b981', borderRadius: '0 4px 4px 0' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#065f46', marginBottom: '0.25rem' }}>Note de livraison</div>
                                        <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{don.remise_message || don.delivery_message}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return (
        <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Chargement…</div>
        </section>
    );

    return (
        <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 className="section-title" style={{ margin: 0, textAlign: 'left' }}>{t('dashboard.title')}</h2>
                    <Link to="/" className="btn btn-outline flex items-center gap-2" style={{ padding: '0.5rem 1.25rem', borderRadius: '99px', fontWeight: '600', borderColor: 'var(--primary)', color: 'var(--primary)', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}>
                        <ArrowLeft size={18} />
                        <span>{t('dashboard.backToHome')}</span>
                    </Link>
                </div>

                {/* Personal Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="dashboard-panel text-center">
                        <Heart size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{summary.totalDonated.toLocaleString()} {t('dashboard.mru')}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{t('dashboard.totalDonated')}</div>
                    </div>
                    <div className="dashboard-panel text-center">
                        <Activity size={32} color="var(--secondary)" style={{ margin: '0 auto 1rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>{summary.donationCount}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{t('dashboard.donationsMade')}</div>
                    </div>
                    <div className="dashboard-panel text-center">
                        <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{summary.familiesHelped}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{t('dashboard.familiesHelped')}</div>
                    </div>
                </div>

                {/* Open Needs Discovery Section */}
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 className="flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                            <Heart size={24} color="var(--primary)" /> Besoins Ouverts
                        </h3>
                        <Link to="/catalog" className="text-primary hover:text-primary-dark" style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Voir tout <ArrowRight size={16} />
                        </Link>
                    </div>

                    {openNeeds.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Aucun besoin ouvert pour le moment. Merci pour votre générosité continue !</p>
                        </div>
                    ) : (
                        <div className="catalog-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {openNeeds.slice(0, 3).map(need => {
                                const progress = Math.min(100, (parseFloat(need.collected_mru) / parseFloat(need.required_mru)) * 100);
                                return (
                                    <div key={need.id} className="need-card" style={{ padding: '1.5rem' }}>
                                        <div className="card-header" style={{ marginBottom: '1rem' }}>
                                            <span className="card-type" style={{ fontSize: '1.1rem' }}>{need.type}</span>
                                        </div>
                                        <div className="card-district" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
                                            <MapPin size={14} />
                                            {need.district} ({need.beneficiaries} familles)
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {need.description}
                                        </p>
                                        <div className="progress-container" style={{ marginBottom: '1.5rem' }}>
                                            <div className="progress-bar-bg" style={{ height: '6px', marginBottom: '0.5rem' }}>
                                                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                                            </div>
                                            <div className="progress-stats" style={{ fontSize: '0.8rem' }}>
                                                <span className="amount">{parseFloat(need.collected_mru).toLocaleString()} MRU <span className="label">collectés</span></span>
                                                <span className="label">Objectif: {parseFloat(need.required_mru).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <Link to={`/donate/${need.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                            Donner
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Current Donations */}
                    <div className="dashboard-panel">
                        <h3 className="flex items-center gap-2" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                            <Clock size={20} color="var(--primary)" /> {t('dashboard.currentDonations')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {currentDonations.map(don => (
                                <div
                                    key={don.id}
                                    onClick={() => { setSelectedDonation(don); setShowModal(true); }}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer', transition: 'transform 0.2s', transform: 'scale(1)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{don.tracking_id}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{don.date}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{parseFloat(don.amount).toLocaleString()} {t('dashboard.mru')}</div>
                                        <div>{don.delivery_photo_path ? (
                                            <span className="badge badge-success" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                                                <CheckCircle2 size={12} className="inline mr-1" /> Livré / Terminé
                                            </span>
                                        ) : getStatusBadge(don.status)}</div>
                                        {don.sha256_hash && (
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'monospace', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={don.sha256_hash}>
                                                HASH: {don.sha256_hash.substring(0, 10)}...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {currentDonations.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>{t('dashboard.noCurrentDonations')}</div>
                            )}
                        </div>
                    </div>

                    {/* Confirmed Donations */}
                    <div className="dashboard-panel">
                        <h3 className="flex items-center gap-2" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                            <CheckCircle2 size={20} color="#10b981" /> {t('dashboard.historyAndImpact')}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {confirmedDonations.map(don => (
                                <div
                                    key={don.id}
                                    onClick={() => { setSelectedDonation(don); setShowModal(true); }}
                                    style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden', cursor: 'pointer' }}
                                >
                                    <div style={{ position: 'relative', height: '160px' }}>
                                        <img
                                            src={don.remise_proof_path ? `http://localhost:8000/${don.remise_proof_path}` : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                                            alt="Preuve d'impact"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <ImageIcon size={12} /> {t('dashboard.anonymized')}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700 }}>#{don.tracking_id}</span>
                                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{parseFloat(don.amount).toLocaleString()} {t('dashboard.mru')}</span>
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{new Date(don.date).toLocaleDateString()}</div>
                                        <Link
                                            to={`/impact/${don.id}`}
                                            className="btn btn-outline w-full"
                                            style={{ padding: '0.5rem', fontSize: '0.875rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink size={16} /> {t('dashboard.seeImpactProof')}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {showModal && renderDonationModal()}
        </section>
    );
};

export default DonorDashboard;
