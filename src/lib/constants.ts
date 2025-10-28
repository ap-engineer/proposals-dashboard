/**
 * Application-wide constants
 */

export const APP_NAME = "Proposals Dashboard"
export const APP_DESCRIPTION = "Manage and analyze your proposals with AI-powered insights"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export const ROUTES = {
    HOME: "/",
    CREATE: "/create",
    ANALYTICS: "/analytics",
    CONTENT: "/content",
    WEBHOOK_STATUS: "/api/webhook",
    PROPOSAL_DETAIL: (id: string) => `/proposals/${id}`,
} as const

export const API_ENDPOINTS = {
    PROPOSALS_LIST: "/api/proposals/list",
    PROPOSAL_DETAIL: (id: string) => `/api/proposals/${id}`,
    PROPOSAL_CREATE: "/api/proposals/create",
    PROPOSAL_INSIGHTS: (id: string) => `/api/proposals/${id}/insights`,
    PROPOSAL_HEALTH: (id: string) => `/api/proposals/${id}/health-check`,
    COMPANIES: "/api/companies",
    CONTENT: "/api/content",
    ANALYTICS: "/api/analytics",
    AI_GENERATE_PROPOSAL: "/api/ai/generate-proposal",
    AI_GENERATE_CONTENT: "/api/ai/generate-content",
} as const

export const EXTERNAL_LINKS = {
    PROPOSALES_DASHBOARD: "https://secure.proposales.com",
    PROPOSALES_PROFILE: "https://secure.proposales.com/settings/profile",
    GROQ_CONSOLE: "https://console.groq.com",
    GROQ_DOCS: "https://console.groq.com/docs",
} as const

export const SWR_CONFIG = {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    shouldRetryOnError: false,
} as const

export const AI_CONFIG = {
    MODEL: "llama-3.3-70b-versatile",
    PROVIDER: "Groq",
} as const
