import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import StyledIconButton from './StyledIconButton';

const Toast = () => {
    const toast = useAppStore(state => state.toast);
    const hideToast = useAppStore(state => state.hideToast);
    const theme = useAppStore(state => state.theme);
    const [isVisible, setIsVisible] = useState(false);

    const isLight = theme === 'light';

    useEffect(() => {
        if (toast) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(hideToast, 300); // Wait for exit animation
            }, 10000); // 10 seconds duration
            return () => clearTimeout(timer);
        }
    }, [toast, hideToast]);

    if (!toast && !isVisible) return null;

    const getIcon = () => {
        switch (toast?.type) {
            case 'success': return <CheckCircle size={20} color="#10b981" />;
            case 'error': return <AlertCircle size={20} color="#ef4444" />;
            case 'warning': return <AlertTriangle size={20} color="#f59e0b" />;
            default: return <Info size={20} color="#3b82f6" />;
        }
    };

    const getBorderColor = () => {
        switch (toast?.type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            default: return '#3b82f6';
        }
    }

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                backgroundColor: isLight ? '#ffffff' : '#1e293b',
                color: isLight ? '#1e293b' : '#ffffff',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.4), 0 10px 20px -6px rgba(0, 0, 0, 0.2)',
                borderLeft: `8px solid ${getBorderColor()}`,
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                minWidth: '400px',
                maxWidth: '500px',
                transform: isVisible ? 'translateX(0)' : 'translateX(130%)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: isVisible ? 'auto' : 'none',
                backdropFilter: 'none',
            }}
        >
            <div>
                {React.cloneElement(getIcon() as React.ReactElement<any>, { size: 32 })} {/* Bigger Icon */}
            </div>
            <div style={{ flex: 1 }}>
                {toast?.title && (
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 700, color: isLight ? '#1e293b' : '#ffffff' }}>{toast.title}</h4>
                )}
                <p style={{ margin: 0, fontSize: '15px', color: isLight ? '#475569' : '#cbd5e1', lineHeight: '1.5' }}>
                    {toast?.message}
                </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
                <StyledIconButton
                    icon={<X />}
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(hideToast, 300);
                    }}
                    tooltip="Cerrar"
                    activeColor="#ef4444"
                />
            </div>
        </div >
    );
};

export default Toast;
