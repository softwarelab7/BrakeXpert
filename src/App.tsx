import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { fetchProducts, isFirebaseConfigured, subscribeToProducts, seedDatabase } from './services/firebase';
import useUrlSync from './hooks/useUrlSync';
import Header from './components/layout/Header';

import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

import ResultsBar from './components/products/ResultsBar';
import ProductGrid from './components/products/ProductGrid';
import Pagination from './components/products/Pagination';
import ProductDetailModal from './components/modals/ProductDetailModal';
import HistoryPanel from './components/HistoryPanel';
import GuideModal from './components/modals/GuideModal';
import NotificationPanel from './components/NotificationPanel';
import AdminPanel from './components/admin/AdminPanel';
import ComparePage from './components/pages/ComparePage';
import ReloadPrompt from './components/ReloadPrompt';
import ScrollToTop from './components/common/ScrollToTop';
import Toast from './components/common/Toast';
import ReportModal from './components/common/ReportModal';
import SuggestAppModal from './components/modals/SuggestAppModal';
import BrandTagsBar from './components/products/BrandTagsBar';
import './styles/global.css';
import './styles/app.css';

function App() {
  useUrlSync(); // Activate URL Sync
  const [view, setView] = useState(window.location.hash || '#search');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleHashChange = () => setView(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);

    // Enforce default Accent Color (Blue) due to removal of color picker
    // document.documentElement.setAttribute('data-theme', 'dark'); // Removed enforcement to allow toggle
    document.documentElement.style.setProperty('--accent-primary', '#3b82f6');
    document.documentElement.style.setProperty('--accent-primary-dim', '#3b82f680');

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const filteredProducts = useAppStore(state => state.filteredProducts);
  const allProducts = useAppStore(state => state.products); // Get all products checking
  const ui = useAppStore(state => state.ui);
  const setProducts = useAppStore(state => state.setProducts);
  const clearFilters = useAppStore(state => state.clearFilters);
  const setCurrentPage = useAppStore(state => state.setCurrentPage);
  const closeReportModal = useAppStore(state => state.closeReportModal);

  // Load products on mount
  const loadProducts = useMemo(() => async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured) {
        try {
          const data = await fetchProducts();
          setProducts(data);
        } catch (firebaseError: unknown) {
          console.error('Error connecting to Firebase:', firebaseError);
          setProducts([]);
          const message = firebaseError instanceof Error ? firebaseError.message : 'Error desconocido';
          alert(`Error conectando a Firebase:\n${message}\n\nRevisa si tu base de datos Firestore está creada y si las Reglas de Seguridad permiten lectura (allow read: if true).`);
        }
      } else {
        console.error('Firebase not configured.');
        setProducts([]);
        alert("Firebase no está configurado. Por favor configura el archivo .env o edita src/services/firebase.ts");
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setProducts]);

  // Real-time updates subscription
  useEffect(() => {
    if (!isFirebaseConfigured) {
      loadProducts();
      return;
    }

    let isInitialLoad = true;
    const unsubscribe = subscribeToProducts((newProducts, changes) => {
      setProducts(newProducts);
      if (isInitialLoad) {
        setIsLoading(false);
      }

      if (!isInitialLoad && changes) {
        const store = useAppStore.getState();

        changes.forEach((change) => {
          const data = change.doc.data();
          const pRef = data.referencia || (data.ref && data.ref[0]) || change.doc.id;

          if (change.type === 'added') {
            store.addNotification({
              type: 'data',
              title: `Referencia Agregada`,
              message: `Se ha añadido la referencia ${pRef} al catálogo.`
            });
          } else if (change.type === 'modified') {
            store.addNotification({
              type: 'data',
              title: `Referencia Actualizada`,
              message: `La referencia ${pRef} ha sido modificada.`
            });
          } else if (change.type === 'removed') {
            store.addNotification({
              type: 'data',
              title: 'Referencia Eliminada',
              message: `La referencia ${pRef} ha sido retirada.`
            });
          }
        });
      }
      isInitialLoad = false;
    });

    return () => unsubscribe();
  }, [loadProducts, setProducts]);

  // Handle Database Seeding
  const handleSeedDatabase = async () => {
    if (confirm('¿Estás seguro de que quieres cargar datos de prueba? Esto escribirá en tu base de datos Firebase.')) {
      setIsLoading(true);
      try {
        const count = await seedDatabase();
        alert(`Se cargaron exitosamente ${count} productos.`);
        // Reload triggered by subscription automatically
      } catch (error) {
        console.error('Error seeding database:', error);
        alert('Error cargando datos. Revisa la consola para más detalles.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Pagination
  const { currentPage, itemsPerPage } = ui;
  const totalResults = filteredProducts.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalResults);
  const paginatedProducts = useMemo(() =>
    filteredProducts.slice(startIndex, endIndex),
    [filteredProducts, startIndex, endIndex]
  );

  return (
    <div className="app">
      {/* Simple View Switcher */}
      {view === '#admin' ? (
        <AdminPanel />
      ) : view === '#compare' ? (
        <>
          <Header />
          <main className="results-panel" style={{ width: '100%', maxWidth: '100%' }}>
            <ComparePage />
          </main>
          <Footer />
          <ScrollToTop />
        </>
      ) : (
        <>
          <Header />

          <div className="main-layout">
            <div className="filters-column">
              <Sidebar />
            </div>

            <main className="results-panel">
              <div className="content-wrapper">

                <ResultsBar
                  totalResults={totalResults}
                  currentStart={startIndex + 1}
                  currentEnd={endIndex}
                />

                <BrandTagsBar />

                <ProductGrid
                  products={paginatedProducts}
                  loading={isLoading}
                  onClearFilters={clearFilters}
                  hasProducts={allProducts.length > 0}
                  onSeedDatabase={handleSeedDatabase}
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

          <ScrollToTop />
          <NotificationPanel />
          <Toast />
          <ReloadPrompt />

          {/* Modals */}
          <ProductDetailModal />
          <HistoryPanel />
          <GuideModal />
          <ReportModal
            isOpen={ui.isReportModalOpen}
            onClose={closeReportModal}
            referenceId={ui.selectedProductId}
          />
          <SuggestAppModal />
        </>
      )}
    </div>
  );
}

export default App;
