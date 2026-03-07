import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
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

/* ── MAIN ── */
const ImpactProof = () => {
    const { donationId } = useParams();
    const [proof, setProof] = useState(null);
    const [loading, setLoading] = useState(true);
    const [linkCopied, setLinkCopied] = useState(false);

    useEffect(() => {
        api.get(`/get_donation.php?id=${donationId}`)
            .then(res => {
                const d = res.data;
                setProof({
                    donationId: d.tracking_id,
                    needType: d.need_type,
                    needDescription: d.need_description,
                    deliveredAt: d.remise_time || d.created_at,
                    photo: d.remise_proof_path ? `http://localhost:8000/${d.remise_proof_path}` : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80',
                    validatorMessage: d.remise_message || 'Un don a été remis grâce à vous.',
                    validatorName: d.validator_name || 'Validateur IHSAN',
                    validatorScore: d.validator_score || 94,
                    beneficiaries: d.beneficiaries || 1,
                    amountMru: parseFloat(d.amount),
                    partnerName: d.partner_name,
                    partnerSpecialties: d.partner_specialties,
                    partnerPhoto: d.partner_photo ? `http://localhost:8000/${d.partner_photo}` : null,
                    orderDetails: d.order_details,
                    orderTime: d.order_time,
                    hedera: d.hedera
                });
            })
            .catch(err => console.error("Error fetching proof:", err))
            .finally(() => setLoading(false));
    }, [donationId]);

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Chargement de la preuve d'impact…
        </div>
    );

    if (!proof) return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Preuve d'impact introuvable.
        </div>
    );

    const verifyUrl = `${window.location.origin}/impact/${donationId}`;

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
            <div className="container" style={{ maxWidth: 850 }}>

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
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Impact Réel & Vérifié</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Votre contribution a fait une différence tangible.
                    </p>
                </div>

                {/* ─── Main Content Stack (Simplified for Mobile) ─── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>

                    {/* ─── Anonymized photo ─── */}
                    <div className="dashboard-panel" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={proof.photo}
                                alt="Preuve d'impact — visages floutés"
                                style={{ width: '100%', height: 'auto', minHeight: '300px', maxHeight: '500px', objectFit: 'cover', display: 'block' }}
                            />
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                                backdropFilter: 'blur(15px)',
                                WebkitBackdropFilter: 'blur(15px)',
                                background: 'rgba(255,255,255,0.05)',
                            }} />
                            <div style={{
                                position: 'absolute', top: '1rem', left: '1rem',
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                color: '#fff', padding: '0.4rem 0.8rem',
                                borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                backdropFilter: 'blur(4px)',
                            }}>
                                <ShieldCheck size={14} /> Visages protégés
                            </div>
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                padding: '2.5rem 1.5rem 1.25rem',
                                color: '#fff',
                            }}>
                                <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                                    Remise le {fmt(proof.deliveredAt)}
                                </div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{proof.needType} &middot; {proof.beneficiaries} familles</div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Validator message ─── */}
                    <div className="dashboard-panel" style={{ padding: '2rem 1.5rem' }}>
                        <div style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '1rem' }}>PAROLES DU TERRAIN</div>
                        <blockquote style={{
                            borderLeft: '4px solid var(--primary)',
                            paddingLeft: '1.25rem',
                            margin: '0 0 1.5rem 0',
                            color: 'var(--text-main)',
                            lineHeight: 1.7,
                            fontSize: '1.05rem',
                            fontStyle: 'italic',
                        }}>
                            « {proof.validatorMessage} »
                        </blockquote>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 900, color: '#fff', fontSize: '1.1rem',
                            }}>
                                {proof.validatorName.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{proof.validatorName}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>
                                    <Star size={12} fill="#f59e0b" /> {proof.validatorScore} pts
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Info Grid (2 cols on desktop, 1 on mobile) ─── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {/* Donation Stats */}
                        <div className="dashboard-panel">
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShieldCheck size={18} color="var(--primary)" /> Détails du Don
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Montant</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{proof.amountMru.toLocaleString()} MRU</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '0.5rem', borderTop: '1px solid var(--border)', pt: '0.75rem' }}>
                                <span style={{ fontSize: '0.8deg', color: 'var(--text-muted)' }}>Suivi</span>
                                <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9rem' }}>#{proof.donationId}</span>
                            </div>
                        </div>

                        {/* Partner / Fulfillment journey */}
                        {proof.partnerName && (
                            <div className="dashboard-panel" style={{ borderLeft: '4px solid #8b5cf6' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={18} color="#8b5cf6" /> Partenaire
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    {proof.partnerPhoto ? (
                                        <img src={proof.partnerPhoto} alt={proof.partnerName} style={{ width: 40, height: 40, borderRadius: '8px', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: 40, height: 40, borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ShieldCheck size={20} color="#8b5cf6" />
                                        </div>
                                    )}
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{proof.partnerName}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Commande :</span>
                                    <span style={{ fontWeight: 600 }}>{proof.orderDetails || 'Standard'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Need Context */}
                    <div className="dashboard-panel">
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Layers size={18} color="var(--secondary)" /> Le Besoin
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            {proof.needDescription}
                        </p>
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
