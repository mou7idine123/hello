import { useState, useEffect } from 'react';
import { UserPlus, LogIn } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Auth = () => {
    const { t } = useTranslation();
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

        const dataToSend = {
            ...formData,
            email: formData.email.trim(),
            password: formData.password.trim(),
            full_name: formData.full_name.trim()
        };

        try {
            const response = await axios.post(url, dataToSend);
            let user;
            if (isLogin) {
                user = response.data.user;
            } else {
                user = {
                    id: response.data.user_id,
                    full_name: dataToSend.full_name,
                    email: dataToSend.email,
                    phone: dataToSend.phone,
                    role: 'donor',
                    is_anonymous: dataToSend.is_anonymous
                };
            }
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new Event('user-auth')); // Notify Header of login
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'partner') {
                navigate('/partner/dashboard');
            } else {
                navigate('/donor-dashboard');
            }
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
                        {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
                    </h2>

                    {error && (
                        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            type="button"
                            className={`btn w-full ${isLogin ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setIsLogin(true)}
                        >
                            <LogIn size={18} /> {t('header.login')}
                        </button>
                        <button
                            type="button"
                            className={`btn w-full ${!isLogin ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setIsLogin(false)}
                        >
                            <UserPlus size={18} /> {t('header.register')}
                        </button>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {!isLogin && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>{t('auth.fullName')}</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    className="filter-select w-full"
                                    placeholder={t('auth.fullNamePlaceholder')}
                                    required
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>{t('auth.email')}</label>
                            <input
                                type="email"
                                name="email"
                                className="filter-select w-full"
                                placeholder={t('auth.emailPlaceholder')}
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>{t('auth.password')}</label>
                            <input
                                type="password"
                                name="password"
                                className="filter-select w-full"
                                placeholder={t('auth.passwordPlaceholder')}
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                        </div>

                        {!isLogin && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>{t('auth.phone')}</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="filter-select w-full"
                                        placeholder={t('auth.phonePlaceholder')}
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
                                        {t('auth.anonymous')}
                                    </label>
                                </div>
                            </>
                        )}

                        {isLogin && (
                            <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                                <a href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{t('auth.forgotPassword')}</a>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }} disabled={loading}>
                            {loading ? t('auth.loading') : (isLogin ? t('auth.connectBtn') : t('auth.registerBtn'))}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Auth;
