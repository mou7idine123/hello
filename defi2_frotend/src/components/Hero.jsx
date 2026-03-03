import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Coins, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Hero = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        families_helped: 0,
        mru_collected: 0,
        confirmed_donations: 0,
    });

    useEffect(() => {
        // In a real scenario, this matches the API endpoint
        axios.get('http://localhost:8000/api/stats.php')
            .then(res => setStats(res.data))
            .catch(err => console.error("Error fetching stats:", err));
    }, []);
    return (
        <section className="hero">
            <div className="container">
                {stats.announcements && stats.announcements.length > 0 && (
                    <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.announcements.map(a => (
                            <div key={a.id} style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem 1.5rem', borderRadius: '0.75rem', textAlign: 'left', backdropFilter: 'blur(10px)' }}>
                                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>📢 {a.title}</h3>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>{a.content}</p>
                            </div>
                        ))}
                    </div>
                )}

                <h1>{t('hero.title')}</h1>
                <p className="quote">&quot;{t('hero.subtitle')}&quot;</p>

                <div className="stats-grid">
                    <div className="stat-card">
                        <Heart size={48} className="w-full justify-center" color="var(--primary)" style={{ marginBottom: "1rem" }} />
                        <div className="stat-value">
                            {stats.families_helped.toLocaleString()}
                        </div>
                        <div className="stat-label">{t('hero.helped')}</div>
                    </div>

                    <div className="stat-card">
                        <Coins size={48} className="w-full justify-center" color="#F59E0B" style={{ marginBottom: "1rem" }} />
                        <div className="stat-value">
                            {stats.mru_collected.toLocaleString()}
                        </div>
                        <div className="stat-label">{t('hero.collected')}</div>
                    </div>

                    <div className="stat-card">
                        <CheckCircle size={48} className="w-full justify-center" color="#3B82F6" style={{ marginBottom: "1rem" }} />
                        <div className="stat-value">
                            {stats.confirmed_donations.toLocaleString()}
                        </div>
                        <div className="stat-label">{t('hero.donors')}</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
