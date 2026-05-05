import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, Wifi, ArrowRight, Loader } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import '../styles/reload-prompt.css';

function ReloadPrompt() {
    const [isUpdating, setIsUpdating] = useState(false);
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            if (r) {
                // Check for updates every minute
                setInterval(() => r.update(), 60 * 1000);
            }
        },
    });

    const addNotification = useAppStore(state => state.addNotification);

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    const handleUpdate = () => {
        setIsUpdating(true);
        // Simulate update processing before reload
        setTimeout(() => {
            addNotification({
                title: 'Actualización completada',
                message: 'La aplicación se ha actualizado a la versión más reciente.',
                type: 'system'
            });
            updateServiceWorker(true);
        }, 1500);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="ReloadPrompt-container">
            <div className="ReloadPrompt-overlay" />
            <div className="ReloadPrompt-toast">
                <div className="ReloadPrompt-icon-wrapper">
                    {offlineReady ? (
                        <Wifi size={32} />
                    ) : (
                        <RefreshCw size={32} className="spin-animate" />
                    )}
                </div>

                <div className="ReloadPrompt-message">
                    <h3>{offlineReady ? 'Modo Offline' : 'Actualización Disponible'}</h3>
                    <p>
                        {offlineReady
                            ? 'La aplicación está lista para usarse sin conexión a internet.'
                            : 'Hay una nueva versión disponible. Hemos mejorado la interfaz para una mejor experiencia.'}
                    </p>
                </div>

                {/* Improvements list hidden by user request */}

                <div className="ReloadPrompt-actions">
                    {needRefresh && (
                        <button
                            className={`ReloadPrompt-btn ReloadPrompt-btn-primary ${isUpdating ? 'updating' : ''}`}
                            onClick={handleUpdate}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <>
                                    Actualizando... <Loader size={20} className="spin-animate" />
                                </>
                            ) : (
                                <>
                                    Actualizar ahora <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    )}
                    {offlineReady && !needRefresh && (
                        <button className="ReloadPrompt-btn ReloadPrompt-btn-primary" onClick={close}>
                            Entendido
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReloadPrompt;
