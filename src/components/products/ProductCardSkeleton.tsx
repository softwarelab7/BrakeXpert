import '../../styles/skeleton.css';

const ProductCardSkeleton = () => {
    return (
        <div className="product-card-skeleton">
            {/* Header: Flag & Actions */}
            <div className="skeleton-header">
                <div className="skeleton skeleton-flag" />
                <div className="skeleton-actions">
                    <div className="skeleton skeleton-btn" />
                    <div className="skeleton skeleton-btn" />
                </div>
            </div>

            {/* Main Image Area */}
            <div className="skeleton skeleton-image" />

            {/* Reference Badge */}
            <div className="skeleton skeleton-badge" />

            {/* Footer Text */}
            <div className="skeleton-footer">
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text short" />
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
