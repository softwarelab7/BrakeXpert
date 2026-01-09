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

/**
 * Smart Year Parsing Logic
 * Handles 2-digit and 4-digit years with a pivot for 2000s vs 1900s
 */
const CURRENT_YEAR = new Date().getFullYear();
const CENTURY_PIVOT = (CURRENT_YEAR % 100) + 2; // e.g., 2026 -> 28. Years <= 28 are 20xx, > 28 are 19xx

export const parseSmartYear = (input: string | number): number | null => {
    if (!input) return null;
    const clean = String(input).trim();
    const num = parseInt(clean, 10);

    if (isNaN(num)) return null;

    // 4-digit year (simple validation)
    if (clean.length === 4) {
        return num;
    }

    // 2-digit year
    if (clean.length <= 2) {
        return num <= CENTURY_PIVOT ? 2000 + num : 1900 + num;
    }

    return null;
};

export const parseYearRange = (rangeStr: string): [number, number] | null => {
    // Standardize separators: 05-25, 05/25, 05 25
    const parts = rangeStr.split(/[-/\s]+/).filter(Boolean);

    // Check for "05 en adelante" or similar single-ended ranges could be future work
    // For now handles explicit start-end
    if (parts.length >= 2) {
        const start = parseSmartYear(parts[0]);
        let end = parseSmartYear(parts[1]);

        if (start !== null) {
            // Handle cases like "2005-presente" or just missing end by defaulting/ignoring if invalid
            // But if end is null, maybe treating as 'current year' or just strict match? 
            // Logic: If second part is valid year, use it. If not, if it says 'adelante', use current year.
            // For safety in this strict task, if end is invalid, we might skip range logic or treat as start-start.
            // Let's assume standard "05-25" format essentially.

            if (end === null) {
                // Try to detect keywords like 'adelante' could be added here, 
                // but for now let's recover if 2nd part looks numeric
                return null;
            }
            return [start, end];
        }
    }
    return null;
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
        return item.aplicaciones.some(app => app && normalizeText(app.marca) === normalizedValue);
    },

    selectedModel: (item, value) => {
        if (!value) return true;
        if (!item.aplicaciones || !Array.isArray(item.aplicaciones)) return false;
        const normalizedValue = normalizeText(value);
        return item.aplicaciones.some(app => {
            if (!app) return false;
            // Check both modelo and serie
            const modelMatch = app.modelo && normalizeText(app.modelo) === normalizedValue;
            const serieMatch = app.serie && normalizeText(app.serie) === normalizedValue;
            return modelMatch || serieMatch;
        });
    },

    selectedYear: (item, value) => {
        if (!value) return true;
        if (!item.aplicaciones || !Array.isArray(item.aplicaciones)) return false;

        const searchValue = String(value).trim();
        const searchYear = parseSmartYear(searchValue);

        // Logical Check: If we parsed a valid year, use smart matching
        if (searchYear !== null) {
            return item.aplicaciones.some(app => {
                if (!app || !app.año) return false;
                const appYearStr = String(app.año);

                // 1. Try exact match on full string first (simple case)
                if (appYearStr.includes(searchValue)) return true;

                // 2. Parse application year/range
                // Check if it's a range
                const range = parseYearRange(appYearStr);
                if (range) {
                    const [start, end] = range;
                    // Check if search year is within params
                    // Swap if start > end (handle 99-05 context if needed, but simple compare is safer)
                    return searchYear >= Math.min(start, end) && searchYear <= Math.max(start, end);
                }

                // Check if it's a single year
                const appYear = parseSmartYear(appYearStr);
                if (appYear !== null) {
                    return appYear === searchYear;
                }

                return false;
            });
        }

        // Fallback: Text search (original behavior)
        return item.aplicaciones.some(app => app && String(app.año || '').includes(searchValue));
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
    selectedPositions: (item, value) => {
        // Debug what value is being passed to the filter
        if (value && Array.isArray(value) && value.length > 0) {
            console.log('📍 Position filter called with:', value);
        }

        if (!value || !Array.isArray(value) || value.length === 0) return true;

        // Collect all positions this product applies to
        const productPositions = new Set<string>();

        // 1. Check root position (Priority Source)
        if (item.posicion) {
            const rootPos = normalizeText(item.posicion);
            if (rootPos === 'ambas') {
                productPositions.add('delantera');
                productPositions.add('trasera');
            } else {
                productPositions.add(rootPos);
            }
        }
        // 2. Fallback: Check applications ONLY if root position is missing
        else if (Array.isArray(item.aplicaciones)) {
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
        // Show products that apply to ALL of the selected positions
        // When both Delantera and Trasera are selected, only show products
        // that have BOTH positions (either explicitly or via "AMBAS")
        const required = value.map(v => normalizeText(v));

        const passes = required.every(req => productPositions.has(req));

        // Debug specific product
        if (item.referencia && item.referencia.includes('7291')) {
            console.log('🔍 Pastilla 7291 Debug:', {
                referencia: item.referencia,
                rootPosition: item.posicion,
                required,
                productPositions: Array.from(productPositions),
                passes,
                aplicacionesCount: item.aplicaciones?.length || 0
            });
        }

        // Use AND logic: product passes only if it has ALL selected positions
        return passes;
    },

    // Favorites & New
    showFavoritesOnly: (item, value, context) => !value || (context && context.favorites ? context.favorites.includes(item.id) : false),

    // New Products (Created within last 15 days)
    showNewOnly: (item, value) => {
        if (!value) return true;
        // Check if created in last 15 days
        return !!item.createdAt && (Date.now() - item.createdAt) < (15 * 24 * 60 * 60 * 1000);
    }
};
