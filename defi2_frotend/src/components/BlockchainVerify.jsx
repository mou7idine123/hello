import { useState } from 'react';
import { Shield, Link as LinkIcon, ExternalLink } from 'lucide-react';

const BlockchainVerify = () => {
    const [txId, setTxId] = useState('');

    const handleVerify = (e) => {
        e.preventDefault();
        if (!txId) return;

        // Format Hedera ID for HashScan (shard.realm.num@seconds.nanos -> shard.realm.num-seconds-nanos)
        const formattedId = txId.replace('@', '-').replace(/\.(\d+)$/, '-$1');

        window.open(`https://hashscan.io/testnet/transaction/${formattedId}`, '_blank');
    };

    return (
        <section className="blockchain-section">
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '20px',
                        background: 'rgba(45, 97, 255, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <Shield size={32} color="var(--primary)" />
                    </div>
                    <h2 className="section-title" style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
                        Vérification Blockchain
                    </h2>
                    <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '1rem auto 0', fontSize: '1.125rem', lineHeight: 1.6 }}>
                        Chaque don effectué via IHSAN est enregistré de façon permanente sur un réseau blockchain public pour garantir une transparence absolue.
                    </p>
                </div>

                <div className="blockchain-card">
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                        Vérifier une transaction
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem', fontWeight: 500 }}>
                        Saisissez votre ID de transaction ci-dessous pour vérifier son statut en direct.
                    </p>

                    <form className="verify-input-group" onSubmit={handleVerify}>
                        <input
                            type="text"
                            className="verify-input"
                            placeholder="ex. 0x9f8b...32c4"
                            value={txId}
                            onChange={(e) => setTxId(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-lg)', padding: '0 2rem' }}>
                            <ExternalLink size={18} style={{ marginRight: '8px' }} />
                            Vérifier
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <LinkIcon size={14} color="var(--primary)" />
                        <a href="https://hashscan.io/testnet/dashboard" target="_blank" rel="noreferrer"
                            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            Parcourir l'explorateur HashScan
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BlockchainVerify;
