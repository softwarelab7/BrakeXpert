import { useEffect, useMemo } from 'react';
import { useAppStore } from './store/useAppStore';
import { fetchProducts, isFirebaseConfigured, subscribeToProducts } from './services/firebase';
import Header from './components/layout/Header';

import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

import ResultsBar from './components/products/ResultsBar';
import ProductGrid from './components/products/ProductGrid';
import Pagination from './components/products/Pagination';
import ProductDetailModal from './components/modals/ProductDetailModal';
import FavoritesModal from './components/modals/FavoritesModal';
import CompareModal from './components/modals/CompareModal';
import HistoryModal from './components/modals/HistoryModal';
import { UpdateNotification } from './components/UpdateNotification';
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
  const loadProducts = async () => {
    try {
      if (isFirebaseConfigured) {
        try {
          const data = await fetchProducts();
          setProducts(data);
          setFilteredProducts(data);

          if (data.length === 0) {
            console.warn('Connected to Firebase but no products found.');
          }
        } catch (firebaseError: any) {
          console.error('Error connecting to Firebase:', firebaseError);
          setProducts([]);
          setFilteredProducts([]);
          alert(`Error conectando a Firebase:\n${firebaseError.message}\n\nRevisa si tu base de datos Firestore está creada y si las Reglas de Seguridad permiten lectura (allow read: if true).`);
        }
      } else {
        console.error('Firebase not configured.');
        setProducts([]);
        setFilteredProducts([]);
        alert("Firebase no está configurado. Por favor configura el archivo .env o edita src/services/firebase.ts");
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  /* Comentado para usar suscripción en tiempo real
  useEffect(() => {
    loadProducts();
  }, [setProducts, setFilteredProducts]);
  */

  // Real-time updates subscription
  useEffect(() => {
    console.log('[App] Checking Firebase configuration:', { isFirebaseConfigured });
    if (!isFirebaseConfigured) {
      console.warn('[App] Firebase not configured, falling back to one-time load.');
      loadProducts(); // Fallback for error/no-config msg
      return;
    }

    let isInitialLoad = true;
    console.log('[App] Subscribing to products collection...');

    const unsubscribe = subscribeToProducts((newProducts, changes) => {
      console.log('[App] Received product update from Firebase. Count:', newProducts.length);
      // console.log('[App] Is initial load?', isInitialLoad);

      setProducts(newProducts);
      // Al recibir actualización, si no hay filtros aplicados, actualizamos la lista visible
      setFilteredProducts(newProducts);

      if (!isInitialLoad && changes) {
        const store = useAppStore.getState();

        const added = changes.filter((c: any) => c.type === 'added');
        const modified = changes.filter((c: any) => c.type === 'modified');
        const removed = changes.filter((c: any) => c.type === 'removed');

        added.forEach((c: any) => {
          const data = c.doc.data();
          const pRef = data.referencia || (data.ref && data.ref[0]) || c.doc.id;
          console.log('[App] New notification for added item:', pRef, data);
          store.addNotification({
            type: 'data',
            title: `Referencia Agregada`,
            message: `Se ha añadido la referencia ${pRef} al catálogo.`
          });
        });

        if (modified.length > 0) {
          modified.forEach((c: any) => {
            const data = c.doc.data();
            const pRef = data.referencia || (data.ref && data.ref[0]) || c.doc.id;
            console.log('[App] New notification for modified item:', pRef, data);
            store.addNotification({
              type: 'data',
              title: `Referencia Actualizada`,
              message: `La referencia ${pRef} ha sido modificada con nueva información.`
            });
          });
        }

        if (removed.length > 0) {
          removed.forEach((c: any) => {
            const data = c.doc.data();
            const pRef = data?.referencia || (data?.ref && data?.ref[0]) || c.doc.id;
            console.log('[App] New notification for removed item:', pRef, data);
            store.addNotification({
              type: 'data',
              title: 'Referencia Eliminada',
              message: `La referencia ${pRef} ha sido retirada.`
            });
          });
        }
      }
      isInitialLoad = false;
    });

    return () => {
      console.log('[App] Unsubscribing from products.');
      unsubscribe();
    };
  }, []);

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




      <UpdateNotification />

      {/* Modals */}
      <ProductDetailModal />
      <FavoritesModal />
      <CompareModal />
      <HistoryModal />
    </div>
  );
}

export default App;
