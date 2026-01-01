
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ImageIcon, Check, Edit2, Package as PackageIcon, Ruler, Car } from 'lucide-react';
import type { Product, VehicleApplication } from '../../types';

interface ProductFormProps {
    initialData?: Product;
    onSave: (data: Partial<Product>) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave }) => {
    const [formData, setFormData] = useState<Partial<Product>>(initialData || {});

    // Sync formData when initialData changes
    useEffect(() => {
        if (initialData) {
            console.log("ProductForm received initialData:", initialData);
            const data = { ...initialData } as any;

            console.log("Medidas before processing:", data.medidas);

            // HANDLE LEGACY FORMAT: ["104.4 x 56.2"]
            if (Array.isArray(data.medidas) && data.medidas.length > 0 && typeof data.medidas[0] === 'string') {
                const parts = data.medidas[0].split('x');
                if (parts.length === 2) {
                    data.medidas = {
                        ancho: parseFloat(parts[0].trim()) || 0,
                        alto: parseFloat(parts[1].trim()) || 0
                    };
                    console.log("Parsed array format to object:", data.medidas);
                }
            }

            // Ensure medidas object exists if it was null/undefined or empty array
            if (!data.medidas || Array.isArray(data.medidas)) {
                data.medidas = {};
            }

            console.log("Medidas before processing:", data.medidas);

            // Helpers to check validity
            const isInvalid = (val: any) => val === undefined || val === null || val === '';

            // Robust check using helper
            if (isInvalid(data.medidas.ancho) || isInvalid(data.medidas.alto)) {

                // Helper to find value by potential keys
                const findValue = (obj: any, keys: string[]) => {
                    for (const key of keys) {
                        // Direct match
                        if (!isInvalid(obj[key])) return obj[key];
                        // Case insensitive match
                        const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
                        if (foundKey && !isInvalid(obj[foundKey])) return obj[foundKey];
                    }
                    return undefined;
                };

                const anchoVal = findValue(data, ['ancho', 'width', 'medida_ancho', 'dimension_ancho']);
                const altoVal = findValue(data, ['alto', 'height', 'largo', 'length', 'medida_alto']);

                // If found, assign - coercing to Number
                if (anchoVal !== undefined) data.medidas.ancho = Number(anchoVal);
                if (altoVal !== undefined) data.medidas.alto = Number(altoVal);
            }

            // Final fallback to 0 if invalid or NaN
            if (isInvalid(data.medidas.ancho) || isNaN(Number(data.medidas.ancho))) data.medidas.ancho = 0;
            if (isInvalid(data.medidas.alto) || isNaN(Number(data.medidas.alto))) data.medidas.alto = 0;

            console.log("Processed formData:", data);
            setFormData(data);
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
            if (!prev.aplicaciones) return prev;
            const apps = [...prev.aplicaciones];
            const currentPos = apps[index].posicion || 'DELANTERA';
            const nextIdx = (positions.indexOf(currentPos as any) + 1) % positions.length;
            apps[index] = { ...apps[index], posicion: positions[nextIdx] };
            return { ...prev, aplicaciones: apps };
        });
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
                                const currentRefs = formData.ref ? [...formData.ref] : [];
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
                                value={formData.fmsi?.join(', ') || ''}
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
                                value={formData.oem?.join(', ') || ''}
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
                                    className={`pos-btn ${formData.posicion?.toUpperCase() === 'DELANTERA' ? 'active del' : ''}`}
                                    onClick={() => setFormData({ ...formData, posicion: 'DELANTERA' })}
                                >DELANTERA</button>
                                <button
                                    type="button"
                                    className={`pos-btn ${formData.posicion?.toUpperCase() === 'TRASERA' ? 'active tras' : ''}`}
                                    onClick={() => setFormData({ ...formData, posicion: 'TRASERA' })}
                                >TRASERA</button>
                                <button
                                    type="button"
                                    className={`pos-btn ${formData.posicion?.toUpperCase() === 'AMBAS' ? 'active ambas-btn' : ''}`}
                                    onClick={() => setFormData({ ...formData, posicion: 'AMBAS' })}
                                >AMBAS</button>
                            </div>
                        </div>

                        <div className="extra-info-grid">
                            <div>
                                <label><Ruler size={14} /> Ancho (mm)</label>
                                <input
                                    type="number"
                                    className="admin-input"
                                    value={formData.medidas?.ancho || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        medidas: { ...(formData.medidas || { ancho: 0, alto: 0 }), ancho: Number(e.target.value) || 0 }
                                    })}
                                />
                            </div>
                            <div>
                                <label><Ruler size={14} /> Alto (mm)</label>
                                <input
                                    type="number"
                                    className="admin-input"
                                    value={formData.medidas?.alto || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        medidas: { ...(formData.medidas || { ancho: 0, alto: 0 }), alto: Number(e.target.value) || 0 }
                                    })}
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
                        {formData.aplicaciones?.map((app, idx) => (
                            <div key={idx} className={`app-item-card ${editingAppIndex === idx ? 'editing' : ''}`}>
                                {editingAppIndex === idx && tempApp ? (
                                    // EDIT MODE
                                    <div className="app-edit-grid">
                                        <input
                                            className="admin-input small"
                                            value={tempApp.marca}
                                            onChange={e => setTempApp({ ...tempApp, marca: e.target.value })}
                                            placeholder="Marca"
                                        />
                                        <input
                                            className="admin-input small"
                                            value={tempApp.serie || tempApp.modelo}
                                            onChange={e => setTempApp({ ...tempApp, serie: e.target.value, modelo: e.target.value })}
                                            placeholder="Serie/Modelo"
                                        />
                                        <input
                                            className="admin-input small"
                                            value={tempApp.año}
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
                                    <>
                                        <div style={{ flex: 1 }}>
                                            <strong style={{ color: '#fff', fontSize: '1rem', display: 'block' }}>
                                                {app.marca} <span style={{ color: 'var(--admin-accent)' }}>{app.serie || app.modelo || '(Sin Serie)'}</span>
                                            </strong>
                                            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>
                                                Año: {app.año || 'N/A'}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span
                                                className={`pos-badge ${(app.posicion || formData.posicion || 'delantera').toLowerCase()}`}
                                                onClick={() => toggleAppPosition(idx)}
                                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                                title="Click para cambiar posición"
                                            >
                                                {(app.posicion || formData.posicion) ?
                                                    ((app.posicion || formData.posicion) === 'AMBAS' ? 'AMBAS' : (app.posicion || formData.posicion)?.substring(0, 3).toUpperCase())
                                                    : 'N/A'}
                                            </span>

                                            <button
                                                onClick={() => startEditingApp(idx, app)}
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
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-footer-actions">
                <button
                    className="save-all-btn"
                    onClick={() => onSave(formData)}
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
                    margin-bottom: 2rem;
                    color: #fff;
                    font-size: 1.2rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                }
                .highlight { border-color: var(--admin-accent); background: rgba(59, 130, 246, 0.05); }
                
                .image-edit-section {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                    background: rgba(255, 255, 255, 0.02);
                    padding: 1.5rem;
                    border-radius: 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
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
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .admin-img-preview { width: 100%; height: 100%; object-fit: contain; }
                .no-image-placeholder { display: flex; flex-direction: column; align-items: center; color: #475569; font-size: 0.7rem; gap: 0.5rem; }
                
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
                    color: #94a3b8;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .input-group { margin-bottom: 1rem; }

                .new-app-box {
                    background: rgba(255, 255, 255, 0.03);
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
                    color: #fff;
                    cursor: pointer;
                    font-size: 0.7rem;
                    font-weight: 700;
                    transition: all 0.2s;
                }
                .pos-btn.active.del { background: rgba(59, 130, 246, 0.2); border-color: #3b82f6; color: #60a5fa; }
                .pos-btn.active.tras { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #f87171; }
                .pos-btn.active.ambas-btn { background: linear-gradient(90deg, #3b82f6, #ef4444); border: none; }
                
                .add-app-btn {
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
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
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 0.75rem;
                    margin-bottom: 0.5rem;
                    transition: all 0.2s;
                }
                .app-item-card:hover { border-color: rgba(255, 255, 255, 0.15); }
                .app-item-card.editing {
                    background: rgba(59, 130, 246, 0.1);
                    border-color: #3b82f6;
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
                    background: rgba(0, 0, 0, 0.3);
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
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
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
                .pos-badge.delantera { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
                .pos-badge.trasera { background: rgba(239, 68, 68, 0.2); color: #f87171; }
                .pos-badge.ambas { background: linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(239, 68, 68, 0.2)); color: #fff; border: 1px solid rgba(255, 255, 255, 0.1); }
`}</style>
        </div>
    );
};

export default ProductForm;
