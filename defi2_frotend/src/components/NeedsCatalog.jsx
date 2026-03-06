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
                        <option value="ouvert">Ouvert</option>
                        <option value="finance">Financé</option>
                        <option value="complete">Terminé</option>
                    </select>
                </div>

                {/* Core Catalog Section (Grid) */}
                <div className="catalog-grid">
                    {filteredNeeds.map(need => {
                        const percent = Math.min((need.collected_mru / need.required_mru) * 100, 100);
                        return (
                            <div className="need-card" key={need.id} onClick={() => navigate(`/needs/${need.id}`)}>
                                <div className="card-header">
                                    <div className="card-type">{need.type}</div>
                                    <span className={`badge ${need.status === 'ouvert' ? 'badge-open' : 'badge-funded'}`}>
                                        {need.status === 'ouvert' ? t('catalog.statusOpen') || 'OUVERT' : t('catalog.statusFunded') || 'FINANCÉ'}
                                    </span>
                                </div>

                                <div className="card-district">
                                    <MapPin size={16} strokeWidth={2.5} />
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
                                        <span className="label">{t('catalog.collected')}</span>
                                        <div className="flex flex-col items-end">
                                            <span className="amount">{need.collected_mru.toLocaleString()} MRU</span>
                                            <span className="label">sur {need.required_mru.toLocaleString()} MRU</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-light flex items-center justify-center text-emerald">
                                            <ShieldCheck size={14} strokeWidth={3} />
                                        </div>
                                        <span className="text-xs uppercase tracking-wider opacity-60">Verified by</span>
                                    </div>
                                    <div className="text-text-main font-bold">{need.validator}</div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredNeeds.length === 0 && (
                        <div className="text-center w-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200" style={{ gridColumn: '1 / -1' }}>
                            <p className="text-lg font-semibold text-text-muted">Aucun besoin ne correspond à vos filtres.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default NeedsCatalog;
