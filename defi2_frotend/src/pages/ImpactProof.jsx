import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ShieldCheck, ExternalLink, Share2, Copy, Check,
    MessageCircle, Clock, Hash, ArrowLeft, Star, Layers
} from 'lucide-react';

/* ── Mock impact data (replace with API call keyed to donationId) ── */
const getMockProof = (donationId) => ({
    donationId: donationId || 'DON-48291',
    needType: 'Panier alimentaire',
    district: 'Tevraghra',
    deliveredAt: '2026-03-01T20:34:00Z',
    photo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80',
    validatorMessage: '5 familles ont rompu le jeûne ce soir grâce à vous. Chaque panier contenait des dattes, du lait, du riz et des légumes frais.',
    validatorName: 'Aminata Diallo',
    validatorScore: 94,
    beneficiaries: 5,
    amountMru: 15000,
    hedera: {
        sequenceNumber: '0.0.3847291',
        timestamp: '2026-03-01T20:34:17Z',
        transactionId: '0.0.3847291@1741xxxxxx.000000000',
        hashscanUrl: 'https://hashscan.io/mainnet/transaction/0.0.3847291',
        topicId: '0.0.2941872',
    },
});

/* ── Helpers ── */
const fmt = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
};

const CopyRow = ({ label, value, mono = true }) => {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(value).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', minWidth: 130 }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: mono ? 'monospace' : 'inherit', fontSize: '0.875rem', fontWeight: 600, wordBreak: 'break-all', textAlign: 'right' }}>{value}</span>
                <button onClick={copy} title="Copier" style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#10b981' : 'var(--text-muted)', flexShrink: 0 }}>
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
            </div>
        </div>
    );
};

/* ═══════════════════════════════ MAIN ═══════════════════════════════ */
const ImpactProof = () => {
    const { donationId } = useParams();
    const proof = getMockProof(donationId);
    const [linkCopied, setLinkCopied] = useState(false);

    const verifyUrl = `${window.location.origin}/impact/${proof.donationId}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(verifyUrl).catch(() => { });
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(
            `✅ Mon don a été remis ! ${proof.beneficiaries} familles ont bénéficié de votre aide.\nVérifiez la preuve ici : ${verifyUrl}`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)' }}>
            <div className="container" style={{ maxWidth: 780 }}>

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <Link to="/donor-dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ArrowLeft size={15} /> Mon tableau de bord
                    </Link>
                    <span style={{ color: 'var(--border)' }}>›</span>
                    <span>Preuve d'impact</span>
                </div>

                {/* ─── Hero badge ─── */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981, #34d399)',
                        boxShadow: '0 0 0 14px rgba(16,185,129,0.1)',
                        marginBottom: '1.25rem',
                    }}>
                        <ShieldCheck size={36} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: 900, marginBottom: '0.5rem' }}>Preuve d'impact vérifiée</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {proof.needType} — {proof.district} &nbsp;·&nbsp; {fmt(proof.deliveredAt)}
                    </p>
                </div>

                {/* ─── Anonymized photo ─── */}
                <div className="dashboard-panel" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <img
                            src={proof.photo}
                            alt="Preuve d'impact — visages floutés"
                            style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
                        />
                        {/* Blur overlay on the upper portion (where faces typically are) */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            background: 'rgba(0,0,0,0.05)',
                        }} />
                        {/* Badge */}
                        <div style={{
                            position: 'absolute', top: '1rem', left: '1rem',
                            backgroundColor: 'rgba(0,0,0,0.65)',
                            color: '#fff', padding: '0.35rem 0.75rem',
                            borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            backdropFilter: 'blur(4px)',
                        }}>
                            <ShieldCheck size={13} /> Visages anonymisés
                        </div>
                        {/* Bottom caption */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
                            padding: '2rem 1.5rem 1.25rem',
                            color: '#fff',
                        }}>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                                Remise effectuée — {proof.beneficiaries} famille{proof.beneficiaries > 1 ? 's' : ''}
                            </div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{fmt(proof.deliveredAt)}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

                    {/* ─── Validator message ─── */}
                    <div className="dashboard-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageCircle size={18} color="var(--primary)" /> Message du validateur
                        </h2>
                        <blockquote style={{
                            borderLeft: '3px solid var(--primary)',
                            paddingLeft: '1rem',
                            margin: 0,
                            color: 'var(--text-muted)',
                            lineHeight: 1.75,
                            fontSize: '0.95rem',
                            fontStyle: 'italic',
                        }}>
                            « {proof.validatorMessage} »
                        </blockquote>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, color: '#fff', fontSize: '1rem',
                            }}>
                                {proof.validatorName.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{proof.validatorName}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#f59e0b' }}>
                                    <Star size={12} fill="#f59e0b" /> {proof.validatorScore}/100
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Stats ─── */}
                    <div className="dashboard-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Layers size={18} color="var(--secondary)" /> Récapitulatif
                        </h2>
                        {[
                            { label: 'Montant remis', value: `${proof.amountMru.toLocaleString()} MRU`, color: 'var(--primary)' },
                            { label: 'Familles bénéficiaires', value: proof.beneficiaries, color: 'var(--secondary)' },
                            { label: 'Type d\'aide', value: proof.needType, color: 'inherit' },
                            { label: 'Quartier', value: proof.district, color: 'inherit' },
                        ].map(row => (
                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                                <span style={{ fontWeight: 700, color: row.color }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── Blockchain proof ─── */}
                <div className="dashboard-panel" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Hash size={18} color="#7c3aed" /> Preuve blockchain — Hedera Hashgraph
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                        Cette transaction est immuablement enregistrée sur le réseau Hedera. Elle ne peut pas être modifiée ou supprimée.
                    </p>

                    <CopyRow label="Numéro de séquence" value={proof.hedera.sequenceNumber} />
                    <CopyRow label="Topic ID" value={proof.hedera.topicId} />
                    <CopyRow label="Transaction ID" value={proof.hedera.transactionId} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={14} /> Horodatage
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{fmt(proof.hedera.timestamp)}</span>
                    </div>

                    <a
                        href={proof.hedera.hashscanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline w-full"
                        style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
                    >
                        <ExternalLink size={16} /> Vérifier sur HashScan
                    </a>
                </div>

                {/* ─── Share ─── */}
                <div className="dashboard-panel">
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <Share2 size={18} color="var(--primary)" /> Partager la preuve
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                        Partagez ce lien de vérification public — il ne contient aucune information personnelle.
                    </p>

                    {/* Link preview */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', marginBottom: '1rem' }}>
                        <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{verifyUrl}</span>
                        <button onClick={handleCopyLink} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, color: linkCopied ? '#10b981' : undefined }}>
                            {linkCopied ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> Copier</>}
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={handleWhatsApp}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                                transition: 'opacity 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                            onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Partager WhatsApp
                        </button>

                        <button
                            onClick={handleCopyLink}
                            className="btn btn-outline"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '0.75rem', fontSize: '0.95rem' }}
                        >
                            {linkCopied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                            {linkCopied ? 'Lien copié !' : 'Copier le lien'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ImpactProof;
