import React, { useState } from 'react';
import { Search, ShieldCheck, ExternalLink, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HederaVerify = () => {
    const { t } = useTranslation();
    const [searchSeq, setSearchSeq] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Mock search function matching the mock Hedera generation in Backend
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchSeq) return;

        setLoading(true);

        setTimeout(() => {
            if (searchSeq.startsWith('0.0.')) {
                setResult({
                    status: 'verified',
                    sequence: searchSeq,
                    timestamp: new Date().toISOString(),
                    network: 'Hedera Testnet',
                    message: "Ancrage cryptographique validé. Ce don correspond bien à une livraison sur le terrain certifiée par l'application IHSAN."
                });
            } else {
                setResult({
                    status: 'not_found'
                });
            }
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh', textAlign: 'center' }}>
            <ShieldCheck size={64} color="#10B981" style={{ margin: '0 auto 1.5rem' }} />
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#0F172A', fontWeight: '800' }}>
                Vérificateur Blockchain Hedera
            </h1>
            <p style={{ color: '#64748B', fontSize: '1.125rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                Saisissez le Sequence Number généré lors de la livraison pour vérifier l'authenticité et l'immuabilité de l'ancrage de la preuve sur le réseau public Hedera.
            </p>

            <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: '500px', margin: '0 auto 3rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', borderRadius: '9999px', overflow: 'hidden', border: '2px solid #E2E8F0', backgroundColor: 'white' }}>
                <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', color: '#94A3B8' }}>
                    <Hash size={24} />
                </div>
                <input
                    type="text"
                    placeholder="ex: 0.0.1234567"
                    value={searchSeq}
                    onChange={(e) => setSearchSeq(e.target.value)}
                    style={{ flex: 1, padding: '1rem', border: 'none', outline: 'none', fontSize: '1.125rem', color: '#1E293B', backgroundColor: 'transparent' }}
                />
                <button
                    type="submit"
                    style={{ padding: '1rem 2rem', backgroundColor: '#1E293B', color: 'white', border: 'none', fontWeight: '600', fontSize: '1.125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background-color 0.2s' }}
                    disabled={loading}
                >
                    {loading ? 'Recherche...' : <><Search size={20} /> Vérifier</>}
                </button>
            </form>

            {loading && <div style={{ color: '#64748B', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}><ShieldCheck className="animate-pulse" /> Interrogation du DLT...</div>}

            {result && !loading && (
                <div style={{ animation: 'fadeIn 0.5s fade-in' }}>
                    {result.status === 'verified' ? (
                        <div style={{ backgroundColor: '#F0FDF4', border: '2px solid #10B981', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ backgroundColor: '#10B981', padding: '0.75rem', borderRadius: '50%', color: 'white' }}>
                                    <CheckCircle size={32} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#064E3B', margin: 0 }}>Ancrage Authentique</h3>
                                    <p style={{ color: '#047857', margin: 0 }}>La preuve d'impact existe sur la blockchain.</p>
                                </div>
                            </div>

                            <div style={{ backgroundColor: 'white', border: '1px solid #A7F3D0', borderRadius: '0.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #ECFDF5' }}>
                                    <span style={{ color: '#64748B', fontWeight: '500' }}>Sequence Number (Topic Message)</span>
                                    <span style={{ color: '#0F172A', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.125rem' }}>{result.sequence}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #ECFDF5' }}>
                                    <span style={{ color: '#64748B', fontWeight: '500' }}>Réseau</span>
                                    <span style={{ color: '#0F172A', fontWeight: '600' }}>{result.network}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <span style={{ color: '#64748B', fontWeight: '500' }}>Horodatage Immuable</span>
                                    <span style={{ color: '#0F172A', fontWeight: '600' }}>{new Date(result.timestamp).toLocaleString()}</span>
                                </div>

                                <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '0.5rem', color: '#475569', fontSize: '0.875rem', lineHeight: '1.5' }}>
                                    {result.message}
                                </div>

                                <a
                                    href={`https://hashscan.io/testnet/topic/0.0.8113854?message=${result.sequence}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '1rem', backgroundColor: '#10B981', color: 'white', fontWeight: '600', textDecoration: 'none', borderRadius: '0.5rem', marginTop: '1.5rem', transition: 'box-shadow 0.2s' }}
                                >
                                    Explorer sur HashScan <ExternalLink size={18} />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: '#FEF2F2', border: '2px dashed #EF4444', padding: '2rem', borderRadius: '1rem', color: '#B91C1C' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Séquence Introuvable</h3>
                            <p>Aucun ancrage correspondant à cette séquence n'a été trouvé sur le réseau.</p>
                        </div>
                    )}
                </div>
            )}
            <style>
                {`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                `}
            </style>
        </div>
    );
};

export default HederaVerify;
