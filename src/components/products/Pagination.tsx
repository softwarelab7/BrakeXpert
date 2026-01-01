import { ChevronLeft, ChevronRight } from 'lucide-react';
import styled from 'styled-components';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = 1;
        let endPage = totalPages;

        if (totalPages > maxVisiblePages) {
            if (currentPage <= 3) {
                endPage = maxVisiblePages;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - 4;
            } else {
                startPage = currentPage - 2;
                endPage = currentPage + 2;
            }
        }

        // Add first page if not in range
        if (startPage > 1) {
            pages.push(
                <div className="tab-group" key={1}>
                    <input
                        id={`page-1`}
                        name="pagination"
                        type="radio"
                        checked={currentPage === 1}
                        onChange={() => onPageChange(1)}
                    />
                    <label htmlFor={`page-1`}>
                        <span>1</span>
                    </label>
                </div>
            );
            if (startPage > 2) {
                pages.push(<span key="dots-start" className="page-dots">...</span>);
            }
        }

        // Render main range
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <div className="tab-group" key={i}>
                    <input
                        id={`page-${i}`}
                        name="pagination"
                        type="radio"
                        checked={currentPage === i}
                        onChange={() => onPageChange(i)}
                    />
                    <label htmlFor={`page-${i}`}>
                        <span>{i}</span>
                    </label>
                </div>
            );
        }

        // Add last page if not in range
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="dots-end" className="page-dots">...</span>);
            }
            pages.push(
                <div className="tab-group" key={totalPages}>
                    <input
                        id={`page-${totalPages}`}
                        name="pagination"
                        type="radio"
                        checked={currentPage === totalPages}
                        onChange={() => onPageChange(totalPages)}
                    />
                    <label htmlFor={`page-${totalPages}`}>
                        <span>{totalPages}</span>
                    </label>
                </div>
            );
        }

        return pages;
    };

    return (
        <StyledWrapper>
            <div className="pagination-container">
                <button
                    className="nav-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Anterior"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="tabs">
                    {renderPageNumbers()}
                </div>

                <button
                    className="nav-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Siguiente"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
  .pagination-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 36px; /* Reduced from 48px */
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 8px;
  }

  .nav-btn:hover:not(:disabled) {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .page-dots {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
    font-size: 1rem;
    padding: 0 2px;
  }

  /* User Provided Styles - Scaled Down (~75%) */
  .tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .tab-group input {
    appearance: none;
    display: none; 
  }

  .tab-group label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px; /* Reduced from 48px */
    height: 36px; /* Reduced from 48px */
    line-height: 1;
    border: 1px solid var(--border-primary, #cccccc);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    position: relative;
    background-color: var(--bg-secondary, transparent);
    color: var(--text-primary, #333);
    transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .tab-group label::after {
    content: "";
    position: absolute;
    bottom: -24px; /* Reduced from -32px */
    left: 50%;
    width: 6px; /* Reduced from 8px */
    height: 6px; /* Reduced from 8px */
    border-radius: 50%;
    background-color: #0a3cff;
    transform: translateX(-50%);
    transform-origin: 0 0;
    scale: 0;
    opacity: 0;
    z-index: -1;
    transition: all 0.48s 0.2s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .tab-group label::before {
    content: "";
    position: absolute;
    top: -18px; /* Reduced from -24px */
    left: 50%;
    width: 36px; /* Reduced from 48px */
    height: 36px; /* Reduced from 48px */
    border-radius: 8px;
    background-color: #0a3cff;
    transform: translate(-50%, -50%);
    z-index: -1;
    opacity: 0;
    scale: 0;
    transform-origin: 0 0;
    transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .tab-group label:hover {
    border-color: #0a3cff;
    color: #0a3cff;
  }

  .tab-group input:checked + label {
    border-color: transparent;
    color: #ffffff;
    scale: 1.1;
  }

  .tab-group input:checked + label::after {
    bottom: -12px;
    opacity: 1;
    scale: 1;
    box-shadow:
      0rem 4px 10px rgba(10, 60, 255, 0.1),
      0rem 18px 18px rgba(10, 60, 255, 0.09),
      0rem 41px 25px rgba(10, 60, 255, 0.05),
      0rem 73px 29px rgba(10, 60, 255, 0.01),
      0rem 114px 32px rgba(10, 60, 255, 0);
  }

  .tab-group input:checked + label::before {
    opacity: 1;
    scale: 1;
    top: 50%;
    box-shadow:
      0rem 4px 10px rgba(10, 60, 255, 0.1),
      0rem 18px 18px rgba(10, 60, 255, 0.09),
      0rem 41px 25px rgba(10, 60, 255, 0.05),
      0rem 73px 29px rgba(10, 60, 255, 0.01),
      0rem 114px 32px rgba(10, 60, 255, 0);
  }
`;

export default Pagination;
