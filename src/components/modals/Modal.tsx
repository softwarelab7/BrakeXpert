import { X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import StyledIconButton from '../common/StyledIconButton';
import '../../styles/modals.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string | ReactNode;
    children: ReactNode;
    size?: 'small' | 'default' | 'large' | 'xl';
    hideHeader?: boolean;
    noPadding?: boolean;
    allowOverflow?: boolean;
}

const Modal = ({ isOpen, onClose, title, children, size = 'default', hideHeader = false, noPadding = false, allowOverflow = false }: ModalProps) => {
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) setShouldRender(true);
    }, [isOpen]);

    const onAnimationEnd = () => {
        if (!isOpen) setShouldRender(false);
    };

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!shouldRender) return null;

    const sizeClass =
        size === 'small' ? 'modal-sm' :
            size === 'large' ? 'modal-large' :
                size === 'xl' ? 'modal-xl' :
                    '';

    const bodyClass = `modal-body ${noPadding ? 'modal-body-p0' : ''} ${allowOverflow ? 'allow-overflow' : ''}`;
    const animationClass = isOpen ? '' : 'closing';

    return createPortal(
        <div
            className={`modal-overlay ${animationClass} ${allowOverflow ? 'allow-overflow' : ''}`}
            onClick={onClose}
            onAnimationEnd={onAnimationEnd}
        >
            <div
                className={`modal-container ${sizeClass} ${animationClass} ${allowOverflow ? 'allow-overflow' : ''}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {!hideHeader && (
                    <div className="modal-header">
                        <h2 id="modal-title" className="modal-title">{title}</h2>
                        <StyledIconButton
                            icon={<X />}
                            onClick={onClose}
                            tooltip="Cerrar"
                            activeColor="#ef4444"
                        />
                    </div>
                )}

                <div className={bodyClass}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
