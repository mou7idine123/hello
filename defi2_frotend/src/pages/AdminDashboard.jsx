import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../components/AdminLayout';
import {
    Activity, FileText, CheckCircle, XCircle, AlertTriangle,
    TrendingUp, MapPin, PieChart as PieChartIcon, DollarSign, Clock, Eye
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const CHART_COLORS = ['#2D61FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AdminDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_donations: 0, pending_verifications: 0,
        confirmed_donations: 0, total_collected: 0,
        graph_week: [], graph_district: [], graph_type: []
    });
    const [pendingDonations, setPendingDonations] = useState([]);
    const [loading, setLoading] = useState(true);

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
                action,
                admin_note: adminNote,
                rejection_reason: rejectionReason
            });
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

    const ProgressCircle = ({ percent, color = 'var(--primary)' }) => (
        <div className="progress-circle-wrap">
            <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="22" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                <circle cx="26" cy="26" r="22" fill="none" stroke={color} strokeWidth="4"
                    strokeDasharray="138.2"
                    strokeDashoffset={138.2 - (138.2 * percent) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 26 26)"
                />
            </svg>
            <span style={{ position: 'absolute', fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-main)' }}>{percent}%</span>
        </div>
    );

    if (loading) return (
        <AdminLayout>
            <div className="admin-loading">
                <div className="admin-spinner" />
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Chargement du tableau de bord…</span>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1><Activity size={24} /> Dashboard</h1>
                    <p className="admin-page-subtitle">Vue d'ensemble de l'activité IHSAN</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="admin-btn-icon icon-blue"><Activity size={18} /></button>
                    <button className="admin-btn-icon icon-blue" style={{ background: '#fff', border: '1px solid var(--border)' }}><Clock size={18} /></button>
                </div>
            </div>

            {/* KPI Section - Inspired by "Bills" in image */}
            <div className="admin-section-title">
                Tableau des Dons
                <span>Mise à jour à l'instant</span>
            </div>
            <div className="admin-kpi-grid-new">
                <div className="admin-card-soft">
                    <div className="admin-card-tab tab-blue" />
                    <div className="kpi-card-inner">
                        <div className="kpi-content">
                            <div className="kpi-label">Dons — Aujourd'hui</div>
                            <div className="kpi-value-large">{stats.total_donations}</div>
                            <div className="kpi-subtext">Total reçus cette semaine: 221</div>
                        </div>
                        <ProgressCircle percent={75} color="var(--primary)" />
                    </div>
                </div>

                <div className="admin-card-soft">
                    <div className="admin-card-tab tab-amber" />
                    <div className="kpi-card-inner">
                        <div className="kpi-content">
                            <div className="kpi-label">À vérifier</div>
                            <div className="kpi-value-large" style={{ color: 'var(--warning)' }}>{stats.pending_verifications}</div>
                            <div className="kpi-subtext">Reçus en attente de validation</div>
                        </div>
                        <ProgressCircle percent={Math.min(100, stats.pending_verifications * 10)} color="var(--warning)" />
                    </div>
                </div>

                <div className="admin-card-soft">
                    <div className="admin-card-tab tab-green" />
                    <div className="kpi-card-inner">
                        <div className="kpi-content">
                            <div className="kpi-label">Confirmés</div>
                            <div className="kpi-value-large" style={{ color: 'var(--emerald)' }}>{stats.confirmed_donations}</div>
                            <div className="kpi-subtext">Dons validés avec succès</div>
                        </div>
                        <ProgressCircle percent={92} color="var(--emerald)" />
                    </div>
                </div>
            </div>

            {/* Invoices/Revenue Section - Charts & Gauge */}
            <div className="admin-section-title">Analyse Financière</div>
            <div className="admin-charts-grid" style={{ gridTemplateColumns: 'minmax(300px, 320px) 1fr' }}>
                <div className="admin-card-soft" style={{ padding: '2rem' }}>
                    <div className="admin-card-tab tab-purple" />
                    <div style={{ textAlign: 'center' }}>
                        <div className="kpi-label" style={{ marginBottom: '1.5rem' }}>Progression Objectif</div>
                        <div style={{ height: 180, position: 'relative' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={[{ value: 45 }, { value: 55 }]} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={90} paddingAngle={0} dataKey="value">
                                        <Cell fill="#8B5CF6" />
                                        <Cell fill="#f1f5f9" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>45%</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <div className="kpi-label" style={{ fontSize: '0.7rem' }}>Total collecté</div>
                            <div className="kpi-value-large" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
                                {parseFloat(stats.total_collected || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>MRU</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="admin-card-soft">
                    <div className="admin-chart-header">
                        <div className="kpi-label">Évolution (7 jours)</div>
                    </div>
                    <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                            <LineChart data={stats.graph_week} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-premium)', fontSize: 13, fontWeight: 700 }} />
                                <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: 'var(--primary)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* History Section - Verification Queue */}
            <div className="admin-section-title" style={{ marginTop: '2.5rem' }}>File d'attente</div>
            <div className="admin-card-soft" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="kpi-label">{pendingDonations.length} Demandes en attente</div>
                    <button className="admin-btn-sm" style={{ background: '#f8fafc', fontWeight: 700 }}>Tout voir</button>
                </div>
                {pendingDonations.length === 0 ? (
                    <div className="admin-empty-state">
                        <CheckCircle size={40} />
                        <p>Aucun don en attente de vérification.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Donateur</th>
                                    <th>Date</th>
                                    <th>Montant</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingDonations.map(don => (
                                    <tr key={don.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 50, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary)', fontSize: '0.75rem' }}>
                                                    {(don.donor_name || 'A')[0].toUpperCase()}
                                                </div>
                                                <div className="cell-bold">{don.is_anonymous ? 'Anonyme' : (don.donor_name || 'Inconnu')}</div>
                                            </div>
                                        </td>
                                        <td className="cell-muted">{new Date(don.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="cell-amount">{don.amount} MRU</td>
                                        <td><span className="admin-badge admin-badge-amber">En attente</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="admin-btn-sm admin-btn-primary" onClick={() => setSelectedDonation(don)}>
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

            {/* Verification Modal */}
            {selectedDonation && (
                <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h2>Validation — #{selectedDonation.tracking_id}</h2>
                            <button className="admin-modal-close" onClick={closeModal}>&times;</button>
                        </div>

                        <div className="admin-modal-body">
                            {/* Donation Details */}
                            <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
                                <div className="admin-info-row">
                                    <span className="admin-info-label">Montant réclamé</span>
                                    <span className="admin-info-value" style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 800 }}>{selectedDonation.amount} MRU</span>
                                </div>
                                <div className="admin-info-row">
                                    <span className="admin-info-label">Banque</span>
                                    <span className="admin-info-value">{selectedDonation.selected_bank}</span>
                                </div>
                                <div className="admin-info-row">
                                    <span className="admin-info-label">Référence</span>
                                    <span className="admin-info-value" style={{ fontFamily: 'var(--font-mono, monospace)' }}>{selectedDonation.bank_reference}</span>
                                </div>
                            </div>

                            {/* Receipt Preview */}
                            {selectedDonation.receipt_path && (
                                <div className="admin-receipt-preview">
                                    <div className="admin-label" style={{ marginBottom: '0.5rem' }}>Pièce jointe</div>
                                    <img src={`http://localhost:8000/${selectedDonation.receipt_path}`} alt="Reçu bancaire" />
                                </div>
                            )}

                            {/* Admin Note */}
                            <div className="admin-field" style={{ marginTop: '1.5rem' }}>
                                <label className="admin-label">Note interne (non visible publiquement)</label>
                                <textarea
                                    className="admin-textarea"
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Ex: Reçu vérifié sur l'app BMI, montant correspond."
                                />
                            </div>

                            {/* Rejection Reason */}
                            <div className="admin-field">
                                <label className="admin-label">Motif de rejet (obligatoire si rejet)</label>
                                <textarea
                                    className="admin-textarea"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Message envoyé au donneur (ex: Capture floue, merci de renvoyer)."
                                    style={{ borderColor: rejectionReason ? 'var(--warning)' : undefined }}
                                />
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            <button className="admin-btn-sm admin-btn-danger" onClick={() => handleAction('reject')} disabled={isProcessing}>
                                <XCircle size={16} /> Rejeter
                            </button>
                            <button className="admin-btn-sm admin-btn-success" onClick={() => handleAction('validate')} disabled={isProcessing}>
                                {isProcessing ? 'Validation…' : <><CheckCircle size={16} /> Virement Confirmé</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
