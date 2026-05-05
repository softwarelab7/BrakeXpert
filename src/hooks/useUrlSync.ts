import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Syncs URL query parameters ↔ filter state.
 * Supports: q, brand, model, year, pos (positions), brandTags, w, h
 * This allows sharing search links and using browser back/forward.
 */
const useUrlSync = () => {
    const {
        filters,
        setSearchQuery,
        setSelectedBrand,
        setSelectedModel,
        setSelectedYear,
        togglePosition,
        toggleBrandTag,
        setWidth,
        setHeight,
    } = useAppStore();

    const isInitialMount = useRef(true);

    // 1. Initialize Store from URL on Mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const q = params.get('q');
        const brand = params.get('brand');
        const model = params.get('model');
        const year = params.get('year');
        const pos = params.get('pos');
        const brandTags = params.get('brandTags');
        const w = params.get('w');
        const h = params.get('h');

        if (q) setSearchQuery(q);
        if (brand) setSelectedBrand(brand);
        if (model) setSelectedModel(model);
        if (year) setSelectedYear(year);
        if (w) setWidth(w);
        if (h) setHeight(h);

        // Restore multi-value filters
        if (pos) {
            pos.split(',').forEach(p => togglePosition(p.trim()));
        }
        if (brandTags) {
            brandTags.split(',').forEach(t => toggleBrandTag(t.trim()));
        }

        isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Sync State changes to URL
    useEffect(() => {
        if (isInitialMount.current) return;

        const params = new URLSearchParams();

        if (filters.searchQuery) params.set('q', filters.searchQuery);
        if (filters.selectedBrand) params.set('brand', filters.selectedBrand);
        if (filters.selectedModel) params.set('model', filters.selectedModel);
        if (filters.selectedYear) params.set('year', filters.selectedYear);
        if (filters.selectedPositions && filters.selectedPositions.length > 0) {
            params.set('pos', filters.selectedPositions.join(','));
        }
        if (filters.selectedBrandTags && filters.selectedBrandTags.length > 0) {
            params.set('brandTags', filters.selectedBrandTags.join(','));
        }
        if (filters.width) params.set('w', filters.width);
        if (filters.height) params.set('h', filters.height);

        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState(null, '', newUrl);

    }, [
        filters.searchQuery,
        filters.selectedBrand,
        filters.selectedModel,
        filters.selectedYear,
        filters.selectedPositions,
        filters.selectedBrandTags,
        filters.width,
        filters.height,
    ]);
};

export default useUrlSync;
