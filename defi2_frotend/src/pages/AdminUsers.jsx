import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import AdminLayout from '../components/AdminLayout';
import { Users, UserX, Shield, Briefcase, CheckCircle, Search } from 'lucide-react';

const AdminUsers = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users.php');
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await api.put('/admin/users.php', { user_id: id, action: 'toggle_status', is_active: !currentStatus });
            fetchUsers();
        } catch (error) { console.error("Error toggling status", error); }
    };

    const changeRole = async (id, newRole) => {
        try {
            await api.put('/admin/users.php', { user_id: id, action: 'change_role', new_role: newRole });
            fetchUsers();
        } catch (error) { console.error("Error changing role", error); }
    };

    const getRoleBadge = (role) => {
        const map = {
            admin: { cls: 'admin-badge-purple', label: 'Admin' },
            validator: { cls: 'admin-badge-blue', label: 'Validateur' },
            partner: { cls: 'admin-badge-green', label: 'Partenaire' },
            donor: { cls: 'admin-badge-gray', label: 'Donneur' },
        };
        const r = map[role] || { cls: 'admin-badge-gray', label: role };
        return <span className={`admin-badge ${r.cls}`}>{r.label}</span>;
    };

    const filtered = users.filter(u => {
        const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    if (loading) return (
        <AdminLayout>
            <div className="admin-loading">
                <div className="admin-spinner" />
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Chargement des utilisateurs…</span>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <div>
                    <h1><Users size={24} /> Gestion des Utilisateurs</h1>
                    <p className="admin-page-subtitle">{users.length} utilisateurs enregistrés</p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', maxWidth: '320px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        className="admin-input"
                        placeholder="Rechercher par nom ou email…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
                <select className="admin-role-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ minWidth: '160px' }}>
                    <option value="all">Tous les rôles</option>
                    <option value="donor">Donneurs</option>
                    <option value="validator">Validateurs</option>
                    <option value="partner">Partenaires</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            <div className="admin-table-container">
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Utilisateur</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Statistiques</th>
                                <th>Statut</th>
                                <th>Inscrit le</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.id} className={!u.is_active ? 'row-suspended' : ''}>
                                    <td>
                                        <div className="cell-bold">{u.full_name}</div>
                                        {u.role === 'partner' && u.partner_details && (
                                            <div className="cell-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                <Briefcase size={12} /> {u.partner_details.business_name} ({u.partner_details.location})
                                            </div>
                                        )}
                                    </td>
                                    <td className="cell-muted">{u.email}</td>
                                    <td>
                                        <select
                                            className="admin-role-select"
                                            value={u.role}
                                            onChange={(e) => changeRole(u.id, e.target.value)}
                                        >
                                            <option value="donor">Donneur</option>
                                            <option value="validator">Validateur</option>
                                            <option value="partner">Partenaire</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        {u.role === 'validator' && (
                                            <div style={{ fontSize: '0.8125rem' }}>
                                                <div>Score: <strong style={{ color: 'var(--primary)' }}>{u.reputation_score}</strong></div>
                                                <div className="cell-muted">Livraisons: <strong>{u.confirmed_deliveries || 0}</strong></div>
                                            </div>
                                        )}
                                        {u.role === 'partner' && u.partner_details && (
                                            <div style={{ fontSize: '0.8125rem' }}>
                                                Commandes: <strong style={{ color: 'var(--emerald)' }}>{u.partner_details.orders_processed || 0}</strong>
                                            </div>
                                        )}
                                        {(u.role === 'donor' || u.role === 'admin') && <span className="cell-muted">—</span>}
                                    </td>
                                    <td>
                                        <span className={`admin-badge ${u.is_active ? 'admin-badge-solid-green' : 'admin-badge-solid-red'}`}>
                                            {u.is_active ? 'Actif' : 'Suspendu'}
                                        </span>
                                    </td>
                                    <td className="cell-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {u.role !== 'admin' && (
                                            <button
                                                className={`admin-btn-sm ${u.is_active ? 'admin-btn-danger' : 'admin-btn-success'}`}
                                                onClick={() => toggleStatus(u.id, u.is_active)}
                                            >
                                                {u.is_active ? <><UserX size={14} /> Suspendre</> : <><CheckCircle size={14} /> Réactiver</>}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
