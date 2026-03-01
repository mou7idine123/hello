import { useState, useEffect } from 'react';
import { UserPlus, LogIn } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Auth = () => {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');
    const [isLogin, setIsLogin] = useState(mode === 'login');

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        is_anonymous: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (mode === 'login') setIsLogin(true);
        else if (mode === 'register') setIsLogin(false);
    }, [mode]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const url = isLogin
            ? 'http://localhost:8000/api/login.php'
            : 'http://localhost:8000/api/register.php';

        try {
            const response = await axios.post(url, formData);
            const user = isLogin ? response.data.user : { id: response.data.user_id, ...formData };
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/donor-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)' }}>
            <div className="container" style={{ maxWidth: '450px' }}>
                <div className="dashboard-panel" style={{ marginTop: '2rem' }}>
                    <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>
                        {isLogin ? 'Connexion Donateur' : 'Inscription Donateur'}
                    </h2>

                    {error && (
                        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            className={`btn w-full ${isLogin ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setIsLogin(true)}
                        >
                            <LogIn size={18} /> Connexion
                        </button>
                        <button
                            className={`btn w-full ${!isLogin ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setIsLogin(false)}
                        >
                            <UserPlus size={18} /> Inscription
                        </button>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {!isLogin && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Nom complet</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    className="filter-select w-full"
                                    placeholder="Ex: Ali Oumar"
                                    required
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Email</label>
                            <input
                                type="email"
                                name="email"
                                className="filter-select w-full"
                                placeholder="votre@email.com"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Mot de passe</label>
                            <input
                                type="password"
                                name="password"
                                className="filter-select w-full"
                                placeholder="••••••••"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                        </div>

                        {!isLogin && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Téléphone (optionnel)</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="filter-select w-full"
                                        placeholder="+222 XX XX XX XX"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="flex items-center gap-2" style={{ marginTop: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        name="is_anonymous"
                                        id="anonymous"
                                        style={{ accentColor: 'var(--primary)', width: '1rem', height: '1rem' }}
                                        checked={formData.is_anonymous}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="anonymous" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'pointer' }}>
                                        Je veux rester anonyme lors de mes dons
                                    </label>
                                </div>
                            </>
                        )}

                        {isLogin && (
                            <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                                <a href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Mot de passe oublié ?</a>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }} disabled={loading}>
                            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "Créer mon compte")}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Auth;
