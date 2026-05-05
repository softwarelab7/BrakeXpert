
import styled from 'styled-components';
import { useAppStore } from '../../store/useAppStore';

const BugReportButton = () => {
  const openReportModal = useAppStore(state => state.openReportModal);

  return (
    <StyledWrapper>
      <button className="BugButton" onClick={openReportModal}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 43 42" className="bugsvg" style={{ color: 'var(--text-primary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} stroke="currentColor" d="M20 7H23C26.866 7 30 10.134 30 14V28.5C30 33.1944 26.1944 37 21.5 37C16.8056 37 13 33.1944 13 28.5V14C13 10.134 16.134 7 20 7Z" />
          <path strokeLinecap="round" strokeWidth={4} stroke="currentColor" d="M18 2V7" />
          <path strokeLinecap="round" strokeWidth={4} stroke="currentColor" d="M25 2V7" />
          <path strokeLinecap="round" strokeWidth={4} stroke="currentColor" d="M31 22H41" />
          <path strokeLinecap="round" strokeWidth={4} stroke="currentColor" d="M2 22H12" />
          <path strokeLinecap="round" strokeWidth={4} stroke="currentColor" d="M12.5785 15.2681C3.5016 15.2684 4.99951 12.0004 5 4" />
          <path strokeLinecap="round" strokeWidth={4} stroke="currentColor" d="M12.3834 29.3877C3.20782 29.3874 4.72202 32.4736 4.72252 40.0291" />
          <path strokeLinecap="round" strokeWidth={4} stroke="currentColor" d="M30.0003 14.8974C39.0545 15.553 37.7958 12.1852 38.3718 4.20521" />
          <path strokeLinecap="round" strokeWidth={4} stroke="currentColor" d="M29.9944 29.7379C39.147 29.1188 37.8746 32.2993 38.4568 39.8355" />
        </svg>
        <span className="tooltip">Reportar Error</span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  @media (max-width: 768px) {
    display: none;
  }

  .BugButton {
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
  }
  .BugButton svg {
    width: 44%;
  }
  .BugButton:hover {
    background-color: rgba(61, 41, 71, 0.1); /* Match StyledIconButton hover */
    /* border: 1px solid var(--border-primary); Remove border to match others (unless desired, but standard usually has none or transparent) */
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    overflow: visible;
  }
  .bugsvg path {
    transition: all 0.2s;
  }
  /* Removed white stroke on hover to maintain contrast with light background
  .BugButton:hover .bugsvg path {
    stroke: #fff;
  } 
  */
  .BugButton:active {
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
  .BugButton:hover .tooltip {
    opacity: 1;
  }`;

export default BugReportButton;
