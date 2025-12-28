import { Scale, Heart, History } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import '../../styles/results-bar.css';

interface ResultsBarProps {
    totalResults: number;
    currentStart: number;
    currentEnd: number;
}

const ResultsBar = ({ totalResults, currentStart, currentEnd }: ResultsBarProps) => {
    const {
        comparisons,
        favorites,
        openCompareModal,
        openFavoritesModal,
        openHistoryModal,
    } = useAppStore();

    return (
        <div className="results-bar">
            <p className="results-text">
                Mostrando{' '}
                <span className="results-count">
                    {currentStart}-{currentEnd}
                </span>{' '}
                de{' '}
                <span className="results-count">{totalResults}</span>{' '}
                resultados
            </p>

            <div className="results-actions">
                <button
                    className={`results-action-btn ${comparisons.length > 0 ? 'active' : ''}`}
                    onClick={openCompareModal}
                    title="Comparar productos"
                >
                    <Scale size={18} />
                    <span>Comparar</span>
                    {comparisons.length > 0 && (
                        <span className="action-badge action-badge-compare">
                            {comparisons.length}
                        </span>
                    )}
                </button>

                <button
                    className={`results-action-btn ${favorites.length > 0 ? 'active' : ''}`}
                    onClick={openFavoritesModal}
                    title="Ver favoritos"
                >
                    <Heart size={18} />
                    <span>Favoritos</span>
                    {favorites.length > 0 && (
                        <span className="action-badge action-badge-favorite">
                            {favorites.length}
                        </span>
                    )}
                </button>

                <button
                    className="results-action-btn"
                    onClick={openHistoryModal}
                    title="Historial de búsquedas"
                >
                    <History size={18} />
                    <span>Historial</span>
                </button>
            </div>
        </div>
    );
};

export default ResultsBar;
