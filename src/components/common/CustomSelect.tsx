import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: number | string;
    label: string;
}

interface CustomSelectProps {
    value: number | string;
    options: Option[];
    onChange: (value: any) => void;
    placeholder?: string;
    className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    value,
    options,
    onChange,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: number | string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div
            className={`custom-select-container ${className}`}
            ref={containerRef}
        >
            <button
                type="button"
                className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="selected-value">
                    {selectedOption ? selectedOption.label : value}
                </span>
                <ChevronDown size={14} className={`chevron-icon ${isOpen ? 'rotate' : ''}`} />
            </button>

            {isOpen && (
                <ul className="custom-select-options">
                    {options.map((option) => (
                        <li
                            key={option.value}
                            className={`custom-option ${option.value === value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            <span>{option.label}</span>
                            {option.value === value && <Check size={14} className="check-icon" />}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomSelect;
