import { useState, useEffect } from 'react';
import '../../styles/scroll-to-top.css';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    // Scroll to top smoothly
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="scroll-to-top-btn group"
                    aria-label="Scroll to top"
                >
                    {/* Arrow 1: Initially centered, moves up and fades out on hover */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20" /* Reduced from 24 */
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="scroll-icon-primary"
                    >
                        <path d="m18 15-6-6-6 6" />
                    </svg>

                    {/* Arrow 2: Initially down, moves to center and fades in on hover */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20" /* Reduced from 24 */
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="scroll-icon-secondary"
                    >
                        <path d="m18 15-6-6-6 6" />
                    </svg>
                </button>
            )}
        </>
    );
};

export default ScrollToTop;
