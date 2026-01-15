import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import '../../styles/compare-page.css';
import '../../styles/product-card.css'; // Import for badge styles

const ComparePage = () => {
    const comparisons = useAppStore(state => state.comparisons);
    const products = useAppStore(state => state.products);
    const toggleComparison = useAppStore(state => state.toggleComparison);

    const comparisonProducts = products.filter(product => comparisons.includes(product.id));

    const handleBack = () => {
        // Fallback to home if no history
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.hash = '#search';
        }
    };

    const getBadgeClass = (ref: string) => {
        if (!ref) return '';
        const r = ref.toUpperCase();
        if (r.endsWith('BP')) return 'ref-badge-gray';
        if (r.startsWith('K')) return 'ref-badge-red';
        if (r.endsWith('BEX')) return 'ref-badge-lightblue';
        if (r.startsWith('SP')) return 'ref-badge-mint';
        return ''; // Default Blue
    };

    const hasDifferentValues = (getter: (p: typeof products[0]) => string | number | null) => {
        if (comparisonProducts.length < 2) return false;
        const firstVal = getter(comparisonProducts[0]);
        return comparisonProducts.slice(1).some(p => getter(p) !== firstVal);
    };

    return (
        <div className="compare-page-container">
            <div className="compare-header">
                <button onClick={handleBack} className="compare-back-btn">
                    <ArrowLeft size={16} /> Volver
                </button>
                <h1 className="compare-title">Comparativa</h1>
            </div>

            {comparisonProducts.length === 0 ? (
                <div className="grid-empty">
                    <AlertCircle size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Sin productos</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Selecciona productos para comparar.</p>
                </div>
            ) : (
                <div className="compare-table-container">
                    <table className="compare-table">
                        <tbody>
                            {/* Product Header (Always show) */}
                            <tr>
                                <td className="compare-feature-header">Producto</td>
                                {comparisonProducts.map(product => (
                                    <td key={product.id} className="compare-product-col">
                                        <div className="compare-image-container">
                                            {product.imagenes && product.imagenes.length > 0 ? (
                                                <img
                                                    src={product.imagenes[0]}
                                                    alt={product.referencia}
                                                    className="compare-image"
                                                />
                                            ) : (
                                                <div className="no-image-placeholder" style={{ height: '100%', minHeight: '100px' }}>
                                                    <span>Sin Imagen</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* References as Badges */}
                                        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                                            {(product.referencia ? [product.referencia, ...(product.ref || [])] : (product.ref || []))
                                                .flatMap(r => r.split(' '))
                                                .filter(Boolean)
                                                // Deduplicate
                                                .filter((item, index, self) => self.indexOf(item) === index)
                                                .map((reference, idx) => (
                                                    <span
                                                        key={`${product.id}-ref-${idx}`}
                                                        className={`ref-badge ${getBadgeClass(reference)}`}
                                                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                                    >
                                                        {reference}
                                                    </span>
                                                ))}
                                        </div>

                                        <span className="compare-manufacturer">{product.fabricante}</span>
                                        <button
                                            onClick={() => toggleComparison(product.id)}
                                            className="compare-remove-text-btn"
                                        >
                                            Quitar
                                        </button>
                                    </td>
                                ))}
                            </tr>

                            {/* Position */}
                            <tr className={hasDifferentValues(p => p.posicion || '') ? 'compare-row-diff' : ''}>
                                <td className="compare-feature-header">Posición</td>
                                {comparisonProducts.map(product => {
                                    const pos = (product.posicion || '').toLowerCase();
                                    const posClass = pos === 'delantera' ? 'pos-text-delantera' :
                                        pos === 'trasera' ? 'pos-text-trasera' : 'pos-text-ambas';
                                    return (
                                        <td key={product.id} className="compare-product-col">
                                            <span className={`pos-text ${posClass}`}>
                                                {product.posicion || '-'}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* Measurements */}
                            <tr className={hasDifferentValues(p => `${p.medidas.ancho}x${p.medidas.alto}`) ? 'compare-row-diff' : ''}>
                                <td className="compare-feature-header">Medidas</td>
                                {comparisonProducts.map(product => (
                                    <td key={product.id} className="compare-product-col">
                                        <div className="data-value">{product.medidas.ancho} x {product.medidas.alto} mm</div>
                                        <div className="data-sub">Ancho x Alto</div>
                                    </td>
                                ))}
                            </tr>

                            {/* Refs (Check if simple serialized refs are different) */}
                            <tr className={hasDifferentValues(p => p.fmsi.concat(p.oem).sort().join(',')) ? 'compare-row-diff' : ''}>
                                <td className="compare-feature-header">Referencias</td>
                                {comparisonProducts.map(product => (
                                    <td key={product.id} className="compare-product-col">
                                        <div>
                                            {product.fmsi.concat(product.oem).map(ref => (
                                                <span key={ref} className="ref-badge">{ref}</span>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Applications (Check first application usually sufficient for diff) */}
                            <tr className={hasDifferentValues(p => p.aplicaciones.length > 0 ? `${p.aplicaciones[0].marca}${p.aplicaciones[0].modelo}` : '') ? 'compare-row-diff' : ''}>
                                <td className="compare-feature-header">Aplicaciones</td>
                                {comparisonProducts.map(product => (
                                    <td key={product.id} className="compare-product-col">
                                        <ul className="simple-list">
                                            {product.aplicaciones.slice(0, 5).map((app, idx) => (
                                                <li key={idx}>
                                                    <strong>{app.marca}</strong> {app.modelo} {app.año}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ComparePage;
