/**
 * Environment Variable Validation
 *
 * Validates that required VITE_* environment variables are set at app startup.
 * In production, a missing VITE_API_URL would silently fallback to localhost,
 * causing all API calls to fail with cryptic network errors.
 *
 * Usage: Import and call validateEnv() in main.jsx before React renders.
 */

const REQUIRED_VARS = ['VITE_API_URL'];

export const validateEnv = () => {
    const missing = REQUIRED_VARS.filter(
        (key) => !import.meta.env[key]
    );

    if (missing.length > 0) {
        const msg = `Missing required environment variables: ${missing.join(', ')}`;

        if (import.meta.env.PROD) {
            // In production — log error prominently but don't crash the app
            console.error(`🚨 ${msg}. API calls will likely fail.`);
        } else {
            // In dev — warn loudly so developers notice
            console.warn(`⚠️ ${msg}. Using fallback values — this will NOT work in production.`);
        }
    }
};

export default validateEnv;
