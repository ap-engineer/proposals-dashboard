/**
 * Application-wide constants
 */

export const APP_NAME = "Proposals Dashboard"
export const APP_DESCRIPTION = "Manage and analyze your proposals with AI-powered insights"

/**
 * API Endpoints - Internal API routes
 */
export const API = {
    PROPOSALS_LIST: "/api/proposals/list",
    PROPOSAL_DETAIL: (id: string) => `/api/proposals/${id}`,
    PROPOSAL_CREATE: "/api/proposals/create",
    PROPOSAL_INSIGHTS: (id: string) => `/api/proposals/${id}/insights`,
    PROPOSAL_HEALTH: (id: string) => `/api/proposals/${id}/health-check`,
    COMPANIES: "/api/companies",
    CONTENT: "/api/content",
    CONTENT_CREATE: "/api/content/create",
    CONTENT_UPDATE: "/api/content/update",
    ANALYTICS: "/api/analytics",
    AI_GENERATE_PROPOSAL: "/api/ai/generate-proposal",
    AI_GENERATE_CONTENT: "/api/ai/generate-content",
    WEBHOOK: "/api/webhook",
} as const

/**
 * External Links
 */
export const EXTERNAL_LINKS = {
    PROPOSALES_DASHBOARD: "https://secure.proposales.com",
    PROPOSALES_PROFILE: "https://secure.proposales.com/settings/profile",
    GROQ_CONSOLE: "https://console.groq.com",
    GROQ_DOCS: "https://console.groq.com/docs",
} as const

/**
 * AI Configuration
 */
export const AI_CONFIG = {
    MODEL: "llama-3.3-70b-versatile",
    PROVIDER: "Groq",
} as const
