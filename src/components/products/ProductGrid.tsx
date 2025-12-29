import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import EmptyState from '../common/EmptyState';
import type { Product } from '../../types';
import '../../styles/product-grid.css';

interface ProductGridProps {
    products: Product[];
    loading?: boolean;
    onClearFilters?: () => void;
}

const ProductGrid = ({ products, loading = false, onClearFilters }: ProductGridProps) => {

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

    // Empty State
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
