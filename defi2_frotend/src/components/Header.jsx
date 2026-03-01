import { Heart, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="container flex justify-between items-center">
        <Link to="/" className="logo">
          <Heart size={32} />
          IHSAN
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/donor-dashboard" className="btn btn-outline" style={{ border: 'none' }}>
            <LayoutDashboard size={18} />
            Tableau de bord
          </Link>
          <Link to="/auth?mode=login" className="btn btn-outline">
            <LogIn size={18} />
            Connexion
          </Link>
          <Link to="/auth?mode=register" className="btn btn-primary">
            <UserPlus size={18} />
            Créer un compte
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
