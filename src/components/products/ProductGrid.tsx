import { PackageOpen } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '../../types';
import '../../styles/product-grid.css';

interface ProductGridProps {
    products: Product[];
    onClearFilters?: () => void;
}

const ProductGrid = ({ products, onClearFilters }: ProductGridProps) => {
    if (products.length === 0) {
        return (
            <div className="product-grid">
                <div className="grid-empty">
                    <PackageOpen className="empty-icon" />
                    <h3 className="empty-title">No se encontraron productos</h3>
                    <p className="empty-message">
                        Intenta ajustar los filtros para ver más resultados
                    </p>
                    {onClearFilters && (
                        <button className="empty-action" onClick={onClearFilters}>
                            Borrar todos los filtros
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="product-grid">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductGrid;
