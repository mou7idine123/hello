import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Coins, CheckCircle } from 'lucide-react';

const Hero = () => {
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
                <h1>La transparence dans chaque don</h1>
                <p className="quote">&quot;Restaurer la dignité et la confiance dans la charité, bloc par bloc.&quot;</p>

                <div className="stats-grid">
                    <div className="stat-card">
                        <Heart size={48} className="w-full justify-center" color="var(--primary)" style={{ marginBottom: "1rem" }} />
                        <div className="stat-value">
                            {stats.families_helped.toLocaleString()}
                        </div>
                        <div className="stat-label">Familles aidées</div>
                    </div>

                    <div className="stat-card">
                        <Coins size={48} className="w-full justify-center" color="#F59E0B" style={{ marginBottom: "1rem" }} />
                        <div className="stat-value">
                            {stats.mru_collected.toLocaleString()}
                        </div>
                        <div className="stat-label">Total MRU collecté</div>
                    </div>

                    <div className="stat-card">
                        <CheckCircle size={48} className="w-full justify-center" color="#3B82F6" style={{ marginBottom: "1rem" }} />
                        <div className="stat-value">
                            {stats.confirmed_donations.toLocaleString()}
                        </div>
                        <div className="stat-label">Dons confirmés</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
