import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { Users, UserX, Shield, Briefcase, CheckCircle } from 'lucide-react';

const AdminUsers = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users.php');
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users", error);
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await api.put('/admin/users.php', {
                user_id: id,
                action: 'toggle_status',
                is_active: !currentStatus
            });
            fetchUsers();
        } catch (error) {
            console.error("Error toggling status", error);
        }
    };

    const changeRole = async (id, newRole) => {
        try {
            await api.put('/admin/users.php', {
                user_id: id,
                action: 'change_role',
                new_role: newRole
            });
            fetchUsers();
        } catch (error) {
            console.error("Error changing role", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement des utilisateurs...</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users /> Gestion des Utilisateurs
            </h1>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <tr>
                                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Nom</th>
                                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Email</th>
                                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Rôle</th>
                                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Stats</th>
                                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Statut</th>
                                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Inscrit le</th>
                                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: u.is_active ? 'white' : '#FEF2F2' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500', color: '#1E293B' }}>{u.full_name}</div>
                                        {u.role === 'partner' && u.partner_details && (
                                            <div style={{ fontSize: '0.875rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                <Briefcase size={14} /> {u.partner_details.business_name} ({u.partner_details.location})
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748B' }}>{u.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <select
                                            value={u.role}
                                            onChange={(e) => changeRole(u.id, e.target.value)}
                                            style={{
                                                padding: '0.5rem',
                                                borderRadius: '0.5rem',
                                                border: '1px solid #CBD5E1',
                                                backgroundColor: '#F8FAFC',
                                                color: '#334155'
                                            }}
                                        >
                                            <option value="donor">Donneur</option>
                                            <option value="validator">Validateur</option>
                                            <option value="partner">Partenaire</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748B', fontSize: '0.875rem' }}>
                                        {u.role === 'validator' && (
                                            <div>
                                                <div>Score: <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{u.reputation_score}</span></div>
                                                <div>Livr. Confirmées: <span style={{ fontWeight: 'bold' }}>{u.confirmed_deliveries || 0}</span></div>
                                            </div>
                                        )}
                                        {u.role === 'partner' && u.partner_details && (
                                            <div>Commandes: <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{u.partner_details.orders_processed || 0}</span></div>
                                        )}
                                        {u.role === 'donor' && '-'}
                                        {u.role === 'admin' && '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            display: 'inline-flex', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                                            backgroundColor: u.is_active ? '#D1FAE5' : '#FEE2E2',
                                            color: u.is_active ? '#059669' : '#DC2626'
                                        }}>
                                            {u.is_active ? 'Actif' : 'Suspendu'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748B', fontSize: '0.875rem' }}>
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => toggleStatus(u.id, u.is_active)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    backgroundColor: u.is_active ? '#FEF2F2' : '#F0FDF4',
                                                    color: u.is_active ? '#DC2626' : '#16A34A'
                                                }}
                                            >
                                                {u.is_active ? <UserX size={16} /> : <CheckCircle size={16} />}
                                                {u.is_active ? "Suspendre" : "Réactiver"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
