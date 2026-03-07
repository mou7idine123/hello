import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api';

const NotificationBell = () => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications.php');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        // Fetch initially
        fetchNotifications();

        // Poll every 30 seconds for new alerts
        const interval = setInterval(fetchNotifications, 30000);

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put('/notifications.php', { notification_id: id });
            fetchNotifications(); // Refresh local state
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        for (let id of unreadIds) {
            await markAsRead(id);
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '0.5rem',
                    color: 'var(--text-muted)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: 'var(--danger)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="glass shadow-premium animate-in fade-in slide-in-from-top-2" style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '0.75rem',
                    width: '320px',
                    borderRadius: '16px',
                    zIndex: 50,
                    overflow: 'hidden',
                    borderColor: 'var(--border)'
                }}>
                    <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)'
                    }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: 'var(--primary)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s',
                                    padding: 0
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-dark)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--primary)'}
                            >
                                Tout marquer lu
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
                                Aucune notification.
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                                        display: 'flex',
                                        gap: '0.75rem',
                                        transition: 'all 0.2s',
                                        backgroundColor: n.is_read ? 'transparent' : 'rgba(45, 97, 255, 0.05)'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = n.is_read ? 'transparent' : 'rgba(45, 97, 255, 0.05)'}
                                >
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{
                                            fontSize: '0.875rem',
                                            marginBottom: '0.25rem',
                                            marginTop: 0,
                                            fontWeight: n.is_read ? 600 : 800,
                                            color: n.is_read ? 'var(--text-main)' : 'var(--primary)'
                                        }}>{n.title}</h4>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            lineHeight: 1.5,
                                            marginBottom: '0.5rem',
                                            marginTop: 0
                                        }}>{n.message}</p>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            opacity: 0.4
                                        }}>{new Date(n.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {!n.is_read && (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            style={{
                                                alignSelf: 'center',
                                                padding: '0.375rem',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--emerald-light)',
                                                color: 'var(--emerald)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--emerald-light)'}
                                            title="Marquer comme lu"
                                        >
                                            <Check size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
