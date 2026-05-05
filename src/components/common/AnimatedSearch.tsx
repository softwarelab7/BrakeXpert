import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useAppStore } from '../../store/useAppStore';
import { buildHighlightSegments, normalizeText } from '../../utils/search';

interface AnimatedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MAX_SUGGESTIONS = 8;

/**
 * Builds reference suggestions from all products matching the current query.
 * Returns up to MAX_SUGGESTIONS unique reference strings with match indices.
 */
const buildSuggestions = (
  query: string,
  refs: { value: string; indices: [number, number][] }[]
): { value: string; indices: [number, number][] }[] => {
  if (!query || query.length < 2) return [];
  return refs.slice(0, MAX_SUGGESTIONS);
};

const AnimatedSearch = React.forwardRef<HTMLInputElement, AnimatedSearchProps>(
  ({ value, onChange, placeholder }, ref) => {
    const products = useAppStore(state => state.products);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const handleReset = () => {
      onChange('');
      setIsOpen(false);
      if (ref && 'current' in ref && ref.current) ref.current.focus();
    };

    // Build flat reference list from all products (memoized on products)
    const allRefs = useMemo(() => {
      const seen = new Set<string>();
      const result: string[] = [];
      for (const p of products) {
        const refs = [
          p.referencia,
          ...(p.ref || []),
          ...(p.oem || []),
          ...(p.fmsi || []),
          p.wva,
        ].filter(Boolean) as string[];
        for (const r of refs) {
          const parts = r.split(/\s+/);
          for (const part of parts) {
            if (part.length > 1 && !seen.has(part)) {
              seen.add(part);
              result.push(part);
            }
          }
        }
      }
      return result.sort();
    }, [products]);

    // Filter suggestions matching current query
    const suggestions = useMemo(() => {
      if (!value || value.length < 2) return [];
      const norm = normalizeText(value);
      const matched: { value: string; indices: [number, number][] }[] = [];

      for (const ref of allRefs) {
        const normRef = normalizeText(ref);
        const idx = normRef.indexOf(norm);
        if (idx !== -1 && normRef !== norm) {
          matched.push({ value: ref, indices: [[idx, idx + norm.length - 1]] });
          if (matched.length >= MAX_SUGGESTIONS) break;
        }
      }

      return buildSuggestions(value, matched);
    }, [value, allRefs]);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
      if (activeIndex >= 0 && listRef.current) {
        const item = listRef.current.children[activeIndex] as HTMLElement;
        item?.scrollIntoView({ block: 'nearest' });
      }
    }, [activeIndex]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
      setIsOpen(true);
      setActiveIndex(-1);
    };

    const handleSelect = (val: string) => {
      onChange(val);
      setIsOpen(false);
      setActiveIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, -1));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex].value);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    const showDropdown = isOpen && suggestions.length > 0;

    return (
      <StyledWrapper ref={wrapperRef}>
        <form className="form relative" onSubmit={(e) => e.preventDefault()}>
          <button className="icon-btn search-btn" type="submit">
            <svg width={17} height={16} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" className="icon-svg">
              <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <input
            ref={ref}
            className="input"
            placeholder={placeholder || 'Buscar...'}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => value.length >= 2 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <button
            type="button"
            className="icon-btn reset-btn"
            onClick={handleReset}
            style={{ display: value ? 'flex' : 'none' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>

        {showDropdown && (
          <ul className="suggestions-dropdown" ref={listRef} role="listbox">
            {suggestions.map(({ value: sug, indices }, i) => {
              const segments = buildHighlightSegments(sug, indices);
              return (
                <li
                  key={sug}
                  role="option"
                  className={`suggestion-item ${i === activeIndex ? 'active' : ''}`}
                  onMouseDown={() => handleSelect(sug)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  {segments.map((seg, j) =>
                    seg.highlight
                      ? <mark key={j} className="search-highlight">{seg.text}</mark>
                      : <span key={j}>{seg.text}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </StyledWrapper>
    );
  }
);

AnimatedSearch.displayName = 'AnimatedSearch';

const StyledWrapper = styled.div`
  width: 100%;
  position: relative;

  .form {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
  }

  .input {
    width: 100%;
    border-radius: 9999px;
    padding: 0.65rem 2.8rem 0.65rem 2.5rem;
    border: 1px solid var(--border-primary);
    outline: none;
    background: var(--bg-secondary);
    color: var(--text-primary);
    transition: all 0.3s ease;
    box-shadow: var(--shadow-md);
    font-size: 0.9rem;
    font-weight: 500;
  }

  .input:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 4px var(--accent-primary-glow);
    background: var(--bg-primary);
  }

  .input::placeholder {
    color: var(--text-muted);
    font-weight: 400;
  }

  .icon-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 6px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s;
    z-index: 10;
  }

  .search-btn { left: 8px; pointer-events: none; }

  .reset-btn {
    right: 8px;
    color: var(--text-tertiary);
    border-radius: 50%;
  }

  .reset-btn:hover {
    background: rgba(0,0,0,0.05);
    color: var(--color-danger);
  }

  .icon-svg { width: 18px; height: 18px; }

  /* Suggestions dropdown */
  .suggestions-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    width: 100%;
    max-height: 220px;
    overflow-y: auto;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 0.75rem;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
    z-index: 200;
    padding: 0.3rem;
    list-style: none;
    margin: 0;
    animation: dropdownSlideIn 0.15s ease forwards;
    opacity: 0;
    transform: translateY(-6px);
  }

  @keyframes dropdownSlideIn {
    to { opacity: 1; transform: translateY(0); }
  }

  .suggestion-item {
    padding: 0.5rem 0.85rem;
    cursor: pointer;
    font-size: 0.83rem;
    font-weight: 500;
    color: var(--text-primary);
    border-radius: 0.5rem;
    transition: background 0.15s;
    font-family: monospace;
    letter-spacing: 0.03em;
  }

  .suggestion-item:hover,
  .suggestion-item.active {
    background: var(--accent-primary);
    color: white;
  }

  .suggestion-item:hover .search-highlight,
  .suggestion-item.active .search-highlight {
    background: transparent;
    color: white;
    font-weight: 800;
  }

  .suggestions-dropdown::-webkit-scrollbar { width: 5px; }
  .suggestions-dropdown::-webkit-scrollbar-track { background: transparent; }
  .suggestions-dropdown::-webkit-scrollbar-thumb {
    background: var(--text-tertiary);
    border-radius: 3px;
  }
`;

export default AnimatedSearch;
