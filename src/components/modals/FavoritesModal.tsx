import { PackageOpen } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import Modal from './Modal';
import ProductCard from '../products/ProductCard';
import '../../styles/product-grid.css';

const FavoritesModal = () => {
    const { ui, favorites, products, closeFavoritesModal } = useAppStore();

    const favoriteProducts = products.filter(product => favorites.includes(product.id));

    return (
        <Modal
            isOpen={ui.isFavoritesModalOpen}
            onClose={closeFavoritesModal}
            title={`Mis Favoritos (${favorites.length})`}
            size="xl"
        >
            {favoriteProducts.length > 0 ? (
                <div className="product-grid">
                    {favoriteProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="grid-empty">
                    <PackageOpen className="empty-icon" />
                    <h3 className="empty-title">Sin Favoritos</h3>
                    <p className="empty-message">
                        Agrega productos a tus favoritos para verlos aquí.
                    </p>
                </div>
            )}
        </Modal>
    );
};

export default FavoritesModal;
