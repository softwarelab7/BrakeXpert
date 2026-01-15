import { ArrowRightLeft, History, Grid3x3, LayoutGrid, Maximize, Zap, Bookmark } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import '../../styles/results-bar.css';
import CustomSelect from '../common/CustomSelect';
import StyledIconButton from '../common/StyledIconButton';

interface ResultsBarProps {
    totalResults: number;
    currentStart: number;
    currentEnd: number;
}

const ResultsBar = ({ totalResults, currentStart, currentEnd }: ResultsBarProps) => {
    const comparisonsCount = useAppStore(state => state.comparisons.length);
    const favoritesCount = useAppStore(state => state.favorites.length);
    const toggleShowFavoritesOnly = useAppStore(state => state.toggleShowFavoritesOnly);


    const showFavoritesOnly = useAppStore(state => state.filters.showFavoritesOnly);
    const openHistoryPanel = useAppStore(state => state.openHistoryPanel);
    const { itemsPerPage, gridDensity } = useAppStore(state => state.ui);
    const setItemsPerPage = useAppStore(state => state.setItemsPerPage);
    const setGridDensity = useAppStore(state => state.setGridDensity);
    const showNewOnly = useAppStore(state => state.filters.showNewOnly);

    const handleItemsPerPageChange = (newValue: number) => {
        setItemsPerPage(Number(newValue));
    };

    return (
        <div className="results-bar">
            {/* Left: Status Text */}
            <p className="results-text">
                {totalResults === 0 ? (
                    'Sin resultados'
                ) : (
                    <>
                        Mostrando{' '}
                        <span className="results-count">
                            {currentStart}-{currentEnd}
                        </span>{' '}
                        de{' '}
                        <span className="results-count">{totalResults}</span>{' '}
                        resultados
                    </>
                )}
            </p>

            {/* Right: Controls & Actions */}
            <div className="results-actions-wrapper">

                {/* Visual Settings Group */}
                <div className="control-group">
                    {/* Density Selector */}
                    <div className="density-selector">
                        <StyledIconButton
                            icon={<Grid3x3 size={16} />}
                            tooltip="Vista Compacta"
                            onClick={() => setGridDensity('compact')}
                            isActive={gridDensity === 'compact'}
                            activeColor="#3b82f6"
                            size="small"
                        />
                        <StyledIconButton
                            icon={<LayoutGrid size={16} />}
                            tooltip="Vista Normal"
                            onClick={() => setGridDensity('normal')}
                            isActive={gridDensity === 'normal'}
                            activeColor="#3b82f6"
                            size="small"
                        />
                        <StyledIconButton
                            icon={<Maximize size={16} />}
                            tooltip="Vista Cómoda"
                            onClick={() => setGridDensity('comfortable')}
                            isActive={gridDensity === 'comfortable'}
                            activeColor="#3b82f6"
                            size="small"
                        />
                    </div>

                    {/* Items Page Selector */}
                    <div className="items-selector">
                        <CustomSelect
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            options={[
                                { value: 24, label: '24 / pág' },
                                { value: 48, label: '48 / pág' },
                                { value: 72, label: '72 / pág' },
                                { value: 96, label: '96 / pág' },
                            ]}
                        />
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="control-divider" />

                {/* Tools Group */}
                <div className="tools-group">
                    <StyledIconButton
                        icon={<Zap />}
                        tooltip={showNewOnly ? "Ver todos los resultados" : "Ver solo nuevos"}
                        onClick={() => useAppStore.getState().toggleShowNewOnly()}
                        isActive={showNewOnly}
                        activeColor="#f59e0b" // Gold
                        badgeCount={useAppStore(state =>
                            state.products.filter(p =>
                                !!p.createdAt && (Date.now() - p.createdAt) < (15 * 24 * 60 * 60 * 1000)
                            ).length
                        )}
                    />

                    <StyledIconButton
                        icon={<ArrowRightLeft />}
                        tooltip="Comparar productos"
                        onClick={() => window.location.hash = 'compare'}
                        isActive={comparisonsCount > 0}
                        activeColor="#9333ea" // Purple
                        badgeCount={comparisonsCount}
                    />

                    <StyledIconButton
                        icon={<Bookmark fill={showFavoritesOnly ? "currentColor" : "none"} />}
                        tooltip={showFavoritesOnly ? "Ver todos los resultados" : "Ver solo favoritos"}
                        onClick={toggleShowFavoritesOnly}
                        isActive={showFavoritesOnly}
                        activeColor="#3b82f6" // Blue
                        badgeCount={favoritesCount}
                    />

                    <StyledIconButton
                        icon={<History />}
                        tooltip="Historial de búsquedas"
                        onClick={openHistoryPanel}
                    />
                </div>
            </div>
        </div>
    );
};

export default ResultsBar;
