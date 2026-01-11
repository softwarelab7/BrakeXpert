import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, Wifi, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import '../styles/reload-prompt.css';

function ReloadPrompt() {
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
        addNotification({
            title: 'Actualización completada',
            message: 'La aplicación se ha actualizado a la versión más reciente.',
            type: 'system'
        });
        updateServiceWorker(true);
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

                {needRefresh && (
                    <div className="ReloadPrompt-changes">
                        <div className="ReloadPrompt-changes-header">¿Qué hay de nuevo?</div>
                        <ul className="ReloadPrompt-changes-list">
                            <li>✨ <strong>Efecto Cristal:</strong> Nuevo banner superior más moderno.</li>
                            <li>🏷️ <strong>Etiquetas de Marca:</strong> Nuevo diseño de botones más limpio.</li>
                            <li>🎨 <strong>Interfaz Pulida:</strong> Colores y espaciados mejorados.</li>
                            <li>🛠️ <strong>Correcciones:</strong> Mejoras de rendimiento y estabilidad.</li>
                        </ul>
                    </div>
                )}

                <div className="ReloadPrompt-actions">
                    {needRefresh && (
                        <button
                            className="ReloadPrompt-btn ReloadPrompt-btn-primary"
                            onClick={handleUpdate}
                        >
                            Actualizar ahora <ArrowRight size={20} />
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
