import { useEffect, useState } from 'react';

interface NotificationBellProps {
    count: number;
    onClick: () => void;
}

const NotificationBell = ({ count, onClick }: NotificationBellProps) => {
    const [bellKey, setBellKey] = useState(0);
    const [badgeKey, setBadgeKey] = useState(0);
    const [prevCount, setPrevCount] = useState(count);

    useEffect(() => {
        // Trigger animations only when count increases (new notification)
        if (count > prevCount) {
            setBellKey(prev => prev + 1);
            setBadgeKey(prev => prev + 1);
        }
        setPrevCount(count);
    }, [count, prevCount]);

    const handleClick = () => {
        // Trigger bell ring animation on click
        setBellKey(prev => prev + 1);
        onClick();
    };

    return (
        <div
            className="nb-wrapper group"
            onClick={handleClick}
        >
            <div key={`bell-${bellKey}`} className="nb-bell-icon animate-elastic-ring">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
            </div>

            {count > 0 && (
                <div className="nb-badge-container">
                    <div key={`badge-${badgeKey}`} className="nb-badge-animator animate-elastic-scale">
                        <div className="nb-badge-pulse"></div>
                        <div className="nb-badge-count">
                            {count > 99 ? '99+' : count}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
