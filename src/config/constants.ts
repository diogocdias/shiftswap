/**
 * Application constants and configuration values.
 * Centralizes magic numbers and configuration for easy maintenance.
 */

// Mock API delays (in milliseconds) - for simulating network latency
export const MOCK_API_DELAYS = {
    CMS_MENU: 300,
    PROFILE_FETCH: 800,
    PROFILE_SAVE: 200,
    SCHEDULE_GENERATE: 200,
    SWAP_REQUEST: 200,
    APPROVE_DECLINE: 500,
    LOGIN: 1500,
} as const;

// UI timing values (in milliseconds)
export const UI_TIMING = {
    SUCCESS_MESSAGE_DISPLAY: 3000,
    PAGE_REDIRECT: 1500,
    LOADING_TIMEOUT: 10000,
} as const;

// Responsive breakpoints (in pixels)
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    DESKTOP: 1024, // Alias for common usage
} as const;

// Session storage keys
export const STORAGE_KEYS = {
    USER_SESSION: 'mockUser',
} as const;

// Default values
export const DEFAULTS = {
    USER_ROLE: 'user',
    LOGGED_IN_USER_ID: '1', // TODO: Remove when real auth is implemented
} as const;

// Shift generation configuration
export const SHIFT_GENERATION = {
    REST_DAY_CHANCE_WEEKEND: 0.6,
    REST_DAY_CHANCE_WEEKDAY: 0.15,
    REST_DAY_CHANCE_AFTER_5_DAYS: 0.8,
    DOUBLE_SHIFT_CHANCE: 0.15,
    MAX_WORKING_DAYS_BEFORE_REST: 5,
} as const;

// File upload limits
export const FILE_LIMITS = {
    MAX_IMAGE_SIZE_MB: 5,
    MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
} as const;
