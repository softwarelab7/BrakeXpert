import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import StyledIconButton from './common/StyledIconButton';
import '../styles/update-notification.css';

export const NotificationPanel: React.FC = () => {
    const isNotificationPanelOpen = useAppStore(state => state.isNotificationPanelOpen);
    const notifications = useAppStore(state => state.ui.notifications);
    const closeNotificationPanel = useAppStore(state => state.closeNotificationPanel);
    const markAsRead = useAppStore(state => state.markAsRead);
    const markAllAsRead = useAppStore(state => state.markAllAsRead);
    const clearAllNotifications = useAppStore(state => state.clearAllNotifications);

    if (!isNotificationPanelOpen) return null;

    const formatTime = (ts: number) => {
        const date = new Date(ts);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <>
            <div className="notification-overlay" onClick={closeNotificationPanel} />
            <div className="fixed-container">
                <div className="notification-card">
                    <header className="notification-header">
                        <h2 className="notification-title">Notificaciones</h2>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {notifications.length > 0 && (
                                <>
                                    <StyledIconButton
                                        icon={<CheckCheck />}
                                        onClick={markAllAsRead}
                                        tooltip="Marcar todo como leído"
                                        activeColor="#10b981"
                                    />
                                    <StyledIconButton
                                        icon={<Trash2 />}
                                        onClick={clearAllNotifications}
                                        tooltip="Limpiar todo"
                                        activeColor="#ef4444"
                                    />
                                </>
                            )}
                            <StyledIconButton
                                icon={<X />}
                                onClick={closeNotificationPanel}
                                tooltip="Cerrar"
                                activeColor="#ef4444"
                            />
                        </div>
                    </header>

                    <div className="notification-list custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="empty-state">
                                <Bell size={48} className="empty-icon" />
                                <p>Sin notificaciones pendientes</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} className="notification-group">
                                    <div className="item-header">
                                        <Bell size={18} className="bell-icon" />
                                        <h3 className="item-title">{n.title}</h3>
                                        {!n.read && <div className="unread-dot"></div>}
                                    </div>
                                    <p className="item-message">{n.message}</p>
                                    <div className="item-footer">
                                        {!n.read ? (
                                            <button className="read-action" onClick={() => markAsRead(n.id)}>
                                                <Check size={14} />
                                                <span>LEÍDO</span>
                                            </button>
                                        ) : (
                                            <div className="read-status">
                                                <Check size={14} />
                                                <span>LEÍDO</span>
                                            </div>
                                        )}
                                        <span className="item-time">{formatTime(n.timestamp)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
