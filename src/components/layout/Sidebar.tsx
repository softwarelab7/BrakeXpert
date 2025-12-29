import { Search, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import '../../styles/sidebar.css';


const Sidebar = () => {
    const filters = useAppStore(state => state.filters);
    const setSearchQuery = useAppStore(state => state.setSearchQuery);
    const setSelectedBrand = useAppStore(state => state.setSelectedBrand);
    const setSelectedModel = useAppStore(state => state.setSelectedModel);
    const setSelectedYear = useAppStore(state => state.setSelectedYear);
    const setSelectedPosition = useAppStore(state => state.setSelectedPosition);
    const setOemReference = useAppStore(state => state.setOemReference);
    const setFmsiReference = useAppStore(state => state.setFmsiReference);
    const setWidth = useAppStore(state => state.setWidth);
    const setHeight = useAppStore(state => state.setHeight);
    const clearFilters = useAppStore(state => state.clearFilters);

    return (
        <aside className="sidebar">
            <div className="filter-card">
                {/* Quick Search */}
                <div className="filter-section">
                    <h3 className="filter-section-title">Búsqueda Rápida</h3>
                    <div className="search-box">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Marca, Serie, Ref, OEM..."
                            value={filters.searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={18} className="search-icon" />
                    </div>
                </div>

                <div className="filter-divider" />

                {/* Vehicle Details */}
                <div className="filter-section">
                    <h3 className="filter-section-title">Detalles del Vehículo</h3>
                    <div className="vehicle-details-grid">
                        <select
                            className="filter-select"
                            value={filters.selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                        >
                            <option value="">Marca</option>
                            <option value="chevrolet">Chevrolet</option>
                            <option value="nissan">Nissan</option>
                            <option value="hyundai">Hyundai</option>
                            <option value="kia">Kia</option>
                            <option value="ford">Ford</option>
                            <option value="toyota">Toyota</option>
                            <option value="honda">Honda</option>
                            <option value="mazda">Mazda</option>
                            <option value="volkswagen">Volkswagen</option>
                            <option value="renault">Renault</option>
                        </select>

                        <select
                            className="filter-select"
                            value={filters.selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            disabled={!filters.selectedBrand}
                        >
                            <option value="">Modelo/Serie</option>
                            <option value="spark">Spark</option>
                            <option value="aveo">Aveo</option>
                            <option value="cruze">Cruze</option>
                            <option value="malibu">Malibu</option>
                            <option value="silverado">Silverado</option>
                        </select>

                        <select
                            className="filter-select"
                            value={filters.selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            disabled={!filters.selectedModel}
                        >
                            <option value="">Año</option>
                            {Array.from({ length: 15 }, (_, i) => 2025 - i).map((year) => (
                                <option key={year} value={year.toString()}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="filter-divider" />

                {/* Position */}
                <div className="filter-section">
                    <h3 className="filter-section-title">Posición</h3>
                    <div className="position-grid">
                        <button
                            className={`position-toggle-btn ${filters.selectedPosition === 'delantera' ? 'active' : ''}`}
                            onClick={() => setSelectedPosition(filters.selectedPosition === 'delantera' ? null : 'delantera')}
                        >
                            Delantera
                        </button>
                        <button
                            className={`position-toggle-btn ${filters.selectedPosition === 'trasera' ? 'active' : ''}`}
                            onClick={() => setSelectedPosition(filters.selectedPosition === 'trasera' ? null : 'trasera')}
                        >
                            Trasera
                        </button>
                    </div>
                </div>

                <div className="filter-divider" />

                {/* References */}
                <div className="filter-section">
                    <h3 className="filter-section-title">Referencias</h3>
                    <div className="references-grid">
                        <div className="ref-input-group">
                            <input
                                type="text"
                                className="ref-input"
                                placeholder="OEM"
                                value={filters.oemReference}
                                onChange={(e) => setOemReference(e.target.value)}
                            />
                        </div>
                        <div className="ref-input-group">
                            <input
                                type="text"
                                className="ref-input"
                                placeholder="FMSI"
                                value={filters.fmsiReference}
                                onChange={(e) => setFmsiReference(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="filter-divider" />

                {/* Measurements */}
                <div className="filter-section">
                    <h3 className="filter-section-title">Medidas (mm)</h3>
                    <div className="measurements-grid">
                        <input
                            type="number"
                            className="measure-input"
                            placeholder="Ancho"
                            value={filters.width}
                            onChange={(e) => setWidth(e.target.value)}
                        />
                        <input
                            type="number"
                            className="measure-input"
                            placeholder="Alto"
                            value={filters.height}
                            onChange={(e) => setHeight(e.target.value)}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons-container">
                    <button className="borrar-filtros-btn" onClick={clearFilters}>
                        <Trash2 size={18} />
                        BORRAR FILTROS
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
