import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, History, Clock, Search, Trash2 } from 'lucide-react';
import type { Filters } from '../types';
import '../styles/history-panel.css';

const HistoryPanel: React.FC = () => {
    const isHistoryPanelOpen = useAppStore(state => state.ui.isHistoryPanelOpen);
    const searchHistory = useAppStore(state => state.searchHistory);
    const closeHistoryPanel = useAppStore(state => state.closeHistoryPanel);
    const setSearchQuery = useAppStore(state => state.setSearchQuery);
    const clearFilters = useAppStore(state => state.clearFilters);
    const setSelectedBrand = useAppStore(state => state.setSelectedBrand);
    const setSelectedModel = useAppStore(state => state.setSelectedModel);
    const setSelectedYear = useAppStore(state => state.setSelectedYear);
    const clearSearchHistory = useAppStore(state => state.clearSearchHistory);

    if (!isHistoryPanelOpen) return null;

    const restoreSearch = (filtersToRestore: Partial<Filters>) => {
        clearFilters();
        if (filtersToRestore.searchQuery) setSearchQuery(filtersToRestore.searchQuery);
        if (filtersToRestore.selectedBrand) setSelectedBrand(filtersToRestore.selectedBrand);
        if (filtersToRestore.selectedModel) setSelectedModel(filtersToRestore.selectedModel);
        if (filtersToRestore.selectedYear) setSelectedYear(filtersToRestore.selectedYear);
        closeHistoryPanel();
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="history-fixed-container">
            <div className="history-panel-card">
                <header className="history-panel-header">
                    <div className="header-title-group">
                        <History size={20} className="header-icon" />
                        <h2 className="history-panel-title">Historial</h2>
                    </div>
                    <div className="header-actions">
                        {searchHistory.length > 0 && (
                            <button
                                onClick={clearSearchHistory}
                                className="history-action-btn delete"
                                title="Limpiar historial"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button onClick={closeHistoryPanel} className="history-action-btn close" title="Cerrar">
                            <X size={24} />
                        </button>
                    </div>
                </header>

                <div className="history-panel-content custom-scrollbar">
                    {searchHistory.length === 0 ? (
                        <div className="history-empty-state">
                            <History size={48} className="empty-icon-large" />
                            <h3>Historial Vacío</h3>
                            <p>Tus búsquedas recientes aparecerán aquí para que puedas volver a ellas rápidamente.</p>
                        </div>
                    ) : (
                        <div className="history-items-list">
                            {searchHistory.map((entry) => (
                                <button
                                    key={entry.id}
                                    onClick={() => restoreSearch(entry.filters)}
                                    className="history-panel-item"
                                >
                                    <div className="item-main">
                                        <div className="item-icon-box">
                                            <Search size={16} />
                                        </div>
                                        <div className="item-details">
                                            <span className="item-summary">{entry.summary || 'Búsqueda General'}</span>
                                            <span className="item-results">{entry.resultCount} resultados encontrados</span>
                                        </div>
                                    </div>
                                    <div className="item-meta">
                                        <Clock size={12} />
                                        <span>{formatDate(entry.timestamp)}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryPanel;
