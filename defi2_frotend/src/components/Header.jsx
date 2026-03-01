import { Heart, LogIn, UserPlus, LayoutDashboard, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Header = () => {
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

  return (
    <header className="header" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
      <div className="container flex justify-between items-center" style={{ padding: '0.75rem 1rem' }}>
        <Link to="/" className="logo flex items-center gap-2" style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)' }}>
          <Heart size={28} />
          <span>IHSAN</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/donor-dashboard" className="btn btn-outline flex items-center gap-2" style={{ border: 'none', padding: '0.5rem 1rem' }}>
            <LayoutDashboard size={18} />
            <span className="hidden sm:inline">Tableau de bord</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                <User size={18} />
                <span>{user.full_name || user.name || 'Donateur'}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline flex items-center gap-2" style={{ padding: '0.5rem 1rem', borderColor: '#ef4444', color: '#ef4444' }}>
                <LogOut size={18} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/auth?mode=login" className="btn btn-outline flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
                <LogIn size={18} />
                <span className="hidden sm:inline">Connexion</span>
              </Link>
              <Link to="/auth?mode=register" className="btn btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
                <UserPlus size={18} />
                <span className="hidden sm:inline">Créer un compte</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
