import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlusCircle, Check, Send, ChevronDown, Search, Loader2 } from 'lucide-react';
import styled from 'styled-components';
import Modal from '../modals/Modal';
import { useAppStore } from '../../store/useAppStore';
import { addReport } from '../../services/firebase';
import '../../styles/searchable-select.css';

const SuggestAppModal = () => {
    const isOpen = useAppStore(state => state.ui.isSuggestAppModalOpen);
    const closeSuggestAppModal = useAppStore(state => state.closeSuggestAppModal);
    const products = useAppStore(state => state.products);

    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        marca: '',
        modelo: '',
        año: '',
        posicion: 'DELANTERA',
        notas: ''
    });

    // Reference Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefDropdownOpen, setIsRefDropdownOpen] = useState(false);

    // Brand/Model Logic
    const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [brandSearch, setBrandSearch] = useState('');
    const [isCustomModel, setIsCustomModel] = useState(false);

    const refWrapperRef = useRef<HTMLDivElement>(null);
    const brandWrapperRef = useRef<HTMLDivElement>(null);
    const modelWrapperRef = useRef<HTMLDivElement>(null);
    const positionWrapperRef = useRef<HTMLDivElement>(null);
    const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);

    // Initialize/Reset
    useEffect(() => {
        if (isOpen) {
            setShowSuccess(false);
            setIsSubmitting(false);
            setFormData({ marca: '', modelo: '', año: '', posicion: 'DELANTERA', notas: '' });
            setSearchTerm('');
            setIsRefDropdownOpen(false);
            setBrandSearch('');
            setBrandSearch('');
            setIsCustomModel(false);
            setIsPositionDropdownOpen(false);
        }
    }, [isOpen]);

    // Outside clicks
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (refWrapperRef.current && !refWrapperRef.current.contains(event.target as Node)) setIsRefDropdownOpen(false);
            if (brandWrapperRef.current && !brandWrapperRef.current.contains(event.target as Node)) setIsBrandDropdownOpen(false);
            if (brandWrapperRef.current && !brandWrapperRef.current.contains(event.target as Node)) setIsBrandDropdownOpen(false);
            if (modelWrapperRef.current && !modelWrapperRef.current.contains(event.target as Node)) setIsModelDropdownOpen(false);
            if (positionWrapperRef.current && !positionWrapperRef.current.contains(event.target as Node)) setIsPositionDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtered References
    const filteredReferences = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];
        const term = searchTerm.toLowerCase();
        const refs = new Set<string>();

        for (const p of products) {
            if (refs.size >= 20) break;

            let matches = false;
            // Check main reference
            if ((p.referencia || '').toLowerCase().includes(term)) {
                matches = true;
            }
            // Check aliases if not already matched
            else if (p.ref) {
                for (const s of p.ref) {
                    if (s && s.toLowerCase().includes(term)) {
                        matches = true;
                        break;
                    }
                }
            }

            if (matches) {
                refs.add(p.referencia);
            }
        }
        return Array.from(refs).sort();
    }, [products, searchTerm]);

    // Available Brands from existing products
    const availableBrands = useMemo(() => {
        const brands = new Set<string>();
        products.forEach(p => p.aplicaciones?.forEach(app => {
            if (app.marca) brands.add(app.marca);
        }));
        return Array.from(brands).sort();
    }, [products]);

    const filteredBrands = useMemo(() => {
        if (!brandSearch) return availableBrands;
        return availableBrands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
    }, [availableBrands, brandSearch]);

    // Available Models based on selected Brand
    const availableModels = useMemo(() => {
        if (!formData.marca) return [];
        const models = new Set<string>();
        products.forEach(p => p.aplicaciones?.forEach(app => {
            if (app.marca === formData.marca) {
                if (app.modelo) models.add(app.modelo);
                if (app.serie) models.add(app.serie);
            }
        }));
        return Array.from(models).sort();
    }, [products, formData.marca]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const selectedProduct = products.find(p => p.referencia === searchTerm || (p.ref && p.ref.includes(searchTerm)));

            await addReport({
                productId: selectedProduct?.id || 'unknown',
                productReference: searchTerm,
                description: `Nueva Aplicación Sugerida: ${formData.marca} ${formData.modelo} ${formData.año ? `(${formData.año})` : ''} - ${formData.posicion}`,
                type: 'NEW_APP',
                data: formData
            });

            setShowSuccess(true);
            setTimeout(() => {
                closeSuggestAppModal();
            }, 2500);
        } catch (error) {
            console.error("Error sending suggestion:", error);
            alert("Hubo un error al enviar la sugerencia.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeSuggestAppModal}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <PlusCircle size={20} className="text-secondary" />
                    Sugerir Nueva Aplicación
                </div>
            }
            size="large"

        >
            <Container>
                {!showSuccess ? (
                    <Form onSubmit={handleSubmit}>
                        <HeaderNote style={{ gridColumn: 'span 2' }}>
                            <p>¿Conoces un vehículo compatible con una pastilla y no está en la lista? ¡Cuéntanos!</p>
                        </HeaderNote>

                        {/* Reference Search */}
                        <FormGroup ref={refWrapperRef} style={{ gridColumn: 'span 2' }}>
                            <Label>Referencia de Pastilla</Label>
                            <SearchWrapper>
                                <SearchIcon><Search size={16} /></SearchIcon>
                                <SearchInput
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setIsRefDropdownOpen(true); }}
                                    onFocus={() => setIsRefDropdownOpen(true)}
                                    placeholder="Buscar referencia (ej: D123)..."
                                    required
                                />
                                {isRefDropdownOpen && filteredReferences.length > 0 && (
                                    <ul className="searchable-select-dropdown">
                                        {filteredReferences.map((ref, idx) => (
                                            <li key={idx} className="searchable-select-option" onClick={() => { setSearchTerm(ref); setIsRefDropdownOpen(false); }}>
                                                {ref}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </SearchWrapper>
                        </FormGroup>

                        {/* Brand Selection */}
                        <FormGroup ref={brandWrapperRef}>
                            <Label>Marca del Vehículo</Label>
                            <div className="searchable-select-container">
                                <input
                                    type="text"
                                    className="searchable-select-input"
                                    placeholder="Seleccionar Marca..."
                                    value={formData.marca || brandSearch}
                                    onChange={(e) => {
                                        setBrandSearch(e.target.value);
                                        setFormData({ ...formData, marca: '', modelo: '' }); // Check if typed matches, otherwise filtering
                                        setIsBrandDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsBrandDropdownOpen(true)}
                                    style={{ height: '38px' }} // Match other inputs
                                    required
                                />
                                <ChevronDown size={20} className={`searchable-select-arrow ${isBrandDropdownOpen ? 'open' : ''}`} onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)} />
                                {isBrandDropdownOpen && (
                                    <ul className="searchable-select-dropdown">
                                        {filteredBrands.map((brand, i) => (
                                            <li key={i} className="searchable-select-option" onClick={() => {
                                                setFormData({ ...formData, marca: brand, modelo: '' });
                                                setBrandSearch('');
                                                setIsBrandDropdownOpen(false);
                                            }}>
                                                {brand}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </FormGroup>

                        {/* Model Selection */}
                        <FormGroup ref={modelWrapperRef}>
                            <Label>Modelo</Label>
                            <div className="searchable-select-container">
                                {isCustomModel || (formData.marca && availableModels.length === 0) ? (
                                    <input
                                        type="text"
                                        className="searchable-select-input"
                                        placeholder="Escribe el modelo..."
                                        value={formData.modelo}
                                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                        style={{ height: '38px' }}
                                        required
                                    />
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            className="searchable-select-input"
                                            placeholder={formData.marca ? "Seleccionar Modelo..." : "Primero selecciona marca"}
                                            value={formData.modelo}
                                            readOnly
                                            onClick={() => formData.marca && setIsModelDropdownOpen(!isModelDropdownOpen)}
                                            style={{ cursor: formData.marca ? 'pointer' : 'not-allowed', opacity: formData.marca ? 1 : 0.6, height: '38px' }}
                                            required
                                        />
                                        <ChevronDown size={20} className={`searchable-select-arrow ${isModelDropdownOpen ? 'open' : ''}`} />
                                        {isModelDropdownOpen && (
                                            <ul className="searchable-select-dropdown">
                                                {availableModels.map((model, i) => (
                                                    <li key={i} className="searchable-select-option" onClick={() => {
                                                        setFormData({ ...formData, modelo: model });
                                                        setIsModelDropdownOpen(false);
                                                    }}>
                                                        {model}
                                                    </li>
                                                ))}
                                                <li className="searchable-select-option create-new" onClick={() => {
                                                    setIsCustomModel(true);
                                                    setFormData({ ...formData, modelo: '' });
                                                    setIsModelDropdownOpen(false);
                                                }}>
                                                    + Escribir otro modelo...
                                                </li>
                                            </ul>
                                        )}
                                    </>
                                )}
                            </div>
                        </FormGroup>

                        {/* Year and Position Row */}
                        <FormGroup>
                            <Label>Año</Label>
                            <SearchInput
                                type="text"
                                placeholder="Ej: 2015-2020"
                                value={formData.año}
                                onChange={(e) => setFormData({ ...formData, año: e.target.value })}
                                style={{ paddingLeft: '0.8rem' }} // Override to standard
                            />
                        </FormGroup>

                        <FormGroup ref={positionWrapperRef}>
                            <Label>Posición</Label>
                            <div className="searchable-select-container">
                                <input
                                    type="text"
                                    className="searchable-select-input"
                                    value={formData.posicion}
                                    readOnly
                                    onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                                    style={{ cursor: 'pointer', height: '38px' }}
                                />
                                <ChevronDown
                                    size={20}
                                    className={`searchable-select-arrow ${isPositionDropdownOpen ? 'open' : ''}`}
                                    onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                                />
                                {isPositionDropdownOpen && (
                                    <ul className="searchable-select-dropdown">
                                        {['DELANTERA', 'TRASERA', 'AMBAS'].map((pos) => (
                                            <li
                                                key={pos}
                                                className={`searchable-select-option ${formData.posicion === pos ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setFormData({ ...formData, posicion: pos as any });
                                                    setIsPositionDropdownOpen(false);
                                                }}
                                            >
                                                {pos}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </FormGroup>

                        <FormGroup style={{ gridColumn: 'span 2' }}>
                            <Label>Notas Adicionales (Opcional)</Label>
                            <TextArea
                                rows={2}
                                placeholder="Cualquier detalle extra..."
                                value={formData.notas}
                                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                            />
                        </FormGroup>

                        <ButtonGroup style={{ gridColumn: 'span 2' }}>
                            <Button type="button" onClick={closeSuggestAppModal} variant="secondary">
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting || !searchTerm || !formData.marca || !formData.modelo}>
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {isSubmitting ? 'Enviando...' : 'Enviar Sugerencia'}
                            </Button>
                        </ButtonGroup>

                    </Form>
                ) : (
                    <SuccessView>
                        <SuccessIcon>
                            <Check size={32} />
                        </SuccessIcon>
                        <h3>¡Sugerencia Recibida!</h3>
                        <p>
                            Gracias por contribuir. Revisaremos la compatibilidad para <strong>{formData.marca} {formData.modelo}</strong> con la referencia <strong>{searchTerm}</strong>.
                        </p>
                    </SuccessView>
                )}
            </Container>
        </Modal>
    );
};

// Reusing Styled Components from ReportModal for consistency
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HeaderNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background-color: rgba(59, 130, 246, 0.1); /* Blue tint */
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  width: 100%;

  p { margin: 0; text-align: center; width: 100%; }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Balanced 2 columns */
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const InputBase = `
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;

  &:focus {
    background: var(--bg-primary);
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 4px rgba(64, 112, 244, 0.1), var(--shadow-sm);
    transform: translateY(-1px);
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
  z-index: 2;
  display: flex;
`;

const SearchInput = styled.input`
  ${InputBase}
  height: 38px; /* Slightly taller */
  padding: 0 2.5rem 0 2.5rem;
  font-family: 'JetBrains Mono', monospace; 

  &::placeholder {
    font-family: 'Inter', sans-serif;
  }
`;

const TextArea = styled.textarea`
  ${InputBase}
  padding: 0.5rem 0.8rem;
  resize: none;
  min-height: 42px;
  overflow-y: auto;
  line-height: 1.5;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--border-secondary);
    border-radius: 4px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all var(--transition-base);

  ${props => props.variant === 'primary' ? `
    background: var(--accent-primary); /* Blue primary */
    color: white;
    border: none;
    box-shadow: var(--shadow-md);

    &:hover {
      background: var(--accent-secondary); 
      transform: translateY(-1px);
    }
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
  ` : `
    background: transparent;
    border: 1px solid var(--border-primary);
    color: var(--text-secondary);

    &:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-secondary);
      color: var(--text-primary);
    }
  `}
`;

const SuccessView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  gap: 1rem;

  h3 {
    font-size: 1.25rem;
    color: var(--text-primary);
  }
  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    max-width: 350px;
  }
`;

const SuccessIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

export default SuggestAppModal;
