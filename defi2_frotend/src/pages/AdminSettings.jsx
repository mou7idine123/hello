import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { Settings, Save, PlusCircle, Building } from 'lucide-react';

const AdminSettings = () => {
    const { t } = useTranslation();
    const [configs, setConfigs] = useState({ settings: [], banks: [], announcements: [] });
    const [comRate, setComRate] = useState(0);
    const [maxDelay, setMaxDelay] = useState(24);
    const [districts, setDistricts] = useState('');

    // Forms
    const [newBank, setNewBank] = useState({ name: '', number: '', holder: '' });
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

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
        } catch (error) {
            console.error(error);
        }
    };

    const saveSettings = async () => {
        try {
            await Promise.all([
                api.post('/admin/config.php', { action: 'save_setting', key: 'commission_rate', value: String(comRate) }),
                api.post('/admin/config.php', { action: 'save_setting', key: 'max_delivery_delay', value: String(maxDelay) }),
                api.post('/admin/config.php', { action: 'save_setting', key: 'available_districts', value: String(districts) })
            ]);
            alert("Paramètres globaux sauvegardés.");
        } catch (error) {
            console.error(error);
        }
    };

    const addBank = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/config.php', { action: 'add_bank', bank_name: newBank.name, account_number: newBank.number, account_holder: newBank.holder });
            setNewBank({ name: '', number: '', holder: '' });
            fetchSettings();
        } catch (error) {
            console.error(error);
        }
    };

    const toggleBank = async (id, currentStat) => {
        try {
            await api.post('/admin/config.php', { action: 'toggle_bank', id: id, is_active: !currentStat ? 1 : 0 });
            fetchSettings();
        } catch (error) {
            console.error(error);
        }
    };

    const addAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/config.php', { action: 'add_announcement', title: newAnnouncement.title, content: newAnnouncement.content });
            setNewAnnouncement({ title: '', content: '' });
            fetchSettings();
        } catch (error) {
            console.error(error);
        }
    };

    const toggleAnnouncement = async (id, currentStat) => {
        try {
            await api.post('/admin/config.php', { action: 'toggle_announcement', id: id, is_active: !currentStat ? 1 : 0 });
            fetchSettings();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Settings /> Configuration Plateforme
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>

                {/* Global Settings */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#1E293B', fontWeight: '600' }}>Paramètres Globaux</h2>

                    <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Taux de Commission (%)</label>
                            <input type="number" className="filter-select w-full" value={comRate} onChange={(e) => setComRate(e.target.value)} />
                            <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '0.25rem' }}>Déduit automatiquement des dons validés.</p>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Délai Maximum de Livraison (Heures)</label>
                            <input type="number" className="filter-select w-full" value={maxDelay} onChange={(e) => setMaxDelay(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Quartiers Disponibles (Séparés par virgule)</label>
                            <input type="text" className="filter-select w-full" value={districts} onChange={(e) => setDistricts(e.target.value)} placeholder="Tevragh Zeina, Arafat, El Mina..." />
                        </div>
                    </div>

                    <button onClick={saveSettings} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10B981', color: 'white', borderRadius: '0.5rem', border: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <Save size={18} /> Sauvegarder Paramètres
                    </button>
                </div>

                {/* Bank Accounts */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#1E293B', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building size={20} /> Comptes Bancaires (IHSAN)</h2>
                    </div>

                    {/* Add Bank Form */}
                    <form onSubmit={addBank} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <input type="text" placeholder="Banque (ex: BMI)" value={newBank.name} onChange={e => setNewBank({ ...newBank, name: e.target.value })} className="filter-select" required style={{ flex: 1 }} />
                        <input type="text" placeholder="Numéro de compte (RIB)" value={newBank.number} onChange={e => setNewBank({ ...newBank, number: e.target.value })} className="filter-select" required style={{ flex: 2 }} />
                        <input type="text" placeholder="Titulaire" value={newBank.holder} onChange={e => setNewBank({ ...newBank, holder: e.target.value })} className="filter-select" required style={{ flex: 1 }} />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}><PlusCircle size={18} /> Ajouter</button>
                    </form>

                    {configs.banks.length === 0 ? (
                        <p style={{ color: '#94A3B8' }}>Aucun compte bancaire enregistré. Les donneurs ne peuvent pas faire de virement.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {configs.banks.map(b => (
                                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '0.5rem', backgroundColor: b.is_active ? 'white' : '#F8FAFC' }}>
                                    <div>
                                        <h3 style={{ fontWeight: '600', color: '#1E293B', marginBottom: '0.25rem' }}>{b.bank_name}</h3>
                                        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{b.account_number} • {b.account_holder}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleBank(b.id, b.is_active)}
                                        style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: b.is_active ? '1px solid #10B981' : '1px solid #94A3B8', backgroundColor: b.is_active ? '#D1FAE5' : 'transparent', color: b.is_active ? '#065F46' : '#64748B', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                                    >
                                        {b.is_active ? 'Actif' : 'Inactif'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Announcements */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#1E293B', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Annonces d'Accueil</h2>
                    </div>

                    <form onSubmit={addAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                        <input type="text" placeholder="Titre de l'annonce (ex: Campagne Ramadan)" value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="filter-select w-full" required />
                        <textarea placeholder="Contenu de l'annonce..." value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} className="filter-select w-full" rows="3" required />
                        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1.5rem' }}><PlusCircle size={18} /> Publier</button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {configs.announcements.map(a => (
                            <div key={a.id} style={{ padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '0.5rem', backgroundColor: a.is_active ? 'white' : '#F8FAFC' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontWeight: '600', color: '#1E293B', margin: 0 }}>{a.title}</h3>
                                    <button
                                        onClick={() => toggleAnnouncement(a.id, a.is_active)}
                                        style={{ background: 'none', border: 'none', color: a.is_active ? '#10B981' : '#64748B', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        {a.is_active ? 'Masquer' : 'Afficher'}
                                    </button>
                                </div>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>{a.content}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminSettings;
