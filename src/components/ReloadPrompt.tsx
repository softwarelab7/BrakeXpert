import { useRegisterSW } from 'virtual:pwa-register/react'
import '../styles/reload-prompt.css'

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            // eslint-disable-next-line prefer-template
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    return (
        <div className="ReloadPrompt-container">
            {(offlineReady || needRefresh) && (
                <div className="ReloadPrompt-toast">
                    <div className="ReloadPrompt-message">
                        {offlineReady
                            ? <span>App lista para trabajar sin internet.</span>
                            : <span>Nueva actualización disponible, recarga para ver los cambios.</span>
                        }
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {needRefresh && (
                            <button className="ReloadPrompt-toast-button" onClick={() => updateServiceWorker(true)}>
                                Recargar
                            </button>
                        )}
                        <button className="ReloadPrompt-toast-button" onClick={close}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ReloadPrompt
