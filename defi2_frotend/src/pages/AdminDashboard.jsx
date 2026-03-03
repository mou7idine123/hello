import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, FileText, CheckCircle, XCircle, AlertTriangle, TrendingUp, MapPin, PieChart as PieChartIcon, Users, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total_donations: 0, pending_verifications: 0, confirmed_donations: 0, total_collected: 0, graph_week: [], graph_district: [], graph_type: [] });
    const [pendingDonations, setPendingDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state for verification
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'admin') {
                navigate('/');
            } else {
                fetchDashboardData();
            }
        } else {
            navigate('/auth?mode=login');
        }
    }, [navigate]);

    const fetchDashboardData = async () => {
        try {
            const statsRes = await api.get('/admin/dashboard_stats.php');
            setStats(statsRes.data);

            const donationsRes = await api.get('/admin/donations.php');
            setPendingDonations(donationsRes.data);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        if (action === 'reject' && !rejectionReason.trim()) {
            alert("Un motif de refus est requis pour rejeter ce reçu.");
            return;
        }

        setIsProcessing(true);
        try {
            await api.put('/admin/donations.php', {
                donation_id: selectedDonation.id,
                action: action,
                admin_note: adminNote,
                rejection_reason: rejectionReason
            });
            // Resync
            fetchDashboardData();
            closeModal();
        } catch (error) {
            console.error("Error processing donation:", error);
            alert("Une erreur est survenue lors du traitement.");
        } finally {
            setIsProcessing(false);
        }
    };

    const closeModal = () => {
        setSelectedDonation(null);
        setAdminNote('');
        setRejectionReason('');
    };

    if (loading) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Chargement Admin...</div>;

    return (
        <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)', padding: '3rem 0' }}>
            <div className="container">
                <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                    <button onClick={() => navigate("/admin/users")} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Users size={18} /> Gérer les Utilisateurs</button>
                    <button onClick={() => navigate("/admin/needs")} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><FileText size={18} /> Gérer les Besoins</button>
                    <button onClick={() => navigate("/admin/settings")} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Activity size={18} /> Paramètres Généraux</button>
                </div>
                <h1 className="section-title" style={{ margin: 0, textAlign: 'left', marginBottom: '2rem' }}>
                    Espace d'Administration
                </h1>

                {/* KPI Cards */}
                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="dashboard-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Dons (Aujourd'hui)</p>
                        <h3 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats.total_donations}</h3>
                    </div>
                    <div className="dashboard-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>À vérifier (Urgent)</p>
                        <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: 'var(--warning)' }}>{stats.pending_verifications}</h3>
                    </div>
                    <div className="dashboard-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Virements Confirmés</p>
                        <h3 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats.confirmed_donations}</h3>
                    </div>
                    <div className="dashboard-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #3B82F6' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Total Distribué (MRU)</p>
                        <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: '#3B82F6' }}>{parseFloat(stats.total_collected).toLocaleString()}</h3>
                    </div>
                </div>

                {/* Graphs Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>

                    {/* Evolution Chart */}
                    <div className="dashboard-panel">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <TrendingUp color="var(--primary)" />
                            <h2 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>Évolution des Dons (7 jours)</h2>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={stats.graph_week} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} />
                                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <RechartsTooltip />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* District Chart */}
                    <div className="dashboard-panel">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <MapPin color="var(--success)" />
                            <h2 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>Dons par Quartier</h2>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={stats.graph_district} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
                                    <XAxis dataKey="district" tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <RechartsTooltip />
                                    <Bar dataKey="total" fill="var(--success)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Need Type Chart */}
                    <div className="dashboard-panel">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <PieChartIcon color="#F59E0B" />
                            <h2 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>Dons par Type de Besoin</h2>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={stats.graph_type} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="total" nameKey="type">
                                        {stats.graph_type?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'][index % 5]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Queue */}
                <div className="dashboard-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <AlertTriangle color="var(--warning)" />
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>File d'attente des vérifications (Reçus soumis)</h2>
                    </div>

                    {pendingDonations.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Aucun don en attente de vérification.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date & Heure</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Donateur</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Besoin (Dest.)</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Montant</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Banque / Réf.</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Preuve</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingDonations.map(don => (
                                        <tr key={don.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem' }}>{new Date(don.created_at).toLocaleString()}</td>
                                            <td style={{ padding: '1rem', fontWeight: 600 }}>{don.is_anonymous ? 'Anonyme' : (don.donor_name || 'Inconnu')}</td>
                                            <td style={{ padding: '1rem' }}>{don.need_type} ({don.district})</td>
                                            <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>{don.amount} MRU</td>
                                            <td style={{ padding: '1rem' }}>{don.selected_bank}<br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Réf: {don.bank_reference}</span></td>
                                            <td style={{ padding: '1rem' }}>
                                                {don.receipt_path ? (
                                                    <a href={`http://localhost:8000/${don.receipt_path}`} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <FileText size={16} /> Voir le reçu
                                                    </a>
                                                ) : 'Aucun'}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                    onClick={() => setSelectedDonation(don)}
                                                >
                                                    Vérifier
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de vérification */}
            {selectedDonation && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>Validation du Don #{selectedDonation.tracking_id}</h2>
                            <button onClick={closeModal} style={{ fontSize: '1.5rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <p><strong>Montant réclamé :</strong> <span style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 800 }}>{selectedDonation.amount} MRU</span></p>
                            <p><strong>Banque envoyée :</strong> {selectedDonation.selected_bank}</p>
                            <p><strong>Référence :</strong> {selectedDonation.bank_reference}</p>
                            {selectedDonation.receipt_path && (
                                <div style={{ marginTop: '1rem', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pièce jointe :</p>
                                    <img src={`http://localhost:8000/${selectedDonation.receipt_path}`} alt="Reçu bancaire" style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain' }} />
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Note Interne Admin (Non visible publiquement)</label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', minHeight: '80px', fontFamily: 'inherit' }}
                                placeholder="Laisser une trace de votre vérification (ex: Reçu illisible mais virement confirmé sur App BMI)."
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Motif de rejet (Obligatoire uniquement si rejet)</label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning)', minHeight: '80px', fontFamily: 'inherit' }}
                                placeholder="Message à envoyer au donneur pour le refus (ex: La capture est floue, merci de renvoyer)."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-outline"
                                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                onClick={() => handleAction('reject')}
                                disabled={isProcessing}
                            >
                                <XCircle size={18} /> Rejeter
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleAction('validate')}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Validation...' : <><CheckCircle size={18} /> Virement Confirmé</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AdminDashboard;
