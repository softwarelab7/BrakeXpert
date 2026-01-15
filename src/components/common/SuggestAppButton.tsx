import styled from 'styled-components';
import { useAppStore } from '../../store/useAppStore';

const SuggestAppButton = () => {
    const openSuggestAppModal = useAppStore(state => state.openSuggestAppModal);

    return (
        <StyledWrapper>
            <button className="SuggestButton" onClick={openSuggestAppModal}>
                {/* Plus Circle Icon custom styled to match BugButton aesthetics */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="suggest-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="tooltip">Sugerir App</span>
            </button>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  @media (max-width: 768px) {
    display: none;
  }

  .SuggestButton {
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
    overflow: hidden;
    color: var(--text-primary);
  }
  .SuggestButton svg {
    width: 65%; /* Slightly larger as the plus icon is thinner */
  }
  .SuggestButton:hover {
    background-color: rgba(61, 41, 71, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    overflow: visible;
  }
  .suggest-svg path {
    transition: all 0.2s;
  }
  .SuggestButton:active {
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
    min-width: 100px;
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
  .SuggestButton:hover .tooltip {
    opacity: 1;
  }`;

export default SuggestAppButton;
