import { useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useInView } from 'framer-motion';

const FadeIn = ({ children, delay = 0, direction = 'up', className = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
            x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
            filter: 'blur(4px)',
        },
        visible: { opacity: 1, y: 0, x: 0, filter: 'blur(0px)' },
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={variants}
            transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

FadeIn.propTypes = {
    children: PropTypes.node.isRequired,
    delay: PropTypes.number,
    direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
    className: PropTypes.string,
};

export default FadeIn;
