import { useEffect, useMemo } from 'react';
import { useAppStore } from './store/useAppStore';
import { getMockProducts } from './services/firebase';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import FloatingButtons from './components/layout/FloatingButtons';
import ResultsBar from './components/products/ResultsBar';
import ProductGrid from './components/products/ProductGrid';
import Pagination from './components/products/Pagination';
import ProductDetailModal from './components/modals/ProductDetailModal';
import FavoritesModal from './components/modals/FavoritesModal';
import CompareModal from './components/modals/CompareModal';
import HistoryModal from './components/modals/HistoryModal';
import './styles/global.css';
import './styles/app.css';

function App() {
  const {
    products,
    setProducts,
    setFilteredProducts,
    filters,
    ui,
    clearFilters,
    setCurrentPage,
  } = useAppStore();

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // For now, use mock data. Replace with fetchProducts() when Firebase is configured
        const mockProducts = getMockProducts();
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadProducts();
  }, [setProducts, setFilteredProducts]);

  // Filter products based on filters
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.filter((product) => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesRef = product.referencia.toLowerCase().includes(query);
        const matchesRefs = product.ref.some((ref) =>
          ref.toLowerCase().includes(query)
        );
        const matchesOem = product.oem.some((oem) =>
          oem.toLowerCase().includes(query)
        );
        const matchesFmsi = product.fmsi.some((fmsi) =>
          fmsi.toLowerCase().includes(query)
        );

        if (!matchesRef && !matchesRefs && !matchesOem && !matchesFmsi) {
          return false;
        }
      }

      // Position filter
      if (filters.selectedPosition) {
        const position = filters.selectedPosition.toUpperCase();
        if (product.posicion !== position && product.posicion !== 'AMBAS') {
          return false;
        }
      }

      // Brand tags filter
      if (filters.selectedBrandTags.length > 0) {
        const hasMatchingBrand = product.aplicaciones.some((app) =>
          filters.selectedBrandTags.some(
            (tag) => tag.toLowerCase() === app.marca.toLowerCase()
          )
        );
        if (!hasMatchingBrand) return false;
      }

      // OEM reference filter
      if (filters.oemReference) {
        const matchesOem = product.oem.some((oem) =>
          oem.toLowerCase().includes(filters.oemReference.toLowerCase())
        );
        if (!matchesOem) return false;
      }

      // FMSI reference filter
      if (filters.fmsiReference) {
        const matchesFmsi = product.fmsi.some((fmsi) =>
          fmsi.toLowerCase().includes(filters.fmsiReference.toLowerCase())
        );
        if (!matchesFmsi) return false;
      }

      // Width filter
      if (filters.width) {
        const width = parseFloat(filters.width);
        if (product.medidas.ancho !== width) return false;
      }

      // Height filter
      if (filters.height) {
        const height = parseFloat(filters.height);
        if (product.medidas.alto !== height) return false;
      }

      return true;
    });
  }, [products, filters]);

  // Update filtered products when filters change
  useEffect(() => {
    setFilteredProducts(filteredProducts);
  }, [filteredProducts, setFilteredProducts]);

  // Pagination
  const currentPage = ui.currentPage;
  const itemsPerPage = ui.itemsPerPage;
  const totalResults = filteredProducts.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalResults);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="app">
      <Header />

      <div className="main-layout">
        <Sidebar />

        <main className="main-content">
          <div className="content-wrapper">
            <ResultsBar
              totalResults={totalResults}
              currentStart={startIndex + 1}
              currentEnd={endIndex}
            />

            <ProductGrid
              products={paginatedProducts}
              onClearFilters={clearFilters}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </main>
      </div>

      <Footer />
      <FloatingButtons />

      {/* Modals */}
      <ProductDetailModal />
      <FavoritesModal />
      <CompareModal />
      <HistoryModal />
    </div>
  );
}

export default App;
