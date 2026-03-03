import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, MapPin, CheckCircle, UploadCloud } from 'lucide-react';
import api from '../api';

const ConfirmDelivery = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

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

        const formData = new FormData();
        formData.append('donation_id', id);
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
                navigate('/');
            }, 5000);
        } catch (error) {
            console.error("Confirmation error:", error);
            alert("Erreur lors de la confirmation. Le statut doit être au préalable 'Vérifié' par un admin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
            <h1 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '2rem', textAlign: 'left', color: '#0F172A' }}>
                {t('validator.title')}
            </h1>

            {isConfirmed ? (
                <div style={{ backgroundColor: '#D1FAE5', padding: '3rem 2rem', borderRadius: '1rem', textAlign: 'center', color: '#059669', border: '1px solid #10B981', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <CheckCircle size={80} style={{ margin: '0 auto 1.5rem' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700' }}>Remise confirmée !</h2>
                    <p style={{ fontSize: '1.125rem' }}>{t('validator.successMsg')}</p>
                </div>
            ) : (
                <>
                    {/* Notification Card */}
                    <div style={{ backgroundColor: '#EFF6FF', padding: '1.5rem', borderRadius: '0.75rem', borderLeft: '4px solid #3B82F6', marginBottom: '2rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                        <p style={{ color: '#1E3A8A', fontWeight: '500', fontSize: '1.125rem', lineHeight: '1.5' }}>
                            {t('validator.notification', { amount })}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', border: '1px solid #E2E8F0' }}>

                        {/* Upload Photo section */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: '#1E293B', fontSize: '1.125rem' }}>
                                {t('validator.uploadPhoto')} <span style={{ color: '#EF4444' }}>*</span>
                            </label>

                            <div style={{
                                border: '2px dashed #94A3B8',
                                borderRadius: '0.75rem',
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                backgroundColor: file ? '#F0FDF4' : '#F8FAFC',
                                borderColor: file ? '#10B981' : '#94A3B8',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out'
                            }}
                                onClick={() => document.getElementById('photo-upload').click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                        setFile(e.dataTransfer.files[0]);
                                    }
                                }}
                            >
                                {file ? (
                                    <div>
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Blurred Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '0.5rem', margin: '0 auto 1rem', display: 'block', objectFit: 'contain' }} />
                                        ) : (
                                            <CheckCircle size={40} color="#10B981" style={{ margin: '0 auto 1rem' }} />
                                        )}
                                        <p style={{ fontWeight: '600', color: '#059669', fontSize: '1.125rem', marginTop: '0.5rem' }}>Anonymisation (Flou) Appliquée</p>
                                        <p style={{ color: '#10B981', fontSize: '0.875rem', marginTop: '0.5rem' }}>Cliquez pour changer la photo</p>
                                    </div>
                                ) : (
                                    <div>
                                        <Camera size={48} color="#64748B" style={{ margin: '0 auto 1rem' }} />
                                        <p style={{ color: '#475569', fontWeight: '500', marginBottom: '0.5rem', fontSize: '1.125rem' }}>Cliquez ou glissez une photo ici</p>
                                        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Formats acceptés: JPG, PNG. La photo sera automatiquement floutée.</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                id="photo-upload"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <div style={{ minWidth: '20px', paddingTop: '2px' }}>
                                    <CheckCircle color="#10B981" />
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>
                                    {t('validator.uploadDesc')}
                                </p>
                            </div>
                        </div>

                        {/* Note to Donor */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: '#1E293B', fontSize: '1.125rem' }}>
                                {t('validator.messageDonor')}
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t('validator.messagePlaceholder')}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #CBD5E1',
                                    minHeight: '120px',
                                    fontFamily: 'inherit',
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#10B981'}
                                onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                            />
                            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.5rem' }}>
                                {t('validator.messageNotice')}
                            </p>
                        </div>

                        {/* GPS Location */}
                        <div style={{ marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: '#F8FAFC', borderRadius: '0.75rem', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h3 style={{ fontWeight: '600', color: '#1E293B', marginBottom: '0.25rem' }}>
                                        {t('validator.gpsActive')}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                                        {t('validator.gpsNotice')}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleEnableGps}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: gpsEnabled ? '#10B981' : 'white',
                                        color: gpsEnabled ? 'white' : '#1E293B',
                                        border: gpsEnabled ? '1px solid #10B981' : '1px solid #CBD5E1',
                                        borderRadius: '0.5rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: gpsEnabled ? '0 4px 6px -1px rgba(16, 219, 129, 0.2)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                    }}
                                >
                                    <MapPin />
                                    {gpsEnabled ? "Localisation activée" : "Activer la localisation"}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div style={{ marginTop: '2rem' }}>
                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                style={{
                                    padding: '1.25rem',
                                    fontSize: '1.25rem',
                                    opacity: (!file || !gpsEnabled || isSubmitting) ? 0.7 : 1,
                                    cursor: (!file || !gpsEnabled || isSubmitting) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                                disabled={!file || !gpsEnabled || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            border: '3px solid rgba(255,255,255,0.3)',
                                            borderRadius: '50%',
                                            borderTopColor: 'white',
                                            animation: 'spin 1s ease-in-out infinite'
                                        }}></div>
                                        Ancrage sur Hedera...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={24} />
                                        {t('validator.confirmBtn')}
                                    </>
                                )}
                            </button>
                            {(!file || !gpsEnabled) && (
                                <p style={{ textAlign: 'center', color: '#EF4444', fontSize: '0.875rem', marginTop: '1rem' }}>
                                    Veuillez ajouter une photo et activer le GPS pour confirmer.
                                </p>
                            )}
                        </div>
                    </form>
                    <style>
                        {`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                        `}
                    </style>
                </>
            )}
        </div>
    );
};

export default ConfirmDelivery;
