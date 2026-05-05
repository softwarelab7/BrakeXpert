import { ArrowUp, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import '../../styles/floating-buttons.css';

const FloatingButtons = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const { theme, setTheme } = useAppStore();

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="floating-buttons">
            <button
                className={`floating-btn floating-btn-up ${!showScrollTop ? 'hidden' : ''}`}
                onClick={scrollToTop}
                title="Volver arriba"
                aria-label="Volver arriba"
            >
                <ArrowUp size={24} />
            </button>

            <button
                className="floating-btn floating-btn-dark"
                onClick={toggleTheme}
                title="Cambiar tema"
                aria-label="Cambiar tema"
            >
                <Moon size={24} />
            </button>
        </div>
    );
};

export default FloatingButtons;
