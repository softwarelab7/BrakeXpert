import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import EmptyState from '../common/EmptyState';
import type { Product } from '../../types';
import '../../styles/product-grid.css';
import { Database } from 'lucide-react';

interface ProductGridProps {
    products: Product[];
    loading?: boolean;
    onClearFilters?: () => void;
    hasProducts?: boolean;
    onSeedDatabase?: () => void;
}

const ProductGrid = ({
    products,
    loading = false,
    onClearFilters,
    hasProducts = true,
    onSeedDatabase
}: ProductGridProps) => {

    // Loading State
    if (loading) {
        return (
            <div className="results-wrapper">
                {Array.from({ length: 8 }).map((_, index) => (
                    <ProductCardSkeleton key={`skeleton-${index}`} />
                ))}
            </div>
        );
    }

    // Empty Database State
    if (!hasProducts && onSeedDatabase) {
        return (
            <div className="results-wrapper" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                        color: '#3b82f6'
                    }}>
                        <Database size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                        Base de Datos Vacía
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                        No se encontraron productos en la base de datos. Puedes cargar un conjunto de datos de prueba para comenzar a utilizar la aplicación.
                    </p>
                    <button
                        onClick={onSeedDatabase}
                        style={{
                            background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex',
                            alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
                        }}
                    >
                        <Database size={18} />
                        Cargar Datos de Prueba
                    </button>
                </div>
            </div>
        );
    }

    // Empty Filtered State
    if (products.length === 0) {
        return (
            <div className="results-wrapper">
                <EmptyState onAction={onClearFilters} />
            </div>
        );
    }

    // Results State
    return (
        <div className="results-wrapper">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductGrid;
