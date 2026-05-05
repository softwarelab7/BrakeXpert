import { useAppStore } from '../../store/useAppStore';
import '../../styles/brand-tags.css';

// Brand Color Mapping
const TAG_COLORS: Record<string, string> = {
    'Incolbest': '#3b82f6', // Incolbest
    'Bex USA': '#0a3cff',   // Bex (Royal Blue)
    'KTC': '#ef4444',       // KTC (Red)
    'Brake Pak': '#64748b', // Brake Pak (Gray)
    'Hi-Q': '#10b981',      // Hi-Q (Mint)
    // Fallback for ID-based tags if they come through as IDs
    'INC': '#3b82f6',
    'BEX': '#0a3cff',
    'K': '#ef4444',
    'BP': '#64748b',
    'SP': '#10b981',
};

// Fallback color
const DEFAULT_COLOR = '#3b82f6';

const BRAND_TAGS = [
    { id: 'INC', label: 'Incolbest' },
    { id: 'BEX', label: 'Bex USA' },
    { id: 'K', label: 'KTC' },
    { id: 'BP', label: 'Brake Pak' },
    { id: 'SP', label: 'Hi-Q' },
];

const BrandTagsBar = () => {
    // Use individual selectors to prevent "getSnapshot" infinite loops with object references
    const filters = useAppStore(state => state.filters);
    const filteredProducts = useAppStore(state => state.filteredProducts);

    const { selectedBrandTags } = filters;

    // Logic to hide/show bar
    const hasSearch = filters.searchQuery.trim().length > 0;
    const hasBrandFilter = !!filters.selectedBrand;

    // Memoize the filtering to avoid expensive recalculations on every render
    const availableTags = BRAND_TAGS.filter(tag => {
        // Keep selected ones visible
        if (selectedBrandTags.includes(tag.id)) return true;

        // Check if any product matches
        return filteredProducts.some(product => {
            const rawRefs = [
                product.referencia,
                product.wva,
                ...(product.ref || []),
                ...(product.intercambios || []),
                ...(product.oem || []),
                ...(product.fmsi || [])
            ].filter(Boolean) as string[];

            const allRefs = rawRefs.flatMap(r => r.split(/[\s,/-]+/)).filter(r => r.length > 2);
            const fabricante = (product.fabricante || '').toUpperCase();

            // Match logic
            if (tag.id === 'INC') return allRefs.some(r => r.trim().toUpperCase().endsWith('INC')) || fabricante.includes('INCOLBEST');
            if (tag.id === 'BEX') return allRefs.some(r => r.trim().toUpperCase().endsWith('BEX')) || fabricante.includes('BEX');
            if (tag.id === 'K') return allRefs.some(r => r.trim().toUpperCase().startsWith('K')) || fabricante.includes('KTC');
            if (tag.id === 'BP') return allRefs.some(r => r.trim().toUpperCase().endsWith('BP')) || fabricante.includes('BRAKE PAK') || fabricante.includes('BRAKEPAK');
            if (tag.id === 'SP') return allRefs.some(r => r.trim().toUpperCase().startsWith('SP'));

            return false;
        });
    });

    // Only show if we actually have context AND tags available
    const shouldShow = (hasSearch || hasBrandFilter) && availableTags.length > 0;

    if (!shouldShow) return null;

    return (
        <div className="brand-tags-bar-container">
            <div className="brand-tags-scroll">
                {availableTags.map((tagObj) => {
                    const tagId = tagObj.id;
                    const tagName = tagObj.label;
                    // Try to match color by Name (preferred) or ID
                    const color = TAG_COLORS[tagName] || TAG_COLORS[tagId] || DEFAULT_COLOR;

                    return (
                        <div
                            key={tagId}
                            className="brand-ticket"
                            style={{ '--ticket-color': color } as React.CSSProperties}
                        >
                            {/* CSS Shape Background */}
                            <div className="brand-ticket-bg"></div>

                            {/* White Hole */}
                            <div className="brand-ticket-hole"></div>

                            {/* Label */}
                            <span className="brand-ticket-label">
                                {tagName}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BrandTagsBar;
