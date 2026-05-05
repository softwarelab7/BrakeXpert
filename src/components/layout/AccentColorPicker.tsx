import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Palette } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import StyledIconButton from '../common/StyledIconButton';

const PRESET_COLORS = [
    { name: 'blue', value: '#3b82f6' },
    { name: 'indigo', value: '#6366f1' },
    { name: 'violet', value: '#8b5cf6' },
    { name: 'purple', value: '#a855f7' },
    { name: 'pink', value: '#ec4899' },
    { name: 'red', value: '#ef4444' },
    { name: 'orange', value: '#f97316' },
    { name: 'amber', value: '#f59e0b' },
    { name: 'green', value: '#22c55e' },
    { name: 'teal', value: '#14b8a6' },
    { name: 'cyan', value: '#06b6d4' },
];

const AccentColorPicker = () => {
    const { accentColor, setAccentColor } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Apply color to CSS variables
    useEffect(() => {
        const selectedColor = PRESET_COLORS.find(c => c.name === accentColor);
        if (selectedColor) {
            document.documentElement.style.setProperty('--accent-primary', selectedColor.value);
            // Add a slightly dimmer version for borders/hover states if needed
            document.documentElement.style.setProperty('--accent-primary-dim', `${selectedColor.value}80`); // 50% opacity
        }
    }, [accentColor]);

    const handleColorSelect = (colorName: string) => {
        setAccentColor(colorName);
        setIsOpen(false);
    };

    return (
        <PickerContainer ref={pickerRef}>
            <StyledIconButton
                icon={<Palette />}
                tooltip="Color de énfasis"
                onClick={() => setIsOpen(!isOpen)}
                isActive={isOpen}
            />

            {isOpen && (
                <PaletteDropdown>
                    {PRESET_COLORS.map((color) => (
                        <ColorOption
                            key={color.name}
                            $color={color.value}
                            $isSelected={accentColor === color.name}
                            onClick={() => handleColorSelect(color.name)}
                            title={color.name}
                        />
                    ))}
                </PaletteDropdown>
            )}
        </PickerContainer>
    );
};

const PickerContainer = styled.div`
    position: relative;
`;

const PaletteDropdown = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background-color: var(--bg-secondary, #1e1e2e);
    border: 1px solid var(--border-primary, #ffffff20);
    border-radius: 12px;
    padding: 12px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 50;
    min-width: 160px;
    
    &::before {
        content: '';
        position: absolute;
        top: -5px;
        right: 14px;
        width: 10px;
        height: 10px;
        background-color: var(--bg-secondary, #1e1e2e);
        border-left: 1px solid var(--border-primary, #ffffff20);
        border-top: 1px solid var(--border-primary, #ffffff20);
        transform: rotate(45deg);
    }
`;

const ColorOption = styled.button<{ $color: string; $isSelected: boolean }>`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: ${props => props.$color};
    border: 2px solid ${props => props.$isSelected ? 'var(--text-primary, white)' : 'transparent'};
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s;
    padding: 0;

    &:hover {
        transform: scale(1.15);
    }
    
    &:active {
        transform: scale(0.95);
    }
`;

export default AccentColorPicker;
