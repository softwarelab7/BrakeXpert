import { Bell, HelpCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import ThemeToggle from './ThemeToggle';
import '../../styles/header.css';

const Header = () => {
    const { ui, openHistoryModal } = useAppStore();
    const notificationCount = ui.notifications.length;

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-section">
                    <h1 className="logo">BRAKE X</h1>
                    <p className="tagline">Consulta rápida. Frenado seguro.</p>
                </div>

                <div className="header-actions">
                    <button
                        className="icon-button"
                        title="Ayuda"
                        aria-label="Ayuda"
                    >
                        <HelpCircle size={20} />
                    </button>

                    <ThemeToggle />

                    <button
                        className="icon-button"
                        title="Notificaciones"
                        aria-label="Notificaciones"
                    >
                        <Bell size={20} />
                        {notificationCount > 0 && (
                            <span className="notification-badge">{notificationCount}</span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
