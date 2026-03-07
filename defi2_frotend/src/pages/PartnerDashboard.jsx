import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Package, Clock, CheckCircle, ChefHat,
    History, Truck, AlertCircle, ArrowRight,
    ShieldCheck
} from 'lucide-react';

const PartnerDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('prepare'); // prepare, collection, payments, history
    const [schedulingOrder, setSchedulingOrder] = useState(null); // The order being scheduled
    const [scheduledTime, setScheduledTime] = useState('');
    const [payments, setPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'partner') {
                navigate('/');
            } else {
                setUser(parsedUser);
                fetchProfile(parsedUser.id);
                fetchOrders(parsedUser.id);
                fetchPayments();
            }
        } else {
            navigate('/auth?mode=login');
        }
    }, [navigate]);
    const fetchProfile = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:8000/api/partner_profile.php?user_id=${userId}`);
            if (!res.data) {
                // If profile doesn't exist, redirect to setup
                navigate('/partner/setup');
            }
        } catch (error) {
            console.error("Error fetching partner profile:", error);
        }
    };

    const fetchOrders = async (userId) => {
        try {
            // Fetch all orders for this partner (removing date filter to show history too)
            const res = await axios.get(`http://localhost:8000/api/partner_orders.php?user_id=${userId}`);
            setOrders(res.data || []);
        } catch (error) {
            console.error("Erreur lors de la récupération des commandes:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPayments = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/partner_payments.php`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setPayments(res.data || []);
        } catch (error) {
            console.error("Error fetching payments:", error);
        }
    };

    const handleStartPreparation = (order) => {
        setSchedulingOrder(order);
        // Default to current time + 2 hours for better UX
        const now = new Date();
        now.setHours(now.getHours() + 2);
        setScheduledTime(now.toISOString().slice(0, 16));
    };

    const submitStartPreparation = async () => {
        if (!schedulingOrder || !scheduledTime) return;
        try {
            await axios.put(`http://localhost:8000/api/partner_orders.php`, {
                order_id: schedulingOrder.id,
                status: 'en_preparation',
                scheduled_time: scheduledTime
            });
            // Update local state
            setOrders(orders.map(o => o.id === schedulingOrder.id ? { ...o, status: 'en_preparation', scheduled_time: scheduledTime } : o));
            setSchedulingOrder(null);
        } catch (error) {
            console.error("Failed to start preparation", error);
        }
    };

    const handleConfirmPreparation = async (orderId) => {
        try {
            await axios.put(`http://localhost:8000/api/partner_orders.php`, {
                order_id: orderId,
                status: 'pret_pour_collecte'
            });
            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'pret_pour_collecte' } : o));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'prepare') return order.status === 'en_attente' || order.status === 'en_preparation';
        if (activeTab === 'collection') return order.status === 'pret_pour_collecte';
        if (activeTab === 'history') return order.status === 'remis';
        return false;
    });

    const stats = {
        toPrepare: orders.filter(o => o.status === 'en_attente' || o.status === 'en_preparation').length,
        ready: orders.filter(o => o.status === 'pret_pour_collecte').length,
        delivered: orders.filter(o => o.status === 'remis').length
    };

    if (loading) return (
        <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner-border" style={{ marginRight: '1rem' }}></div>
            Chargement de votre cuisine...
        </div>
    );

    return (
        <div className="dashboard-full-width" style={{ padding: '3rem', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            {/* Elegant Header Section */}
            <div className="admin-card-glass" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2.5rem 3rem', borderRadius: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--text-main)', marginBottom: '0.5rem', background: 'linear-gradient(90deg, #0F172A, #2D61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Cuisine IHSAN
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: 500 }}>
                        Espace de préparation des dons — Discrétion et Dignité.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="admin-badge badge-blue" style={{ height: 'fit-content', padding: '0.75rem 1.25rem', borderRadius: '15px' }}>
                        <Clock size={18} style={{ marginRight: '8px' }} />
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="admin-kpi-grid-new" style={{ marginBottom: '4rem' }}>
                <div className="admin-card-glass tab-blue" style={{ borderTop: 'none', borderLeft: '6px solid var(--primary)' }}>
                    <div className="kpi-card-inner">
                        <div className="kpi-content">
                            <span className="kpi-label">À Préparer</span>
                            <div className="kpi-value-large">{stats.toPrepare}</div>
                            <span className="kpi-subtext" style={{ fontSize: '0.875rem' }}>Commandes urgentes</span>
                        </div>
                        <div className="progress-circle-wrap">
                            <svg viewBox="0 0 36 36" className="progress-circle blue">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle" strokeDasharray={`${Math.min(100, (stats.toPrepare / (orders.length || 1)) * 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <ChefHat size={18} className="center-icon" color="var(--primary)" />
                        </div>
                    </div>
                </div>

                <div className="admin-card-glass tab-amber" style={{ borderTop: 'none', borderLeft: '6px solid var(--warning)' }}>
                    <div className="kpi-card-inner">
                        <div className="kpi-content">
                            <span className="kpi-label">Prêtes</span>
                            <div className="kpi-value-large">{stats.ready}</div>
                            <span className="kpi-subtext" style={{ fontSize: '0.875rem' }}>Attente de collecte</span>
                        </div>
                        <div className="progress-circle-wrap">
                            <svg viewBox="0 0 36 36" className="progress-circle amber">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle" strokeDasharray={`${Math.min(100, (stats.ready / (orders.length || 1)) * 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <Package size={18} className="center-icon" color="var(--warning)" />
                        </div>
                    </div>
                </div>

                <div className="admin-card-glass tab-green" style={{ borderTop: 'none', borderLeft: '6px solid var(--emerald)' }}>
                    <div className="kpi-card-inner">
                        <div className="kpi-content">
                            <span className="kpi-label">Historique</span>
                            <div className="kpi-value-large">{stats.delivered}</div>
                            <span className="kpi-subtext" style={{ fontSize: '0.875rem' }}>Total des aides</span>
                        </div>
                        <div className="progress-circle-wrap">
                            <svg viewBox="0 0 36 36" className="progress-circle green">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <CheckCircle size={18} className="center-icon" color="var(--emerald)" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Main Orders Section */}
            <div className="admin-card-glass" style={{ padding: '3rem', borderRadius: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h2 className="admin-section-title" style={{ marginBottom: 0, fontSize: '1.75rem', fontWeight: 900 }}>Suivi des Commandes</h2>

                    {/* Modern Tab Switcher */}
                    <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '18px' }}>
                        <button
                            onClick={() => setActiveTab('prepare')}
                            style={{
                                padding: '0.75rem 1.5rem', borderRadius: '14px', border: 'none',
                                background: activeTab === 'prepare' ? 'white' : 'transparent',
                                color: activeTab === 'prepare' ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: activeTab === 'prepare' ? 800 : 600, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: activeTab === 'prepare' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <ChefHat size={18} fill={activeTab === 'prepare' ? 'var(--primary-light)' : 'none'} />
                            À Préparer
                        </button>
                        <button
                            onClick={() => setActiveTab('collection')}
                            style={{
                                padding: '0.75rem 1.5rem', borderRadius: '14px', border: 'none',
                                background: activeTab === 'collection' ? 'white' : 'transparent',
                                color: activeTab === 'collection' ? 'var(--warning)' : 'var(--text-muted)',
                                fontWeight: activeTab === 'collection' ? 800 : 600, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: activeTab === 'collection' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <Truck size={18} />
                            Prêtes
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            style={{
                                padding: '0.75rem 1.5rem', borderRadius: '14px', border: 'none',
                                background: activeTab === 'history' ? 'white' : 'transparent',
                                color: activeTab === 'history' ? 'var(--emerald)' : 'var(--text-muted)',
                                fontWeight: activeTab === 'history' ? 800 : 600, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: activeTab === 'history' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <History size={18} />
                            Historique
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            style={{
                                padding: '0.75rem 1.5rem', borderRadius: '14px', border: 'none',
                                background: activeTab === 'payments' ? 'white' : 'transparent',
                                color: activeTab === 'payments' ? '#8b5cf6' : 'var(--text-muted)',
                                fontWeight: activeTab === 'payments' ? 800 : 600, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: activeTab === 'payments' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <ShieldCheck size={18} />
                            Paiements
                        </button>
                    </div>
                </div>

                {activeTab === 'payments' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                        {payments.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                                <AlertCircle size={40} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-muted)' }}>Aucun paiement enregistré pour le moment.</p>
                            </div>
                        ) : (
                            payments.map(pay => (
                                <div key={pay.id} className="admin-card-glass" style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setSelectedPayment(pay)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                            REF-{pay.id.toString().padStart(4, '0')}
                                        </span>
                                        <span className={`admin-badge ${pay.status === 'Payé' ? 'badge-green' : 'badge-amber'}`}>
                                            {pay.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                                        {parseFloat(pay.amount).toLocaleString()} MRU
                                    </div>
                                    <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem' }}>{pay.need_type}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={14} /> {new Date(pay.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '35px', background: 'rgba(241, 245, 249, 0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem',
                            color: '#cbd5e1', border: '1px solid #e2e8f0'
                        }}>
                            <Package size={50} strokeWidth={1.5} />
                        </div>
                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem' }}>Aucun colis ici</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Les nouvelles commandes s'afficheront dès qu'elles seront assignées par un validateur.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '2rem' }}>
                        {filteredOrders.map(order => (
                            <div key={order.id} className="admin-card-glass" style={{
                                padding: '2rem',
                                borderLeft: '8px solid ' + (activeTab === 'prepare' ? 'var(--primary)' : activeTab === 'collection' ? 'var(--warning)' : 'var(--emerald)'),
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <span style={{
                                            background: activeTab === 'prepare' ? 'var(--primary-light)' : activeTab === 'collection' ? 'rgba(245, 158, 11, 0.1)' : 'var(--emerald-light)',
                                            color: activeTab === 'prepare' ? 'var(--primary)' : activeTab === 'collection' ? 'var(--warning)' : 'var(--emerald)',
                                            padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'
                                        }}>
                                            Commande CLI-{order.id.toString().padStart(4, '0')}
                                        </span>
                                        <h4 style={{ fontSize: '1.5rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {order.orders}
                                        </h4>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '15px', color: 'var(--text-muted)' }}>
                                        <Package size={24} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,40,0.02)', borderRadius: '15px' }}>
                                    {order.scheduled_time && order.scheduled_time !== '0000-00-00 00:00:00' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Clock size={16} color="var(--primary)" />
                                            <span>Prévu le <strong>{new Date(order.scheduled_time).toLocaleDateString()}</strong> à <strong>{new Date(order.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <ChefHat size={16} />
                                        <span>Détails : {order.orders} — Préparation soignée requise.</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    {activeTab === 'prepare' && order.status === 'en_attente' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleStartPreparation(order)}
                                            style={{
                                                padding: '1rem 2rem', borderRadius: '100px',
                                                display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800,
                                                boxShadow: '0 10px 20px rgba(45, 97, 255, 0.2)', width: '100%', justifyContent: 'center'
                                            }}
                                        >
                                            <ArrowRight size={20} /> Commencer la préparation
                                        </button>
                                    )}

                                    {activeTab === 'prepare' && order.status === 'en_preparation' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleConfirmPreparation(order.id)}
                                            style={{
                                                padding: '1rem 2rem', borderRadius: '100px',
                                                display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800,
                                                boxShadow: '0 10px 20px rgba(45, 97, 255, 0.2)', width: '100%', justifyContent: 'center',
                                                background: 'var(--emerald)', borderColor: 'var(--emerald)'
                                            }}
                                        >
                                            <CheckCircle size={20} /> Marquer comme Prête
                                        </button>
                                    )}

                                    {activeTab === 'collection' && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            color: '#92400e', background: '#fef3c7',
                                            padding: '1rem', borderRadius: '18px', fontWeight: 800, width: '100%', justifyContent: 'center'
                                        }}>
                                            <div className="animate-pulse" style={{ width: '10px', height: '10px', background: 'var(--warning)', borderRadius: '50%' }}></div>
                                            Attente du Validateur
                                        </div>
                                    )}

                                    {activeTab === 'history' && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            color: 'var(--emerald)', background: 'var(--emerald-light)',
                                            padding: '1rem', borderRadius: '18px', fontWeight: 800, width: '100%', justifyContent: 'center'
                                        }}>
                                            <CheckCircle size={20} /> Remise effectuée avec succès
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Scheduling Modal */}
            {schedulingOrder && (
                <div className="admin-modal-overlay" onClick={() => setSchedulingOrder(null)}>
                    <div className="admin-card-soft" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>Planifier la collecte</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Veuillez indiquer l'heure à laquelle le validateur pourra venir récupérer la commande <strong>{schedulingOrder.orders}</strong>.
                        </p>

                        <div className="admin-field" style={{ marginBottom: '2rem' }}>
                            <label className="admin-label">Date et Heure de Collecte</label>
                            <input
                                type="datetime-local"
                                className="admin-input"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                style={{ fontSize: '1.1rem', padding: '1rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSchedulingOrder(null)}>Annuler</button>
                            <button className="btn btn-primary" style={{ flex: 2 }} onClick={submitStartPreparation}>Confirmer et Commencer</button>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                .spinner-border {
                    display: inline-block;
                    width: 2rem;
                    height: 2rem;
                    border: 0.25em solid currentColor;
                    border-right-color: transparent;
                    border-radius: 50%;
                    animation: spin .75s linear infinite;
                }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                `}
            </style>
            {/* Payment Details Modal */}
            {selectedPayment && (
                <div className="admin-modal-overlay" onClick={() => setSelectedPayment(null)}>
                    <div className="admin-card-soft" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Détails du Paiement</h3>
                            <button className="admin-modal-close" onClick={() => setSelectedPayment(null)}>&times;</button>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '20px', marginBottom: '2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Montant Reçu</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--primary)' }}>{parseFloat(selectedPayment.amount).toLocaleString()} MRU</div>
                            <div style={{ marginTop: '1rem' }}>
                                <span className={`admin-badge ${selectedPayment.status === 'Payé' ? 'badge-green' : 'badge-amber'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    {selectedPayment.status}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Type de Besoin</span>
                                <span style={{ fontWeight: 800 }}>{selectedPayment.need_type}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Détails Commande</span>
                                <span style={{ fontWeight: 800, textAlign: 'right' }}>{selectedPayment.order_details}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>District</span>
                                <span style={{ fontWeight: 800 }}>{selectedPayment.district}</span>
                            </div>
                            {selectedPayment.transaction_ref && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Réf. Transaction</span>
                                    <span style={{ fontWeight: 800, fontFamily: 'monospace', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{selectedPayment.transaction_ref}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Date</span>
                                <span style={{ fontWeight: 800 }}>{new Date(selectedPayment.created_at).toLocaleString()}</span>
                            </div>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem', borderRadius: '15px' }} onClick={() => setSelectedPayment(null)}>
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerDashboard;
