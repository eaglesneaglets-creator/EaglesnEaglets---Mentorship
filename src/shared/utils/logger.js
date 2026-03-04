/**
 * Logger Utility
 *
 * Environment-aware logging that suppresses debug/info messages in production.
 * Replaces raw console.log/console.error calls throughout the codebase.
 *
 * Usage:
 *   import { logger } from '@utils/logger';
 *   logger.debug('Only visible in dev');
 *   logger.error('Always visible');
 */

const isDev = import.meta.env.DEV;

export const logger = {
    /** Debug messages — suppressed in production */
    debug: (...args) => {
        if (isDev) console.debug('[DEBUG]', ...args);
    },

    /** Informational messages — suppressed in production */
    info: (...args) => {
        if (isDev) console.info('[INFO]', ...args);
    },

    /** Warnings — always shown (potential issues) */
    warn: (...args) => {
        console.warn('[WARN]', ...args);
    },

    /** Errors — always shown (failures) */
    error: (...args) => {
        console.error('[ERROR]', ...args);
    },
};

export default logger;
