import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, ArrowRight, CheckCircle2, Heart, ShieldCheck,
    Copy, Upload, ImageIcon, AlertCircle, ChevronRight, Building2, RefreshCw
} from 'lucide-react';

/* ── Helpers ── */

// Banks are fetched dynamically from the API

/* ── Step indicator ── */
const StepBar = ({ current, total }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '2.5rem' }}>
        {Array.from({ length: total }).map((_, i) => {
            const num = i + 1;
            const done = num < current;
            const active = num === current;
            return (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.9rem',
                        backgroundColor: done ? '#10b981' : active ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                        color: done || active ? '#fff' : 'var(--text-muted)',
                        border: active ? '2px solid var(--primary)' : done ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.12)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                    }}>
                        {done ? <CheckCircle2 size={18} /> : num}
                    </div>
                    {i < total - 1 && (
                        <div style={{ width: 60, height: 2, backgroundColor: done ? '#10b981' : 'rgba(255,255,255,0.1)', transition: 'background-color 0.3s ease' }} />
                    )}
                </div>
            );
        })}
    </div>
);

const stepLabels = ['Confirmation', 'Virement & Reçu'];

/* ═══════════════════════════════ MAIN ═══════════════════════════════ */
const DonateTunnel = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [need, setNeed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1); // 1,2,3,4(success)

    const [bankAccounts, setBankAccounts] = useState([]);

    // Step 1 state
    const [amount, setAmount] = useState(searchParams.get('amount') || '');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [selectedBankId, setSelectedBankId] = useState('');
    const [bankReference, setBankReference] = useState('');

    // Step 2 state
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef();

    const trackingId = `DON-${Math.floor(10000 + Math.random() * 90000)}`;

    useEffect(() => {
        // Fetch Need
        axios.get('http://localhost:8000/api/needs.php')
            .then(res => {
                const found = res.data.find(n => String(n.id) === String(id));
                setNeed(found || null);
                setLoading(false);
            })
            .catch(() => { setNeed(null); setLoading(false); });

        // Fetch Banks
        axios.get('http://localhost:8000/api/banks.php')
            .then(res => {
                setBankAccounts(res.data || []);
            })
            .catch(err => console.error("Could not fetch banks", err));
    }, [id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setReceiptFile(file);
        const reader = new FileReader();
        reader.onload = ev => setReceiptPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const user = JSON.parse(localStorage.getItem('user'));

        if (!user) {
            alert('Veuillez vous connecter pour effectuer un don.');
            navigate('/auth?mode=login');
            return;
        }

        const selectedBank = bankAccounts.find(b => String(b.id) === String(selectedBankId));
        if (!selectedBank) return;

        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('need_id', id);
        formData.append('amount', amount);
        formData.append('tracking_id', trackingId);
        formData.append('is_anonymous', isAnonymous ? '1' : '0');
        formData.append('selected_bank', selectedBank.bank_name);
        formData.append('bank_reference', bankReference);
        if (receiptFile) {
            formData.append('receipt', receiptFile);
        }

        try {
            await axios.post('http://localhost:8000/api/create_donation.php', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStep(3); // success screen is now step 3
        } catch (err) {
            console.error('Error submitting donation:', err);
            alert('Une erreur est survenue lors de la soumission de votre don.');
        } finally {
            setSubmitting(false);
        }
    };



    /* ─ Loading ─ */
    if (loading) return (
        <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={32} className="animate-spin" color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        </section>
    );

    if (!need) return (
        <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <AlertCircle size={48} color="var(--primary)" />
            <h2 style={{ fontSize: '1.5rem' }}>Besoin introuvable</h2>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Retour au catalogue</button>
        </section>
    );

    /* ─── Success screen ─── */
    if (step === 3) return (
        <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="dashboard-panel" style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 0 0 12px rgba(16,185,129,0.12)',
                }}>
                    <CheckCircle2 size={40} color="#fff" />
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Reçu soumis avec succès !</h1>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                    Votre reçu a bien été reçu. Notre équipe vérifiera votre virement dans les <strong style={{ color: 'var(--primary)' }}>24 heures</strong> et vous notifiera par email.
                </p>

                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.75rem', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Numéro de suivi</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>{trackingId}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Conservez ce numéro pour suivre votre don</div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link to="/donor-dashboard" className="btn btn-primary w-full" style={{ flex: 1 }}>
                        Voir mon tableau de bord
                    </Link>
                    <Link to="/" className="btn btn-outline w-full" style={{ flex: 1 }}>
                        Retour au catalogue
                    </Link>
                </div>
            </div>
        </section>
    );

    /* ─── Main tunnel wrapper ─── */
    return (
        <section className="section bg-background" style={{ minHeight: 'calc(100vh - 70px)' }}>
            <div className="container" style={{ maxWidth: 640 }}>
                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <Link to={`/needs/${id}`} style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ArrowLeft size={15} /> {need.type} — {need.district}
                    </Link>
                    <ChevronRight size={14} />
                    <span>Faire un don</span>
                </div>

                {/* Step info */}
                <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    Étape {step} sur 2 — {stepLabels[step - 1]}
                </p>
                <StepBar current={step} total={2} />

                {/* ═══ STEP 1 — Confirmation & Bank Selection ═══ */}
                {step === 1 && (
                    <div className="dashboard-panel" style={{ animation: 'fadeInUp 0.3s ease' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Confirmer votre don</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Vérifiez les détails avant de continuer.</p>

                        {/* Need summary */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{need.type}</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{need.district}</div>
                                </div>
                                <span className="badge badge-open" style={{ fontSize: '0.75rem', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    🟢 Ouvert
                                </span>
                            </div>

                            {need.description && (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
                                    {need.description}
                                </p>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                <div style={{ color: 'var(--text-muted)' }}>
                                    👥 {need.beneficiaries} bénéficiaires
                                </div>
                                <div style={{ color: 'var(--secondary)', fontWeight: 700 }}>
                                    Reste : {(parseFloat(need.required_mru) - parseFloat(need.collected_mru)).toLocaleString()} MRU
                                </div>
                            </div>
                        </div>

                        {/* Amount field */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Montant du don</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
                                {[100, 300, 500, 1000].map(s => (
                                    <button key={s} onClick={() => setAmount(s.toString())}
                                        className={`btn ${amount === s.toString() ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ fontSize: '0.95rem', padding: '0.65rem' }}>
                                        {s.toLocaleString()} MRU
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="number" min="100" className="filter-select" style={{ flex: 1 }}
                                    placeholder="Autre montant…" value={amount} onChange={e => setAmount(e.target.value)} />
                                <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>MRU</span>
                            </div>
                        </div>

                        {/* Anonymous */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', marginBottom: '1.75rem', cursor: 'pointer' }}
                            onClick={() => setIsAnonymous(a => !a)}>
                            <div style={{
                                width: 22, height: 22, borderRadius: 6, border: '2px solid var(--primary)',
                                backgroundColor: isAnonymous ? 'var(--primary)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.2s', flexShrink: 0,
                            }}>
                                {isAnonymous && <CheckCircle2 size={14} color="#fff" />}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Don anonyme</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Votre nom ne sera pas affiché publiquement</div>
                            </div>
                        </div>

                        {/* Bank selector */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                <Building2 size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                                Votre application bancaire
                            </label>
                            <select className="filter-select w-full" value={selectedBankId} onChange={e => setSelectedBankId(e.target.value)}>
                                <option value="">Sélectionner l'application pour le virement…</option>
                                {bankAccounts.map(b => (
                                    <option key={b.id} value={b.id}>{b.bank_name}</option>
                                ))}
                            </select>
                        </div>

                        <button className="btn btn-primary w-full" disabled={!amount || Number(amount) < 100 || !selectedBankId}
                            onClick={() => setStep(2)}
                            style={{ padding: '0.9rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            Continuer <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {/* ═══ STEP 2 — Virement & Reçu ═══ */}
                {step === 2 && (
                    <div className="dashboard-panel" style={{ animation: 'fadeInUp 0.3s ease' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Soumettre votre reçu</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                            Effectuez le virement sur le compte ci-dessous et joignez la preuve.
                        </p>

                        {/* Amount reminder */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(var(--primary-rgb, 99,102,241), 0.15), rgba(var(--secondary-rgb, 16,185,129), 0.08))', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Montant à virer</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>{Number(amount).toLocaleString()} <span style={{ fontSize: '1.2rem' }}>MRU</span></div>
                        </div>

                        {/* Bank details dynamically populated based on selected bank in Step 1 */}
                        {[
                            { label: 'Application ciblée', value: bankAccounts.find(b => String(b.id) === String(selectedBankId))?.bank_name || 'N/A' },
                            { label: 'Numéro de compte', value: bankAccounts.find(b => String(b.id) === String(selectedBankId))?.account_number || 'N/A' },
                            { label: 'Titulaire du compte', value: bankAccounts.find(b => String(b.id) === String(selectedBankId))?.account_holder || 'N/A' },
                        ].map(row => (
                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{row.label}</span>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: row.label.includes('Numéro de compte') ? 'monospace' : 'inherit' }}>{row.value}</span>
                            </div>
                        ))}

                        {/* Bank Reference Input */}
                        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Référence de la transaction (N° de virement) <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                className="filter-select w-full"
                                placeholder="Entrer le numéro de référence du virement…"
                                value={bankReference}
                                onChange={e => setBankReference(e.target.value)}
                            />
                        </div>



                        {/* Receipt upload */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                <ImageIcon size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                                Photo du reçu bancaire
                            </label>
                            <div
                                onClick={() => fileRef.current?.click()}
                                style={{
                                    border: `2px dashed ${receiptFile ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}`,
                                    borderRadius: '0.75rem', padding: '1.5rem',
                                    textAlign: 'center', cursor: 'pointer',
                                    backgroundColor: receiptFile ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {receiptPreview ? (
                                    <img src={receiptPreview} alt="Aperçu reçu"
                                        style={{ maxHeight: 180, borderRadius: '0.5rem', objectFit: 'contain', margin: '0 auto' }} />
                                ) : (
                                    <>
                                        <Upload size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Cliquer pour charger une photo</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>JPG, PNG ou PDF — max 10 Mo</div>
                                    </>
                                )}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />
                            {receiptFile && (
                                <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <CheckCircle2 size={14} /> {receiptFile.name}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <ArrowLeft size={16} /> Retour
                            </button>
                            <button
                                className="btn btn-primary"
                                disabled={!receiptFile || !bankReference || submitting}
                                onClick={handleSubmit}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                {submitting ? (
                                    <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Envoi…</>
                                ) : (
                                    <><ShieldCheck size={18} /> Soumettre</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default DonateTunnel;
