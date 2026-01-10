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
  size?: 'small' | 'default'; // New prop
}

const StyledIconButton = ({
  onClick,
  tooltip,
  icon,
  badgeCount,
  className,
  isActive = false,
  activeColor,
  size = 'default'
}: StyledIconButtonProps) => {
  return (
    <StyledWrapper className={className} $isActive={isActive} $activeColor={activeColor} $size={size}>
      <button className="IconButton" onClick={onClick}>
        {icon}
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="badge">{badgeCount}</span>
        )}
        <span className="tooltip">{tooltip}</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $isActive: boolean; $activeColor?: string; $size: 'small' | 'default' }>`
  .IconButton {
    width: ${props => props.$size === 'small' ? '32px' : '40px'};
    height: ${props => props.$size === 'small' ? '32px' : '40px'};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background-color: ${props => props.$isActive ? (props.$activeColor ? `${props.$activeColor}20` : 'rgba(61, 41, 71, 0.1)') : 'transparent'};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
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
  }

  .IconButton:hover svg {
    color: ${props => props.$activeColor || '#000'};
    transform: scale(1.1);
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
    top: -4px;
    right: -4px;
    background-color: ${props => props.$activeColor || 'var(--accent-primary, #3b82f6)'};
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    width: 18px;          /* Fixed width */
    height: 18px;         /* Fixed height */
    min-width: 18px;      /* Ensure it doesn't shrink */
    border-radius: 50%;   /* Perfect circle */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;           /* crucial for centering */
    line-height: 1;
    pointer-events: none;
    box-shadow: none;
  }
`;

export default StyledIconButton;
