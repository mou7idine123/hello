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
                    <div className="flex flex-col gap-4 mb-12 max-w-2xl mx-auto">
                        {stats.announcements.map(a => (
                            <div key={a.id} className="glass p-4 rounded-xl text-left shadow-sm border-primary/10">
                                <h3 className="text-sm font-bold text-primary mb-1">📢 {a.title}</h3>
                                <p className="text-sm text-text-muted leading-relaxed">{a.content}</p>
                            </div>
                        ))}
                    </div>
                )}

                <h1>{t('hero.title')}</h1>
                <p className="quote">{t('hero.subtitle')}</p>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
                            <Heart size={24} fill="currentColor" />
                        </div>
                        <div className="stat-value">
                            {stats.families_helped.toLocaleString()}
                        </div>
                        <div className="stat-label">{t('hero.helped')}</div>
                    </div>

                    <div className="stat-card">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6 text-amber-600">
                            <Coins size={24} fill="currentColor" />
                        </div>
                        <div className="stat-value">
                            {stats.mru_collected.toLocaleString()}
                        </div>
                        <div className="stat-label">{t('hero.collected')}</div>
                    </div>

                    <div className="stat-card">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6 text-blue-600">
                            <CheckCircle size={24} fill="currentColor" />
                        </div>
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
