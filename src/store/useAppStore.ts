import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Filters, Theme, SearchHistory, UIState } from '../types';

interface AppState {
    // Products
    products: Product[];
    filteredProducts: Product[];

    // Filters
    filters: Filters;
    filterMode: 'AND' | 'OR';      // ✅ NEW: AND = todos los filtros, OR = cualquier filtro

    // Collections
    favorites: string[]; // product IDs
    comparisons: string[]; // product IDs (max 4)
    searchHistory: SearchHistory[];

    // UI
    theme: Theme;
    accentColor: string;
    ui: UIState;
    notificationMessage: string | null;
    pwaUpdateAvailable: boolean;

    // Product Actions
    setProducts: (products: Product[]) => void;
    setFilteredProducts: (products: Product[]) => void;
    setNotificationMessage: (message: string | null) => void;
    setPwaUpdateAvailable: (available: boolean) => void;

    // Filter Actions
    setSearchQuery: (query: string) => void;
    setSelectedBrand: (brand: string) => void;
    setSelectedModel: (model: string) => void;
    setSelectedYear: (year: string) => void;
    togglePosition: (position: string) => void;
    toggleBrandTag: (brand: string) => void;
    setOemReference: (ref: string) => void;
    setFmsiReference: (ref: string) => void;
    setWidth: (width: string) => void;
    setHeight: (height: string) => void;
    toggleShowFavoritesOnly: () => void;
    toggleShowNewOnly: () => void;
    setFilterMode: (mode: 'AND' | 'OR') => void;  // ✅ NEW
    clearFilters: () => void;

    // Collection Actions
    toggleFavorite: (id: string) => void;
    toggleComparison: (id: string) => void;
    addToSearchHistory: (entry: Omit<SearchHistory, 'id'>) => void;
    clearSearchHistory: () => void;

    // Theme Actions
    setTheme: (theme: Theme) => void;
    setAccentColor: (color: string) => void;

    // UI Actions
    setCurrentPage: (page: number) => void;
    setItemsPerPage: (count: number) => void;
    setGridDensity: (density: 'compact' | 'normal' | 'comfortable') => void;

    openHistoryPanel: () => void;
    closeHistoryPanel: () => void;
    openProductDetailModal: (productId: string) => void;
    closeProductDetailModal: () => void;
    openGuideModal: () => void;
    closeGuideModal: () => void;
    openReportModal: () => void;
    closeReportModal: () => void;
    addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;

    // Toast Notification
    toast: { id: string; title?: string; message: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
    hideToast: () => void;

    // Notification Panel
    isNotificationPanelOpen: boolean;
    toggleNotificationPanel: () => void;
    closeNotificationPanel: () => void;
    removeNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAllNotifications: () => void;
    openSuggestAppModal: () => void;
    closeSuggestAppModal: () => void;
}

import { FILTER_STRATEGIES, getSortableRefNumber, performSearch, performSearchWithMatches, type SearchResult } from '../utils/search';

const applyFilters = (
    products: Product[],
    filters: Filters,
    favorites: string[],
    filterMode: 'AND' | 'OR' = 'AND'
): Product[] => {
    if (!products || !Array.isArray(products) || !products.length) return [];
    if (!filters) return products;

    // 1. Fuzzy search (sorted by relevance)
    let filtered = filters.searchQuery
        ? performSearch(products, filters.searchQuery)
        : [...products];

    // 2. Collect active non-search filter entries
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
        if (key === 'searchQuery') return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'boolean') return value;
        return !!value;
    });

    if (activeFilters.length > 0) {
        filtered = filtered.filter((product) => {
            if (filterMode === 'OR') {
                // OR: product passes if it matches ANY active filter
                return activeFilters.some(([key, value]) => {
                    const strategy = FILTER_STRATEGIES[key];
                    return strategy ? strategy(product, value, { favorites }) : true;
                });
            } else {
                // AND: product passes if it matches ALL active filters (default)
                return activeFilters.every(([key, value]) => {
                    const strategy = FILTER_STRATEGIES[key];
                    return strategy ? strategy(product, value, { favorites }) : true;
                });
            }
        });
    }

    // 3. Sort if no search query
    if (!filters.searchQuery) {
        filtered.sort((a, b) => getSortableRefNumber(a.ref) - getSortableRefNumber(b.ref));
    }

    return filtered;
};

// Store match metadata separately so ProductCard can read it for highlighting
let _lastSearchResults: SearchResult[] = [];
export const getLastSearchResults = (): SearchResult[] => _lastSearchResults;

const applyFiltersWithMatches = (
    products: Product[],
    filters: Filters,
    favorites: string[],
    filterMode: 'AND' | 'OR' = 'AND'
): Product[] => {
    if (filters.searchQuery) {
        _lastSearchResults = performSearchWithMatches(products, filters.searchQuery);
    } else {
        _lastSearchResults = [];
    }
    return applyFilters(products, filters, favorites, filterMode);
};

const initialFilters: Filters = {
    searchQuery: '',
    selectedBrand: '',
    selectedModel: '',
    selectedYear: '',
    selectedPositions: [],
    selectedBrandTags: [],
    oemReference: '',
    fmsiReference: '',
    width: '',
    height: '',
    showFavoritesOnly: false,
    showNewOnly: false,
};

const initialUIState: UIState = {
    currentPage: 1,
    itemsPerPage: 24,
    gridDensity: 'normal',

    isHistoryPanelOpen: false,
    isProductDetailModalOpen: false,
    isGuideModalOpen: false,
    isReportModalOpen: false,
    isSuggestAppModalOpen: false,
    selectedProductId: null,
    notifications: [],
};

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial State
            products: [],
            filteredProducts: [],
            filters: initialFilters,
            filterMode: 'AND' as const,
            favorites: [],
            comparisons: [],
            searchHistory: [],
            theme: 'light',
            accentColor: 'blue',
            ui: initialUIState,
            isNotificationPanelOpen: false,
            toggleNotificationPanel: () => set((state) => ({ isNotificationPanelOpen: !state.isNotificationPanelOpen })),
            closeNotificationPanel: () => set({ isNotificationPanelOpen: false }),

            toast: null,
            hideToast: () => set({ toast: null }),

            notificationMessage: null,
            pwaUpdateAvailable: false,

            // Product Actions
            setProducts: (products) => set((state) => ({
                products,
                filteredProducts: applyFiltersWithMatches(products, state.filters, state.favorites, state.filterMode)
            })),
            setFilteredProducts: (filteredProducts) => set({ filteredProducts }),
            setNotificationMessage: (message) => set({ notificationMessage: message }),
            setPwaUpdateAvailable: (available) => set({ pwaUpdateAvailable: available }),

            // Filter Actions
            setSearchQuery: (query) =>
                set((state) => {
                    const newFilters = { ...state.filters, searchQuery: query };
                    return {
                        filters: newFilters,
                        filteredProducts: applyFiltersWithMatches(state.products, newFilters, state.favorites, state.filterMode),
                        ui: { ...state.ui, currentPage: 1 }
                    };
                }),

            setSelectedBrand: (brand) =>
                set((state) => {
                    const newFilters = { ...state.filters, selectedBrand: brand };
                    return {
                        filters: newFilters,
                        filteredProducts: applyFiltersWithMatches(state.products, newFilters, state.favorites, state.filterMode),
                        ui: { ...state.ui, currentPage: 1 }
                    };
                }),

            setSelectedModel: (model) =>
                set((state) => {
                    const newFilters = { ...state.filters, selectedModel: model };
                    return {
                        filters: newFilters,
                        filteredProducts: applyFiltersWithMatches(state.products, newFilters, state.favorites, state.filterMode),
                        ui: { ...state.ui, currentPage: 1 }
                    };
                }),

            setSelectedYear: (year) =>
                set((state) => {
                    const newFilters = { ...state.filters, selectedYear: year };
                    return {
                        filters: newFilters,
                        filteredProducts: applyFiltersWithMatches(state.products, newFilters, state.favorites, state.filterMode),
                        ui: { ...state.ui, currentPage: 1 }
                    };
                }),

            togglePosition: (position) =>
                set((state) => {
                    const currentPositions = state.filters.selectedPositions || [];
                    const isSelected = currentPositions.includes(position);
                    const newPositions = isSelected
                        ? currentPositions.filter(p => p !== position)
                        : [...currentPositions, position];
                    const newFilters = { ...state.filters, selectedPositions: newPositions };
                    return {
                        filters: newFilters,
                        filteredProducts: applyFiltersWithMatches(state.products, newFilters, state.favorites, state.filterMode),
                        ui: { ...state.ui, currentPage: 1 }
                    };
                }),

            setOemReference: (ref) =>
                set((state) => {
                    const newFilters = { ...state.filters, oemReference: ref };
                    return {
                        filters: newFilters,
                        filteredProducts: applyFiltersWithMatches(state.products, newFilters, state.favorites, state.filterMode),
                        ui: { ...state.ui, currentPage: 1 }
                    };
                }),

            setFmsiReference: (ref) =>
                set((state) => {
                    const newFilters = { ...state.filters, fmsiReference: ref };
                    return {
                        filters: newFilters,
                        filteredProducts: applyFiltersWithMatches(state.products, newFilters, state.favorites, state.filterMode),
                        ui: { ...state.ui, currentPage: 1 }
                    };
                }),

            setWidth: (width) =>
                set((state) => {
                    const newFilters = { ...state.filters, width };
                    return {
                        filters: newFilters,
                        filteredProducts: applyFiltersWithMatches(state.products, newFilters, state.favorites, state.filterMode),
                        ui: { ...state.ui, currentPage: 1 }
                    };
                }),

            setHeight: (height) =>
                set((state) => {
                    const newFilters = { ...state.filters, height };
                    return {
                        filters: newFilters,
                        filteredProducts: applyFiltersWithMatches(state.products, newFilters, state.favorites, state.filterMode),
                        ui: { ...state.ui, currentPage: 1 }
                    };
                }),

            // ✅ NEW: AND/OR filter mode toggle
            setFilterMode: (mode) =>
                set((state) => ({
                    filterMode: mode,
                    filteredProducts: applyFiltersWithMatches(state.products, state.filters, state.favorites, mode),
                    ui: { ...state.ui, currentPage: 1 }
                })),

            toggleShowFavoritesOnly: () =>
                set((state) => {
                    const isActive = !state.filters.showFavoritesOnly;
                    const newFilters = {
                        ...state.filters,
                        showFavoritesOnly: isActive,
                        showNewOnly: isActive ? false : state.filters.showNewOnly
                    };
                    return {
                        filters: newFilters,
                        filteredProducts: applyFiltersWithMatches(state.products, newFilters, state.favorites, state.filterMode),
                        ui: { ...state.ui, currentPage: 1 }
                    };
                }),

            toggleShowNewOnly: () =>
                set((state) => {
                    const isActive = !state.filters.showNewOnly;
                    const newFilters = {
                        ...state.filters,
                        showNewOnly: isActive,
                        showFavoritesOnly: isActive ? false : state.filters.showFavoritesOnly
                    };

                    return {
                        filters: newFilters,
                        filteredProducts: applyFiltersWithMatches(state.products, newFilters, state.favorites, state.filterMode),
                        ui: { ...state.ui, currentPage: 1 }
                    };
                }),

            toggleBrandTag: (tagId) =>
                set((state) => {
                    const currentTags = state.filters.selectedBrandTags || [];
                    const newTags = currentTags.includes(tagId)
                        ? currentTags.filter(t => t !== tagId)
                        : [...currentTags, tagId];

                    const newFilters = { ...state.filters, selectedBrandTags: newTags };
                    return {
                        filters: newFilters,
                        filteredProducts: applyFiltersWithMatches(state.products, newFilters, state.favorites, state.filterMode),
                        ui: { ...state.ui, currentPage: 1 }
                    };
                }),

            clearFilters: () =>
                set((state) => ({
                    filters: initialFilters,
                    filteredProducts: applyFiltersWithMatches(state.products, initialFilters, state.favorites, state.filterMode),
                    ui: { ...state.ui, currentPage: 1 },
                })),

            // Collection Actions
            toggleFavorite: (id) => {
                const state = get();
                const isAdding = !state.favorites.includes(id);

                set((state) => {
                    const favorites = state.favorites.includes(id)
                        ? state.favorites.filter((fav) => fav !== id)
                        : [...state.favorites, id];

                    // Mutual Exclusivity Removed per user request
                    const comparisons = state.comparisons;

                    // If we're filtering by favorites, we need to re-apply the filter
                    const filteredProducts = state.filters.showFavoritesOnly
                        ? applyFiltersWithMatches(state.products, state.filters, favorites, state.filterMode)
                        : state.filteredProducts;

                    return { favorites, filteredProducts, comparisons };
                });

                // Trigger Notification
                const product = get().products.find(p => p.id === id);
                const ref = product ? (product.referencia || product.ref?.[0] || id) : id;

                get().addNotification({
                    type: isAdding ? 'success' : 'system',
                    title: isAdding ? 'Favorito Agregado' : 'Favorito Eliminado',
                    message: isAdding
                        ? `Se ha añadido la referencia ${ref} a favoritos.`
                        : `Se ha eliminado la referencia ${ref} de favoritos.`
                });
            },

            toggleComparison: (id) => {
                const state = get();
                const isAdding = !state.comparisons.includes(id);

                let comparisons = state.comparisons;
                if (isAdding) {
                    if (state.comparisons.length < 4) {
                        comparisons = [...state.comparisons, id];
                    } else {
                        // Max reached, notify and return early (don't add)
                        get().addNotification({
                            type: 'system',
                            title: 'Límite de comparación',
                            message: 'Máximo 4 productos para comparar',
                        });
                        return;
                    }
                } else {
                    comparisons = state.comparisons.filter((comp) => comp !== id);
                }

                set((currentState) => {
                    // Mutual Exclusivity Removed per user request
                    const favorites = currentState.favorites;

                    // Re-apply filters if necessary
                    const filteredProducts = currentState.filters.showFavoritesOnly
                        ? applyFiltersWithMatches(currentState.products, currentState.filters, favorites, currentState.filterMode)
                        : currentState.filteredProducts;

                    return { comparisons, favorites, filteredProducts };
                });
            },

            addToSearchHistory: (entry) =>
                set((state) => {
                    const newEntry: SearchHistory = {
                        ...entry,
                        id: Date.now().toString(),
                    };
                    // Keep only last 10 searches
                    const history = [newEntry, ...state.searchHistory].slice(0, 10);
                    return { searchHistory: history };
                }),

            clearSearchHistory: () => set({ searchHistory: [] }),

            // Theme Actions
            setTheme: (theme) => {
                set({ theme });
                // Apply theme to document
                document.documentElement.setAttribute('data-theme', theme);
            },

            setAccentColor: (color) => set({ accentColor: color }),

            // UI Actions
            setCurrentPage: (page) =>
                set((state) => ({
                    ui: { ...state.ui, currentPage: page },
                })),

            setItemsPerPage: (itemsPerPage) =>
                set((state) => ({
                    ui: { ...state.ui, itemsPerPage, currentPage: 1 },
                })),

            setGridDensity: (gridDensity) =>
                set((state) => ({
                    ui: { ...state.ui, gridDensity },
                })),



            openHistoryPanel: () =>
                set((state) => ({
                    ui: { ...state.ui, isHistoryPanelOpen: true },
                })),

            closeHistoryPanel: () =>
                set((state) => ({
                    ui: { ...state.ui, isHistoryPanelOpen: false },
                })),

            openProductDetailModal: (productId) =>
                set((state) => ({
                    ui: {
                        ...state.ui,
                        isProductDetailModalOpen: true,
                        selectedProductId: productId,
                    },
                })),

            closeProductDetailModal: () =>
                set((state) => ({
                    ui: {
                        ...state.ui,
                        isProductDetailModalOpen: false,
                        selectedProductId: null,
                    },
                })),

            openGuideModal: () =>
                set((state) => ({
                    ui: { ...state.ui, isGuideModalOpen: true },
                })),

            closeGuideModal: () =>
                set((state) => ({
                    ui: { ...state.ui, isGuideModalOpen: false },
                })),

            openReportModal: () =>
                set((state) => ({
                    ui: { ...state.ui, isReportModalOpen: true },
                })),

            closeReportModal: () =>
                set((state) => ({
                    ui: { ...state.ui, isReportModalOpen: false },
                })),

            openSuggestAppModal: () =>
                set((state) => ({
                    ui: { ...state.ui, isSuggestAppModalOpen: true },
                })),

            closeSuggestAppModal: () =>
                set((state) => ({
                    ui: { ...state.ui, isSuggestAppModalOpen: false },
                })),

            addNotification: (notification) =>
                set((state) => {
                    const newNotification = {
                        ...notification,
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        timestamp: Date.now(),
                        read: false,
                    };
                    // Keep only last 50 notifications
                    const notifications = [newNotification, ...state.ui.notifications].slice(0, 50);

                    // Map Notification Type to Toast Type
                    let toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
                    if (notification.type === 'success') toastType = 'success';
                    if (notification.type === 'error') toastType = 'error';
                    // 'system', 'data', 'update' default to 'info'

                    return {
                        ui: {
                            ...state.ui,
                            notifications,
                        },
                        toast: {
                            id: newNotification.id,
                            title: newNotification.title,
                            message: newNotification.message,
                            type: toastType
                        }
                    };
                }),

            removeNotification: (id) =>
                set((state) => ({
                    ui: {
                        ...state.ui,
                        notifications: state.ui.notifications.filter((n) => n.id !== id),
                    },
                })),

            markAsRead: (id) =>
                set((state) => ({
                    ui: {
                        ...state.ui,
                        notifications: state.ui.notifications.map((n) =>
                            n.id === id ? { ...n, read: true } : n
                        ),
                    },
                })),

            markAllAsRead: () =>
                set((state) => ({
                    ui: {
                        ...state.ui,
                        notifications: state.ui.notifications.map((n) => ({ ...n, read: true })),
                    },
                })),

            clearAllNotifications: () =>
                set((state) => ({
                    ui: {
                        ...state.ui,
                        notifications: [],
                    },
                })),
        }),
        {
            name: 'brake-x-storage',
            partialize: (state) => ({
                favorites: state.favorites,
                comparisons: state.comparisons,
                searchHistory: state.searchHistory,
                theme: state.theme,
                filterMode: state.filterMode,
                ui: state.ui,
            }),
        }
    )
);
