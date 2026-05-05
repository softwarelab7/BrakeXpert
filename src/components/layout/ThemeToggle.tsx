import { useAppStore } from '../../store/useAppStore';
import { useEffect } from 'react';
import '../../styles/theme-toggle.css';

const ThemeToggle = () => {
    const { theme, setTheme } = useAppStore();

    // Apply theme on mount
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <label className="switch-uiverse" title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}>
            <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
            />
            <span className="slider-uiverse"></span>
        </label>
    );
};

export default ThemeToggle;
