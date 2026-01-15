import React from 'react';
import { ArrowRightLeft, ImageOff, Bookmark } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Product } from '../../types';
import '../../styles/product-card.css';

import StyledIconButton from '../common/StyledIconButton';

interface ProductCardProps {
    product: Product;
}

const ProductCard = React.memo(({ product }: ProductCardProps) => {
    const favorites = useAppStore(state => state.favorites);
    const comparisons = useAppStore(state => state.comparisons);

    const isFavorite = favorites.includes(product.id);
    const isInComparison = comparisons.includes(product.id);

    const toggleFavorite = useAppStore(state => state.toggleFavorite);
    const toggleComparison = useAppStore(state => state.toggleComparison);
    const openProductDetailModal = useAppStore(state => state.openProductDetailModal);

    const formatApplications = () => {
        if (!product.aplicaciones || product.aplicaciones.length === 0) return 'Sin aplicaciones';

        const first = product.aplicaciones[0];
        const remaining = product.aplicaciones.length - 1;

        const brand = first.marca || '';
        const model = first.modelo && first.modelo !== 'undefined' ? first.modelo : '';

        let text = `${brand} ${model}`.trim();

        if (!text) {
            text = first.año ? `Año: ${first.año}` : 'Sin detalles';
        }

        if (remaining > 0) {
            text += `, +${remaining} más`;
        }

        return text;
    };

    // Determine actual position - check applications for both positions
    const getActualPosition = () => {
        // Priority 1: Check root position explicit value
        if (product.posicion) {
            const rootPos = product.posicion.toUpperCase();
            if (rootPos === 'AMBAS') {
                return { display: 'DL-TR', className: 'badge-ambas' };
            }
            if (rootPos === 'TRASERA') {
                return { display: 'TRASERA', className: 'badge-trasera' };
            }
            if (rootPos === 'DELANTERA') {
                return { display: 'DELANTERA', className: '' };
            }
        }

        // Priority 2: Derive from applications (fallback)
        const positions = new Set<string>();

        // Check root position for non-standard values or if we want to include it in the set for fallback logic
        if (product.posicion) {
            positions.add(product.posicion.toUpperCase());
        }

        // Check all applications
        if (Array.isArray(product.aplicaciones)) {
            product.aplicaciones.forEach(app => {
                if (app && app.posicion) {
                    const appPos = app.posicion.toUpperCase();
                    if (appPos === 'AMBAS') {
                        positions.add('DELANTERA');
                        positions.add('TRASERA');
                    } else {
                        positions.add(appPos);
                    }
                }
            });
        }

        // If has both positions, show DL-TR
        if (positions.has('DELANTERA') && positions.has('TRASERA')) {
            return { display: 'DL-TR', className: 'badge-ambas' };
        }

        // Otherwise show the single position
        if (positions.has('TRASERA')) {
            return { display: 'TRASERA', className: 'badge-trasera' };
        }

        if (positions.has('DELANTERA')) {
            return { display: 'DELANTERA', className: '' };
        }

        // Fallback
        return { display: product.posicion || 'N/A', className: '' };
    };

    const positionInfo = getActualPosition();

    const getBadgeClass = (ref: string) => {
        if (!ref) return '';
        const r = ref.toUpperCase();
        if (r.endsWith('BP')) return 'ref-badge-gray';
        if (r.startsWith('K')) return 'ref-badge-red';
        if (r.endsWith('BEX')) return 'ref-badge-lightblue';
        if (r.startsWith('SP')) {
            // console.log('Mint Badge Triggered for:', ref);
            return 'ref-badge-mint';
        }
        return ''; // Default Blue
    };

    const getHoverClass = () => {
        if (positionInfo.display === 'DL-TR') return 'hover-ambas';
        if (positionInfo.display === 'DELANTERA') return 'hover-delantera';
        if (positionInfo.display === 'TRASERA') return 'hover-trasera';
        return '';
    };

    return (
        <div className={`product-card ${getHoverClass()}`} onClick={() => openProductDetailModal(product.id)}>
            {/* Header: Position and Actions */}
            <div className="card-header">
                <span className={`position-badge ${positionInfo.className}`}>
                    {positionInfo.display}
                </span>
                <div className="action-icons" onClick={(e) => e.stopPropagation()}>
                    <StyledIconButton
                        icon={<ArrowRightLeft />}
                        tooltip={isInComparison ? "Quitar de comparar" : "Comparar"}
                        onClick={() => toggleComparison(product.id)}
                        isActive={isInComparison}
                        activeColor="#9333ea"
                        size="small"
                    />
                    <StyledIconButton
                        icon={<Bookmark fill={isFavorite ? "currentColor" : "none"} />}
                        tooltip={isFavorite ? "Quitar de favoritos" : "Guardar favorito"}
                        onClick={() => toggleFavorite(product.id)}
                        isActive={isFavorite}
                        activeColor="#3b82f6"
                        size="small"
                    />
                </div>
            </div>

            {/* NEW Badge Overlay */}
            {!!product.createdAt && product.createdAt > 0 && (Date.now() - product.createdAt) < (15 * 24 * 60 * 60 * 1000) && (
                <div className="new-badge-overlay">NUEVO</div>
            )}

            {/* Image */}
            <div className="image-container">
                {product.imagenes && product.imagenes.length > 0 ? (
                    <img
                        src={product.imagenes[0]}
                        alt={product.referencia}
                        className="product-image"
                        loading="lazy"
                    />
                ) : (
                    <div className="no-image-placeholder">
                        <ImageOff size={32} strokeWidth={1.5} />
                        <span>Sin Imagen</span>
                    </div>
                )}
            </div>

            {/* References */}
            <div className="ref-section">
                {(product.referencia ? [product.referencia] : (product.ref || []))
                    .flatMap(r => r.split(' ')) // Split space-separated strings
                    .filter(Boolean) // Remove empty strings
                    .map((reference, idx) => (
                        <span
                            key={`${reference}-${idx}`}
                            className={`ref-badge ${getBadgeClass(reference)}`}
                        >
                            {reference}
                        </span>
                    ))}
            </div>

            {/* Application Detail */}
            <div className="card-bottom">
                <p className="applications">{formatApplications()}</p>
            </div>
        </div>
    );
});

export default ProductCard;
