
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import '../../styles/admin.css';
import { Plus, Search, LogOut, Activity, Database, Edit3, ArrowLeft, AlertTriangle, CheckCircle2, XCircle, History, FileClock, Menu, Cloud, Download, LayoutGrid, Server } from 'lucide-react';
import ProductForm from './ProductForm';
import AdminLogin from './AdminLogin';
import ThemeToggle from '../layout/ThemeToggle';
import type { Product } from '../../types';
import { updateProduct, addProduct, deleteProduct, auth, addHistoryLog, fetchHistoryLogs, type HistoryLog } from '../../services/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import Modal from '../modals/Modal';

class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: (error: any) => React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
    componentDidCatch(error: any, errorInfo: any) { console.error("Form Error Caught Deep:", error, errorInfo); }
    render() {
        if (this.state.hasError) return this.props.fallback(this.state.error);
        return this.props.children;
    }
}

const AdminPanel: React.FC = () => {
    const [user, setUser] = useState<User | null>(auth.currentUser);
    const [activeTab, setActiveTab] = useState<'catalog' | 'new' | 'edit' | 'audit' | 'history' | 'database'>('catalog');
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (activeTab === 'history') {
            setIsLoadingHistory(true);
            fetchHistoryLogs(100).then(logs => {
                setHistoryLogs(logs);
                setIsLoadingHistory(false);
            });
        }
    }, [activeTab]);

    const handleLogout = React.useCallback(async () => {
        await signOut(auth);
        window.location.hash = '#search';
    }, []);

    // Session Timeout (20 minutes)
    useEffect(() => {
        const TIMEOUT_DURATION = 20 * 60 * 1000; // 20 minutes
        let timeoutId: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                handleLogout();
                alert('Sesión cerrada por inactividad (20 min).');
            }, TIMEOUT_DURATION);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        // Initialize
        resetTimer();

        // Listeners for user activity
        const handleActivity = () => resetTimer();

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [handleLogout]);

    const products = useAppStore(state => state.products);

    if (!user) {
        return <AdminLogin onLoginSuccess={() => setActiveTab('catalog')} />;
    }

    const filteredProducts = products.filter(p => {
        const refMatch = p.referencia?.toLowerCase().includes(searchTerm.toLowerCase());
        const otherRefMatch = Array.isArray(p.ref) && p.ref.some(r => String(r).toLowerCase().includes(searchTerm.toLowerCase()));
        return refMatch || otherRefMatch;
    }).slice(0, 20);

    const handleEdit = (product: Product) => {
        console.log("Starting edit for product:", product.id);
        setEditingProduct(product);
        setActiveTab('edit');
    };

    const handleNew = () => {
        setEditingProduct(undefined);
        setActiveTab('new');
    };

    const handleBack = () => {
        setActiveTab('catalog');
        setEditingProduct(undefined);
    };

    const handleDeleteClick = () => {
        if (!editingProduct?.id) return;
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!editingProduct?.id) return;

        setIsSaving(true);
        setShowDeleteConfirm(false); // Close modal immediately
        try {
            await deleteProduct(editingProduct.id);

            // Log History
            await addHistoryLog({
                productId: editingProduct.id,
                productRef: (editingProduct.referencia || editingProduct.ref?.[0] || 'N/A'),
                action: 'DELETE',
                changes: [],
                user: user?.email || 'unknown',
            });

            showNotification('Producto eliminado con éxito', 'success');
            handleBack();
        } catch (error) {
            console.error('Error deleting:', error);
            showNotification('Error al eliminar: ' + (error instanceof Error ? error.message : 'Error desconocido'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async (data: Partial<Product>) => {
        setIsSaving(true);
        try {
            if (activeTab === 'edit' && editingProduct?.id) {
                // Calculate diff
                const changes: { field: string, old: any, new: any }[] = [];
                Object.keys(data).forEach(key => {
                    const k = key as keyof Product;
                    if (JSON.stringify(editingProduct[k]) !== JSON.stringify(data[k])) {
                        changes.push({ field: k, old: editingProduct[k], new: data[k] });
                    }
                });

                await updateProduct(editingProduct.id, data);

                // Log History
                await addHistoryLog({
                    productId: editingProduct.id,
                    productRef: (data.ref?.[0] || data.referencia || editingProduct.referencia),
                    action: 'UPDATE',
                    changes,
                    user: user?.email || 'unknown',
                });

                showNotification('¡Producto actualizado con éxito!');
            } else {
                const newId = await addProduct(data);

                // Log History
                await addHistoryLog({
                    productId: newId,
                    productRef: (data.ref?.[0] || data.referencia || 'N/A'),
                    action: 'CREATE',
                    changes: [],
                    user: user?.email || 'unknown',
                });

                showNotification('¡Nuevo producto agregado con éxito!');
            }
            setTimeout(handleBack, 800);
        } catch (error) {
            console.error('Error saving:', error);
            showNotification('Error: ' + (error instanceof Error ? error.message : 'Error desconocido'), 'error');
        } finally {
            setIsSaving(false);
        }
    };



    const handleExportJSON = () => {
        const dataStr = JSON.stringify(products, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `brakehubx_db_backup_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        showNotification('Base de datos exportada con éxito');
    };

    const totalApps = products.reduce((acc, p) => acc + (p.aplicaciones?.length || 0), 0);

    return (
        <div className="admin-layout">
            {isMobileMenuOpen && (
                <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
            )}
            {notification && (
                <div className={`toast-notification ${notification.type}`}>
                    {notification.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {notification.message}
                </div>
            )}
            <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="admin-brand">
                    <h2 className="admin-logo-title" style={{ display: 'flex', alignItems: 'center', gap: 0, color: 'var(--admin-text)', fontSize: '1.4rem', fontWeight: 800 }}>
                        <span>Brake</span>
                        <svg className="header-x" style={{ height: '0.6em', marginLeft: '0.3em', marginRight: '0', filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24">
                            <path fill="#3b82f6" d="M8.98885921,23.8523026 C8.8942483,23.9435442 8.76801031,24 8.62933774,24 L2.03198365,24 C1.73814918,24 1.5,23.7482301 1.5,23.4380086 C1.5,23.2831829 1.55946972,23.1428989 1.65570253,23.0416777 L13.2166154,12.4291351 C13.3325814,12.3262031 13.4061076,12.1719477 13.4061076,11.999444 C13.4061076,11.8363496 13.3401502,11.6897927 13.2352673,11.587431 L1.68841087,0.990000249 C1.57298556,0.88706828 1.5,0.733668282 1.5,0.561734827 C1.5,0.251798399 1.73814918,0.000028513 2.03198365,0.000028513 L8.62933774,0.000028513 C8.76855094,0.000028513 8.89532956,0.0561991444 8.98994048,0.148296169 L21.4358709,11.5757407 C21.548593,11.6783875 21.6196864,11.8297916 21.6196864,11.999444 C21.6196864,12.1693815 21.5483227,12.3219261 21.4350599,12.4251432 L8.98885921,23.8523026 Z M26.5774333,23.8384453 L20.1765996,17.9616286 C20.060093,17.8578413 19.9865669,17.7038710 19.9865669,17.5310822 C19.9865669,17.3859509 20.0390083,17.2536506 20.1246988,17.153855 L23.4190508,14.1291948 C23.5163648,14.0165684 23.6569296,13.945571 23.8131728,13.945571 C23.9602252,13.945571 24.0929508,14.0082997 24.1894539,14.1092357 L33.861933,22.9913237 C33.9892522,23.0939706 34.0714286,23.2559245 34.0714286,23.4381226 C34.0714286,23.748059 33.8332794,23.9998289 33.5394449,23.9998289 L26.9504707,23.9998289 C26.8053105,23.9998289 26.6733958,23.9382408 26.5774333,23.8384453 Z M26.5774333,0.161098511 C26.6733958,0.0615881034 26.8053105,0 26.9504707,0 L33.5394449,0 C33.8332794,0 34.0714286,0.251769886 34.0714286,0.561706314 C34.0714286,0.743904453 33.9892522,0.905573224 33.861933,1.00822006 L24.1894539,9.89030807 C24.0929508,9.99152926 23.9602252,10.0542579 23.8131728,10.0542579 C23.6569296,10.0542579 23.5163648,9.98354562 23.4190508,9.87063409 L20.1246988,6.8459739 C20.0390083,6.74617837 19.9865669,6.613878 19.9865669,6.46874677 Q20.060093,6.14198767 20.1765996,6.03848544 L26.5774333,0.161098511 Z" />
                        </svg>
                        <span style={{ marginLeft: 0 }}>pert</span>
                        <span style={{ marginLeft: '10px', color: 'var(--admin-text-muted)', fontWeight: 400, fontSize: '1rem' }}>Admin</span>
                    </h2>
                </div>

                <nav className="admin-nav-container">
                    <button
                        onClick={() => { setActiveTab('catalog'); setIsMobileMenuOpen(false); }}
                        className={`admin-nav-item ${activeTab === 'catalog' ? 'active-primary' : ''}`}
                    >
                        <LayoutGrid size={20} /> Catálogo
                    </button>

                    <button
                        onClick={() => { handleNew(); setIsMobileMenuOpen(false); }}
                        className={`admin-nav-item secondary ${activeTab === 'new' ? 'active' : ''}`}
                    >
                        <Plus size={20} /> Nueva Pastilla
                    </button>

                    <div className="nav-divider"></div>

                    <button
                        onClick={() => { setActiveTab('audit'); setIsMobileMenuOpen(false); }}
                        className={`admin-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
                    >
                        <AlertTriangle size={20} /> Auditoría
                    </button>
                    <button
                        onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }}
                        className={`admin-nav-item ${activeTab === 'history' ? 'active' : ''}`}
                    >
                        <History size={20} /> Historial
                    </button>
                    <button
                        onClick={() => { setActiveTab('database'); setIsMobileMenuOpen(false); }}
                        className={`admin-nav-item ${activeTab === 'database' ? 'active' : ''}`}
                    >
                        <Server size={20} /> Base de Datos
                    </button>
                </nav>

                <div className="admin-logout-wrapper">
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-section-title-wrapper">
                        <button className="menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <div>
                            {activeTab === 'edit' && (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={handleBack} className="back-btn">
                                        <ArrowLeft size={16} /> Volver al catálogo
                                    </button>
                                    <button
                                        onClick={handleDeleteClick}
                                        className="edit-action-btn"
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            borderColor: 'var(--admin-danger)',
                                            color: 'var(--admin-danger)'
                                        }}
                                    >
                                        <AlertTriangle size={16} /> Eliminar
                                    </button>
                                </div>
                            )}
                            <h1 className="admin-title" style={{ marginTop: activeTab === 'edit' ? '0.5rem' : 0 }}>
                                {activeTab === 'catalog' ? 'Panel de Control' :
                                    activeTab === 'new' ? 'Nueva Referencia' :
                                        activeTab === 'edit' ? 'Editando Referencia' :
                                            activeTab === 'audit' ? 'Panel de Auditoría' :
                                                activeTab === 'history' ? 'Historial de Cambios' : 'Gestión de Base de Datos'}
                            </h1>
                        </div>
                    </div>
                    <ThemeToggle />
                </header>

                {activeTab === 'catalog' && (
                    <div className="admin-card">
                        <div className="admin-section-header">
                            <h3 className="admin-section-title-text">Listado de Productos</h3>
                            <div className="admin-search-wrapper">
                                <Search className="admin-search-icon" size={18} />
                                <input
                                    className="admin-input"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="Buscar por referencia..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Referencia</th>
                                        <th>Aplicaciones</th>
                                        <th style={{ textAlign: 'right' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(p => (
                                        <tr key={p.id}>
                                            <td data-label="Referencia"><strong>{p.referencia || p.ref[0]}</strong></td>
                                            <td data-label="Aplicaciones">{p.aplicaciones.length} vehículos</td>
                                            <td data-label="Acciones" style={{ textAlign: 'right' }}>
                                                <button onClick={() => handleEdit(p)} className="edit-action-btn">
                                                    <Edit3 size={16} /> Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="admin-card">
                        <h3 className="admin-section-title-with-icon">
                            <AlertTriangle color="var(--admin-danger)" /> Referencias con Datos Inconsistentes
                        </h3>
                        <p className="admin-section-description">
                            Estas referencias tienen marcada una posición global que no coincide con sus aplicaciones.
                        </p>

                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Referencia</th>
                                        <th>Problema Detectado</th>
                                        <th style={{ textAlign: 'right' }}>Corregir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.filter(p => {
                                        if (!p.posicion) return false;
                                        const root = p.posicion.toUpperCase();
                                        if (root === 'AMBAS') return false;

                                        return p.aplicaciones.some(app => {
                                            const appPos = app.posicion?.toUpperCase();
                                            if (!appPos) return false;
                                            if (root === 'DELANTERA' && appPos === 'TRASERA') return true;
                                            if (root === 'TRASERA' && appPos === 'DELANTERA') return true;
                                            return false;
                                        });
                                    }).map(p => (
                                        <tr key={p.id}>
                                            <td data-label="Referencia"><strong>{p.referencia || p.ref[0]}</strong></td>
                                            <td data-label="Problema" style={{ color: 'var(--admin-danger)' }}>
                                                {p.posicion === 'DELANTERA' ? 'Tiene apps TRASERAS' : 'Tiene apps DELANTERAS'}
                                            </td>
                                            <td data-label="Acción" style={{ textAlign: 'right' }}>
                                                <button onClick={() => handleEdit(p)} className="edit-action-btn" style={{ borderColor: 'var(--admin-danger)', color: 'var(--admin-text)' }}>
                                                    <Edit3 size={16} /> Corregir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="admin-card">
                        <h3 className="admin-section-title-with-icon">
                            <FileClock color="var(--admin-accent)" /> Historial de Cambios
                        </h3>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Usuario</th>
                                        <th>Acción</th>
                                        <th>Producto</th>
                                        <th>Detalles</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingHistory ? (
                                        <tr><td colSpan={5} className="text-center p-8">Cargando historial...</td></tr>
                                    ) : historyLogs.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center p-8 text-muted">No hay cambios registrados aún.</td></tr>
                                    ) : historyLogs.map(log => (
                                        <tr key={log.id}>
                                            <td data-label="Fecha" className="fs-small text-muted">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td data-label="Usuario">{log.user}</td>
                                            <td data-label="Acción">
                                                <span className={`log-action-badge ${log.action === 'CREATE' ? 'success' : 'edit'}`}
                                                    style={{ background: log.action === 'CREATE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: log.action === 'CREATE' ? '#34d399' : '#60a5fa' }}>
                                                    {log.action === 'CREATE' ? 'CREACIÓN' : 'EDICIÓN'}
                                                </span>
                                            </td>
                                            <td data-label="Producto"><strong>{log.productRef || 'Sin Ref'}</strong></td>
                                            <td data-label="Detalles" className="history-details">
                                                {log.changes?.length ? (
                                                    <ul className="history-changes-list">
                                                        {log.changes.map((c, i) => {
                                                            const vFormat = (v: any) => {
                                                                if (typeof v === 'object' && v !== null) {
                                                                    if ('ancho' in v && 'alto' in v) return `${v.ancho} x ${v.alto}`;
                                                                    return JSON.stringify(v);
                                                                }
                                                                return String(v);
                                                            };
                                                            return (
                                                                <li key={i}>
                                                                    <span className="font-semibold text-muted">{c.field}:</span> {vFormat(c.old).substring(0, 30)} ➝ <span className="admin-text-highlight">{vFormat(c.new).substring(0, 30)}</span>
                                                                </li>
                                                            );
                                                        }).slice(0, 3)}
                                                        {log.changes.length > 3 && <li>...</li>}
                                                    </ul>
                                                ) : <span style={{ color: 'var(--admin-text-muted)' }}>Sin cambios detectados</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'database' && (
                    <div className="admin-card">
                        <div className="admin-section-title-wrapper-large">
                            <div className="status-indicator success" />
                            <h3 className="admin-section-title-text-large">Estado del Sistema</h3>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                    <LayoutGrid size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Total Referencias</span>
                                    <span className="stat-value">{products.length}</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                    <Activity size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Total Aplicaciones</span>
                                    <span className="stat-value">{totalApps}</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                    <Cloud size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Servidor Firebase</span>
                                    <span className="stat-value" style={{ fontSize: '1rem', color: '#10b981' }}>Conectado</span>
                                </div>
                            </div>
                        </div>

                        <div className="db-backup-card">
                            <Database size={48} className="db-backup-icon" />
                            <h4 className="db-backup-title">Respaldar Información</h4>
                            <p className="db-backup-description">
                                Descarga una copia de seguridad completa de todos los productos y aplicaciones en formato JSON.
                            </p>
                            <button onClick={handleExportJSON} className="save-all-btn db-backup-btn">
                                <Download size={20} /> Descargar JSON
                            </button>
                        </div>
                    </div>
                )}

                {(activeTab === 'new' || activeTab === 'edit') && (
                    <div style={{ opacity: isSaving ? 0.7 : 1, pointerEvents: isSaving ? 'none' : 'auto' }}>
                        <ErrorBoundary fallback={(error) => (
                            <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <AlertTriangle size={48} color="var(--admin-danger)" style={{ marginBottom: '1rem' }} />
                                <h2 style={{ color: 'var(--admin-text)' }}>Error al cargar el formulario</h2>
                                <p style={{ color: 'var(--admin-text-muted)', marginBottom: '1rem' }}>
                                    {error?.message || "Esta referencia podría tener datos corruptos o incompatibles."}
                                </p>
                                <pre style={{ color: '#64748b', fontSize: '0.7rem', background: '#000', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', maxWidth: '100%', marginBottom: '2rem' }}>
                                    {error?.stack}
                                </pre>
                                <button onClick={handleBack} className="save-all-btn" style={{ padding: '1rem 2rem' }}>
                                    Volver al catálogo
                                </button>
                            </div>
                        )}>
                            <ProductForm
                                initialData={editingProduct}
                                onSave={handleSave}
                            />
                        </ErrorBoundary>
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Confirmar Eliminación"
                size="small"
            >
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--admin-danger)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        <AlertTriangle size={32} />
                    </div>
                    <p style={{ marginBottom: '2rem', color: 'var(--admin-text-muted)', fontSize: '1.1rem' }}>
                        ¿Estás seguro de que deseas eliminar este producto permanentemente? <br />
                        <strong style={{ color: 'var(--admin-text)', marginTop: '0.5rem', display: 'block' }}>
                            {editingProduct?.referencia || 'Referencia desconocida'}
                        </strong>
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            style={{
                                padding: '0.8rem 1.5rem',
                                borderRadius: '0.8rem',
                                border: '1px solid var(--admin-border)',
                                background: 'transparent',
                                color: 'var(--admin-text)',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmDelete}
                            style={{
                                padding: '0.8rem 1.5rem',
                                borderRadius: '0.8rem',
                                border: 'none',
                                background: 'var(--admin-danger)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600,
                                boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminPanel;
