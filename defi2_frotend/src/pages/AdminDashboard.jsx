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
    const [pendingRemises, setPendingRemises] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('donations'); // 'donations', 'remises', 'payments'

    const [selectedDonation, setSelectedDonation] = useState(null);
    const [selectedRemise, setSelectedRemise] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [paymentTransactionRef, setPaymentTransactionRef] = useState('');
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
            const remisesRes = await api.get('/admin/remise_verification.php');
            setPendingRemises(remisesRes.data || []);
            const paymentsRes = await api.get('/admin/partner_payments.php');
            setPendingPayments(paymentsRes.data || []);
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

    const handleRemiseAction = async (action) => {
        setIsProcessing(true);
        try {
            await api.put('/admin/remise_verification.php', {
                need_id: selectedRemise.id,
                action: action === 'validate' ? 'approve' : 'reject'
            });
            fetchDashboardData();
            setSelectedRemise(null);
        } catch (error) {
            console.error("Error processing remise:", error);
            alert("Une erreur est survenue lors de la validation.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSettlePayment = async () => {
        if (!paymentTransactionRef.trim()) {
            alert("Référence de transaction requise.");
            return;
        }
        setIsProcessing(true);
        try {
            await api.put('/admin/partner_payments.php', {
                payment_id: selectedPayment.id,
                transaction_ref: paymentTransactionRef
            });
            fetchDashboardData();
            setSelectedPayment(null);
            setPaymentTransactionRef('');
        } catch (error) {
            console.error("Error settling payment:", error);
            alert("Erreur lors du règlement.");
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
            <div className="admin-kpi-grid-new" style={{ marginBottom: '2.5rem' }}>
                <div className="admin-card-soft">
                    <div className="admin-card-tab tab-blue" />
                    <div className="kpi-card-inner">
                        <div className="kpi-content">
                            <div className="kpi-label">Dons — Aujourd'hui</div>
                            <div className="kpi-value-large">{stats.total_donations}</div>
                            <div className="kpi-subtext">Total reçus ces 7 derniers jours: {stats.weekly_total_count || 0}</div>
                        </div>
                        <ProgressCircle percent={100} color="var(--primary)" />
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
                        <ProgressCircle percent={stats.total_donations > 0 ? Math.round((stats.pending_verifications / stats.total_donations) * 100) : 0} color="var(--warning)" />
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
                        <ProgressCircle percent={stats.total_donations > 0 ? Math.round((stats.confirmed_donations / stats.total_donations) * 100) : 0} color="var(--emerald)" />
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
                            {(() => {
                                const collected = parseFloat(stats.monthly_collected || 0);
                                const objective = parseFloat(stats.monthly_objective || 100000);
                                const progress = Math.min(100, Math.round((collected / objective) * 100));
                                return (
                                    <>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={[{ value: progress }, { value: 100 - progress }]} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={90} paddingAngle={0} dataKey="value">
                                                    <Cell fill="#8B5CF6" />
                                                    <Cell fill="#f1f5f9" />
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>{progress}%</div>
                                        </div>
                                    </>
                                );
                            })()
                            }
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
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setActiveTab('donations')}
                    style={{
                        padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
                        background: activeTab === 'donations' ? 'var(--primary)' : 'white',
                        color: activeTab === 'donations' ? 'white' : 'var(--text-muted)',
                        fontWeight: 700, cursor: 'pointer', transition: '0.2s',
                        boxShadow: activeTab === 'donations' ? '0 4px 12px rgba(45, 97, 255, 0.2)' : 'none'
                    }}
                >
                    Vérification Dons ({pendingDonations.length})
                </button>
                <button
                    onClick={() => setActiveTab('remises')}
                    style={{
                        padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
                        background: activeTab === 'remises' ? 'var(--primary)' : 'white',
                        color: activeTab === 'remises' ? 'white' : 'var(--text-muted)',
                        fontWeight: 700, cursor: 'pointer', transition: '0.2s',
                        boxShadow: activeTab === 'remises' ? '0 4px 12px rgba(45, 97, 255, 0.2)' : 'none'
                    }}
                >
                    Vérification Remises ({pendingRemises.length})
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    style={{
                        padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
                        background: activeTab === 'payments' ? 'var(--primary)' : 'white',
                        color: activeTab === 'payments' ? 'white' : 'var(--text-muted)',
                        fontWeight: 700, cursor: 'pointer', transition: '0.2s',
                        boxShadow: activeTab === 'payments' ? '0 4px 12px rgba(45, 97, 255, 0.2)' : 'none'
                    }}
                >
                    Paiements Partenaires ({pendingPayments.filter(p => p.status === 'En attente').length})
                </button>
            </div>

            <div className="admin-card-soft" style={{ padding: 0, overflow: 'hidden' }}>
                {activeTab === 'donations' ? (
                    <>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="kpi-label">{pendingDonations.length} Demandes de dons en attente</div>
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
                    </>
                ) : activeTab === 'remises' ? (
                    <>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="kpi-label">{pendingRemises.length} Remises terrain à valider</div>
                        </div>
                        {pendingRemises.length === 0 ? (
                            <div className="admin-empty-state">
                                <CheckCircle size={40} />
                                <p>Aucune remise en attente de validation.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Validateur</th>
                                            <th>Partenaire</th>
                                            <th>Type de besoin</th>
                                            <th>Date Remise</th>
                                            <th style={{ textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingRemises.map(rem => (
                                            <tr key={rem.id}>
                                                <td><div className="cell-bold">{rem.validator_name}</div></td>
                                                <td className="cell-muted">{rem.partner_name}</td>
                                                <td><span className="admin-badge admin-badge-blue">{rem.type}</span></td>
                                                <td className="cell-muted">{new Date(rem.remise_time).toLocaleDateString()}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="admin-btn-sm admin-btn-primary" onClick={() => setSelectedRemise(rem)}>
                                                        Vérifier preuve
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="kpi-label">Historique des paiements partenaires</div>
                        </div>
                        {pendingPayments.length === 0 ? (
                            <div className="admin-empty-state">
                                <DollarSign size={40} />
                                <p>Aucun paiement n'a encore été généré.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Partenaire</th>
                                            <th>Besoin</th>
                                            <th>Montant</th>
                                            <th>Réf. Transaction</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingPayments.map(pay => (
                                            <tr key={pay.id}>
                                                <td><div className="cell-bold">{pay.partner_name}</div></td>
                                                <td className="cell-muted" style={{ fontSize: '0.8rem' }}>{pay.need_type}</td>
                                                <td className="cell-amount">{pay.amount} MRU</td>
                                                <td>
                                                    {pay.transaction_ref ? (
                                                        <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{pay.transaction_ref}</span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>À régler</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`admin-badge ${pay.status === 'Payé' ? 'admin-badge-success' : 'admin-badge-amber'}`}>
                                                        {pay.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {pay.status === 'En attente' && (
                                                        <button className="admin-btn-sm admin-btn-success" onClick={() => setSelectedPayment(pay)}>
                                                            Régler
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
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
                            {/* Need Details Section */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={16} /> Détails du besoin
                                </h3>
                                <div style={{ background: '#f0f9ff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid #bae6fd' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedDonation.need_type}</span>
                                        <span className="admin-badge admin-badge-blue">{selectedDonation.district}</span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#0369a1', marginBottom: '1rem', lineHeight: 1.5 }}>
                                        {selectedDonation.description || "Aucune description fournie."}
                                    </p>
                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8125rem' }}>
                                        <div>
                                            <span style={{ color: 'var(--text-muted)' }}>Bénéficiaires: </span>
                                            <span style={{ fontWeight: 700 }}>{selectedDonation.beneficiaries} familles</span>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--text-muted)' }}>Progression: </span>
                                            <span style={{ fontWeight: 700 }}>{parseFloat(selectedDonation.collected_mru).toLocaleString()} / {parseFloat(selectedDonation.required_mru).toLocaleString()} MRU</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Donation Details Section */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <DollarSign size={16} /> Détails du don
                                </h3>
                                <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)' }}>
                                    <div className="admin-info-row">
                                        <span className="admin-info-label">Montant réclamé</span>
                                        <span className="admin-info-value" style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 800 }}>{parseFloat(selectedDonation.amount).toLocaleString()} MRU</span>
                                    </div>
                                    <div className="admin-info-row">
                                        <span className="admin-info-label">Banque choisie</span>
                                        <span className="admin-info-value" style={{ fontWeight: 700 }}>{selectedDonation.selected_bank}</span>
                                    </div>
                                    <div className="admin-info-row">
                                        <span className="admin-info-label">Référence bancaire</span>
                                        <span className="admin-info-value" style={{ fontFamily: 'var(--font-mono, monospace)', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{selectedDonation.bank_reference}</span>
                                    </div>
                                    <div className="admin-info-row" style={{ marginTop: '0.5rem' }}>
                                        <span className="admin-info-label">Donateur</span>
                                        <span className="admin-info-value">{selectedDonation.is_anonymous ? 'Anonyme' : (selectedDonation.donor_name || 'Inconnu')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Receipt Photo Section */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={16} /> Photo du reçu bancaire
                                </h3>
                                {selectedDonation.receipt_path ? (
                                    <div className="admin-receipt-preview" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                        <img
                                            src={`http://localhost:8000/${selectedDonation.receipt_path}`}
                                            alt="Reçu bancaire"
                                            style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain', background: '#f1f5f9' }}
                                        />
                                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                                            <a
                                                href={`http://localhost:8000/${selectedDonation.receipt_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                                            >
                                                <Eye size={14} /> Ouvrir en plein écran
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', background: '#fff1f2', color: '#991b1b', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
                                        <XCircle size={32} style={{ margin: '0 auto 0.5rem' }} />
                                        <p style={{ fontWeight: 700 }}>Aucune photo de reçu fournie.</p>
                                    </div>
                                )}
                            </div>

                            {/* Admin Processing Section */}
                            <div style={{ borderTop: '2px solid var(--border)', paddingTop: '2rem' }}>
                                <div className="admin-field">
                                    <label className="admin-label">Note interne (non visible publiquement)</label>
                                    <textarea
                                        className="admin-textarea"
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Ex: Reçu vérifié sur l'app BMI, montant correspond."
                                    />
                                </div>

                                <div className="admin-field">
                                    <label className="admin-label" style={{ color: rejectionReason ? 'var(--warning)' : undefined }}>
                                        Motif de rejet (obligatoire si rejet)
                                    </label>
                                    <textarea
                                        className="admin-textarea"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Message envoyé au donneur (ex: Capture floue, merci de renvoyer)."
                                        style={{ borderColor: rejectionReason ? 'var(--warning)' : undefined }}
                                    />
                                </div>
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
            {/* Remise Verification Modal */}
            {selectedRemise && (
                <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedRemise(null)}>
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h2>Preuve de remise — {selectedRemise.type}</h2>
                            <button className="admin-modal-close" onClick={() => setSelectedRemise(null)}>&times;</button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div className="kpi-label">Validateur</div>
                                    <div className="cell-bold" style={{ fontSize: '1.1rem' }}>{selectedRemise.validator_name}</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="kpi-label">Partenaire</div>
                                    <div className="cell-bold" style={{ fontSize: '1.1rem' }}>{selectedRemise.partner_name}</div>
                                </div>
                            </div>

                            <div className="kpi-label" style={{ marginBottom: '1rem' }}>Photo de remise (Anonymisée)</div>
                            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
                                <img
                                    src={`http://localhost:8000/${selectedRemise.remise_proof_path}`}
                                    alt="Preuve remise"
                                    style={{ width: '100%', maxHeight: '450px', objectFit: 'contain' }}
                                />
                                <div style={{ padding: '1rem', textAlign: 'center' }}>
                                    <a
                                        href={`http://localhost:8000/${selectedRemise.remise_proof_path}`}
                                        target="_blank" rel="noreferrer"
                                        style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}
                                    >
                                        Voir l'image originale
                                    </a>
                                </div>
                            </div>

                            {selectedRemise.remise_message && (
                                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderLeft: '4px solid var(--primary)', borderRadius: '4px' }}>
                                    <div className="kpi-label" style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Message du Validateur</div>
                                    <p style={{ fontStyle: 'italic', color: 'var(--text-main)', fontSize: '1rem' }}>"{selectedRemise.remise_message}"</p>
                                </div>
                            )}
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn-sm admin-btn-danger" onClick={() => handleRemiseAction('reject')} disabled={isProcessing}>
                                Refuser (Invalide)
                            </button>
                            <button className="admin-btn-sm admin-btn-success" onClick={() => handleRemiseAction('validate')} disabled={isProcessing}>
                                Valider la remise (Publier)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Settlement Modal */}
            {selectedPayment && (
                <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedPayment(null)}>
                    <div className="admin-modal" style={{ maxWidth: '500px' }}>
                        <div className="admin-modal-header">
                            <h2>Règlement — {selectedPayment.partner_name}</h2>
                            <button className="admin-modal-close" onClick={() => setSelectedPayment(null)}>&times;</button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span className="kpi-label">Montant à payer</span>
                                    <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{selectedPayment.amount} MRU</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="kpi-label">Besoin</span>
                                    <span style={{ fontWeight: 700 }}>{selectedPayment.need_type}</span>
                                </div>
                            </div>

                            <div className="admin-field">
                                <label className="admin-label">Référence de Transaction (BPM/Masrivi/etc)</label>
                                <input
                                    type="text"
                                    className="admin-textarea"
                                    style={{ height: 'auto', padding: '0.75rem' }}
                                    value={paymentTransactionRef}
                                    onChange={(e) => setPaymentTransactionRef(e.target.value)}
                                    placeholder="Ex: TR-984KJ2L"
                                />
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn-sm" onClick={() => setSelectedPayment(null)}>Annuler</button>
                            <button className="admin-btn-sm admin-btn-success" onClick={handleSettlePayment} disabled={isProcessing}>
                                Confirmer le virement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
