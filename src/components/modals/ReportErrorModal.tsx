import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { addReport } from '../../services/firebase';
import '../../styles/modals.css';

interface ReportErrorModalProps {
    product: {
        id: string;
        referencia: string;
    } | null;
}

const ReportErrorModal: React.FC<ReportErrorModalProps> = ({ product }) => {
    const isOpen = useAppStore(state => state.ui.isReportModalOpen);
    const closeReportModal = useAppStore(state => state.closeReportModal);
    const addNotification = useAppStore(state => state.addNotification);

    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !product) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        setIsSubmitting(true);
        try {
            await addReport({
                productId: product.id,
                productReference: product.referencia,
                description: description.trim()
            });

            addNotification({
                title: 'Reporte enviado',
                message: 'Gracias por ayudarnos a mejorar.',
                type: 'success'
            });

            setDescription('');
            closeReportModal();
        } catch (error) {
            console.error(error);
            addNotification({
                title: 'Error',
                message: 'No se pudo enviar el reporte. Intenta de nuevo.',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 1100 }}> {/* Higher z-index to sit above details */}
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <button className="modal-close" onClick={closeReportModal}>
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', background: '#fee2e2', borderRadius: '50%', color: '#ef4444' }}>
                            <AlertTriangle size={24} />
                        </div>
                        <h2 className="modal-title">Reportar Error</h2>
                    </div>
                </div>

                <div className="modal-body">
                    <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                        ¿Encontraste un error en la referencia <strong>{product.referencia}</strong>? Descríbelo brevemente abajo.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <textarea
                            className="search-input" // Reusing input style or custom
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '1rem',
                                resize: 'vertical',
                                marginBottom: '1.5rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px'
                            }}
                            placeholder="Ej: La medida del ancho es incorrecta, debería ser..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSubmitting}
                            required
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                type="button"
                                className="action-button secondary"
                                onClick={closeReportModal}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="action-button primary"
                                style={{ backgroundColor: '#ef4444' }} // Red for report action usually implies high attention
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportErrorModal;
