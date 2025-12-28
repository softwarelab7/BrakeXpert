import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/pagination.css';

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

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <button
                        key={i}
                        className={`page-btn ${currentPage === i ? 'active' : ''}`}
                        onClick={() => onPageChange(i)}
                    >
                        {i}
                    </button>
                );
            }
        } else {
            // Always show first page
            pages.push(
                <button
                    key={1}
                    className={`page-btn ${currentPage === 1 ? 'active' : ''}`}
                    onClick={() => onPageChange(1)}
                >
                    1
                </button>
            );

            // Show dots if current page is far from start
            if (currentPage > 3) {
                pages.push(<span key="dots-start" className="page-dots">...</span>);
            }

            // Show current page and neighbors
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(
                    <button
                        key={i}
                        className={`page-btn ${currentPage === i ? 'active' : ''}`}
                        onClick={() => onPageChange(i)}
                    >
                        {i}
                    </button>
                );
            }

            // Show dots if current page is far from end
            if (currentPage < totalPages - 2) {
                pages.push(<span key="dots-end" className="page-dots">...</span>);
            }

            // Always show last page
            pages.push(
                <button
                    key={totalPages}
                    className={`page-btn ${currentPage === totalPages ? 'active' : ''}`}
                    onClick={() => onPageChange(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="pagination">
            <button
                className="page-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
            >
                <ChevronLeft size={18} />
            </button>

            {renderPageNumbers()}

            <button
                className="page-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;
