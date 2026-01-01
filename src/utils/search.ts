import type { Product } from '../types';

/**
 * Normalizes text for search comparisons:
 * - Converts to lowercase
 * - Removes accents/diacritics
 * - Trims whitespace
 */
export const normalizeText = (text: string | number | null | undefined): string => {
    if (text === null || text === undefined) return '';
    return String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};

/**
 * Helper to get a sortable numeric value from reference
 */
export const getSortableRefNumber = (refs: string[] | undefined): number => {
    if (!refs || refs.length === 0) return 999999;
    // Try to find the first numeric part of the first ref
    const match = refs[0].match(/\d+/);
    return match ? parseInt(match[0], 10) : 999999;
};

interface FilterContext {
    favorites?: string[];
}

/**
 * Filter Strategies Implementation
 * Directly adapted from the provided requirements
 */
export const FILTER_STRATEGIES: Record<string, (item: Product, value: any, context?: FilterContext) => boolean> = {
    // Quick Search (Main search box)
    // Quick Search (Main search box)
    searchQuery: (item, value) => {
        if (!value) return true;

        // Normalize and split search query into individual terms
        const searchTerms = normalizeText(value).split(/\s+/).filter(Boolean);
        if (searchTerms.length === 0) return true;

        const itemWithCache = item as Product & { _searchableText?: string };

        // Generate searchable text if not cached
        if (!itemWithCache._searchableText) {
            const parts = [
                item.referencia || '',
                ...(item.ref || []),
                ...(item.oem || []),
                ...(item.fmsi || []),
                item.wva || '',
                item.fabricante || '',
            ];

            // Add application details safely
            if (Array.isArray(item.aplicaciones)) {
                item.aplicaciones.forEach(app => {
                    if (app) {
                        if (app.marca) parts.push(app.marca);
                        if (app.modelo) parts.push(app.modelo);
                        if (app.serie) parts.push(app.serie);
                        if (app.año) parts.push(String(app.año));
                    }
                });
            }

            itemWithCache._searchableText = normalizeText(parts.join(' '));
        }

        // Check if ALL search terms are present in the searchable text
        const text = itemWithCache._searchableText!;
        return searchTerms.every(term => text.includes(term));
    },

    // Vehicle Details
    selectedBrand: (item, value) => {
        if (!value) return true;
        if (!item.aplicaciones || !Array.isArray(item.aplicaciones)) return false;
        const normalizedValue = normalizeText(value);
        return item.aplicaciones.some(app => app && normalizeText(app.marca).includes(normalizedValue));
    },

    selectedModel: (item, value) => {
        if (!value) return true;
        if (!item.aplicaciones || !Array.isArray(item.aplicaciones)) return false;
        const normalizedValue = normalizeText(value);
        return item.aplicaciones.some(app => {
            if (!app) return false;
            // Check both modelo and serie
            const modelMatch = app.modelo && normalizeText(app.modelo).includes(normalizedValue);
            const serieMatch = app.serie && normalizeText(app.serie).includes(normalizedValue);
            return modelMatch || serieMatch;
        });
    },

    selectedYear: (item, value) => {
        if (!value) return true;
        if (!item.aplicaciones || !Array.isArray(item.aplicaciones)) return false;
        const strValue = String(value);
        return item.aplicaciones.some(app => app && String(app.año || '').includes(strValue));
    },

    // Technical Filters
    oemReference: (item, value) => !value || (item.oem || []).some(o => normalizeText(o).includes(normalizeText(value))),
    fmsiReference: (item, value) => !value || (item.fmsi || []).some(f => normalizeText(f).includes(normalizeText(value))),

    // Measurements (+- 2mm tolerance per requirements)
    width: (item, value) => {
        if (!value) return true;
        const val = parseFloat(value);
        if (isNaN(val)) return true;
        const itemVal = typeof item.medidas?.ancho === 'string' ? parseFloat(item.medidas.ancho) : (item.medidas?.ancho || 0);
        return Math.abs(itemVal - val) <= 2;
    },
    height: (item, value) => {
        if (!value) return true;
        const val = parseFloat(value);
        if (isNaN(val)) return true;
        const itemVal = typeof item.medidas?.alto === 'string' ? parseFloat(item.medidas.alto) : (item.medidas?.alto || 0);
        return Math.abs(itemVal - val) <= 2;
    },

    // Position
    // Position
    selectedPositions: (item, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return true;

        // Collect all positions this product applies to
        const productPositions = new Set<string>();

        // 1. Check root position (fallback for older data)
        if (item.posicion) {
            const rootPos = normalizeText(item.posicion);
            if (rootPos === 'ambas') {
                productPositions.add('delantera');
                productPositions.add('trasera');
            } else {
                productPositions.add(rootPos);
            }
        }

        // 2. Check applications (New strict logic)
        if (Array.isArray(item.aplicaciones)) {
            item.aplicaciones.forEach(app => {
                if (!app || !app.posicion) return;
                const appPos = normalizeText(app.posicion);
                if (appPos === 'ambas') {
                    productPositions.add('delantera');
                    productPositions.add('trasera');
                } else {
                    productPositions.add(appPos);
                }
            });
        }

        // Logic: AND (Intersection)
        // usage: "mostrar las pastillas que tienen las dos aplicaciones"
        // The product must support ALL selected positions.
        // We check if required positions (normalized) are effectively in the product's position set.

        // Normalize filter requirements
        const required = value.map(v => normalizeText(v));

        return required.every(req => productPositions.has(req));
    },

    // Favorites
    showFavoritesOnly: (item, value, context) => !value || (context && context.favorites ? context.favorites.includes(item.id) : false)
};
