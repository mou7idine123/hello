import { Heart, LogIn, UserPlus, LayoutDashboard, LogOut, User, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation as useI18n } from 'react-i18next';
import NotificationBell from './NotificationBell';

const Header = () => {
  const { t, i18n } = useI18n();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const checkUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
    window.addEventListener('user-auth', checkUser);
    // This allows synchronization across tabs if needed
    window.addEventListener('storage', checkUser);
    return () => {
      window.removeEventListener('user-auth', checkUser);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    checkUser();
    window.dispatchEvent(new Event('user-auth'));
    navigate('/');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="header" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
      <div className="container flex justify-between items-center" style={{ padding: '0.75rem 1rem' }}>
        <Link to="/" className="logo flex items-center gap-2" style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)' }}>
          <Heart size={28} />
          <span>IHSAN</span>
        </Link>
        <nav className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="btn btn-outline flex items-center gap-2"
            style={{ padding: '0.4rem 0.8rem', borderRadius: '99px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
            title="Traduire en Arabe / French"
          >
            <Globe size={18} />
            <span className="hidden sm:inline">{t('header.toggleLang')}</span>
          </button>

          {user && (
            <Link
              to={
                user.role === 'admin' ? '/admin/dashboard' :
                  user.role === 'partner' ? '/partner/dashboard' :
                    user.role === 'validator' ? '/validator-dashboard' :
                      '/donor-dashboard'
              }
              className="btn btn-outline flex items-center gap-2"
              style={{ border: 'none', padding: '0.5rem 1rem' }}
            >
              <LayoutDashboard size={18} />
              <span className="hidden sm:inline">{t('header.dashboard')}</span>
            </Link>
          )}

          {user && user.role === 'admin' && (
            <div className="hidden lg:flex items-center gap-4 border-l pl-4 ml-2" style={{ borderColor: '#eee' }}>
              <Link to="/admin/users" className="text-sm font-semibold hover:text-primary transition-colors">Utilisateurs</Link>
              <Link to="/admin/needs" className="text-sm font-semibold hover:text-primary transition-colors">Besoins</Link>
              <Link to="/admin/settings" className="text-sm font-semibold hover:text-primary transition-colors">Paramètres</Link>
            </div>
          )}
          {user ? (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                <User size={18} />
                <span>{user.full_name || user.name || 'Donateur'}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline flex items-center gap-2" style={{ padding: '0.5rem 1rem', borderColor: '#ef4444', color: '#ef4444' }}>
                <LogOut size={18} />
                <span className="hidden sm:inline">{t('header.logout')}</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/auth?mode=login" className="btn btn-outline flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
                <LogIn size={18} />
                <span className="hidden sm:inline">{t('header.login')}</span>
              </Link>
              <Link to="/auth?mode=register" className="btn btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
                <UserPlus size={18} />
                <span className="hidden sm:inline">{t('header.register')}</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
