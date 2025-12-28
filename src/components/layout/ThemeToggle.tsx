import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useEffect } from 'react';
import '../../styles/theme-toggle.css';

// Custom Planet/Saturn Icon for Orbital Mode
const PlanetIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="6" />
        <ellipse cx="12" cy="12" rx="15" ry="3" opacity="0.5" />
    </svg>
);

const ThemeToggle = () => {
    const { theme, setTheme } = useAppStore();

    // Apply theme on mount
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const cycleTheme = () => {
        const themes: Array<'light' | 'dark' | 'orbital'> = ['light', 'dark', 'orbital'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    return (
        <button
            className="theme-toggle"
            onClick={cycleTheme}
            title={`Tema actual: ${theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Orbital'}`}
            aria-label="Cambiar tema"
        >
            <span className="theme-icon theme-icon-light">
                <Sun />
            </span>
            <span className="theme-icon theme-icon-dark">
                <Moon />
            </span>
            <span className="theme-icon theme-icon-orbital">
                <PlanetIcon />
            </span>
        </button>
    );
};

export default ThemeToggle;
