import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, MapPin, CheckCircle, UploadCloud, AlertCircle } from 'lucide-react';
import api from '../api';

const ConfirmDelivery = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [message, setMessage] = useState('');
    const [gpsEnabled, setGpsEnabled] = useState(false);
    const [gpsCoords, setGpsCoords] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Mock amount for this delivery
    const amount = 5000;

    const processImageWithPrivacyBlur = (originalFile) => {
        const img = new Image();
        const url = URL.createObjectURL(originalFile);
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw original
            ctx.drawImage(img, 0, 0);

            // Apply a "privacy blur" over the image (simulating auto face blur for MVP)
            ctx.filter = 'blur(15px)';
            ctx.drawImage(img, 0, 0);
            ctx.filter = 'none';

            canvas.toBlob((blob) => {
                const blurredFile = new File([blob], `blurred_${originalFile.name}`, { type: 'image/jpeg' });
                setFile(blurredFile);
                setPreviewUrl(URL.createObjectURL(blob));
            }, 'image/jpeg', 0.8);
        };
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            processImageWithPrivacyBlur(e.target.files[0]);
        }
    };

    const handleEnableGps = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = `${position.coords.latitude},${position.coords.longitude}`;
                    setGpsCoords(coords);
                    setGpsEnabled(true);
                },
                (error) => {
                    console.error("GPS error", error);
                    alert("Erreur GPS. Veuillez autoriser la localisation.");
                }
            );
        } else {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !gpsEnabled) return;

        setIsSubmitting(true);

        const type = location.state?.type || 'donation';

        const formData = new FormData();
        formData.append('donation_id', id);
        formData.append('type', type);
        formData.append('message', message);
        formData.append('gps', gpsCoords);
        formData.append('photo', file);

        try {
            const response = await api.post('/validator/confirm_delivery.php', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log("Confirmed. Hedera Hash:", response.data.hedera_sequence);
            setIsConfirmed(true);
            setTimeout(() => {
                navigate('/validator-dashboard', {
                    state: {
                        notification: {
                            type: 'success',
                            message: type === 'order' ? 'Aide remise et besoin clôturé avec succès !' : 'Don remis avec succès !'
                        }
                    }
                });
            }, 3000);
        } catch (error) {
            console.error("Confirmation error:", error);
            alert(error.response?.data?.message || "Erreur lors de la confirmation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-main" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '2rem' }}>
                {t('validator.title')}
            </h1>

            {isConfirmed ? (
                <div className="admin-card-soft" style={{ padding: '5rem 3rem', textAlign: 'center', borderTop: '8px solid var(--emerald)' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '32px',
                        background: 'var(--emerald-light)', color: 'var(--emerald)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2.5rem', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)'
                    }}>
                        <CheckCircle size={60} />
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>Remise confirmée !</h2>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{t('validator.successMsg')}</p>
                    <button onClick={() => navigate('/validator-dashboard')} className="btn btn-primary" style={{ marginTop: '2.5rem', padding: '1rem 3rem', borderRadius: 'var(--radius-xl)' }}>
                        Retour au Dashboard
                    </button>
                </div>
            ) : (
                <>
                    {/* Notification Card */}
                    <div className="admin-card-soft" style={{
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        padding: '1.75rem 2rem', border: '1px solid #bfdbfe', marginBottom: '2.5rem',
                        display: 'flex', alignItems: 'center', gap: '1.5rem'
                    }}>
                        <div style={{ background: 'white', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)', boxShadow: '0 4px 12px rgba(45, 97, 255, 0.1)' }}>
                            <AlertCircle size={24} />
                        </div>
                        <p style={{ color: '#1E3A8A', fontWeight: 700, fontSize: '1.125rem', lineHeight: '1.5', margin: 0 }}>
                            {t('validator.notification', { amount })}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="admin-card-soft" style={{ padding: '3rem' }}>
                        {/* Upload Photo section */}
                        <div style={{ marginBottom: '3rem' }}>
                            <label className="admin-label" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
                                {t('validator.uploadPhoto')} <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>

                            <div style={{
                                border: '2px dashed var(--border)',
                                borderRadius: 'var(--radius-2xl)',
                                padding: '4rem 2rem',
                                textAlign: 'center',
                                backgroundColor: file ? 'rgba(16, 185, 129, 0.03)' : '#f8fafc',
                                borderColor: file ? 'var(--emerald)' : 'var(--border)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                                onClick={() => document.getElementById('photo-upload').click()}
                            >
                                {file ? (
                                    <div>
                                        {previewUrl ? (
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <img src={previewUrl} alt="Blurred Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }} />
                                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--emerald)', color: 'white', borderRadius: '50%', padding: '4px' }}>
                                                    <CheckCircle size={20} />
                                                </div>
                                            </div>
                                        ) : (
                                            <CheckCircle size={48} color="var(--emerald)" style={{ margin: '0 auto 1.5rem' }} />
                                        )}
                                        <p style={{ fontWeight: 800, color: 'var(--emerald)', fontSize: '1.25rem', marginTop: '1.5rem' }}>Anonymisation Appliquée</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.5rem' }}>Cliquez pour changer la photo</p>
                                    </div>
                                ) : (
                                    <div style={{ opacity: 0.7 }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                                            <Camera size={36} color="var(--text-muted)" />
                                        </div>
                                        <p style={{ color: 'var(--text-main)', fontWeight: 800, marginBottom: '0.5rem', fontSize: '1.25rem' }}>Cliquez ou glissez une photo</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>La photo sera automatiquement floutée pour la vie privée.</p>
                                    </div>
                                )}
                            </div>
                            <input type="file" id="photo-upload" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                        </div>

                        {/* Note to Donor */}
                        <div style={{ marginBottom: '3rem' }}>
                            <label className="admin-label" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>{t('validator.messageDonor')}</label>
                            <textarea
                                className="admin-textarea"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t('validator.messagePlaceholder')}
                                style={{ minHeight: '150px' }}
                            />
                        </div>

                        {/* GPS Location */}
                        <div style={{ marginBottom: '3.5rem', padding: '2rem', background: '#f8fafc', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.125rem' }}>{t('validator.gpsActive')}</h3>
                                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', margin: 0 }}>{t('validator.gpsNotice')}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleEnableGps}
                                    className={`btn ${gpsEnabled ? 'btn-success' : ''}`}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '1rem 1.5rem', borderRadius: 'var(--radius-xl)',
                                        background: gpsEnabled ? 'var(--emerald)' : 'white',
                                        color: gpsEnabled ? 'white' : 'var(--text-main)',
                                        border: '1px solid ' + (gpsEnabled ? 'var(--emerald)' : 'var(--border)'),
                                        fontWeight: 800, transition: 'all 0.2s',
                                        boxShadow: gpsEnabled ? '0 8px 16px rgba(16, 185, 129, 0.2)' : 'var(--shadow-sm)'
                                    }}
                                >
                                    <MapPin size={20} />
                                    {gpsEnabled ? "Position Capturée" : "Partager ma Position"}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    width: '100%', padding: '1.25rem', fontSize: '1.25rem', fontWeight: 900,
                                    borderRadius: 'var(--radius-xl)',
                                    opacity: (!file || !gpsEnabled || isSubmitting) ? 0.6 : 1,
                                    cursor: (!file || !gpsEnabled || isSubmitting) ? 'not-allowed' : 'pointer',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem',
                                    boxShadow: '0 12px 24px rgba(45, 97, 255, 0.3)'
                                }}
                                disabled={!file || !gpsEnabled || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="spinner-border" style={{ width: '24px', height: '24px' }}></div>
                                        Ancrage sur Hedera...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={24} />
                                        {t('validator.confirmBtn')}
                                    </>
                                )}
                            </button>
                            {(!file || !gpsEnabled) && (
                                <p style={{ textAlign: 'center', color: 'var(--danger)', fontSize: '0.875rem', marginTop: '1.5rem', fontWeight: 600 }}>
                                    Veuillez ajouter une photo et activer le GPS pour confirmer la remise.
                                </p>
                            )}
                        </div>
                    </form>
                </>
            )}
            <style>
                {`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spinner-border {
                    display: inline-block;
                    width: 2rem;
                    height: 2rem;
                    vertical-align: text-bottom;
                    border: 0.25em solid currentColor;
                    border-right-color: transparent;
                    border-radius: 50%;
                    animation: spin .75s linear infinite;
                }
                `}
            </style>
        </div>
    );
};

export default ConfirmDelivery;
