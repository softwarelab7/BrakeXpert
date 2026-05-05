import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AlertTriangle, Check, Send, ChevronDown, Search, Loader2 } from 'lucide-react';
import styled from 'styled-components';
import Modal from '../modals/Modal';
import { useAppStore } from '../../store/useAppStore';
import { addReport } from '../../services/firebase';
import '../../styles/searchable-select.css';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string | null;
}

export default function ReportModal({ isOpen, onClose, referenceId }: ReportModalProps) {
  const products = useAppStore(state => state.products);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tipoError: 'medida',
    descripcion: ''
  });

  // Reference Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Error Type State
  const [isErrorDropdownOpen, setIsErrorDropdownOpen] = useState(false);
  const errorWrapperRef = useRef<HTMLDivElement>(null);

  const ERROR_TYPES = [
    { value: "medida", label: "Medidas incorrectas" },
    { value: "posicion", label: "Posición incorrecta" },
    { value: "foto", label: "Fotografía incorrecta" },
    { value: "aplicacion", label: "Aplicación incorrecta" },
    { value: "otro", label: "Otro problema" }
  ];

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      setIsSubmitting(false);
      setFormData({ tipoError: 'medida', descripcion: '' });
      setSearchTerm(referenceId || '');
      setIsDropdownOpen(false);
      setIsErrorDropdownOpen(false);
    }
  }, [isOpen, referenceId]);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (errorWrapperRef.current && !errorWrapperRef.current.contains(event.target as Node)) {
        setIsErrorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter references for autocomplete
  const filteredReferences = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    const refs = new Set<string>();

    // Limit to first 20 matches for performance
    let count = 0;
    for (const p of products) {
      if (count >= 20) break;

      const mainRef = p.referencia || '';
      if (mainRef.toLowerCase().includes(term)) {
        refs.add(mainRef);
        count++;
      }

      if (p.ref && Array.isArray(p.ref)) {
        for (const secondary of p.ref) {
          if (count >= 20) break;
          if (secondary && secondary.toLowerCase().includes(term)) {
            refs.add(secondary);
            count++;
          }
        }
      }
    }

    return Array.from(refs).sort();
  }, [products, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const selectedProduct = products.find(p =>
        p.referencia === searchTerm ||
        (p.ref && p.ref.includes(searchTerm))
      );

      await addReport({
        productId: selectedProduct?.id || 'unknown',
        productReference: searchTerm,
        description: `[${ERROR_TYPES.find(t => t.value === formData.tipoError)?.label}] ${formData.descripcion}`
      });

      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (error) {
      console.error("Error sending report:", error);
      alert("Hubo un error al enviar el reporte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectReference = (ref: string) => {
    setSearchTerm(ref);
    setIsDropdownOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={20} className="text-warning" />
          Reportar Problema
        </div>
      }
      size="large"
      allowOverflow={true}
    >
      <Container>
        {!showSuccess ? (
          <Form onSubmit={handleSubmit}>
            <HeaderNote style={{ gridColumn: 'span 2' }}>
              <p>Ayúdanos a mejorar el catálogo reportando errores en esta referencia.</p>
            </HeaderNote>

            <FormGroup ref={wrapperRef}>
              <Label>Referencia Afectada</Label>
              <SearchWrapper>
                <SearchIcon>
                  <Search size={16} />
                </SearchIcon>
                <SearchInput
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Escribe la referencia..."
                  autoComplete="off"
                  required
                />
                {isDropdownOpen && filteredReferences.length > 0 && (
                  <ul className="searchable-select-dropdown">
                    {filteredReferences.map((ref, idx) => (
                      <li
                        key={idx}
                        className="searchable-select-option"
                        onClick={() => handleSelectReference(ref)}
                      >
                        {ref}
                      </li>
                    ))}
                  </ul>
                )}
              </SearchWrapper>
            </FormGroup>

            <FormGroup ref={errorWrapperRef}>
              <Label>¿Cuál es el error?</Label>
              <div className="searchable-select-container">
                <input
                  type="text"
                  className="searchable-select-input"
                  style={{ cursor: 'pointer', caretColor: 'transparent' }}
                  value={ERROR_TYPES.find(e => e.value === formData.tipoError)?.label || ''}
                  readOnly
                  onClick={() => setIsErrorDropdownOpen(!isErrorDropdownOpen)}
                />
                <ChevronDown
                  className={`searchable-select-arrow ${isErrorDropdownOpen ? 'open' : ''}`}
                  size={16}
                  onClick={() => setIsErrorDropdownOpen(!isErrorDropdownOpen)}
                />

                {isErrorDropdownOpen && (
                  <ul className="searchable-select-dropdown">
                    {ERROR_TYPES.map((type) => (
                      <li
                        key={type.value}
                        className={`searchable-select-option ${formData.tipoError === type.value ? 'selected' : ''}`}
                        onClick={() => {
                          setFormData({ ...formData, tipoError: type.value });
                          setIsErrorDropdownOpen(false);
                        }}
                      >
                        {type.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </FormGroup>

            <FormGroup style={{ gridColumn: 'span 2' }}>
              <Label>Detalles adicionales</Label>
              <TextArea
                rows={4}
                placeholder="Describe el error brevemente para que podamos corregirlo..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                required
              />
            </FormGroup>

            <ButtonGroup style={{ gridColumn: 'span 2' }}>
              <Button type="button" onClick={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting || !searchTerm || !formData.descripcion}>
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
              </Button>
            </ButtonGroup>
          </Form>
        ) : (
          <SuccessView>
            <SuccessIcon>
              <Check size={32} />
            </SuccessIcon>
            <h3>¡Reporte Enviado!</h3>
            <p>
              Gracias por tu colaboración. Revisaremos la referencia <strong>{searchTerm}</strong> lo antes posible.
            </p>
          </SuccessView>
        )}
      </Container>
    </Modal>
  );
}

// Styled Components maintaining design consistency
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HeaderNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background-color: rgba(245, 158, 11, 0.1); 
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  width: 100%;

  p {
    margin: 0;
    text-align: center;
    width: 100%;
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

// New styles for searchable input
const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.85rem; /* Match searchable-select padding-left roughly or align with text */
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
  z-index: 2;
  display: flex; /* Ensure icon centers */
`;

const SearchInput = styled.input`
  ${InputBase}
  height: 34px;
  padding: 0 2.5rem 0 2.5rem; /* Left padding for icon */
  font-family: 'JetBrains Mono', monospace; 

  /* Placeholder style override if needed */
  &::placeholder {
    font-family: 'Inter', sans-serif;
  }

  @media (max-width: 768px) {
    height: 50px;
    font-size: 1rem;
  }
`;

const TextArea = styled.textarea`
  ${InputBase}
  padding: 0.8rem;
  resize: none;
  min-height: 100px;
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
  padding: 0.625rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all var(--transition-base);

  ${props => props.variant === 'primary' ? `
    background: var(--color-danger);
    color: white;
    border: none;
    box-shadow: var(--shadow-md);

    &:hover {
      background: #dc2626; /* Darker red */
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
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
    max-width: 300px;
  }
`;

const SuccessIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--color-success-glow);
  color: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  
  svg {
    stroke-width: 3px;
  }
`;
