import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../config/constants';

/**
 * Hook to detect if the current viewport is desktop-sized.
 * Updates on window resize and orientation change.
 *
 * @returns boolean - true if viewport width >= desktop breakpoint (1024px)
 */
export function useIsDesktop(): boolean {
    const getCurrentState = () =>
        typeof window !== 'undefined' ? window.innerWidth >= BREAKPOINTS.DESKTOP : false;

    const [isDesktop, setIsDesktop] = useState(getCurrentState);

    useEffect(() => {
        const update = () => {
            setIsDesktop(getCurrentState());
        };

        window.addEventListener('resize', update);
        window.addEventListener('orientationchange', update);

        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('orientationchange', update);
        };
    }, []);

    return isDesktop;
}

export default useIsDesktop;
