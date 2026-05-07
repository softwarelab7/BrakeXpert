import '../../styles/skeleton.css';
import '../../styles/product-card.css';

/**
 * Skeleton that mirrors the real card structure exactly,
 * including the image-as-hero layout.
 */
const ProductCardSkeleton = () => (
    <div className="product-card" style={{ pointerEvents: 'none', border: '1px solid var(--border-primary)', animation: 'none', opacity: 1 }}>
        {/* Header */}
        <div className="card-header">
            <div className="skeleton" style={{ width: '64px', height: '22px', borderRadius: '0.4rem' }} />
            <div className="action-icons">
                <div className="skeleton" style={{ width: '30px', height: '30px', borderRadius: '7px' }} />
                <div className="skeleton" style={{ width: '30px', height: '30px', borderRadius: '7px' }} />
            </div>
        </div>

        {/* Image hero area */}
        <div className="image-container" style={{ padding: 0 }}>
            <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 0 }} />
        </div>

        {/* References */}
        <div className="ref-section" style={{ gap: '0.35rem' }}>
            <div className="skeleton" style={{ width: '58px',  height: '20px', borderRadius: '0.35rem' }} />
            <div className="skeleton" style={{ width: '72px',  height: '20px', borderRadius: '0.35rem' }} />
            <div className="skeleton" style={{ width: '46px',  height: '20px', borderRadius: '0.35rem' }} />
            <div className="skeleton" style={{ width: '62px',  height: '20px', borderRadius: '0.35rem' }} />
        </div>

        {/* Footer */}
        <div className="card-bottom">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
                <div className="skeleton" style={{ width: '85%', height: '12px', borderRadius: '4px' }} />
                <div className="skeleton" style={{ width: '50%', height: '12px', borderRadius: '4px' }} />
            </div>
        </div>
    </div>
);

export default ProductCardSkeleton;
