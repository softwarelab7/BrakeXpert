import { useState, useRef, useEffect, useMemo } from 'react';
import '../../styles/searchable-select.css';
import { ChevronDown } from 'lucide-react';

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
}

const SearchableSelect = ({
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    className = ''
}: SearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync search term with value prop when it changes externally
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Reset search term to selected value if user didn't select anything
                if (searchTerm !== value) {
                    // Optional: Decide if we want to clear text or revert. 
                    // Current behavior: Leave it as text input allows for free text searching if supported,
                    // but here we are mimicking select. Let's revert to value for consistency if strict.
                    // But user might be typing a partial query.
                    // Reverting for now to ensure state consistency with parent.
                    setSearchTerm(value);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [searchTerm, value]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        const lowerTerm = searchTerm.toLowerCase();
        return options.filter(opt =>
            opt.toLowerCase().includes(lowerTerm)
        );
    }, [options, searchTerm]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        onChange(newValue); // Update parent immediately to allow typing flow
        setIsOpen(true);
    };

    const handleOptionClick = (option: string) => {
        setSearchTerm(option);
        onChange(option);
        setIsOpen(false);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const toggleDropdown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className={`searchable-select-container ${className}`} ref={wrapperRef}>
            <input
                type="text"
                className="searchable-select-input"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onClick={() => !isOpen && setIsOpen(true)} // Only open on click if closed, to avoid fighting with toggle
            />
            <div
                className={`searchable-select-arrow ${isOpen ? 'open' : ''}`}
                onMouseDown={toggleDropdown} // Use onMouseDown to prevent focus loss issues
            >
                <ChevronDown size={16} />
            </div>

            {isOpen && (
                <ul className="searchable-select-dropdown">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <li
                                key={option}
                                className={`searchable-select-option ${option === value ? 'selected' : ''}`}
                                onClick={() => handleOptionClick(option)}
                            >
                                {option}
                            </li>
                        ))
                    ) : (
                        <li className="searchable-select-no-options">
                            No se encontraron resultados
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default SearchableSelect;
