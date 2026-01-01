import { useMemo, useState, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Product } from '../../types';
import '../../styles/sidebar.css';

const Sidebar = () => {
    const store = useAppStore();
    const { filters, products, filteredProducts } = store;

    // Local state for smooth typing
    const [localQuery, setLocalQuery] = useState(filters.searchQuery);
    const [localOem, setLocalOem] = useState(filters.oemReference);
    const [localFmsi, setLocalFmsi] = useState(filters.fmsiReference);
    const [localWidth, setLocalWidth] = useState(filters.width);
    const [localHeight, setLocalHeight] = useState(filters.height);

    // Sync local state when global filters are cleared
    useEffect(() => {
        setLocalQuery(filters.searchQuery);
        setLocalOem(filters.oemReference);
        setLocalFmsi(filters.fmsiReference);
        setLocalWidth(filters.width);
        setLocalHeight(filters.height);
    }, [filters.searchQuery, filters.oemReference, filters.fmsiReference, filters.width, filters.height]);

    // Debounce effects to update global store
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localQuery !== filters.searchQuery) store.setSearchQuery(localQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [localQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localOem !== filters.oemReference) {
                store.setOemReference(localOem);
                if (localOem && localQuery) setLocalQuery('');
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localOem]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localFmsi !== filters.fmsiReference) {
                store.setFmsiReference(localFmsi);
                if (localFmsi && localQuery) setLocalQuery('');
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localFmsi]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localWidth !== filters.width) store.setWidth(localWidth);
        }, 300);
        return () => clearTimeout(timer);
    }, [localWidth]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localHeight !== filters.height) store.setHeight(localHeight);
        }, 300);
        return () => clearTimeout(timer);
    }, [localHeight]);

    // Faceted logic
    const brands = useMemo(() => {
        const brandMap = new Map<string, number>();
        products.forEach((p: Product) => {
            if (p.aplicaciones && Array.isArray(p.aplicaciones)) {
                p.aplicaciones.forEach((app: any) => {
                    if (app && app.marca) {
                        brandMap.set(app.marca, (brandMap.get(app.marca) || 0) + 1);
                    }
                });
            }
        });
        return Array.from(brandMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [products]);

    const models = useMemo(() => {
        const modelMap = new Map<string, number>();
        products.forEach((p: Product) => {
            if (p.aplicaciones && Array.isArray(p.aplicaciones)) {
                p.aplicaciones.forEach((app: any) => {
                    if (app && app.modelo) {
                        modelMap.set(app.modelo, (modelMap.get(app.modelo) || 0) + 1);
                    }
                });
            }
        });
        return Array.from(modelMap.keys()).sort((a, b) => a.localeCompare(b));
    }, [products]);

    const years = useMemo(() => {
        const yearSet = new Set<string>();
        products.forEach((p: Product) => {
            if (p.aplicaciones && Array.isArray(p.aplicaciones)) {
                p.aplicaciones.forEach((app: any) => {
                    if (app && app.año) {
                        yearSet.add(String(app.año));
                    }
                });
            }
        });
        return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
    }, [products]);

    return (
        <aside className="sidebar">
            <div className="filter-section">
                <h3 className="filter-section-title">Búsqueda Rápida</h3>
                <div className="search-box">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Chevrolet Onix, 2244, FMSI..."
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                    />
                    <Search size={16} className="search-icon" />
                </div>
            </div>

            <div className="filter-section">
                <h3 className="filter-section-title">Detalles del Vehículo</h3>
                <div className="vehicle-details-grid">
                    <div className="searchable-filter">
                        <input
                            list="brands-list"
                            className="filter-select"
                            placeholder="Marca"
                            value={filters.selectedBrand || ''}
                            onChange={(e) => {
                                store.setSelectedBrand(e.target.value);
                                if (e.target.value) setLocalQuery('');
                            }}
                        />
                        <datalist id="brands-list">
                            {brands.map(([name]) => (
                                <option key={name} value={name} />
                            ))}
                        </datalist>
                    </div>

                    <div className="searchable-filter">
                        <input
                            list="models-list"
                            className="filter-select"
                            placeholder="Modelo/Serie"
                            value={filters.selectedModel || ''}
                            onChange={(e) => {
                                store.setSelectedModel(e.target.value);
                                if (e.target.value) setLocalQuery('');
                            }}
                        />
                        <datalist id="models-list">
                            {models.map(name => (
                                <option key={name} value={name} />
                            ))}
                        </datalist>
                    </div>

                    <div className="searchable-filter">
                        <input
                            list="years-list"
                            className="filter-select"
                            placeholder="Año"
                            value={filters.selectedYear || ''}
                            onChange={(e) => {
                                store.setSelectedYear(e.target.value);
                                if (e.target.value) setLocalQuery('');
                            }}
                        />
                        <datalist id="years-list">
                            {years.map(year => (
                                <option key={year} value={year} />
                            ))}
                        </datalist>
                    </div>
                </div>
            </div>

            <div className="filter-section">
                <h3 className="filter-section-title">Posición</h3>
                <div className="position-grid">
                    <button
                        className={`position-toggle-btn ${filters.selectedPositions.includes('delantera') ? 'active' : ''}`}
                        onClick={() => {
                            store.togglePosition('delantera');
                            setLocalQuery('');
                        }}
                    >
                        Delantera
                    </button>
                    <button
                        className={`position-toggle-btn ${filters.selectedPositions.includes('trasera') ? 'active' : ''}`}
                        onClick={() => {
                            store.togglePosition('trasera');
                            setLocalQuery('');
                        }}
                    >
                        Trasera
                    </button>
                </div>
            </div>

            <div className="filter-section">
                <h3 className="filter-section-title">Referencias</h3>
                <div className="references-grid">
                    <input
                        type="text"
                        className="ref-input"
                        placeholder="OEM"
                        value={localOem}
                        onChange={(e) => setLocalOem(e.target.value)}
                    />
                    <input
                        type="text"
                        className="ref-input"
                        placeholder="FMSI"
                        value={localFmsi}
                        onChange={(e) => setLocalFmsi(e.target.value)}
                    />
                </div>
            </div>

            <div className="filter-section">
                <h3 className="filter-section-title">Medidas (mm)</h3>
                <div className="measurements-grid">
                    <input
                        type="number"
                        className="measure-input"
                        placeholder="Ancho"
                        step="0.1"
                        value={localWidth}
                        onChange={(e) => setLocalWidth(e.target.value)}
                    />
                    <input
                        type="number"
                        className="measure-input"
                        placeholder="Alto"
                        step="0.1"
                        value={localHeight}
                        onChange={(e) => setLocalHeight(e.target.value)}
                    />
                </div>
            </div>

            <div className="action-buttons-container">
                <button
                    className="borrar-filtros-btn"
                    onClick={() => {
                        store.clearFilters();
                        setLocalQuery('');
                        setLocalOem('');
                        setLocalFmsi('');
                        setLocalWidth('');
                        setLocalHeight('');
                    }}
                    disabled={filteredProducts.length === products.length}
                    style={{ opacity: filteredProducts.length === products.length ? 0.6 : 1 }}
                >
                    <Trash2 size={16} />
                    LIMPIAR ({filteredProducts.length})
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
