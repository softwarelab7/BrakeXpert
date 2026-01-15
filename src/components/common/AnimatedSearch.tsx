import React from 'react';
import styled from 'styled-components';

interface AnimatedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const AnimatedSearch = React.forwardRef<HTMLInputElement, AnimatedSearchProps>(({ value, onChange, placeholder }, ref) => {
  const handleReset = () => {
    onChange('');
    if (ref && 'current' in ref && ref.current) {
      ref.current.focus();
    }
  };

  return (
    <StyledWrapper>
      <form className="form relative" onSubmit={(e) => e.preventDefault()}>
        <button className="icon-btn search-btn" type="submit">
          <svg width={17} height={16} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search" className="icon-svg">
            <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <input
          ref={ref}
          className="input"
          placeholder={placeholder || "Search..."}
          required
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="icon-btn reset-btn" onClick={handleReset} style={{ display: value ? 'flex' : 'none' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </form>
    </StyledWrapper>
  );
});

AnimatedSearch.displayName = 'AnimatedSearch';

const StyledWrapper = styled.div`
  width: 100%;
  
  .form {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
  }

  .input {
    width: 100%;
    border-radius: 9999px;
    padding: 0.65rem 2.8rem 0.65rem 2.5rem; /* Extra padding on right for clear btn */
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

  .search-btn {
    left: 8px;
    pointer-events: none;
  }

  .reset-btn {
    right: 8px;
    color: var(--text-tertiary);
    border-radius: 50%;
  }

  .reset-btn:hover {
    background: rgba(0, 0, 0, 0.05); /* Subtle dark hover */
    color: var(--color-danger); /* Red on hover */
  }

  .icon-svg {
    width: 18px;
    height: 18px;
  }
`;

export default AnimatedSearch;
