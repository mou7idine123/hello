import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { PlusCircle, AlertCircle, MapPin, Building2, Utensils } from 'lucide-react';
import MapPicker from '../components/MapPicker';
import { useEffect } from 'react';

const CreateNeed = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: '',
        district: '',
        description: '',
        full_description: '',
        required_mru: '',
        beneficiaries: '',
        deadline_date: '',
        gps_coordinates: '',
        partner_id: '',
        partner_orders: ''
    });
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await api.get('/validator/list_partners.php');
                setPartners(res.data);
            } catch (err) {
                console.error("Error fetching partners:", err);
            }
        };
        fetchPartners();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/validator/needs.php', formData);
            alert("Besoin publié avec succès !");
            navigate('/validator-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la publication.');
            setLoading(false);
        }
    };

    return (
        <div className="admin-main" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Publier un Nouveau Besoin
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Détaillez les nécessités de la famille pour lancer la collecte.</p>
            </div>

            <form onSubmit={handleSubmit} className="admin-card-soft" style={{ padding: '3rem' }}>
                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2', color: '#dc2626', padding: '1rem 1.5rem',
                        borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem', border: '1px solid #fee2e2',
                        fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}>
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div className="admin-form-group">
                        <label className="admin-label">Titre du Besoin (Type)</label>
                        <input type="text" name="type" required value={formData.type} onChange={handleChange}
                            className="admin-input" placeholder="ex: Panier Alimentaire Ramadan" />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Quartier / Localisation (Texte)</label>
                        <div style={{ position: 'relative' }}>
                            <input type="text" name="district" required value={formData.district} onChange={handleChange}
                                className="admin-input" placeholder="ex: Tarhil, Nouakchott" />
                            <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div className="admin-form-group">
                        <label className="admin-label">Localisation précise (Cliquez sur la carte)</label>
                        <div style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                            <MapPicker
                                onLocationSelected={(coords) => setFormData({ ...formData, gps_coordinates: coords })}
                            />
                        </div>
                        {formData.gps_coordinates && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={14} /> Coordonnées sélectionnées : {formData.gps_coordinates}
                            </div>
                        )}
                        <input type="hidden" name="gps_coordinates" required value={formData.gps_coordinates} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div className="admin-form-group">
                        <label className="admin-label">Montant Requis (MRU)</label>
                        <input type="number" name="required_mru" required value={formData.required_mru} onChange={handleChange}
                            className="admin-input" placeholder="5000" />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Bénéficiaires (Familles)</label>
                        <input type="number" name="beneficiaries" required value={formData.beneficiaries} onChange={handleChange}
                            className="admin-input" placeholder="1" />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Date Butoir</label>
                        <input type="date" name="deadline_date" value={formData.deadline_date} onChange={handleChange}
                            className="admin-input" />
                    </div>
                </div>

                {/* Partner and Order Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                    <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Building2 size={18} /> Assignation Partenaire & Logistique
                        </h3>
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Partenaire Responsable</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                name="partner_id"
                                required
                                value={formData.partner_id}
                                onChange={handleChange}
                                className="admin-input"
                                style={{ appearance: 'none' }}
                            >
                                <option value="">Choisir un partenaire...</option>
                                {partners.map(p => (
                                    <option key={p.id} value={p.id}>{p.business_name}</option>
                                ))}
                            </select>
                            <Building2 size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                        </div>
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Détails de la Commande (Orders)</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                name="partner_orders"
                                required
                                value={formData.partner_orders}
                                onChange={handleChange}
                                className="admin-input"
                                placeholder="ex: 10 Kits Ramadan, 5 Sacs de riz..."
                            />
                            <Utensils size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        </div>
                    </div>
                </div>

                <div className="admin-form-group" style={{ marginBottom: '2rem' }}>
                    <label className="admin-label">Description Courte (Accroche)</label>
                    <textarea name="description" required value={formData.description} onChange={handleChange}
                        className="admin-textarea" placeholder="Une phrase résumant l'urgence pour les donateurs."
                        style={{ minHeight: '80px' }} />
                </div>

                <div className="admin-form-group" style={{ marginBottom: '3rem' }}>
                    <label className="admin-label">Description Complète & Justification</label>
                    <textarea name="full_description" required value={formData.full_description} onChange={handleChange}
                        className="admin-textarea" rows="5" placeholder="Détaillez la situation sociale et le contenu précis de l'aide." />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" onClick={() => navigate('/validator-dashboard')} className="btn"
                        style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-xl)', fontWeight: 700, background: '#f1f5f9', color: '#475569' }}>
                        Annuler
                    </button>
                    <button type="submit" disabled={loading} className="btn btn-primary"
                        style={{ flex: 2, padding: '1rem', borderRadius: 'var(--radius-xl)', fontWeight: 700, fontSize: '1.125rem' }}>
                        {loading ? 'Publication en cours...' : 'Publier le besoin'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateNeed;
