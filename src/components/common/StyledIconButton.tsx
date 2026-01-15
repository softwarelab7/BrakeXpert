import React from 'react';
import styled from 'styled-components';

interface StyledIconButtonProps {
  onClick: () => void;
  tooltip: string;
  icon: React.ReactNode;
  badgeCount?: number;
  className?: string;
  isActive?: boolean;
  activeColor?: string;
  size?: 'small' | 'default';
  label?: string; // New prop for generic text support
}

const StyledIconButton = ({
  onClick,
  tooltip,
  icon,
  badgeCount,
  className,
  isActive = false,
  activeColor,
  size = 'default',
  label
}: StyledIconButtonProps) => {
  return (
    <StyledWrapper
      className={className}
      $isActive={isActive}
      $activeColor={activeColor}
      $size={size}
      $hasLabel={!!label}
    >
      <button className="IconButton" onClick={onClick}>
        {icon}
        {label && <span className="label-text">{label}</span>}
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="badge">{badgeCount}</span>
        )}
        {!label && <span className="tooltip">{tooltip}</span>}
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{
  $isActive: boolean;
  $activeColor?: string;
  $size: 'small' | 'default';
  $hasLabel: boolean;
}>`
  .IconButton {
    width: ${props => props.$hasLabel ? '100%' : (props.$size === 'small' ? '32px' : '40px')};
    height: ${props => props.$size === 'small' ? '32px' : '40px'};
    display: flex;
    flex-direction: ${props => props.$hasLabel ? 'row' : 'column'};
    align-items: center;
    justify-content: center;
    gap: ${props => props.$hasLabel ? '8px' : '3px'};
    background-color: ${props => props.$isActive ? (props.$activeColor ? `${props.$activeColor}20` : 'rgba(61, 41, 71, 0.1)') : 'transparent'};
    border: ${props => props.$hasLabel ? '1px solid var(--border-primary)' : 'none'};
    border-color: ${props => props.$isActive && props.$hasLabel ? (props.$activeColor || 'var(--accent-primary)') : 'var(--border-primary)'};
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    padding: ${props => props.$hasLabel ? '0 12px' : '0'};
  }

  .label-text {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${props => props.$isActive ? (props.$activeColor || 'var(--text-primary, #000)') : 'var(--text-secondary, #333)'};
    white-space: nowrap;
  }

  /* Icon sizing to match general scale */
  .IconButton svg {
    width: ${props => props.$size === 'small' ? '16px' : '20px'};
    height: ${props => props.$size === 'small' ? '16px' : '20px'};
    color: ${props => props.$isActive ? (props.$activeColor || 'var(--text-primary, #000)') : 'var(--text-secondary, #333)'};
    transition: all 0.2s;
    /* Ensure strokes are legible */
    stroke-width: 2px;
  }

  .IconButton:hover {
    background-color: ${props => props.$isActive ? (props.$activeColor ? `${props.$activeColor}30` : 'rgba(61, 41, 71, 0.15)') : 'rgba(61, 41, 71, 0.1)'};
    border-color: ${props => props.$hasLabel ? (props.$activeColor || 'var(--accent-primary)') : 'transparent'};
  }

  .IconButton:hover svg,
  .IconButton:hover .label-text {
    color: ${props => props.$activeColor || 'var(--text-primary)'};
  }

  .IconButton:hover svg {
    transform: ${props => props.$hasLabel ? 'scale(1.1)' : 'scale(1.1)'}; /* Scale icon in both cases */
  }

  .IconButton:active {
    transform: scale(0.98);
  }

  .tooltip {
    --tooltip-color: rgb(41, 41, 41);
    position: absolute;
    top: 50px;
    background-color: var(--tooltip-color);
    color: white;
    border-radius: 5px;
    font-size: 12px;
    padding: 8px 12px;
    font-weight: 600;
    box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.105);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.5s;
    min-width: max-content;
    white-space: nowrap;
    pointer-events: none;
    z-index: 1000;
  }
  
  .tooltip::before {
    position: absolute;
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
    content: "";
    background-color: var(--tooltip-color);
    top: -5px;
  }

  .IconButton:hover .tooltip {
    opacity: 1;
  }

  /* Badge Styling */
  .badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background-color: ${props => props.$activeColor || 'var(--accent-primary, #3b82f6)'};
    color: white;
    font-size: 0.6rem;
    font-weight: 700;
    height: 14px;
    min-width: 14px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
    line-height: 1;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    font-variant-numeric: tabular-nums;
  }
`;

export default StyledIconButton;
