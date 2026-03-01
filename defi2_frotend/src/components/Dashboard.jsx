import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, MapPin, CalendarDays } from 'lucide-react';

const Dashboard = () => {
    const [recentDonations, setRecentDonations] = useState([]);
    const [totalCollected, setTotalCollected] = useState(0);

    useEffect(() => {
        // Fetch recent donations
        axios.get('http://localhost:8000/api/recent_donations.php')
            .then(res => setRecentDonations(res.data))
            .catch(err => console.error("Error fetching recent donations:", err));

        // Fetch global stats for total platform collected
        axios.get('http://localhost:8000/api/stats.php')
            .then(res => setTotalCollected(res.data.mru_collected))
            .catch(err => console.error("Error fetching stats:", err));
    }, []);

    return (
        <section className="section bg-background">
            <div className="container">
                <h2 className="section-title">Tableau de bord de transparence publique</h2>

                <div className="dashboard-grid">
                    {/* Latest Confirmed Donations */}
                    <div className="dashboard-panel">
                        <h3 className="flex items-center gap-2" style={{ marginBottom: "1.5rem" }}>
                            <Activity size={20} color="var(--primary)" />
                            Dons confirmés récents
                        </h3>

                        <div className="donation-list">
                            {recentDonations.length === 0 ? (
                                <div style={{ color: "var(--text-muted)", padding: "1rem 0" }}>Aucun don récent trouvé.</div>
                            ) : (
                                recentDonations.map(donation => (
                                    <div key={donation.id} className="donation-item">
                                        <div className="donation-info">
                                            <span className="donation-id">{donation.id}</span>
                                            <span className="donation-meta">
                                                <CalendarDays size={12} style={{ display: 'inline', margin: '0 4px' }} />
                                                {donation.date} •
                                                <MapPin size={12} style={{ display: 'inline', margin: '0 4px' }} />
                                                {donation.district}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="donation-amount">{donation.amount.toLocaleString()} MRU</span>
                                            <span className="badge badge-open" style={{ fontSize: "0.6rem" }}>{donation.status}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Live Global Transparency */}
                    <div className="dashboard-panel text-center flex flex-col justify-center items-center">
                        <h3 style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Total collecté sur la plateforme</h3>
                        <div style={{ fontSize: "3.5rem", fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>
                            {totalCollected.toLocaleString()}
                        </div>
                        <div style={{ fontWeight: 600, color: "var(--secondary)", marginTop: "0.5rem" }}>MRU</div>
                        <p style={{ marginTop: "2rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                            100% des transactions confirmées sont enregistrées de manière sécurisée et vérifiable.
                        </p>
                        <div style={{ marginTop: "1.5rem", width: "100%", height: "150px", background: "url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=IHSAN_TRANSPARENCY') no-repeat center center", opacity: 0.1, backgroundSize: "contain" }} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
