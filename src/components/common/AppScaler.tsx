
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const AppScaler: React.FC = () => {
    const { zoom, setZoom } = useAppStore();

    const handleZoom = (delta: number) => {
        const newZoom = Math.min(Math.max(zoom + delta, 0.7), 1.3);
        setZoom(Number(newZoom.toFixed(1)));
    };

    const resetZoom = () => setZoom(1.0);

    return (
        <div className="flex items-center gap-2" style={{
            background: 'var(--bg-tertiary)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-primary)',
            marginLeft: '8px'
        }}>
            <button
                onClick={() => handleZoom(-0.1)}
                className="hover:text-accent-primary"
                title="Reducir tamaño"
                style={{ padding: '4px' }}
            >
                <Minus size={16} />
            </button>

            <button
                onClick={resetZoom}
                className="text-xs font-bold"
                title="Restablecer tamaño"
                style={{ minWidth: '35px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
                {Math.round(zoom * 100)}%
            </button>

            <button
                onClick={() => handleZoom(0.1)}
                className="hover:text-accent-primary"
                title="Aumentar tamaño"
                style={{ padding: '4px' }}
            >
                <Plus size={16} />
            </button>
        </div>
    );
};

export default AppScaler;
