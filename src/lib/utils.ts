import {type ClassValue, clsx} from "clsx"

/**
 * Merge class names with tailwind-merge for proper Tailwind CSS class handling
 */
export const cn = (...inputs: ClassValue[]) => clsx(inputs)

/**
 * Format a timestamp to a readable date string
 */
export const formatDate = (timestamp?: number): string => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleDateString()
}

/**
 * Format a timestamp to a readable date and time string
 */
export const formatDateTime = (timestamp?: number): string => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleString()
}

/**
 * Format a number as currency
 */
export const formatCurrency = (amount?: number, currency: string = "USD"): string => {
    if (amount === undefined || amount === null) return "N/A"
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amount)
}

/**
 * Get a localized string from a multi-language object
 */
export const getLocalizedString = (
    value: string | { en?: string; [key: string]: string | undefined } | undefined,
    fallback: string = "Untitled"
): string => {
    if (!value) return fallback
    if (typeof value === "string") return value
    return value.en || Object.values(value)[0] || fallback
}

/**
 * Truncate text to a maximum length
 */
export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
}

/**
 * Get status color classes for Tailwind
 */
export const getStatusColor = (status?: string): string => {
    switch (status?.toLowerCase()) {
        case "accepted":
        case "won":
            return "bg-green-100 text-green-800"
        case "sent":
        case "viewed":
            return "bg-blue-100 text-blue-800"
        case "draft":
            return "bg-gray-100 text-gray-800"
        case "rejected":
        case "lost":
            return "bg-red-100 text-red-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

/**
 * Get verdict color classes for health check
 */
export const getVerdictColor = (verdict?: string): string => {
    switch (verdict) {
        case "excellent":
            return "bg-green-100 text-green-800"
        case "good":
            return "bg-blue-100 text-blue-800"
        case "needs_work":
            return "bg-yellow-100 text-yellow-800"
        case "poor":
            return "bg-red-100 text-red-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

/**
 * Safely parse JSON with fallback
 */
export const safeJsonParse = <T, >(text: string, fallback: T): T => {
    try {
        // Remove markdown code blocks if present
        const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
        return JSON.parse(cleanText)
    } catch {
        return fallback
    }
}

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}
