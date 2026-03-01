import { useState } from 'react';
import { Shield, Link as LinkIcon, ExternalLink } from 'lucide-react';

const BlockchainVerify = () => {
    const [txId, setTxId] = useState('');

    const handleVerify = (e) => {
        e.preventDefault();
        if (!txId) return;
        // Simulate testnet redirect
        window.open(`https://testnet.explorer.ihsan.com/tx/${txId}`, '_blank');
    };

    return (
        <section className="blockchain-section">
            <div className="container">
                <h2 className="section-title" style={{ color: 'white', marginBottom: '1rem' }}>
                    <Shield size={36} color="var(--primary)" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '1rem' }} />
                    Vérification Blockchain
                </h2>
                <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto 3rem' }}>
                    Chaque don effectué via IHSAN est enregistré de façon permanente sur un réseau de test blockchain public pour garantir l'immutabilité, la transparence et la traçabilité depuis le donateur jusqu'au bénéficiaire final.
                </p>

                <div className="blockchain-card">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Vérifier une transaction</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                        Saisissez votre ID de transaction ci-dessous pour vérifier son statut sur le registre public.
                    </p>

                    <form className="verify-input-group" onSubmit={handleVerify}>
                        <input
                            type="text"
                            className="verify-input"
                            placeholder="ex. 0x9f8b...32c4"
                            value={txId}
                            onChange={(e) => setTxId(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ExternalLink size={18} />
                            Vérifier
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '8px', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                        <LinkIcon size={14} />
                        <a href="https://testnet.explorer.ihsan.com" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                            Ou parcourir l'explorateur Testnet en direct
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BlockchainVerify;
