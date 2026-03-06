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
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-text-muted hover:text-primary transition-all relative flex items-center justify-center bg-transparent border-none cursor-pointer"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 glass rounded-2xl shadow-premium z-50 overflow-hidden border-border animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-white/50">
                        <h3 className="text-sm font-bold text-text-main">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-bold text-primary hover:text-primary-dark transition-colors bg-transparent border-none cursor-pointer"
                            >
                                Tout marquer lu
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center text-text-muted text-sm font-medium">
                                Aucune notification.
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`p-4 border-b border-border/50 flex gap-3 transition-all hover:bg-white/40 ${n.is_read ? 'bg-transparent' : 'bg-primary/5'}`}
                                >
                                    <div className="flex-1">
                                        <h4 className={`text-sm mb-1 ${n.is_read ? 'font-semibold text-text-main' : 'font-extrabold text-primary'}`}>{n.title}</h4>
                                        <p className="text-xs text-text-muted leading-relaxed mb-2">{n.message}</p>
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">{new Date(n.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {!n.is_read && (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            className="self-center p-1.5 rounded-full bg-emerald-light text-emerald hover:bg-emerald/20 transition-all border-none cursor-pointer"
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
