import '../../styles/skeleton.css';
import '../../styles/product-card.css';

const ProductCardSkeleton = () => {
    return (
        <div className="product-card" style={{ pointerEvents: 'none', border: '1px solid var(--border-primary)' }}>
            {/* Header */}
            <div className="card-header">
                <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '0.4rem' }} />
                <div className="action-icons">
                    <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                    <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                </div>
            </div>

            {/* Image */}
            <div className="image-container" style={{ padding: '0.5rem' }}>
                <div className="skeleton" style={{ width: '100%', height: '140px', borderRadius: '0.5rem' }} />
            </div>

            {/* References */}
            <div className="ref-section">
                <div className="skeleton" style={{ width: '50px', height: '18px', borderRadius: '0.4rem' }} />
                <div className="skeleton" style={{ width: '70px', height: '18px', borderRadius: '0.4rem' }} />
                <div className="skeleton" style={{ width: '40px', height: '18px', borderRadius: '0.4rem' }} />
            </div>

            {/* Footer */}
            <div className="card-bottom">
                <div className="skeleton" style={{ width: '80%', height: '14px', borderRadius: '4px' }} />
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
