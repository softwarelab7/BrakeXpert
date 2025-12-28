import { ArrowUp, Moon, Orbit } from 'lucide-react';
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

    const toggleDarkMode = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const toggleOrbitalMode = () => {
        setTheme(theme === 'orbital' ? 'light' : 'orbital');
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
                className="floating-btn floating-btn-orbital"
                onClick={toggleOrbitalMode}
                title="Modo Orbital"
                aria-label="Modo Orbital"
            >
                <Orbit size={24} />
            </button>

            <button
                className="floating-btn floating-btn-dark"
                onClick={toggleDarkMode}
                title="Modo Oscuro"
                aria-label="Modo Oscuro"
            >
                <Moon size={24} />
            </button>
        </div>
    );
};

export default FloatingButtons;
