import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    BarChart3, Users2, HandHeart, Wrench,
    ArrowLeftFromLine, ShieldCheck
} from 'lucide-react';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/admin/dashboard', label: 'Tableau de bord', icon: BarChart3 },
        { path: '/admin/users', label: 'Utilisateurs', icon: Users2 },
        { path: '/admin/needs', label: 'Besoins', icon: HandHeart },
        { path: '/admin/settings', label: 'Configuration', icon: Wrench },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.5rem' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 12,
                            background: 'linear-gradient(135deg, var(--primary), #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(45, 97, 255, 0.3)'
                        }}>
                            <ShieldCheck size={20} color="white" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>IHSAN</h2>
                    </div>
                    <span>Administration</span>
                </div>

                <nav className="admin-nav">
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                className={`admin-nav-item${isActive ? ' active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                <item.icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                                {item.label}
                            </button>
                        );
                    })}

                    <div className="admin-nav-divider" />

                    <button className="admin-nav-item" onClick={() => navigate('/')}>
                        <ArrowLeftFromLine size={19} strokeWidth={1.8} />
                        Retour au site
                    </button>
                </nav>
            </aside>

            <main className="admin-main">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
