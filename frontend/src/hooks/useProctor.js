import { useEffect, useState } from 'react';

export const useProctor = (isEnabled = true, onViolation) => {
    const [violations, setViolations] = useState(0);

    useEffect(() => {
        if (!isEnabled) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                const newViolations = violations + 1;
                setViolations(newViolations);
                console.warn(`[Integrity] Tab switch detected! Count: ${newViolations}`);

                if (onViolation) {
                    onViolation({ type: 'tab_switch', count: newViolations, timestamp: new Date() });
                }
            }
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
            // Optional: alert user or count as minor violation
        };

        // Prevent selection
        const handleSelectStart = (e) => {
            e.preventDefault();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('selectstart', handleSelectStart);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
        };
    }, [isEnabled, violations, onViolation]);

    return { violations };
};
