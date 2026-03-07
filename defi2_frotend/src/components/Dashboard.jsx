import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, MapPin, CalendarDays, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
    const [recentDonations, setRecentDonations] = useState([]);
    const [totalCollected, setTotalCollected] = useState(0);

    useEffect(() => {
        // Fetch recent donations
        axios.get('http://localhost:8000/api/recent_donations.php')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setRecentDonations(res.data);
                } else {
                    setRecentDonations([]);
                }
            })
            .catch(err => {
                console.error("Error fetching recent donations:", err);
                setRecentDonations([]);
            });

        // Fetch global stats for total platform collected
        axios.get('http://localhost:8000/api/stats.php')
            .then(res => {
                if (res.data && res.data.mru_collected !== undefined) {
                    setTotalCollected(res.data.mru_collected);
                } else {
                    setTotalCollected(0);
                }
            })
            .catch(err => {
                console.error("Error fetching stats:", err);
                setTotalCollected(0);
            });
    }, []);

    return (
        <section className="section bg-background">
            <div className="container">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <h2 className="section-title text-left mb-0">Donations & Transparence</h2>
                    <p className="text-text-muted font-medium mb-2">Données en temps réel (Blockchain Verify)</p>
                </div>

                <div className="dashboard-grid">
                    {/* Latest Confirmed Donations */}
                    <div className="dashboard-panel">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="flex items-center gap-2 text-lg font-bold">
                                <Activity size={20} className="text-primary" />
                                Derniers dons confirmés
                            </h3>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary-light px-3 py-1 rounded-full">Live</span>
                        </div>

                        <div className="donation-list">
                            {!recentDonations || recentDonations.length === 0 ? (
                                <div className="text-text-muted py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 font-medium">
                                    Aucun don récent trouvé.
                                </div>
                            ) : (
                                recentDonations.map(donation => (
                                    <div key={donation?.id || Math.random()} className="donation-item px-2">
                                        <div className="donation-info">
                                            <span className="donation-id">{donation?.id || 'N/A'}</span>
                                            <div className="donation-meta gap-2">
                                                <CalendarDays size={12} />
                                                <span>{donation?.date || '...'}</span>
                                                <span className="opacity-20">•</span>
                                                <MapPin size={12} />
                                                <span>{donation?.district || '...'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="donation-amount">{(donation?.amount || 0).toLocaleString()} MRU</span>
                                            <span className="badge badge-open text-[10px] py-0.5 mt-1">{donation?.status || 'Open'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Live Global Transparency */}
                    <div className="transparency-card">
                        <div className="relative z-10 flex flex-col items-center">
                            <h3 className="text-white/60 text-sm font-bold uppercase tracking-widest mb-6">Plateforme Collectée</h3>
                            <div className="amount">
                                {(totalCollected || 0).toLocaleString()}
                            </div>
                            <div className="text-primary font-bold text-xl mb-8">MRU</div>

                            <div className="w-full h-px bg-white/10 mb-8" />

                            <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-8">
                                <ShieldCheck size={16} className="inline mr-2 text-emerald" />
                                100% des transactions enregistrées sur la blockchain publique.
                            </p>

                            <div className="p-4 bg-white rounded-2xl shadow-xl">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://hashscan.io/testnet/topic/0.0.8113854" alt="QR Verify" className="w-20 h-20 opacity-90" />
                            </div>
                            <span className="text-[10px] text-white/30 uppercase mt-4 tracking-tighter">Blockchain Verified ID</span>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald/10 blur-[100px] rounded-full -ml-32 -mb-32" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
