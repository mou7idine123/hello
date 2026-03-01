import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Activity, CheckCircle, Bell, ExternalLink, Image as ImageIcon, Clock, CheckCircle2, ShieldCheck, Upload, ArrowLeft } from 'lucide-react';

const DonorDashboard = () => {
    const [summary, setSummary] = useState({
        totalDonated: 0,
        donationCount: 0,
        familiesHelped: 0
    });
    const [currentDonations, setCurrentDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            window.location.href = '/auth?mode=login';
            return;
        }

        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/user_donations.php?user_id=${user.id}`);
                const donations = res.data;
                setCurrentDonations(donations);

                const total = donations.reduce((acc, d) => acc + parseFloat(d.amount), 0);
                const uniqueNeeds = new Set(donations.map(d => d.need_id)).size;

                setSummary({
                    totalDonated: total,
                    donationCount: donations.length,
                    familiesHelped: uniqueNeeds // simplified
                });
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Mock data for Confirmed Donations (remains mock for now or fetched as part of history)
    const confirmedDonations = [
        { id: 'DON-4700', amount: 15000, date: '2023-09-15', hederaLink: '#', photo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
        { id: 'DON-4612', amount: 7000, date: '2023-08-02', hederaLink: '#', photo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
    ];

    // Mock data for Notifications
    const notifications = [
        { id: 1, type: 'success', message: 'Bienvenue sur votre tableau de bord.', date: 'Maintenant' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'En attente de virement':
                return <span className="badge badge-open" style={{ backgroundColor: '#fff3cd', color: '#856404' }}><Clock size={12} className="inline mr-1" /> {status}</span>;
            case 'Reçu soumis':
                return <span className="badge badge-in-progress" style={{ backgroundColor: '#cce5ff', color: '#004085' }}><Upload size={12} className="inline mr-1" /> {status}</span>;
            case 'Vérifié':
                return <span className="badge badge-success" style={{ backgroundColor: '#d4edda', color: '#155724' }}><ShieldCheck size={12} className="inline mr-1" /> {status}</span>;
            case 'Remis':
                return <span className="badge badge-success" style={{ backgroundColor: '#d4edda', color: '#155724' }}><CheckCircle2 size={12} className="inline mr-1" /> {status}</span>;
            default:
                return <span className="badge">{status}</span>;
        }
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
                    <h2 className="section-title" style={{ margin: 0, textAlign: 'left' }}>Mon Espace Donateur</h2>
                    <Link to="/" className="btn btn-outline flex items-center gap-2" style={{ padding: '0.5rem 1.25rem', borderRadius: '99px', fontWeight: '600', borderColor: 'var(--primary)', color: 'var(--primary)', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}>
                        <ArrowLeft size={18} />
                        <span>Retour à l'accueil</span>
                    </Link>
                </div>

                {/* Personal Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="dashboard-panel text-center">
                        <Heart size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{summary.totalDonated.toLocaleString()} MRU</div>
                        <div style={{ color: 'var(--text-muted)' }}>Total donné</div>
                    </div>
                    <div className="dashboard-panel text-center">
                        <Activity size={32} color="var(--secondary)" style={{ margin: '0 auto 1rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>{summary.donationCount}</div>
                        <div style={{ color: 'var(--text-muted)' }}>Dons effectués</div>
                    </div>
                    <div className="dashboard-panel text-center">
                        <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{summary.familiesHelped}</div>
                        <div style={{ color: 'var(--text-muted)' }}>Familles aidées</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Current Donations */}
                        <div className="dashboard-panel">
                            <h3 className="flex items-center gap-2" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                                <Clock size={20} color="var(--primary)" /> Mes dons en cours
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {currentDonations.map(don => (
                                    <div key={don.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{don.tracking_id}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{don.date}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{parseFloat(don.amount).toLocaleString()} MRU</div>
                                            <div>{getStatusBadge(don.status)}</div>
                                        </div>
                                    </div>
                                ))}
                                {currentDonations.length === 0 && (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Vous n'avez pas de dons en cours.</div>
                                )}
                            </div>
                        </div>

                        {/* Confirmed Donations */}
                        <div className="dashboard-panel">
                            <h3 className="flex items-center gap-2" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                                <CheckCircle2 size={20} color="#10b981" /> Historique et Preuves d'impact
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {confirmedDonations.map(don => (
                                    <div key={don.id} style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                        <div style={{ position: 'relative', height: '160px' }}>
                                            <img src={don.photo} alt="Preuve d'impact anonymisée" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <ImageIcon size={12} /> Anonymisé
                                            </div>
                                        </div>
                                        <div style={{ padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 700 }}>{don.id}</span>
                                                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{don.amount.toLocaleString()} MRU</span>
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{don.date}</div>
                                            <Link to={`/impact/${don.id}`} className="btn btn-outline w-full" style={{ padding: '0.5rem', fontSize: '0.875rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                                <ExternalLink size={16} /> Voir la preuve d'impact
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="dashboard-panel" style={{ position: 'sticky', top: '90px' }}>
                        <h3 className="flex items-center gap-2" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                            <Bell size={20} color="var(--primary)" /> Notifications
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {notifications.map(notif => (
                                <div key={notif.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: notif.type === 'success' ? '#10b981' : notif.type === 'info' ? '#3b82f6' : 'var(--primary)',
                                        marginTop: '0.35rem',
                                        flexShrink: 0
                                    }} />
                                    <div>
                                        <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem', lineHeight: 1.4 }}>{notif.message}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notif.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DonorDashboard;
