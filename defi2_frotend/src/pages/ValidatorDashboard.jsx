import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ShieldCheck, PlusCircle, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ValidatorDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchDashboard();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement de votre espace...</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '2rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                    <ShieldCheck color="#10B981" size={32} /> Espace Validateur
                </h1>
                <button
                    onClick={() => navigate('/validator/create-need')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#10B981',
                        color: 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(16, 219, 129, 0.2)'
                    }}
                >
                    <PlusCircle size={20} />
                    Publier un Besoin
                </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', borderLeft: '4px solid #10B981' }}>
                    <p style={{ color: '#64748B', fontWeight: '500', marginBottom: '0.5rem' }}>Score de Réputation</p>
                    <h3 style={{ fontSize: '2rem', color: '#0F172A', fontWeight: '700', margin: 0 }}>{stats.reputation_score} / 100</h3>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', borderLeft: '4px solid #F59E0B' }}>
                    <p style={{ color: '#64748B', fontWeight: '500', marginBottom: '0.5rem' }}>Besoins en cours</p>
                    <h3 style={{ fontSize: '2rem', color: '#0F172A', fontWeight: '700', margin: 0 }}>{stats.active_needs}</h3>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', borderLeft: '4px solid #EF4444' }}>
                    <p style={{ color: '#64748B', fontWeight: '500', marginBottom: '0.5rem' }}>Dons à remettre (Urgent)</p>
                    <h3 style={{ fontSize: '2rem', color: '#0F172A', fontWeight: '700', margin: 0 }}>{stats.donations_to_process}</h3>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', borderLeft: '4px solid #3B82F6' }}>
                    <p style={{ color: '#64748B', fontWeight: '500', marginBottom: '0.5rem' }}>Familles Aidées</p>
                    <h3 style={{ fontSize: '2rem', color: '#0F172A', fontWeight: '700', margin: 0 }}>{stats.total_families_helped}</h3>
                </div>
            </div>

            {/* Needs List */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1E293B', fontWeight: '600' }}>Vos besoins publiés</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <tr>
                            <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Besoin</th>
                            <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Quartier</th>
                            <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Fonds</th>
                            <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.needs_list.map((n) => (
                            <tr key={n.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: '500', color: '#1E293B' }}>{n.type}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px' }}>{n.beneficiaries} bénéficiaires</div>
                                </td>
                                <td style={{ padding: '1rem', color: '#64748B' }}>{n.district}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: '500', color: '#1E293B' }}>{Number(n.collected_mru).toLocaleString()} / {Number(n.required_mru).toLocaleString()} MRU</div>
                                    <div style={{ width: '100%', backgroundColor: '#E2E8F0', height: '6px', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.min(100, (n.collected_mru / n.required_mru) * 100)}%`,
                                            backgroundColor: '#10B981',
                                            height: '100%'
                                        }}></div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {n.status === 'Open' && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500', backgroundColor: '#FEF08A', color: '#854D0E' }}>
                                            <Clock size={14} /> En collecte
                                        </span>
                                    )}
                                    {n.status === 'Funded' && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500', backgroundColor: '#D1FAE5', color: '#065F46' }}>
                                            <CheckCircle size={14} /> Financé (Attente remise)
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {stats.needs_list.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                                    Vous n'avez pas encore publié de besoin. Cliquez sur "Publier un Besoin" pour commencer.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default ValidatorDashboard;
