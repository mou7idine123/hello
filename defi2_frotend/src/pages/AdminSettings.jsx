import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import AdminLayout from '../components/AdminLayout';
import { Settings, Save, PlusCircle, Building, Megaphone, Sliders } from 'lucide-react';

const AdminSettings = () => {
    const { t } = useTranslation();
    const [configs, setConfigs] = useState({ settings: [], banks: [], announcements: [] });
    const [comRate, setComRate] = useState(0);
    const [maxDelay, setMaxDelay] = useState(24);
    const [districts, setDistricts] = useState('');

    const [newBank, setNewBank] = useState({ name: '', number: '', holder: '' });
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/config.php');
            setConfigs(res.data);
            const cr = res.data.settings.find(s => s.setting_key === 'commission_rate');
            if (cr) setComRate(cr.setting_value);
            const md = res.data.settings.find(s => s.setting_key === 'max_delivery_delay');
            if (md) setMaxDelay(md.setting_value);
            const ds = res.data.settings.find(s => s.setting_key === 'available_districts');
            if (ds) setDistricts(ds.setting_value);
        } catch (error) { console.error(error); }
    };

    const saveSettings = async () => {
        try {
            await Promise.all([
                api.post('/admin/config.php', { action: 'save_setting', key: 'commission_rate', value: String(comRate) }),
                api.post('/admin/config.php', { action: 'save_setting', key: 'max_delivery_delay', value: String(maxDelay) }),
                api.post('/admin/config.php', { action: 'save_setting', key: 'available_districts', value: String(districts) })
            ]);
            alert("Paramètres globaux sauvegardés.");
        } catch (error) { console.error(error); }
    };

    const addBank = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/config.php', { action: 'add_bank', bank_name: newBank.name, account_number: newBank.number, account_holder: newBank.holder });
            setNewBank({ name: '', number: '', holder: '' });
            fetchSettings();
        } catch (error) { console.error(error); }
    };

    const toggleBank = async (id, currentStat) => {
        try {
            await api.post('/admin/config.php', { action: 'toggle_bank', id, is_active: !currentStat ? 1 : 0 });
            fetchSettings();
        } catch (error) { console.error(error); }
    };

    const addAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/config.php', { action: 'add_announcement', title: newAnnouncement.title, content: newAnnouncement.content });
            setNewAnnouncement({ title: '', content: '' });
            fetchSettings();
        } catch (error) { console.error(error); }
    };

    const toggleAnnouncement = async (id, currentStat) => {
        try {
            await api.post('/admin/config.php', { action: 'toggle_announcement', id, is_active: !currentStat ? 1 : 0 });
            fetchSettings();
        } catch (error) { console.error(error); }
    };

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <div>
                    <h1><Settings size={24} /> Configuration Plateforme</h1>
                    <p className="admin-page-subtitle">Paramètres généraux, comptes bancaires et annonces</p>
                </div>
            </div>

            {/* Global Settings */}
            <div className="admin-section-card">
                <div className="admin-section-card-header">
                    <h3><Sliders size={18} style={{ color: 'var(--primary)' }} /> Paramètres Globaux</h3>
                    <button className="admin-btn-sm admin-btn-success" onClick={saveSettings}>
                        <Save size={14} /> Sauvegarder
                    </button>
                </div>
                <div className="admin-section-card-body">
                    <div className="admin-settings-grid">
                        <div className="admin-field">
                            <label className="admin-label">Taux de Commission (%)</label>
                            <input type="number" className="admin-input" value={comRate} onChange={(e) => setComRate(e.target.value)} />
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.375rem' }}>Déduit automatiquement des dons validés.</p>
                        </div>
                        <div className="admin-field">
                            <label className="admin-label">Délai Maximum de Livraison (Heures)</label>
                            <input type="number" className="admin-input" value={maxDelay} onChange={(e) => setMaxDelay(e.target.value)} />
                        </div>
                        <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                            <label className="admin-label">Quartiers Disponibles (séparés par virgule)</label>
                            <input type="text" className="admin-input" value={districts} onChange={(e) => setDistricts(e.target.value)} placeholder="Tevragh Zeina, Arafat, El Mina…" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bank Accounts */}
            <div className="admin-section-card">
                <div className="admin-section-card-header">
                    <h3><Building size={18} style={{ color: '#10b981' }} /> Comptes Bancaires IHSAN</h3>
                </div>
                <div className="admin-section-card-body">
                    <form onSubmit={addBank} className="admin-inline-form" style={{ marginBottom: '1.5rem' }}>
                        <div className="admin-field" style={{ marginBottom: 0 }}>
                            <label className="admin-label">Banque</label>
                            <input type="text" className="admin-input" placeholder="Ex: BMI" value={newBank.name} onChange={e => setNewBank({ ...newBank, name: e.target.value })} required />
                        </div>
                        <div className="admin-field" style={{ marginBottom: 0, flex: 2 }}>
                            <label className="admin-label">Numéro (RIB)</label>
                            <input type="text" className="admin-input" placeholder="Numéro de compte" value={newBank.number} onChange={e => setNewBank({ ...newBank, number: e.target.value })} required />
                        </div>
                        <div className="admin-field" style={{ marginBottom: 0 }}>
                            <label className="admin-label">Titulaire</label>
                            <input type="text" className="admin-input" placeholder="Nom du titulaire" value={newBank.holder} onChange={e => setNewBank({ ...newBank, holder: e.target.value })} required />
                        </div>
                        <button type="submit" className="admin-btn-sm admin-btn-primary" style={{ alignSelf: 'flex-end', marginBottom: '0', height: '42px' }}>
                            <PlusCircle size={14} /> Ajouter
                        </button>
                    </form>

                    {configs.banks.length === 0 ? (
                        <div className="admin-empty-state">
                            <p>Aucun compte bancaire. Les donneurs ne peuvent pas faire de virement.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {configs.banks.map(b => (
                                <div key={b.id} className={`admin-list-item ${!b.is_active ? 'inactive' : ''}`}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.125rem' }}>{b.bank_name}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{b.account_number} • {b.account_holder}</div>
                                    </div>
                                    <button
                                        className={`admin-btn-sm ${b.is_active ? 'admin-btn-success' : 'admin-btn-ghost'}`}
                                        onClick={() => toggleBank(b.id, b.is_active)}
                                        style={!b.is_active ? { border: '1px solid var(--border)' } : {}}
                                    >
                                        {b.is_active ? 'Actif' : 'Inactif'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Announcements */}
            <div className="admin-section-card">
                <div className="admin-section-card-header">
                    <h3><Megaphone size={18} style={{ color: '#f59e0b' }} /> Annonces d'Accueil</h3>
                </div>
                <div className="admin-section-card-body">
                    <form onSubmit={addAnnouncement} style={{ marginBottom: '1.5rem' }}>
                        <div className="admin-field">
                            <label className="admin-label">Titre de l'annonce</label>
                            <input type="text" className="admin-input" placeholder="Ex: Campagne Ramadan 2026" value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} required />
                        </div>
                        <div className="admin-field">
                            <label className="admin-label">Contenu</label>
                            <textarea className="admin-textarea" placeholder="Rédigez le contenu de l'annonce…" value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} rows="3" required />
                        </div>
                        <button type="submit" className="admin-btn-sm admin-btn-primary">
                            <PlusCircle size={14} /> Publier
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {configs.announcements.map(a => (
                            <div key={a.id} className={`admin-list-item ${!a.is_active ? 'inactive' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ fontWeight: 700, color: 'var(--text-main)', margin: 0, fontSize: '0.9375rem' }}>{a.title}</h4>
                                    <button
                                        className={`admin-btn-sm ${a.is_active ? 'admin-btn-success' : 'admin-btn-ghost'}`}
                                        onClick={() => toggleAnnouncement(a.id, a.is_active)}
                                        style={!a.is_active ? { border: '1px solid var(--border)' } : {}}
                                    >
                                        {a.is_active ? 'Affiché' : 'Masqué'}
                                    </button>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: '0.5rem 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{a.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
