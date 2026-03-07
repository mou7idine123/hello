import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import AdminLayout from '../components/AdminLayout';
import { Target, Trash2, Edit, Download, Search, Filter } from 'lucide-react';

const AdminNeeds = () => {
    const { t } = useTranslation();
    const [needs, setNeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingNeed, setEditingNeed] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => { fetchNeeds(); }, []);

    const fetchNeeds = async () => {
        try {
            const res = await api.get('/admin/needs.php');
            setNeeds(res.data);
        } catch (error) {
            console.error("Error fetching needs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir annuler ce besoin ? Les donneurs seront notifiés du remboursement.")) return;
        try {
            await api.put('/admin/needs.php', { need_id: id, action: 'cancel' });
            fetchNeeds();
        } catch (error) { console.error("Delete error", error); }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            await api.put('/admin/needs.php', {
                action: 'edit',
                need_id: editingNeed.id,
                type: editingNeed.type,
                district: editingNeed.district,
                description: editingNeed.description,
                required_mru: editingNeed.required_mru,
                beneficiaries: editingNeed.beneficiaries,
                status: editingNeed.status
            });
            setEditingNeed(null);
            fetchNeeds();
        } catch (error) { console.error("Edit error", error); }
    };

    const getStatusBadge = (status) => {
        const map = {
            'ouvert': { cls: 'admin-badge-amber', label: 'Ouvert' },
            'finance': { cls: 'admin-badge-green', label: 'Financé' },
            'en_cours': { cls: 'admin-badge-blue', label: 'En cours' },
            'complete': { cls: 'admin-badge-solid-green', label: 'Complété' },
            'annule': { cls: 'admin-badge-red', label: 'Annulé' },
        };
        const s = map[status] || { cls: 'admin-badge-gray', label: status };
        return <span className={`admin-badge ${s.cls}`}>{s.label}</span>;
    };

    const filtered = needs.filter(n => {
        const matchSearch = n.type.toLowerCase().includes(search.toLowerCase()) ||
            n.district.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || n.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const statCounts = {
        all: needs.length,
        'ouvert': needs.filter(n => n.status === 'ouvert').length,
        'finance': needs.filter(n => n.status === 'finance').length,
        'en_cours': needs.filter(n => n.status === 'en_cours').length,
        'complete': needs.filter(n => n.status === 'complete').length,
        'annule': needs.filter(n => n.status === 'annule').length,
    };

    if (loading) return (
        <AdminLayout>
            <div className="admin-loading">
                <div className="admin-spinner" />
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Chargement des besoins…</span>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <div>
                    <h1><Target size={24} /> Gestion des Besoins</h1>
                    <p className="admin-page-subtitle">{needs.length} besoins enregistrés</p>
                </div>
                <a
                    href={`http://localhost:8000/api/admin/export_csv.php?token=${localStorage.getItem('token')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn-sm"
                    style={{ background: '#0f172a', color: 'white', textDecoration: 'none', padding: '0.625rem 1.25rem' }}
                >
                    <Download size={16} /> Exporter CSV
                </a>
            </div>

            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: 'Tous' },
                    { key: 'ouvert', label: 'Ouverts' },
                    { key: 'finance', label: 'Financés' },
                    { key: 'en_cours', label: 'En cours' },
                    { key: 'complete', label: 'Complétés' },
                    { key: 'annule', label: 'Annulés' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        className={`admin-btn-sm ${statusFilter === tab.key ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                        onClick={() => setStatusFilter(tab.key)}
                        style={statusFilter !== tab.key ? { border: '1px solid var(--border)' } : {}}
                    >
                        {tab.label} <span style={{ opacity: 0.7, marginLeft: '0.25rem' }}>({statCounts[tab.key]})</span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: '320px', marginBottom: '1.5rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                    type="text"
                    className="admin-input"
                    placeholder="Rechercher par type ou quartier…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                />
            </div>

            <div className="admin-table-container">
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Type / Quartier</th>
                                <th>Validateur</th>
                                <th>Objectif</th>
                                <th>Progression</th>
                                <th>Statut</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(n => {
                                const pct = n.required_mru > 0 ? Math.min(100, (n.collected_mru / n.required_mru) * 100) : 0;
                                return (
                                    <tr key={n.id} style={{ opacity: n.status === 'annule' ? 0.5 : 1 }}>
                                        <td>
                                            <div className="cell-bold">{n.type}</div>
                                            <div className="cell-muted">{n.district}</div>
                                        </td>
                                        <td>{n.validator_name || <span className="cell-muted">—</span>}</td>
                                        <td className="cell-amount">{Number(n.required_mru).toLocaleString()} MRU</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ flex: 1, minWidth: '80px', height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#10b981' : 'var(--primary)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                                                </div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pct >= 100 ? '#10b981' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                    {Math.round(pct)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(n.status)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                                                <button className="admin-btn-icon icon-blue" onClick={() => setEditingNeed(n)} title="Modifier">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="admin-btn-icon icon-red" onClick={() => handleDelete(n.id)} title="Annuler">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingNeed && (
                <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingNeed(null)}>
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h2>Modifier le Besoin</h2>
                            <button className="admin-modal-close" onClick={() => setEditingNeed(null)}>&times;</button>
                        </div>
                        <form onSubmit={handleEditSave}>
                            <div className="admin-modal-body">
                                <div className="admin-field">
                                    <label className="admin-label">Type / Titre</label>
                                    <input type="text" className="admin-input" value={editingNeed.type} onChange={e => setEditingNeed({ ...editingNeed, type: e.target.value })} required />
                                </div>
                                <div className="admin-field">
                                    <label className="admin-label">Quartier</label>
                                    <input type="text" className="admin-input" value={editingNeed.district} onChange={e => setEditingNeed({ ...editingNeed, district: e.target.value })} required />
                                </div>
                                <div className="admin-field">
                                    <label className="admin-label">Description</label>
                                    <textarea className="admin-textarea" value={editingNeed.description} onChange={e => setEditingNeed({ ...editingNeed, description: e.target.value })} required />
                                </div>
                                <div className="admin-settings-grid">
                                    <div className="admin-field">
                                        <label className="admin-label">Montant Requis (MRU)</label>
                                        <input type="number" className="admin-input" value={editingNeed.required_mru} onChange={e => setEditingNeed({ ...editingNeed, required_mru: e.target.value })} required />
                                    </div>
                                    <div className="admin-field">
                                        <label className="admin-label">Bénéficiaires</label>
                                        <input type="number" className="admin-input" value={editingNeed.beneficiaries || ''} onChange={e => setEditingNeed({ ...editingNeed, beneficiaries: e.target.value })} />
                                    </div>
                                    <div className="admin-field">
                                        <label className="admin-label">Statut</label>
                                        <select className="admin-input" value={editingNeed.status || 'ouvert'} onChange={e => setEditingNeed({ ...editingNeed, status: e.target.value })}>
                                            <option value="ouvert">Ouvert</option>
                                            <option value="finance">Financé</option>
                                            <option value="en_cours">En cours</option>
                                            <option value="complete">Complété</option>
                                            <option value="annule">Annulé</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="admin-btn-sm admin-btn-ghost" style={{ border: '1px solid var(--border)' }} onClick={() => setEditingNeed(null)}>Annuler</button>
                                <button type="submit" className="admin-btn-sm admin-btn-primary">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminNeeds;
