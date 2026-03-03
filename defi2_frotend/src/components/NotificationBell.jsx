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
                    backgroundColor: 'transparent',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        backgroundColor: '#EF4444',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        width: '18px',
                        height: '18px',
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
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '0.5rem',
                    width: '320px',
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    border: '1px solid #E2E8F0',
                    zIndex: 50,
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0F172A' }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{ fontSize: '0.75rem', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                            >
                                Tout marquer lu
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                                Aucune notification.
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid #F1F5F9',
                                        backgroundColor: n.is_read ? 'white' : '#EFF6FF',
                                        display: 'flex',
                                        gap: '0.75rem',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: n.is_read ? '500' : '700', color: '#1E293B' }}>{n.title}</h4>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8125rem', color: '#475569', lineHeight: '1.4' }}>{n.message}</p>
                                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(n.created_at).toLocaleString()}</span>
                                    </div>
                                    {!n.is_read && (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10B981', alignSelf: 'center', padding: '0.25rem' }}
                                            title="Marquer comme lu"
                                        >
                                            <Check size={16} />
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
