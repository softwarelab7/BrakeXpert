export interface Product {
  id: string;
  referencia: string;
  ref: string[];
  oem: string[];
  fmsi: string[];
  fabricante: string;
  posicion?: 'DELANTERA' | 'TRASERA' | 'AMBAS'; // Optional now
  imagenes: string[];
  aplicaciones: VehicleApplication[];
  wva?: string;
  intercambios?: string[];
  medidas: {
    ancho: number | string;
    alto: number | string;
  };
  createdAt?: number; // Timestamp for "New" badge
}

export interface VehicleApplication {
  marca: string;
  modelo: string;
  serie?: string;
  año: string;
  motor?: string; // Engine liters/info
  posicion: 'DELANTERA' | 'TRASERA' | 'AMBAS'; // Mandatory here
}

// Filter Types
export interface Filters {
  searchQuery: string;
  selectedBrand: string;
  selectedModel: string;
  selectedYear: string;
  selectedPositions: string[];
  selectedBrandTags: string[];
  oemReference: string;
  fmsiReference: string;
  width: string;
  height: string;
  showFavoritesOnly: boolean;
  showNewOnly: boolean;
}

// Theme Types
export type Theme = 'light' | 'dark';

// Search History
export interface SearchHistory {
  id: string;
  timestamp: number;
  filters: Partial<Filters>;
  resultCount: number;
  summary: string;
}

// UI State
export interface UIState {
  currentPage: number;
  itemsPerPage: number;
  gridDensity: 'compact' | 'normal' | 'comfortable';
  isHistoryPanelOpen: boolean;
  isProductDetailModalOpen: boolean;
  isReportModalOpen: boolean;
  isSuggestAppModalOpen: boolean;
  isGuideModalOpen: boolean;
  selectedProductId: string | null;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'update' | 'data' | 'system' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
}
