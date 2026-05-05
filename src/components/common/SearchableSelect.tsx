import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import '../../styles/searchable-select.css';
import { ChevronDown } from 'lucide-react';
import { buildHighlightSegments, normalizeText } from '../../utils/search';

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
    multiline?: boolean;
}

/**
 * Fuzzy-filters options and returns them with match indices for highlighting.
 * Uses a simple substring match on normalized text with scored ranking:
 * - Exact prefix match → score 0
 * - Substring match    → score 1
 * - Individual words all match → score 2
 */
const fuzzyFilterOptions = (
    options: string[],
    term: string
): { option: string; indices: [number, number][] }[] => {
    if (!term) return options.map(o => ({ option: o, indices: [] }));

    const norm = normalizeText(term);
    const results: { option: string; indices: [number, number][]; score: number }[] = [];

    for (const option of options) {
        const normOption = normalizeText(option);

        // Exact prefix
        if (normOption.startsWith(norm)) {
            results.push({ option, indices: [[0, norm.length - 1]], score: 0 });
            continue;
        }

        // Substring match
        const idx = normOption.indexOf(norm);
        if (idx !== -1) {
            results.push({ option, indices: [[idx, idx + norm.length - 1]], score: 1 });
            continue;
        }

        // All individual words present anywhere (fuzzy word match)
        const words = norm.split(/\s+/).filter(Boolean);
        if (words.length > 1) {
            const allMatch = words.every(w => normOption.includes(w));
            if (allMatch) {
                // Find first match indices for first word
                const firstIdx = normOption.indexOf(words[0]);
                results.push({ option, indices: [[firstIdx, firstIdx + words[0].length - 1]], score: 2 });
            }
        }
    }

    results.sort((a, b) => a.score - b.score);
    return results.map(r => ({ option: r.option, indices: r.indices }));
};

const SearchableSelect = ({
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    className = '',
    multiline = false
}: SearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => { setSearchTerm(value); }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (searchTerm !== value) setSearchTerm(value);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [searchTerm, value]);

    const filteredOptions = useMemo(
        () => fuzzyFilterOptions(options, searchTerm),
        [options, searchTerm]
    );

    // Scroll active item into view
    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const item = listRef.current.children[activeIndex] as HTMLElement;
            item?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        onChange(newValue);
        setIsOpen(true);
        setActiveIndex(-1);
    };

    const handleOptionClick = useCallback((option: string) => {
        setSearchTerm(option);
        onChange(option);
        setIsOpen(false);
        setActiveIndex(-1);
    }, [onChange]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
                return;
            }
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, filteredOptions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, -1));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            handleOptionClick(filteredOptions[activeIndex].option);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };

    const toggleDropdown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(o => !o);
    };

    return (
        <div className={`searchable-select-container ${className}`} ref={wrapperRef}>
            {multiline ? (
                <textarea
                    className="searchable-select-input multiline"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{ resize: 'none', height: '68px', paddingTop: '8px', lineHeight: '1.4' }}
                />
            ) : (
                <input
                    type="text"
                    className="searchable-select-input"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                />
            )}

            <div
                className={`searchable-select-arrow ${isOpen ? 'open' : ''}`}
                onMouseDown={toggleDropdown}
            >
                <ChevronDown size={16} />
            </div>

            {isOpen && (
                <ul className="searchable-select-dropdown" ref={listRef} role="listbox">
                    {filteredOptions.length > 0 ? filteredOptions.map(({ option, indices }, i) => {
                        const segments = buildHighlightSegments(option, indices);
                        return (
                            <li
                                key={option}
                                role="option"
                                aria-selected={option === value}
                                className={`searchable-select-option ${option === value ? 'selected' : ''} ${i === activeIndex ? 'active' : ''}`}
                                onMouseDown={() => handleOptionClick(option)}
                                onMouseEnter={() => setActiveIndex(i)}
                            >
                                {segments.map((seg, j) =>
                                    seg.highlight
                                        ? <mark key={j} className="search-highlight">{seg.text}</mark>
                                        : <span key={j}>{seg.text}</span>
                                )}
                            </li>
                        );
                    }) : (
                        <li className="searchable-select-no-options">Sin resultados</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default SearchableSelect;
