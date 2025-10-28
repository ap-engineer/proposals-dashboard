import { listProposals } from "@/lib/proposales"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const response = await listProposals()
        const proposalData = response.data
        
        // Handle both single proposal and array
        const proposals = proposalData ? (Array.isArray(proposalData) ? proposalData : [proposalData]) : []

        // Calculate analytics
        const analytics = {
            total: proposals.length,
            byStatus: {} as Record<string, number>,
            byCompany: {} as Record<string, number>,
            totalValue: 0,
            recentProposals: proposals.slice(0, 5).map((p: any) => ({
                uuid: p.uuid,
                title: p.title,
                status: p.status,
                created_at: p.created_at
            })),
            statusDistribution: [] as { status: string; count: number; percentage: number }[]
        }

        // Aggregate data
        proposals.forEach((proposal: any) => {
            // Status distribution
            const status = proposal.status || "unknown"
            analytics.byStatus[status] = (analytics.byStatus[status] || 0) + 1

            // Company distribution
            const company = proposal.company_name || "Unknown"
            analytics.byCompany[company] = (analytics.byCompany[company] || 0) + 1

            // Total value
            if (proposal.value_without_tax) {
                analytics.totalValue += proposal.value_without_tax
            }
        })

        // Calculate percentages for status distribution
        analytics.statusDistribution = Object.entries(analytics.byStatus).map(([status, count]) => ({
            status,
            count,
            percentage: Math.round((count / analytics.total) * 100)
        }))

        return NextResponse.json(analytics)
    } catch (err: any) {
        console.error("Error generating analytics:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
