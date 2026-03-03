import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Clock, CheckCircle, TrendingUp } from 'lucide-react';

const PartnerDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

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
            const today = new Date().toISOString().split('T')[0];
            const res = await axios.get(`http://localhost:8000/api/partner_orders.php?user_id=${userId}&date=${today}`);
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'À préparer': return <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>{status}</span>;
            case 'En préparation': return <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>{status}</span>;
            case 'Prête': return <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>{status}</span>;
            case 'Remise': return <span className="badge" style={{ backgroundColor: '#E0E7FF', color: '#3730A3' }}>{status}</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    if (loading) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Chargement...</div>;

    return (
        <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)', padding: '3rem 0' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="section-title" style={{ margin: 0, textAlign: 'left' }}>
                        Tableau de bord Partenaire
                    </h1>
                </div>

                {/* KPI Cards */}
                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '2rem' }}>
                    <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                        <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
                            <Package size={24} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Commandes à préparer</p>
                            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>
                                {orders.filter(o => o.status === 'À préparer' || o.status === 'En préparation').length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="dashboard-panel">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--secondary)' }}>Commandes du jour</h2>

                    {orders.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                            Aucune commande planifiée pour aujourd'hui.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.map(order => (
                                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <h4 style={{ fontSize: '1.125rem', margin: 0 }}>{order.quantity}x {order.item_type}</h4>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Prévu pour : {new Date(order.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span>Numéro de commande: #{order.id}</span>
                                        </div>
                                    </div>

                                    {(order.status === 'À préparer' || order.status === 'En préparation') && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleConfirmPreparation(order.id)}
                                        >
                                            <CheckCircle size={18} /> Confirmer la préparation
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PartnerDashboard;
