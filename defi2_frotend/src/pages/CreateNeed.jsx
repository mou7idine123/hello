import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { PlusCircle } from 'lucide-react';

const CreateNeed = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: '',
        district: '',
        description: '',
        full_description: '',
        required_mru: '',
        beneficiaries: '',
        deadline_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <PlusCircle color="#10B981" /> Publier un Nouveau Besoin
            </h1>

            <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                {error && <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Titre (Type)</label>
                        <input type="text" name="type" required value={formData.type} onChange={handleChange} placeholder="ex: Panier Alimentaire Ramadan" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Quartier</label>
                        <input type="text" name="district" required value={formData.district} onChange={handleChange} placeholder="ex: Tarhil, Nouakchott" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Montant Requis (MRU)</label>
                        <input type="number" name="required_mru" required value={formData.required_mru} onChange={handleChange} placeholder="5000" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Bénéficiaires (Familles)</label>
                        <input type="number" name="beneficiaries" required value={formData.beneficiaries} onChange={handleChange} placeholder="1" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date Butoir (Optionnel)</label>
                        <input type="date" name="deadline_date" value={formData.deadline_date} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }} />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description Courte</label>
                    <textarea name="description" required value={formData.description} onChange={handleChange} placeholder="Une phrase résumant l'urgence." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', resize: 'vertical' }} />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description Complète</label>
                    <textarea name="full_description" required value={formData.full_description} onChange={handleChange} rows="4" placeholder="Détaillez la situation de la famille et le contenu de l'aide prévue." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', resize: 'vertical' }} />
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', backgroundColor: '#10B981', color: 'white', fontWeight: '600', fontSize: '1.125rem', border: 'none', borderRadius: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Publication en cours...' : 'Publier le besoin'}
                </button>
            </form>
        </div>
    );
};

export default CreateNeed;
