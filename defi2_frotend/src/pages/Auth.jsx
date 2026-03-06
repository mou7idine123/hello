import { useState, useEffect } from 'react';
import { UserPlus, LogIn, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Auth = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');
    const [isLogin, setIsLogin] = useState(mode !== 'register');
    const [showPassword, setShowPassword] = useState(false);

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
            window.dispatchEvent(new Event('user-auth'));
            if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'partner') navigate('/partner/dashboard');
            else if (user.role === 'validator') navigate('/validator-dashboard');
            else navigate('/donor-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-background-overlay"></div>

            <div className="container flex justify-center items-center" style={{ minHeight: 'calc(100vh - 70px)', position: 'relative', zIndex: 10 }}>
                <div className="glass auth-card animate-in fade-in slide-in-from-top-2">
                    <div className="auth-card-header">
                        <div className="auth-logo-icon">
                            {isLogin ? <LogIn size={28} /> : <UserPlus size={28} />}
                        </div>
                        <h2 className="auth-title">
                            {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
                        </h2>
                        <p className="auth-subtitle">
                            {isLogin ? 'Ravi de vous revoir parmi nous' : 'Rejoignez notre mission humanitaire'}
                        </p>
                    </div>

                    {error && (
                        <div className="auth-error-msg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form-refined">
                        {!isLogin && (
                            <div className="auth-input-group">
                                <label className="auth-label">{t('auth.fullName')}</label>
                                <div className="auth-input-wrapper">
                                    <User className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        name="full_name"
                                        className="auth-input-field"
                                        placeholder={t('auth.fullNamePlaceholder')}
                                        required
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="auth-input-group">
                            <label className="auth-label">{t('auth.email')}</label>
                            <div className="auth-input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    className="auth-input-field"
                                    placeholder={t('auth.emailPlaceholder')}
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">{t('auth.password')}</label>
                            <div className="auth-input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="auth-input-field"
                                    placeholder={t('auth.passwordPlaceholder')}
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <>
                                <div className="auth-input-group">
                                    <label className="auth-label">{t('auth.phone')}</label>
                                    <div className="auth-input-wrapper">
                                        <Phone className="input-icon" size={18} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="auth-input-field"
                                            placeholder={t('auth.phonePlaceholder')}
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 anonymous-check">
                                    <input
                                        type="checkbox"
                                        name="is_anonymous"
                                        id="anonymous"
                                        className="custom-checkbox"
                                        checked={formData.is_anonymous}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="anonymous" className="anonymous-label">
                                        {t('auth.anonymous')}
                                    </label>
                                </div>
                            </>
                        )}

                        {isLogin && (
                            <div className="forgot-password-link">
                                <Link to="#">{t('auth.forgotPassword')}</Link>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                            {loading ? (
                                <div className="spinner-border-sm"></div>
                            ) : (
                                <>
                                    <span>{isLogin ? t('auth.connectBtn') : t('auth.registerBtn')}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-card-footer">
                        <p>
                            {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
                        </p>
                        <button
                            className="auth-toggle-link"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? "S'inscrire" : "Se connecter"}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .auth-page-wrapper {
                    position: relative;
                    min-height: calc(100vh - 70px);
                    background: url('/home/mouhidin/.gemini/antigravity/brain/e7ab4216-0545-4fb7-9c37-eefa1b056903/auth_background_premium_png_1772582532685.png') center/cover no-repeat;
                }
                .auth-background-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(248, 250, 252, 0.4) 0%, rgba(248, 250, 252, 0.2) 100%);
                    backdrop-filter: blur(2px);
                }
                .auth-card {
                    width: 100%;
                    max-width: 480px;
                    padding: 3rem;
                    border-radius: var(--radius-2xl);
                    box-shadow: var(--shadow-premium);
                }
                .auth-card-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }
                .auth-logo-icon {
                    width: 64px;
                    height: 64px;
                    background: var(--primary);
                    color: white;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    box-shadow: 0 10px 25px rgba(45, 97, 255, 0.3);
                }
                .auth-title {
                    font-size: 1.875rem;
                    font-weight: 900;
                    letter-spacing: -0.04em;
                    color: var(--text-main);
                    margin-bottom: 0.5rem;
                }
                .auth-subtitle {
                    color: var(--text-muted);
                    font-size: 0.9375rem;
                }
                .auth-form-refined {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .auth-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .auth-label {
                    font-size: 0.8125rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-left: 0.25rem;
                }
                .auth-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon {
                    position: absolute;
                    left: 1rem;
                    color: var(--text-muted);
                    pointer-events: none;
                }
                .auth-input-field {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 3rem;
                    background: white;
                    border: 1.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    font-family: inherit;
                    font-size: 0.9375rem;
                    transition: all 0.3s ease;
                }
                .auth-input-field:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px rgba(45, 97, 255, 0.1);
                    transform: translateY(-1px);
                }
                .password-toggle {
                    position: absolute;
                    right: 1rem;
                    cursor: pointer;
                    color: var(--text-muted);
                    padding: 0.25rem;
                    border-radius: 50%;
                    transition: all 0.2s;
                }
                .password-toggle:hover {
                    background: var(--background);
                    color: var(--primary);
                }
                .anonymous-check {
                    padding: 0 0.25rem;
                }
                .custom-checkbox {
                    width: 1.25rem;
                    height: 1.25rem;
                    accent-color: var(--primary);
                    cursor: pointer;
                }
                .anonymous-label {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    font-weight: 500;
                    cursor: pointer;
                }
                .forgot-password-link {
                    text-align: right;
                    margin-top: -0.5rem;
                }
                .forgot-password-link a {
                    font-size: 0.8125rem;
                    font-weight: 700;
                    color: var(--primary);
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                .forgot-password-link a:hover {
                    opacity: 1;
                    text-decoration: underline;
                }
                .auth-submit-btn {
                    padding: 1rem;
                    border-radius: var(--radius-xl);
                    font-size: 1rem;
                    margin-top: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                }
                .auth-card-footer {
                    margin-top: 2.5rem;
                    text-align: center;
                    border-top: 1.5px solid var(--border);
                    padding-top: 2rem;
                }
                .auth-card-footer p {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                }
                .auth-toggle-link {
                    font-size: 0.9375rem;
                    font-weight: 800;
                    color: var(--primary);
                    text-decoration: underline;
                    cursor: pointer;
                }
                .auth-error-msg {
                    padding: 1rem;
                    background: rgba(239, 68, 68, 0.08);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: var(--radius-lg);
                    color: #e11d48;
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-bottom: 2rem;
                    text-align: center;
                }
                .spinner-border-sm {
                    width: 1.25rem;
                    height: 1.25rem;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Auth;
