import React from 'react';
import styled from 'styled-components';

interface StyledHeaderIconButtonProps {
    onClick: () => void;
    tooltip: string;
    icon: React.ReactNode;
    badgeCount?: number;
    className?: string; // For any extra spacing if needed
}

const StyledHeaderIconButton = ({ onClick, tooltip, icon, badgeCount, className }: StyledHeaderIconButtonProps) => {
    return (
        <StyledWrapper className={className}>
            <button className="HeaderButton" onClick={onClick}>
                {icon}
                {badgeCount !== undefined && badgeCount > 0 && (
                    <span className="badge">{badgeCount}</span>
                )}
                <span className="tooltip">{tooltip}</span>
            </button>
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
  .HeaderButton {
    width: 40px;
    height: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background-color: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    /* overflow: visible;  Ensure badge and tooltip are visible */
  }

  /* Icon sizing to match general scale */
  .HeaderButton svg {
    width: 20px;
    height: 20px;
    color: var(--text-secondary, #333); /* Use theme var or fallback */
    transition: all 0.2s;
  }

  .HeaderButton:hover {
    background-color: rgba(61, 41, 71, 0.1);
  }

  /* Icon color on hover - match the BugButton's contrast logic? 
     BugButton kept it black. Let's keep it theme aware but consistent.
  */
  .HeaderButton:hover svg {
    /* stroke: #000;  If icons are stroke-based */
    /* color: #000; */
    transform: scale(1.1);
  }

  .HeaderButton:active {
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
    min-width: max-content; /* Allow text to fit */
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

  .HeaderButton:hover .tooltip {
    opacity: 1;
  }

  /* Badge Styling */
  .badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background-color: var(--accent-primary, #3b82f6);
    color: white;
    font-size: 0.65rem;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    pointer-events: none;
    box-shadow: 0 0 0 2px var(--bg-primary, #fff); /* border effect */
  }
`;

export default StyledHeaderIconButton;
