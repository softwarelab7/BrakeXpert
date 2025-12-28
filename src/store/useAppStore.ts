import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Filters, Theme, SearchHistory, UIState } from '../types';

interface AppState {
    // Products
    products: Product[];
    filteredProducts: Product[];

    // Filters
    filters: Filters;

    // Collections
    favorites: string[]; // product IDs
    comparisons: string[]; // product IDs (max 4)
    searchHistory: SearchHistory[];

    // UI
    theme: Theme;
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
    setSelectedPosition: (position: 'delantera' | 'trasera' | null) => void;
    toggleBrandTag: (brand: string) => void;
    setOemReference: (ref: string) => void;
    setFmsiReference: (ref: string) => void;
    setWidth: (width: string) => void;
    setHeight: (height: string) => void;
    clearFilters: () => void;

    // Collection Actions
    toggleFavorite: (id: string) => void;
    toggleComparison: (id: string) => void;
    addToSearchHistory: (entry: Omit<SearchHistory, 'id'>) => void;
    clearSearchHistory: () => void;

    // Theme Actions
    setTheme: (theme: Theme) => void;

    // UI Actions
    setCurrentPage: (page: number) => void;
    openCompareModal: () => void;
    closeCompareModal: () => void;
    openFavoritesModal: () => void;
    closeFavoritesModal: () => void;
    openHistoryModal: () => void;
    closeHistoryModal: () => void;
    openProductDetailModal: (productId: string) => void;
    closeProductDetailModal: () => void;
    addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;

    // Notification Panel
    isNotificationPanelOpen: boolean;
    toggleNotificationPanel: () => void;
    closeNotificationPanel: () => void;
    removeNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    clearAllNotifications: () => void;
}

const initialFilters: Filters = {
    searchQuery: '',
    selectedBrand: '',
    selectedModel: '',
    selectedYear: '',
    selectedPosition: null,
    selectedBrandTags: [],
    oemReference: '',
    fmsiReference: '',
    width: '',
    height: '',
};

const initialUIState: UIState = {
    currentPage: 1,
    itemsPerPage: 24,
    isCompareModalOpen: false,
    isFavoritesModalOpen: false,
    isHistoryModalOpen: false,
    isProductDetailModalOpen: false,
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
            favorites: [],
            comparisons: [],
            searchHistory: [],
            theme: 'light',
            ui: initialUIState,
            isNotificationPanelOpen: false,
            toggleNotificationPanel: () => set((state) => ({ isNotificationPanelOpen: !state.isNotificationPanelOpen })),
            closeNotificationPanel: () => set({ isNotificationPanelOpen: false }),

            notificationMessage: null,
            pwaUpdateAvailable: false,

            // Product Actions
            setProducts: (products) => set({ products }),
            setFilteredProducts: (filteredProducts) => set({ filteredProducts }),
            setNotificationMessage: (message) => set({ notificationMessage: message }),
            setPwaUpdateAvailable: (available) => set({ pwaUpdateAvailable: available }),

            // Filter Actions
            setSearchQuery: (query) =>
                set((state) => ({
                    filters: { ...state.filters, searchQuery: query },
                })),

            setSelectedBrand: (brand) =>
                set((state) => ({
                    filters: { ...state.filters, selectedBrand: brand, selectedModel: '', selectedYear: '' },
                })),

            setSelectedModel: (model) =>
                set((state) => ({
                    filters: { ...state.filters, selectedModel: model, selectedYear: '' },
                })),

            setSelectedYear: (year) =>
                set((state) => ({
                    filters: { ...state.filters, selectedYear: year },
                })),

            setSelectedPosition: (position) =>
                set((state) => ({
                    filters: { ...state.filters, selectedPosition: position },
                })),

            toggleBrandTag: (brand) =>
                set((state) => {
                    const tags = state.filters.selectedBrandTags;
                    const newTags = tags.includes(brand)
                        ? tags.filter((b) => b !== brand)
                        : [...tags, brand];
                    return {
                        filters: { ...state.filters, selectedBrandTags: newTags },
                    };
                }),

            setOemReference: (ref) =>
                set((state) => ({
                    filters: { ...state.filters, oemReference: ref },
                })),

            setFmsiReference: (ref) =>
                set((state) => ({
                    filters: { ...state.filters, fmsiReference: ref },
                })),

            setWidth: (width) =>
                set((state) => ({
                    filters: { ...state.filters, width },
                })),

            setHeight: (height) =>
                set((state) => ({
                    filters: { ...state.filters, height },
                })),

            clearFilters: () =>
                set({
                    filters: initialFilters,
                    ui: { ...get().ui, currentPage: 1 },
                }),

            // Collection Actions
            toggleFavorite: (id) =>
                set((state) => {
                    const favorites = state.favorites.includes(id)
                        ? state.favorites.filter((fav) => fav !== id)
                        : [...state.favorites, id];
                    return { favorites };
                }),

            toggleComparison: (id) =>
                set((state) => {
                    const comparisons = state.comparisons.includes(id)
                        ? state.comparisons.filter((comp) => comp !== id)
                        : state.comparisons.length < 4
                            ? [...state.comparisons, id]
                            : state.comparisons;

                    // Show notification if max reached
                    if (state.comparisons.length >= 4 && !state.comparisons.includes(id)) {
                        const notification = {
                            type: 'system' as const,
                            title: 'Límite de comparación',
                            message: 'Máximo 4 productos para comparar',
                        };
                        get().addNotification(notification);
                    }

                    return { comparisons };
                }),

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

            // UI Actions
            setCurrentPage: (page) =>
                set((state) => ({
                    ui: { ...state.ui, currentPage: page },
                })),

            openCompareModal: () =>
                set((state) => ({
                    ui: { ...state.ui, isCompareModalOpen: true },
                })),

            closeCompareModal: () =>
                set((state) => ({
                    ui: { ...state.ui, isCompareModalOpen: false },
                })),

            openFavoritesModal: () =>
                set((state) => ({
                    ui: { ...state.ui, isFavoritesModalOpen: true },
                })),

            closeFavoritesModal: () =>
                set((state) => ({
                    ui: { ...state.ui, isFavoritesModalOpen: false },
                })),

            openHistoryModal: () =>
                set((state) => ({
                    ui: { ...state.ui, isHistoryModalOpen: true },
                })),

            closeHistoryModal: () =>
                set((state) => ({
                    ui: { ...state.ui, isHistoryModalOpen: false },
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
                    return {
                        ui: {
                            ...state.ui,
                            notifications,
                        },
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
                // Do not persist notifications to start fresh, or persist if desired. 
                // Given user request for "system", usually persist is good but maybe not for high volume.
                // Assuming not persisting ui.notifications is safer for now or let it be (it's not listed in partialize).
            }),
        }
    )
);
