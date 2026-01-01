
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ImageIcon, Check, Edit2, Package as PackageIcon, Ruler, Car } from 'lucide-react';
import type { Product, VehicleApplication } from '../../types';

interface ProductFormProps {
    initialData?: Product;
    onSave: (data: Partial<Product>) => void;
}

const normalizeProductData = (data: any): Partial<Product> => {
    if (!data) return {};
    const normalized = { ...data };

    // 1. Normalize Medidas (trust global normalizeProduct or re-run if needed)
    let rawMedidas = normalized.medidas;
    let ancho: number | string = '';
    let alto: number | string = '';

    if (Array.isArray(rawMedidas) && rawMedidas.length > 0) {
        rawMedidas = rawMedidas[0];
    }

    if (typeof rawMedidas === 'string') {
        const parts = rawMedidas.toLowerCase().split('x');
        if (parts.length === 2) {
            const a = parseFloat(parts[0].trim());
            const h = parseFloat(parts[1].trim());
            ancho = a || '';
            alto = h || '';
        }
    } else if (rawMedidas && typeof rawMedidas === 'object') {
        const a = parseFloat(rawMedidas.ancho) || parseFloat(rawMedidas.width);
        const h = parseFloat(rawMedidas.alto) || parseFloat(rawMedidas.height);
        ancho = a || '';
        alto = h || '';
    }

    normalized.medidas = { ancho, alto };


    // 2. Normalize Arrays
    const ensureArray = (val: any) => {
        if (Array.isArray(val)) return val;
        if (val && typeof val === 'string') return [val];
        return [];
    };

    normalized.fmsi = ensureArray(normalized.fmsi);
    normalized.oem = ensureArray(normalized.oem);
    normalized.ref = ensureArray(normalized.ref);
    normalized.imagenes = ensureArray(normalized.imagenes);

    // 3. Normalize Aplicaciones
    normalized.aplicaciones = ensureArray(normalized.aplicaciones).map((app: any) => {
        if (app && typeof app === 'object') {
            return {
                marca: String(app.marca || ''),
                modelo: String(app.modelo || app.serie || ''),
                serie: String(app.serie || ''),
                año: String(app.año || ''),
                posicion: String(app.posicion || 'DELANTERA').toUpperCase() as any
            };
        }
        return { marca: 'Dato corrupto', modelo: String(app), año: '', posicion: 'DELANTERA' };
    });

    // 4. Normalize basic strings
    normalized.posicion = String(normalized.posicion || normalized.posición || 'DELANTERA').toUpperCase() as any;

    return normalized;
};

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave }) => {
    const [formData, setFormData] = useState<Partial<Product>>(() => normalizeProductData(initialData));

    // Sync formData when initialData changes
    useEffect(() => {
        if (initialData) {
            console.log("ProductForm received initialData change, normalizing...");
            setFormData(normalizeProductData(initialData));
        }
    }, [initialData]);

    const [newApp, setNewApp] = useState<VehicleApplication>({
        marca: '',
        modelo: '',
        serie: '',
        año: '',
        posicion: 'DELANTERA'
    });

    // State for editing an existing application
    const [editingAppIndex, setEditingAppIndex] = useState<number | null>(null);
    const [tempApp, setTempApp] = useState<VehicleApplication | null>(null);

    const handleAddApp = () => {
        if (!newApp.marca || (!newApp.modelo && !newApp.serie)) return;
        setFormData(prev => ({
            ...prev,
            aplicaciones: [...(prev.aplicaciones || []), newApp]
        }));
        setNewApp({ marca: '', modelo: '', serie: '', año: '', posicion: 'DELANTERA' });
    };

    const removeApp = (index: number) => {
        setFormData(prev => ({
            ...prev,
            aplicaciones: prev.aplicaciones?.filter((_, i) => i !== index)
        }));
    };

    const startEditingApp = (index: number, app: VehicleApplication) => {
        setEditingAppIndex(index);
        setTempApp({ ...app });
    };

    const cancelEditingApp = () => {
        setEditingAppIndex(null);
        setTempApp(null);
    };

    const saveEditingApp = () => {
        if (editingAppIndex === null || !tempApp) return;
        setFormData(prev => {
            const newApps = [...(prev.aplicaciones || [])];
            newApps[editingAppIndex] = tempApp;
            return { ...prev, aplicaciones: newApps };
        });
        setEditingAppIndex(null);
        setTempApp(null);
    };

    const toggleAppPosition = (index: number) => {
        const positions: ('DELANTERA' | 'TRASERA' | 'AMBAS')[] = ['DELANTERA', 'TRASERA', 'AMBAS'];
        setFormData(prev => {
            if (!prev.aplicaciones || !prev.aplicaciones[index]) return prev;
            const apps = [...prev.aplicaciones];
            const currentPos = apps[index].posicion || 'DELANTERA';
            const nextIdx = (positions.indexOf(currentPos as any) + 1) % positions.length;
            apps[index] = { ...apps[index], posicion: positions[nextIdx] };
            return { ...prev, aplicaciones: apps };
        });
    };

    const handleSaveClick = () => {
        try {
            console.log("Saving formData:", formData);
            const dataToSave = { ...formData };

            // Convert back to legacy format for storage if it's an object now
            if (dataToSave.medidas && typeof dataToSave.medidas === 'object' && !Array.isArray(dataToSave.medidas)) {
                const anchoFinal = dataToSave.medidas.ancho || 0;
                const altoFinal = dataToSave.medidas.alto || 0;
                dataToSave.medidas = [`${anchoFinal} x ${altoFinal}`] as any;
            }

            onSave(dataToSave);
        } catch (err) {
            console.error("Error in handleSaveClick:", err);
            alert("Error al preparar los datos para guardar.");
        }
    };

    return (
        <div className="product-form-container">
            <div className="admin-grid">
                {/* General Data Card */}
                <div className="admin-card">
                    <h3 className="section-title"><PackageIcon size={20} /> Datos Generales</h3>

                    {/* Image Preview Area */}
                    <div className="image-edit-section">
                        <div className="image-preview-container">
                            {formData.imagenes?.[0] ? (
                                <img src={formData.imagenes[0]} alt="Preview" className="admin-img-preview" />
                            ) : (
                                <div className="no-image-placeholder">
                                    <ImageIcon size={40} opacity={0.2} />
                                    <span>Sin Imagen</span>
                                </div>
                            )}
                        </div>
                        <div className="image-input-stack">
                            <label>URL Imagen</label>
                            <input
                                type="text"
                                className="admin-input"
                                placeholder="Link de Firebase..."
                                value={formData.imagenes?.[0] || ''}
                                onChange={(e) => setFormData({ ...formData, imagenes: [e.target.value] })}
                            />
                        </div>
                    </div>

                    <div className="form-group-stack">
                        <label>REF</label>
                        <input
                            type="text"
                            className="admin-input highlight"
                            value={formData.ref?.[0] || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                const currentRefs = Array.isArray(formData.ref) ? [...formData.ref] : [];
                                if (currentRefs.length > 0) {
                                    currentRefs[0] = val;
                                } else {
                                    currentRefs.push(val);
                                }
                                setFormData({ ...formData, ref: currentRefs });
                            }}
                        />

                        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                            <label>FMSI (Planita)</label>
                            <input
                                type="text"
                                className="admin-input"
                                placeholder="Ej: D1234, 8432"
                                value={Array.isArray(formData.fmsi) ? formData.fmsi.join(', ') : ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    fmsi: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                            />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label>OEM (Separadas por coma)</label>
                            <input
                                type="text"
                                className="admin-input"
                                placeholder="Ej: 1K0698151A, 5K0698151"
                                value={Array.isArray(formData.oem) ? formData.oem.join(', ') : ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    oem: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                            />
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <label>Posición Global</label>
                            <div className="pos-selector">
                                <button
                                    type="button"
                                    className={`pos-btn ${String(formData.posicion || '').toUpperCase() === 'DELANTERA' ? 'active del' : ''}`}
                                    onClick={() => setFormData({ ...formData, posicion: 'DELANTERA' })}
                                >DELANTERA</button>
                                <button
                                    type="button"
                                    className={`pos-btn ${String(formData.posicion || '').toUpperCase() === 'TRASERA' ? 'active tras' : ''}`}
                                    onClick={() => setFormData({ ...formData, posicion: 'TRASERA' })}
                                >TRASERA</button>
                                <button
                                    type="button"
                                    className={`pos-btn ${String(formData.posicion || '').toUpperCase() === 'AMBAS' ? 'active ambas-btn' : ''}`}
                                    onClick={() => setFormData({ ...formData, posicion: 'AMBAS' })}
                                >AMBAS</button>
                            </div>
                        </div>

                        <div className="extra-info-grid">
                            <div>
                                <label><Ruler size={14} /> Ancho (mm)</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="0.0"
                                    value={(formData.medidas as any)?.ancho ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(',', '.');
                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                            setFormData({
                                                ...formData,
                                                medidas: { ...(formData.medidas as any || { ancho: '', alto: '' }), ancho: val }
                                            });
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <label><Ruler size={14} /> Alto (mm)</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="0.0"
                                    value={(formData.medidas as any)?.alto ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(',', '.');
                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                            setFormData({
                                                ...formData,
                                                medidas: { ...(formData.medidas as any || { ancho: '', alto: '' }), alto: val }
                                            });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applications Card */}
                <div className="admin-card">
                    <h3 className="section-title"><Car size={20} /> Aplicaciones por Vehículo</h3>

                    {/* New Application Input */}
                    <div className="new-app-box">
                        <input
                            placeholder="Marca"
                            className="admin-input"
                            value={newApp.marca}
                            onChange={e => setNewApp({ ...newApp, marca: e.target.value })}
                        />
                        <input
                            placeholder="Serie / Modelo"
                            className="admin-input"
                            value={newApp.serie || newApp.modelo}
                            onChange={e => setNewApp({ ...newApp, serie: e.target.value, modelo: e.target.value })}
                        />
                        <input
                            placeholder="Año"
                            className="admin-input"
                            value={newApp.año}
                            onChange={e => setNewApp({ ...newApp, año: e.target.value })}
                        />

                        <div className="pos-selector">
                            <button
                                type="button"
                                className={`pos-btn ${newApp.posicion === 'DELANTERA' ? 'active del' : ''}`}
                                onClick={() => setNewApp({ ...newApp, posicion: 'DELANTERA' })}
                            >DEL</button>
                            <button
                                type="button"
                                className={`pos-btn ${newApp.posicion === 'TRASERA' ? 'active tras' : ''}`}
                                onClick={() => setNewApp({ ...newApp, posicion: 'TRASERA' })}
                            >TRAS</button>
                            <button
                                type="button"
                                className={`pos-btn ${newApp.posicion === 'AMBAS' ? 'active ambas-btn' : ''}`}
                                onClick={() => setNewApp({ ...newApp, posicion: 'AMBAS' })}
                            >AMBAS</button>
                        </div>

                        <button type="button" className="add-app-btn" onClick={handleAddApp}>
                            <Plus size={18} /> Añadir Vehículo
                        </button>
                    </div>

                    {/* Applications List */}
                    <div className="apps-list-container">
                        {Array.isArray(formData.aplicaciones) && formData.aplicaciones.map((app, idx) => (
                            <div key={idx} className={`app-item-card ${editingAppIndex === idx ? 'editing' : ''}`}>
                                {editingAppIndex === idx && tempApp ? (
                                    // EDIT MODE
                                    <div className="app-edit-grid">
                                        <input
                                            className="admin-input small"
                                            value={tempApp.marca || ''}
                                            onChange={e => setTempApp({ ...tempApp, marca: e.target.value })}
                                            placeholder="Marca"
                                        />
                                        <input
                                            className="admin-input small"
                                            value={tempApp.serie || tempApp.modelo || ''}
                                            onChange={e => setTempApp({ ...tempApp, serie: e.target.value, modelo: e.target.value })}
                                            placeholder="Serie/Modelo"
                                        />
                                        <input
                                            className="admin-input small"
                                            value={tempApp.año || ''}
                                            onChange={e => setTempApp({ ...tempApp, año: e.target.value })}
                                            placeholder="Año"
                                        />
                                        <div className="edit-app-actions">
                                            <button onClick={saveEditingApp} className="icon-btn success"><Check size={16} /></button>
                                            <button onClick={cancelEditingApp} className="icon-btn danger"><X size={16} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    // VIEW MODE
                                    <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ flex: 1 }}>
                                            <strong style={{ color: 'var(--admin-text)', fontSize: '1rem', display: 'block' }}>
                                                {app?.marca || 'N/A'} <span style={{ color: 'var(--admin-accent)' }}>{app?.serie || app?.modelo || '(Sin Serie)'}</span>
                                            </strong>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', fontWeight: 500 }}>
                                                Año: {app?.año || 'N/A'}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span
                                                className={`pos-badge ${String(app?.posicion || formData.posicion || 'delantera').toLowerCase()}`}
                                                onClick={() => toggleAppPosition(idx)}
                                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                                title="Click para cambiar posición"
                                            >
                                                {(app?.posicion || formData.posicion || 'N/A')}
                                            </span>

                                            <button
                                                onClick={() => app && startEditingApp(idx, app)}
                                                className="icon-btn edit"
                                                title="Editar Vehículo"
                                            >
                                                <Edit2 size={16} />
                                            </button>

                                            <button
                                                onClick={() => removeApp(idx)}
                                                className="icon-btn danger"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-footer-actions">
                <button
                    className="save-all-btn"
                    onClick={handleSaveClick}
                >
                    Guardar Todos los Cambios
                </button>
            </div>

            <style>{`
                .form-footer-actions {
                    margin-top: 3rem;
                    display: flex;
                    justify-content: center;
                    padding-bottom: 2rem;
                }
                label {
                    color: var(--admin-text-muted);
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    display: block;
                }
                .save-all-btn {
                    background: var(--admin-accent);
                    color: #fff;
                    border: none;
                    padding: 1.25rem 4rem;
                    border-radius: 1.25rem;
                    font-weight: 800;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 15px 30px -10px rgba(59, 130, 246, 0.5);
                }
                .save-all-btn:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 20px 40px -12px rgba(59, 130, 246, 0.6);
                }
                .save-all-btn:active {
                    transform: translateY(0) scale(0.98);
                }
                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                    color: var(--admin-text);
                    font-size: 1rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                }
                .highlight { border-color: var(--admin-accent); background: rgba(59, 130, 246, 0.05); }
                
                .image-edit-section {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                    background: var(--admin-glass);
                    padding: 1.5rem;
                    border-radius: 1.5rem;
                    border: 1px solid var(--admin-border);
                }
                .image-preview-container {
                    width: 120px;
                    height: 120px;
                    background: #000;
                    border-radius: 1rem;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--admin-border);
                }
                .admin-img-preview { width: 100%; height: 100%; object-fit: contain; }
                .no-image-placeholder { display: flex; flex-direction: column; align-items: center; color: var(--admin-text-muted); font-size: 0.7rem; gap: 0.5rem; }
                
                .image-input-stack { flex: 1; display: flex; flex-direction: column; justify-content: center; }
                
                .extra-info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-top: 1.5rem;
                }

                .form-group-stack label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    color: var(--admin-text-muted);
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .input-group { margin-bottom: 1rem; }

                .new-app-box {
                    background: var(--admin-glass);
                    padding: 1rem;
                    border-radius: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid var(--admin-border);
                }
                .pos-selector {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 0.5rem;
                }
                .pos-btn {
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    border: 1px solid var(--admin-border);
                    background: transparent;
                    color: var(--admin-text);
                    cursor: pointer;
                    font-size: 0.7rem;
                    font-weight: 700;
                    transition: all 0.2s;
                }
                .pos-btn.active.del { background: rgba(59, 130, 246, 0.2); border-color: #3b82f6; color: #3b82f6; }
                .pos-btn.active.tras { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #ef4444; }
                .pos-btn.active.ambas-btn { background: var(--accent-primary); color: #fff; border: none; }
                
                .add-app-btn {
                    background: var(--admin-text);
                    color: var(--admin-card-bg);
                    border: none;
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .add-app-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                .apps-list-container {
                    max-height: 400px;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                }
                
                .app-item-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: var(--admin-glass);
                    border: 1px solid var(--admin-border);
                    border-radius: 0.75rem;
                    margin-bottom: 0.5rem;
                    transition: all 0.2s;
                }
                .app-item-card:hover { border-color: var(--admin-accent); }
                .app-item-card.editing {
                    background: var(--admin-glass-hover);
                    border-color: var(--admin-accent);
                }

                .app-edit-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 0.8fr auto;
                    gap: 0.5rem;
                    width: 100%;
                    align-items: center;
                }
                
                .admin-input.small {
                    padding: 0.5rem;
                    font-size: 0.85rem;
                    background: var(--admin-glass);
                }

                .edit-app-actions {
                    display: flex;
                    gap: 0.25rem;
                }

                .icon-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: var(--admin-glass);
                    color: var(--admin-text);
                }
                .icon-btn:hover { background: rgba(255, 255, 255, 0.15); transform: scale(1.05); }
                .icon-btn.edit { color: #60a5fa; }
                .icon-btn.danger { color: #ef4444; }
                .icon-btn.success { background: #10b981; color: #fff; }
                .icon-btn.success:hover { background: #059669; }

                .pos-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .pos-badge.delantera { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
                .pos-badge.trasera { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                .pos-badge.ambas { background: var(--accent-primary); color: #fff; border: none; }
`}</style>
        </div>
    );
};

export default ProductForm;
