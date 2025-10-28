// Shared types for the application

export type ProposalStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected"

export interface Proposal {
    uuid: string
    title?: string
    status?: ProposalStatus
    created_at?: number
    updated_at?: number
    company_id?: number
    company_name?: string
    recipient_name?: string
    recipient_company_name?: string
    description_md?: string
    description_html?: string
    value_without_tax?: number
    series_uuid?: string
    version?: number | null
    data?: Record<string, any>
}

export interface ContentItem {
    product_id?: number
    variation_id?: number
    title?: string | { en?: string; [key: string]: string | undefined }
    description?: string | { en?: string; [key: string]: string | undefined }
    created_at?: number
    is_archived?: boolean
    images?: Array<{ url?: string; [key: string]: any }>
    sources?: Record<string, any>
    integration_id?: number
    integration_metadata?: Record<string, any>
}

export interface Company {
    id: number
    name: string
    created_at?: number
    currency?: string
    tax_mode?: string
    registration_number?: string
    website_url?: string
}

export interface AIInsights {
    summary: string
    keyPoints: string[]
    suggestions: string[]
    sentiment: "positive" | "neutral" | "negative"
    confidence: number
}

export interface HealthCheck {
    overallScore: number
    scores: {
        clarity: number
        completeness: number
        professionalism: number
        persuasiveness: number
    }
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    verdict: "excellent" | "good" | "needs_work" | "poor"
}

export interface GeneratedContent {
    title: string
    description: string
    keyFeatures: string[]
    suggestedPrice: number
    category: string
}

export interface Analytics {
    total: number
    byStatus: Record<string, number>
    byCompany: Record<string, number>
    totalValue: number
    recentProposals: Array<{
        uuid: string
        title?: string
        status?: string
        created_at?: number
    }>
    statusDistribution: Array<{
        status: string
        count: number
        percentage: number
    }>
}
