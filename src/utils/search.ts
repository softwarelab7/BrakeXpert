import type { Product } from '../types';
import Fuse, { type FuseResult, type FuseResultMatch } from 'fuse.js';

// ─── Fuse.js Config ───────────────────────────────────────────────────────────

const fuseOptions = {
    includeScore: true,
    includeMatches: true,         // ✅ NEW: devuelve qué campos y posiciones coincidieron
    threshold: 0.25,              // ✅ RELAXED: más tolerante a errores tipográficos (era 0.1)
    distance: 200,                // ✅ NEW: busca coincidencias en todo el campo, no solo al inicio
    ignoreLocation: true,
    useExtendedSearch: true,
    minMatchCharLength: 2,        // ✅ NEW: mínimo 2 chars para considerar match
    keys: [
        { name: 'referencia', weight: 3.0 },
        { name: 'ref', weight: 2.5 },
        { name: 'oem', weight: 2.5 },
        { name: 'wva', weight: 2.5 },
        { name: 'fmsi', weight: 2.5 },
        { name: 'aplicaciones.marca', weight: 1.0 },
        { name: 'aplicaciones.modelo', weight: 0.8 },
        { name: 'aplicaciones.serie', weight: 0.8 },
        { name: 'aplicaciones.año', weight: 0.5 },
        { name: 'fabricante', weight: 0.5 }
    ]
};

// ─── Cached Fuse Index ────────────────────────────────────────────────────────

let cachedFuse: Fuse<Product> | null = null;
let cachedProducts: Product[] | null = null;

const getFuseIndex = (products: Product[]): Fuse<Product> => {
    if (cachedFuse && cachedProducts === products) return cachedFuse;
    cachedFuse = new Fuse(products, fuseOptions);
    cachedProducts = products;
    return cachedFuse;
};

export const invalidateFuseCache = (): void => {
    cachedFuse = null;
    cachedProducts = null;
};

// ─── Search Result with Match Info ───────────────────────────────────────────

export interface SearchMatch {
    key: string;
    value: string;
    indices: readonly [number, number][];
}

export interface SearchResult {
    item: Product;
    score: number;
    matches: SearchMatch[];
}

// ─── Search Cache ────────────────────────────────────────────────────────────
let _lastSearchResults: SearchResult[] = [];

/**
 * Performs fuzzy search and returns results WITH match metadata for highlighting.
 */
export const performSearchWithMatches = (products: Product[], query: string): SearchResult[] => {
    if (!query) {
        _lastSearchResults = products.map(p => ({ item: p, score: 1, matches: [] }));
        return _lastSearchResults;
    }
    const fuse = getFuseIndex(products);
    _lastSearchResults = fuse.search(query).map((r: FuseResult<Product>) => ({
        item: r.item,
        score: r.score ?? 1,
        matches: (r.matches ?? []).map((m: FuseResultMatch) => ({
            key: m.key ?? '',
            value: String(m.value ?? ''),
            indices: m.indices as readonly [number, number][],
        })),
    }));
    return _lastSearchResults;
};

/**
 * Returns the results of the last search performed.
 */
export const getLastSearchResults = (): SearchResult[] => _lastSearchResults;

/**
 * Simple version — returns just products (used internally by applyFilters).
 */
export const performSearch = (products: Product[], query: string): Product[] =>
    performSearchWithMatches(products, query).map(r => r.item);

// ─── Highlight Utility ────────────────────────────────────────────────────────

/**
 * Given a string and an array of [start, end] index pairs, returns an array
 * of {text, highlight} segments for rendering in JSX.
 */
export const buildHighlightSegments = (
    text: string,
    indices: readonly [number, number][]
): { text: string; highlight: boolean }[] => {
    if (!indices || indices.length === 0) return [{ text, highlight: false }];

    const segments: { text: string; highlight: boolean }[] = [];
    let lastIndex = 0;

    for (const [start, end] of indices) {
        if (start > lastIndex) {
            segments.push({ text: text.slice(lastIndex, start), highlight: false });
        }
        segments.push({ text: text.slice(start, end + 1), highlight: true });
        lastIndex = end + 1;
    }

    if (lastIndex < text.length) {
        segments.push({ text: text.slice(lastIndex), highlight: false });
    }

    return segments;
};

// ─── Text Normalization ───────────────────────────────────────────────────────

export const normalizeText = (text: string | number | null | undefined): string => {
    if (text === null || text === undefined) return '';
    return String(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
};

export const getSortableRefNumber = (refs: string[] | undefined): number => {
    if (!refs || refs.length === 0) return 999999;
    const match = refs[0].match(/\d+/);
    return match ? parseInt(match[0], 10) : 999999;
};

// ─── Year Parsing ─────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const CENTURY_PIVOT = (CURRENT_YEAR % 100) + 2;

export const parseSmartYear = (input: string | number): number | null => {
    if (!input) return null;
    const clean = String(input).trim();
    const num = parseInt(clean, 10);
    if (isNaN(num)) return null;
    if (clean.length === 4) return num;
    if (clean.length <= 2) return num <= CENTURY_PIVOT ? 2000 + num : 1900 + num;
    return null;
};

export const parseYearRange = (rangeStr: string): [number, number] | null => {
    const parts = rangeStr.split(/[-/\s]+/).filter(Boolean);
    if (parts.length >= 2) {
        const start = parseSmartYear(parts[0]);
        const end = parseSmartYear(parts[1]);
        if (start !== null && end !== null) return [start, end];
    }
    return null;
};

// ─── Filter Strategies ────────────────────────────────────────────────────────

interface FilterContext {
    favorites?: string[];
}

export const FILTER_STRATEGIES: Record<string, (item: Product, value: any, context?: FilterContext) => boolean> = {

    searchQuery: (item, value) => {
        if (!value) return true;
        const searchTerms = normalizeText(value).split(/\s+/).filter(Boolean);
        if (searchTerms.length === 0) return true;

        const itemWithCache = item as Product & { _searchableText?: string };
        if (!itemWithCache._searchableText) {
            const parts = [
                item.referencia || '',
                ...(item.ref || []),
                ...(item.oem || []),
                ...(item.fmsi || []),
                item.wva || '',
                item.fabricante || '',
            ];
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

        return searchTerms.every(term => itemWithCache._searchableText!.includes(term));
    },

    selectedBrand: (item, value) => {
        if (!value) return true;
        if (!item.aplicaciones || !Array.isArray(item.aplicaciones)) return false;
        const normalizedValue = normalizeText(value);
        return item.aplicaciones.some(app => app && normalizeText(app.marca) === normalizedValue);
    },

    selectedModel: (item, value) => {
        if (!value) return true;
        if (!item.aplicaciones || !Array.isArray(item.aplicaciones)) return false;
        const normalizedSearch = normalizeText(value);
        return item.aplicaciones.some(app => {
            if (!app) return false;
            return normalizeText(app.modelo).includes(normalizedSearch) ||
                   normalizeText(app.serie).includes(normalizedSearch);
        });
    },

    selectedYear: (item, value) => {
        if (!value) return true;
        if (!item.aplicaciones || !Array.isArray(item.aplicaciones)) return false;

        const searchValue = String(value).trim();

        // ✅ NEW: detect range input like "2015-2020"
        const rangeInput = parseYearRange(searchValue);
        if (rangeInput) {
            const [from, to] = rangeInput;
            return item.aplicaciones.some(app => {
                if (!app || !app.año) return false;
                const appYearStr = String(app.año);
                const appRange = parseYearRange(appYearStr);
                if (appRange) {
                    // Overlap check: app range overlaps with requested range
                    return appRange[0] <= to && appRange[1] >= from;
                }
                const appYear = parseSmartYear(appYearStr);
                return appYear !== null && appYear >= from && appYear <= to;
            });
        }

        const searchYear = parseSmartYear(searchValue);
        if (searchYear !== null) {
            return item.aplicaciones.some(app => {
                if (!app || !app.año) return false;
                const appYearStr = String(app.año);
                if (appYearStr.includes(searchValue)) return true;
                const range = parseYearRange(appYearStr);
                if (range) return searchYear >= Math.min(range[0], range[1]) && searchYear <= Math.max(range[0], range[1]);
                const appYear = parseSmartYear(appYearStr);
                return appYear !== null && appYear === searchYear;
            });
        }

        return item.aplicaciones.some(app => app && String(app.año || '').includes(searchValue));
    },

    oemReference: (item, value) => !value || (item.oem || []).some(o => normalizeText(o).includes(normalizeText(value))),
    fmsiReference: (item, value) => !value || (item.fmsi || []).some(f => normalizeText(f).includes(normalizeText(value))),

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

    selectedPositions: (item, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return true;
        const productPositions = new Set<string>();
        if (item.posicion) {
            const rootPos = normalizeText(item.posicion);
            if (rootPos === 'ambas') { productPositions.add('delantera'); productPositions.add('trasera'); }
            else productPositions.add(rootPos);
        } else if (Array.isArray(item.aplicaciones)) {
            item.aplicaciones.forEach(app => {
                if (!app?.posicion) return;
                const p = normalizeText(app.posicion);
                if (p === 'ambas') { productPositions.add('delantera'); productPositions.add('trasera'); }
                else productPositions.add(p);
            });
        }
        return value.map(v => normalizeText(v)).every(req => productPositions.has(req));
    },

    showFavoritesOnly: (item, value, context) =>
        !value || (context?.favorites ? context.favorites.includes(item.id) : false),

    showNewOnly: (item, value) =>
        !value || (!!item.createdAt && (Date.now() - item.createdAt) < 15 * 24 * 60 * 60 * 1000),

    selectedBrandTags: (item, selectedTags: string[]) => {
        if (!selectedTags?.length) return true;
        const rawRefs = [
            item.referencia, item.wva,
            ...(item.ref || []), ...(item.intercambios || []),
            ...(item.oem || []), ...(item.fmsi || [])
        ].filter(Boolean) as string[];
        const allRefs = rawRefs.flatMap(r => r.split(/[\s,/-]+/)).filter(r => r.length > 2);
        const fab = (item.fabricante || '').toUpperCase();
        return selectedTags.some(tag => {
            if (tag === 'INC') return allRefs.some(r => r.toUpperCase().endsWith('INC')) || fab.includes('INCOLBEST');
            if (tag === 'BEX') return allRefs.some(r => r.toUpperCase().endsWith('BEX')) || fab.includes('BEX');
            if (tag === 'K')   return allRefs.some(r => r.toUpperCase().startsWith('K')) || fab.includes('KTC');
            if (tag === 'BP')  return allRefs.some(r => r.toUpperCase().endsWith('BP')) || fab.includes('BRAKE PAK') || fab.includes('BRAKEPAK');
            if (tag === 'SP')  return allRefs.some(r => r.toUpperCase().startsWith('SP'));
            return false;
        });
    }
};
