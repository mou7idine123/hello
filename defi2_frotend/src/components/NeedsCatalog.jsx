import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NeedsCatalog = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [needs, setNeeds] = useState([]);
    const [filterType, setFilterType] = useState('All');
    const [filterDistrict, setFilterDistrict] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        // Fetch from PHP backend
        axios.get('http://localhost:8000/api/needs.php')
            .then(res => setNeeds(res.data))
            .catch(err => console.error("Error fetching needs:", err));
    }, []);

    // Filter Needs
    const filteredNeeds = needs.filter(need => {
        if (filterType !== 'All' && need.type !== filterType) return false;
        if (filterDistrict !== 'All' && need.district !== filterDistrict) return false;
        if (filterStatus !== 'All' && need.status !== filterStatus) return false;
        return true;
    });

    const uniqueTypes = [...new Set(needs.map(n => n.type))];
    const uniqueDistricts = [...new Set(needs.map(n => n.district))];

    return (
        <section className="section bg-white" id="needs">
            <div className="container">
                <h2 className="section-title">{t('catalog.title')}</h2>

                {/* Filters Section */}
                <div className="filters">
                    <select
                        className="filter-select"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="All">Tous les types</option>
                        {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <select
                        className="filter-select"
                        value={filterDistrict}
                        onChange={e => setFilterDistrict(e.target.value)}
                    >
                        <option value="All">Tous les districts</option>
                        {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <select
                        className="filter-select"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="All">Tous les statuts</option>
                        <option value="Open">Ouvert</option>
                        <option value="Funded">Financé</option>
                    </select>
                </div>

                {/* Core Catalog Section (Grid) */}
                <div className="catalog-grid">
                    {filteredNeeds.map(need => {
                        const percent = Math.min((need.collected_mru / need.required_mru) * 100, 100);
                        return (
                            <div className="need-card" key={need.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/needs/${need.id}`)}>
                                <div className="card-header">
                                    <div className="card-type">{need.type}</div>
                                    <span className={`badge ${need.status === 'Open' ? 'badge-open' : 'badge-funded'}`}>
                                        {need.status}
                                    </span>
                                </div>

                                <div className="card-district">
                                    <MapPin size={16} />
                                    {need.district}
                                </div>

                                <div className="progress-container">
                                    <div className="progress-bar-bg">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <div className="progress-stats">
                                        <span className="text-muted">{need.collected_mru.toLocaleString()} {t('dashboard.mru')} {t('catalog.collected').split(' ')[0]}</span>
                                        <span style={{ color: "var(--secondary)", fontWeight: 700 }}>{need.required_mru.toLocaleString()} {t('dashboard.mru')}</span>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={16} color="var(--primary)" />
                                        Vérifié par :
                                    </div>
                                    <div style={{ fontWeight: 600, color: "var(--secondary)" }}>{need.validator}</div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredNeeds.length === 0 && (
                        <div className="text-center w-full" style={{ gridColumn: '1 / -1', padding: '3rem', color: 'var(--text-muted)' }}>
                            Aucun besoin ne correspond à vos filtres.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default NeedsCatalog;
