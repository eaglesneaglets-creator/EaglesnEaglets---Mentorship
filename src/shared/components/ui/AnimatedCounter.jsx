import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const AnimatedCounter = ({ value, duration = 1200, prefix = '', suffix = '', className = '' }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const previousValue = useRef(0);
    const frameRef = useRef(null);

    useEffect(() => {
        const numericValue = typeof value === 'number' ? value : parseInt(value, 10) || 0;
        const startValue = previousValue.current;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + (numericValue - startValue) * eased);

            setDisplayValue(current);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                previousValue.current = numericValue;
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [value, duration]);

    return (
        <span className={`tabular-nums ${className}`}>
            {prefix}{displayValue.toLocaleString()}{suffix}
        </span>
    );
};

AnimatedCounter.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    duration: PropTypes.number,
    prefix: PropTypes.string,
    suffix: PropTypes.string,
    className: PropTypes.string,
};

export default AnimatedCounter;
