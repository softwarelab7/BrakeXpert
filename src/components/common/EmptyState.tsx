import { SearchX, RefreshCcw } from 'lucide-react';
import '../../styles/empty-state.css';

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState = ({
    title = "No se encontraron resultados",
    description = "Intenta ajustar los filtros de búsqueda o prueba con otros términos para encontrar lo que necesitas.",
    actionLabel = "Limpiar Filtros",
    onAction
}: EmptyStateProps) => {
    return (
        <div className="empty-state-container">
            <div className="empty-state-icon-wrapper">
                <div className="empty-state-blob" />
                <SearchX size={64} className="empty-state-icon" strokeWidth={1.5} />
            </div>

            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">{description}</p>

            <div className="empty-state-tips-box">
                <p className="tips-header">Sugerencias para mejorar tu búsqueda:</p>
                <ul className="tips-list">
                    <li>Verifica que la referencia esté bien escrita.</li>
                    <li>Intenta buscar solo por modelo (ej: "Mazda 3").</li>
                    <li>Prueba con menos palabras clave.</li>
                </ul>
            </div>

            {onAction && (
                <button onClick={onAction} className="empty-state-action">
                    <RefreshCcw size={18} />
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
