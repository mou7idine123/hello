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
    const [activeTab, setActiveTab] = useState('prepare'); // prepare, collection, history

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'partner') {
                navigate('/');
            } else {
                setUser(parsedUser);
                fetchOrders(parsedUser.id);
            }
        } else {
            navigate('/auth?mode=login');
        }
    }, [navigate]);

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

    const handleConfirmPreparation = async (orderId) => {
        try {
            await axios.put(`http://localhost:8000/api/partner_orders.php`, {
                order_id: orderId,
                status: 'Prête'
            });
            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Prête' } : o));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'prepare') return order.status === 'À préparer' || order.status === 'En préparation';
        if (activeTab === 'collection') return order.status === 'Prête';
        if (activeTab === 'history') return order.status === 'Remise';
        return false;
    });

    const stats = {
        toPrepare: orders.filter(o => o.status === 'À préparer' || o.status === 'En préparation').length,
        ready: orders.filter(o => o.status === 'Prête').length,
        delivered: orders.filter(o => o.status === 'Remise').length
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

                <div className="admin-card-glass tab-blue" style={{ borderTop: 'none', borderLeft: '6px solid #8b5cf6' }}>
                    <div className="kpi-card-inner">
                        <div className="kpi-content">
                            <span className="kpi-label">Satisfaction</span>
                            <div className="kpi-value-large">98%</div>
                            <span className="kpi-subtext" style={{ fontSize: '0.875rem' }}>Taux de conformité</span>
                        </div>
                        <div className="progress-circle-wrap" style={{ opacity: 0.5 }}>
                            <ShieldCheck size={40} className="center-icon" color="#8b5cf6" />
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
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
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
                                            {order.quantity}x {order.item_type}
                                        </h4>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '15px', color: 'var(--text-muted)' }}>
                                        <Package size={24} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,40,0.02)', borderRadius: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Clock size={16} color="var(--primary)" />
                                        <span>Prévu le <strong>{new Date(order.scheduled_time).toLocaleDateString()}</strong> à <strong>{new Date(order.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <ChefHat size={16} />
                                        <span>Type de kit : {order.item_type} — Préparation soignée requise.</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    {activeTab === 'prepare' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleConfirmPreparation(order.id)}
                                            style={{
                                                padding: '1rem 2rem', borderRadius: '100px',
                                                display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800,
                                                boxShadow: '0 10px 20px rgba(45, 97, 255, 0.2)', width: '100%', justifyContent: 'center'
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
        </div>
    );
};

export default PartnerDashboard;
