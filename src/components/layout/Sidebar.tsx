import { useMemo, useState, useEffect, useRef } from 'react';

import { useAppStore } from '../../store/useAppStore';
import type { Product } from '../../types';
import AnimatedSearch from '../common/AnimatedSearch';
import SearchableSelect from '../common/SearchableSelect';
import StyledIconButton from '../common/StyledIconButton';
import { ArrowUp, ArrowDown, Trash2, Filter } from 'lucide-react';
import '../../styles/sidebar.css';


const Sidebar = () => {
    const store = useAppStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { filters, products, filteredProducts } = store;

    // Ref for search input
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Keyboard Shortcut Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
    }, [localQuery, filters.searchQuery, store]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localOem !== filters.oemReference) {
                store.setOemReference(localOem);
                if (localOem && localQuery) setLocalQuery('');
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localOem, filters.oemReference, localQuery, store]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localFmsi !== filters.fmsiReference) {
                store.setFmsiReference(localFmsi);
                if (localFmsi && localQuery) setLocalQuery('');
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localFmsi, filters.fmsiReference, localQuery, store]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localWidth !== filters.width) store.setWidth(localWidth);
        }, 300);
        return () => clearTimeout(timer);
    }, [localWidth, filters.width, store]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localHeight !== filters.height) store.setHeight(localHeight);
        }, 300);
        return () => clearTimeout(timer);
    }, [localHeight, filters.height, store]);

    // Track when to add to history
    useEffect(() => {
        // Only record if filters are not empty
        const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
            if (key === 'showFavoritesOnly') return false;
            if (Array.isArray(value)) return value.length > 0;
            return !!value;
        });

        if (!hasActiveFilters) return;

        const timer = setTimeout(() => {
            // Generate summary
            const parts = [];
            if (filters.searchQuery) parts.push(filters.searchQuery);
            if (filters.selectedBrand) parts.push(filters.selectedBrand);
            if (filters.selectedModel) parts.push(filters.selectedModel);
            if (filters.selectedYear) parts.push(filters.selectedYear);
            if (filters.oemReference) parts.push(`OEM: ${filters.oemReference}`);
            if (filters.fmsiReference) parts.push(`FMSI: ${filters.fmsiReference}`);
            if (filters.width || filters.height) parts.push(`${filters.width || '?'}x${filters.height || '?'}`);

            const summary = parts.join(' • ') || 'Nueva Búsqueda';

            store.addToSearchHistory({
                timestamp: Date.now(),
                filters: { ...filters },
                resultCount: filteredProducts.length,
                summary
            });
        }, 1500); // 1.5s delay to "commit" to history

        return () => clearTimeout(timer);
    }, [filters, filteredProducts.length, store]);

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
                    // Check if brand is selected, if so, only show models for that brand
                    if (filters.selectedBrand && app.marca !== filters.selectedBrand) {
                        return;
                    }

                    if (app && app.modelo) {
                        modelMap.set(app.modelo, (modelMap.get(app.modelo) || 0) + 1);
                    }
                });
            }
        });
        return Array.from(modelMap.keys()).sort((a, b) => a.localeCompare(b));
    }, [products, filters.selectedBrand]);

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

    const hasActiveFilters = filteredProducts.length !== products.length;

    const clearFilters = () => {
        store.clearFilters();
        setLocalQuery('');
        setLocalOem('');
        setLocalFmsi('');
        setLocalWidth('');
        setLocalHeight('');
    };

    // Icon import if needed, assuming Filter icon from lucide-react
    // Need to verify standard Lucide imports in file header if I use Filter icon.
    // Since I cannot see top of file in this chunk, I will use text "FILTROS" and maybe svg inline or add import in separate step if missing.
    // Actually I can scan for Filter import.

    return (
        <>
            {/* Mobile Toggle Button (Visible only on mobile via CSS) */}
            <StyledIconButton
                className="mobile-toggle-btn"
                icon={<Filter />}
                label="FILTROS"
                onClick={() => setIsMobileOpen(true)}
                isActive={hasActiveFilters}
                activeColor="var(--accent-primary)"
                tooltip="Mostrar filtros"
            />

            {/* Backdrop Overlay */}
            <div
                className={`sidebar-overlay ${isMobileOpen ? 'open' : ''}`}
                onClick={() => setIsMobileOpen(false)}
            />

            <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    <div className="filter-section">
                        <div className="section-header">
                            <h3 className="filter-section-title">Búsqueda Rápida</h3>
                        </div>
                        <AnimatedSearch
                            ref={searchInputRef}
                            value={localQuery}
                            onChange={setLocalQuery}
                            placeholder="Buscar..."
                        />
                    </div>

                    <div className="filter-section">
                        <div className="section-header">
                            <h3 className="filter-section-title">Detalles del Vehículo</h3>
                        </div>
                        <div className="vehicle-details-grid">
                            <SearchableSelect
                                placeholder="Marca"
                                value={filters.selectedBrand || ''}
                                options={brands.map(([name]) => name)}
                                onChange={(value) => {
                                    store.setSelectedBrand(value);
                                    if (value) setLocalQuery('');
                                }}
                                className={filters.selectedBrand ? 'has-value' : ''}
                            />

                            <SearchableSelect
                                placeholder="Modelo/Serie"
                                value={filters.selectedModel || ''}
                                options={models}
                                onChange={(value) => {
                                    store.setSelectedModel(value);
                                    if (value) setLocalQuery('');
                                }}
                                className={filters.selectedModel ? 'has-value' : ''}
                            />

                            <SearchableSelect
                                placeholder="Año"
                                value={filters.selectedYear || ''}
                                options={years}
                                onChange={(value) => {
                                    store.setSelectedYear(value);
                                    if (value) setLocalQuery('');
                                }}
                                className={filters.selectedYear ? 'has-value' : ''}
                            />
                        </div>
                    </div>

                    <div className="filter-section">
                        <div className="section-header">
                            <h3 className="filter-section-title">Posición</h3>
                        </div>
                        <div className="position-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                            <StyledIconButton
                                icon={<ArrowUp />}
                                tooltip="Delantera"
                                label="Delantera"
                                onClick={() => store.togglePosition('delantera')}
                                isActive={filters.selectedPositions.includes('delantera')}
                                activeColor="#3b82f6"
                            />
                            <StyledIconButton
                                icon={<ArrowDown />}
                                tooltip="Trasera"
                                label="Trasera"
                                onClick={() => store.togglePosition('trasera')}
                                isActive={filters.selectedPositions.includes('trasera')}
                                activeColor="#ef4444"
                            />
                        </div>
                    </div>

                    <div className="filter-section">
                        <div className="section-header">
                            <h3 className="filter-section-title">Referencias</h3>
                        </div>
                        <div className="references-grid">
                            <div className={`ref-input-wrapper ${localOem ? 'has-value' : ''}`}>
                                <input
                                    type="text"
                                    className="ref-input"
                                    placeholder="OEM"
                                    value={localOem}
                                    onChange={(e) => setLocalOem(e.target.value)}
                                />
                            </div>
                            <div className={`ref-input-wrapper ${localFmsi ? 'has-value' : ''}`}>
                                <input
                                    type="text"
                                    className="ref-input"
                                    placeholder="FMSI"
                                    value={localFmsi}
                                    onChange={(e) => setLocalFmsi(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="filter-section">
                        <div className="section-header">
                            <h3 className="filter-section-title">Medidas (mm)</h3>
                        </div>
                        <div className="measurements-grid">
                            <div className={`measure-input-wrapper ${localWidth ? 'has-value' : ''}`}>
                                <input
                                    type="number"
                                    className="measure-input"
                                    placeholder="Ancho"
                                    step="0.1"
                                    value={localWidth}
                                    onChange={(e) => setLocalWidth(e.target.value)}
                                />
                            </div>
                            <div className={`measure-input-wrapper ${localHeight ? 'has-value' : ''}`}>
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
                    </div>

                    <div className="borrar-filtros-container" style={{ display: 'flex', justifyContent: 'center' }}>
                        <StyledIconButton
                            icon={<Trash2 />}
                            tooltip="Borrar Filtros"
                            label="BORRAR FILTROS"
                            onClick={clearFilters}
                            isActive={hasActiveFilters}
                            activeColor="#ef4444"
                            className={`${!hasActiveFilters ? 'disabled' : ''} trash-hover`}
                        />
                    </div>
                </div>



            </aside >
        </>
    );
};

export default Sidebar;
