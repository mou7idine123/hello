import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { Target, Trash2, Edit, CheckCircle, Download } from 'lucide-react';

const AdminNeeds = () => {
    const { t } = useTranslation();
    const [needs, setNeeds] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingNeed, setEditingNeed] = useState(null);

    useEffect(() => {
        fetchNeeds();
    }, []);

    const fetchNeeds = async () => {
        try {
            const res = await api.get('/admin/needs.php');
            setNeeds(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching needs", error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer/annuler ce besoin ? S'il y a des fonds, les donneurs seront notifiés du remboursement.")) return;
        try {
            await api.put('/admin/needs.php', { need_id: id, action: 'cancel' });
            fetchNeeds();
        } catch (error) {
            console.error("Delete error", error);
        }
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
                beneficiaries: editingNeed.beneficiaries
            });
            setEditingNeed(null);
            fetchNeeds();
        } catch (error) {
            console.error("Edit error", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Open': return { bg: '#FEF08A', color: '#854D0E', label: 'Ouvert' };
            case 'Funded': return { bg: '#D1FAE5', color: '#065F46', label: 'Financé' };
            case 'In progress': return { bg: '#DBEAFE', color: '#1E40AF', label: 'En cours' };
            case 'Confirmed': return { bg: '#10B981', color: 'white', label: 'Confirmé' };
            case 'Cancelled': return { bg: '#FEE2E2', color: '#991B1B', label: 'Annulé' };
            default: return { bg: '#E2E8F0', color: '#475569', label: status };
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                    <Target /> Gestion des Besoins
                </h1>

                <a
                    href={`http://localhost:8000/api/admin/export_csv.php?token=${localStorage.getItem('token')}`}
                    target="_blank"
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#1E293B',
                        color: 'white',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600'
                    }}
                >
                    <Download size={20} /> Exporter CSV
                </a>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <tr>
                            <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Titre</th>
                            <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Validateur</th>
                            <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Objectif</th>
                            <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Statut</th>
                            <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {needs.map(n => {
                            const st = getStatusStyle(n.status);
                            return (
                                <tr key={n.id} style={{ borderBottom: '1px solid #E2E8F0', opacity: n.status === 'Cancelled' ? 0.6 : 1 }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500', color: '#1E293B' }}>{n.type}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#64748B' }}>{n.district}</div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#475569' }}>{n.validator_name}</td>
                                    <td style={{ padding: '1rem', color: '#475569' }}>
                                        {Number(n.collected_mru).toLocaleString()} / {Number(n.required_mru).toLocaleString()} MRU
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                                            backgroundColor: st.bg,
                                            color: st.color
                                        }}>
                                            {st.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => setEditingNeed(n)}
                                            style={{
                                                padding: '0.5rem',
                                                borderRadius: '0.375rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                backgroundColor: '#EFF6FF',
                                                color: '#3B82F6',
                                                marginRight: '0.5rem'
                                            }}
                                            title="Éditer"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(n.id)}
                                            style={{
                                                padding: '0.5rem',
                                                borderRadius: '0.375rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                backgroundColor: '#FEF2F2',
                                                color: '#DC2626'
                                            }}
                                            title="Annuler/Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal Edit */}
            {editingNeed && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Modifier le Besoin</h2>
                        <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Type / Titre</label>
                                <input type="text" className="filter-select w-full" value={editingNeed.type} onChange={e => setEditingNeed({ ...editingNeed, type: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Quartier</label>
                                <input type="text" className="filter-select w-full" value={editingNeed.district} onChange={e => setEditingNeed({ ...editingNeed, district: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                                <textarea className="filter-select w-full" value={editingNeed.description} onChange={e => setEditingNeed({ ...editingNeed, description: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Montant Requis (MRU)</label>
                                <input type="number" className="filter-select w-full" value={editingNeed.required_mru} onChange={e => setEditingNeed({ ...editingNeed, required_mru: e.target.value })} required />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setEditingNeed(null)}>Annuler</button>
                                <button type="submit" className="btn btn-primary">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNeeds;
