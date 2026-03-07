import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Layout,
    Home,
    Save,
    Building2,
    MapPin,
    Clock,
    Utensils,
    CreditCard,
    Info,
    CheckCircle2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MapPicker from '../components/MapPicker';

const PartnerSetup = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        business_name: '',
        address: '',
        specialties: '',
        opening_hours: '',
        bank_account_number: '',
        bank_name: '',
        bank_account_holder: ''
    });
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'partner') {
                navigate('/');
            } else {
                setUser(parsedUser);
                // Check if profile already exists
                checkExistingProfile(parsedUser.id);
            }
        } else {
            navigate('/auth?mode=login');
        }
    }, [navigate]);

    const checkExistingProfile = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:8000/api/partner_profile.php?user_id=${userId}`);
            if (res.data) {
                // If profile already exists, redirect to dashboard
                navigate('/partner/dashboard');
            }
        } catch (error) {
            console.error("Error checking profile:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`http://localhost:8000/api/partner_profile.php`, {
                ...formData,
                user_id: user.id
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/partner/dashboard');
            }, 2000);
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Une erreur est survenue lors de l'enregistrement de votre profil.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="setup-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div className="admin-card-glass text-center" style={{ padding: '4rem', maxWidth: '500px', borderRadius: '30px', animation: 'fadeIn 0.5s ease' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--emerald-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <CheckCircle2 size={48} color="var(--emerald)" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Profil Enregistré !</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Bienvenue dans le réseau IHSAN. Redirection vers votre tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="setup-container" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '4rem 2rem' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="admin-card-glass" style={{ padding: '3rem', borderRadius: '30px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ display: 'inline-flex', padding: '1rem', background: 'var(--primary-light)', borderRadius: '20px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                            <Building2 size={32} />
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>Configuration de votre profil</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Complétez vos informations pour commencer à recevoir des commandes.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {/* Business Section */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Info size={20} color="var(--primary)" /> Informations de l'établissement
                                </h3>
                            </div>

                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="admin-label">Nom de l'entreprise / Cuisine</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="business_name"
                                        className="admin-input"
                                        value={formData.business_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: Cuisine Centrale IHSAN"
                                    />
                                    <Building2 size={18} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                </div>
                            </div>

                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="admin-label">Localisation précise (Cliquez sur la carte)</label>
                                <div style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'white' }}>
                                    <MapPicker
                                        onLocationSelected={(coords) => setFormData({ ...formData, address: coords })}
                                    />
                                </div>
                                {formData.address && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={14} /> Coordonnées sélectionnées : {formData.address}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="admin-label">Spécialités / Type</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="specialties"
                                        className="admin-input"
                                        value={formData.specialties}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: Plats chauds, Kits secs..."
                                    />
                                    <Utensils size={18} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="admin-label">Horaires d'ouverture</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="opening_hours"
                                        className="admin-input"
                                        value={formData.opening_hours}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: Lun-Ven 08:00 - 18:00"
                                    />
                                    <Clock size={18} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                </div>
                            </div>

                            {/* Bank Section */}
                            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <CreditCard size={20} color="var(--primary)" /> Coordonnées Bancaires
                                </h3>
                            </div>

                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="admin-label">Nom de la Banque</label>
                                <input
                                    type="text"
                                    name="bank_name"
                                    className="admin-input"
                                    value={formData.bank_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ex: Bank of Mauritania"
                                />
                            </div>

                            <div className="form-group">
                                <label className="admin-label">Numéro de compte (IBAN / RIB)</label>
                                <input
                                    type="text"
                                    name="bank_account_number"
                                    className="admin-input"
                                    value={formData.bank_account_number}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="admin-label">Titulaire du compte</label>
                                <input
                                    type="text"
                                    name="bank_account_holder"
                                    className="admin-input"
                                    value={formData.bank_account_holder}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1.25rem', borderRadius: '15px', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 10px 20px rgba(45, 97, 255, 0.2)' }}
                                >
                                    {loading ? 'Enregistrement...' : <><Save size={20} /> Enregistrer et Continuer</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PartnerSetup;
