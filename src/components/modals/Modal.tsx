import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/modals.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'default' | 'large' | 'xl';
}

const Modal = ({ isOpen, onClose, title, children, size = 'default' }: ModalProps) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
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

    if (!isOpen) return null;

    const sizeClass = size === 'large' ? 'modal-large' : size === 'xl' ? 'modal-xl' : '';

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-container ${sizeClass}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="modal-header">
                    <h2 id="modal-title" className="modal-title">{title}</h2>
                    <button
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
