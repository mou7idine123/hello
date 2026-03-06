import { Heart, LogIn, UserPlus, LayoutDashboard, LogOut, User, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation as useI18n } from 'react-i18next';
import NotificationBell from './NotificationBell';

const Header = () => {
  const { t, i18n } = useI18n();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`header-floating glass ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="container flex justify-between items-center px-4">
        <Link to="/" className="logo">
          <Heart size={20} strokeWidth={3} fill="var(--primary)" />
          <span>IHSAN</span>
        </Link>

        <nav className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="nav-link flex items-center gap-2"
            title="Traduire"
          >
            <Globe size={16} />
            <span className="hidden md:inline">{i18n.language.toUpperCase()}</span>
          </button>

          {user && (
            <Link
              to={
                user.role === 'admin' ? '/admin/dashboard' :
                  user.role === 'partner' ? '/partner/dashboard' :
                    user.role === 'validator' ? '/validator-dashboard' :
                      '/donor-dashboard'
              }
              className="nav-link flex items-center gap-2"
            >
              <LayoutDashboard size={16} />
              <span className="hidden lg:inline">{t('header.dashboard')}</span>
            </Link>
          )}

          {user && user.role === 'admin' && (
            <div className="hidden xl:flex items-center gap-4 border-l pl-4 border-border">
              <Link to="/admin/users" className="nav-link">Utilisateurs</Link>
              <Link to="/admin/needs" className="nav-link">Besoins</Link>
              <Link to="/admin/settings" className="nav-link">Paramètres</Link>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-text-main bg-white/50 py-1 px-3 rounded-full border border-white/40">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                  <User size={12} />
                </div>
                <span>{user.full_name || user.name || 'Donateur'}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-bold text-danger hover:bg-danger/5 px-3 py-1.5 rounded-lg transition-colors">
                <LogOut size={14} />
                <span className="hidden sm:inline">{t('header.logout')}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth" className="nav-link font-bold pr-2">
                Connexion
              </Link>
              <Link to="/auth?mode=register" className="btn btn-primary btn-sm rounded-full">
                S'inscrire
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
