import {listProposalsWithDetails, listCompanies} from "@/lib/proposales"
import {NextResponse} from "next/server"

export async function GET() {
    try {
        const [proposalsResponse, companiesResponse] = await Promise.all([
            listProposalsWithDetails(),
            listCompanies()
        ])

        const proposalData = proposalsResponse.data
        const companiesData = companiesResponse.data || []

        // Handle both single proposal and array
        const allProposals = proposalData ? (Array.isArray(proposalData) ? proposalData : [proposalData]) : []

        // Filter out deleted proposals (those with deleted_at timestamp)
        const proposals = allProposals.filter((p: any) => !p.deleted_at)

        // Debug: Log first proposal to see available fields
        if (proposals.length > 0) {
            console.log("[Analytics] Sample proposal fields:", Object.keys(proposals[0]))
            console.log("[Analytics] Sample proposal values:", {
                value_without_tax: proposals[0].value_without_tax,
                value_with_tax: proposals[0].value_with_tax
            })
        }

        // Create company lookup map
        const companyMap = new Map()
        companiesData.forEach((company: any) => {
            companyMap.set(company.id, company.name || `Company ${company.id}`)
        })

        // Calculate analytics
        const analytics = {
            total: proposals.length,
            byStatus: {} as Record<string, number>,
            byCompany: {} as Record<string, number>,
            totalValue: 0,
            totalValueWithTax: 0,
            recentProposals: proposals.slice(0, 5).map((p: any) => ({
                uuid: p.uuid,
                title: p.title,
                status: p.status,
                created_at: p.created_at,
                value_without_tax: p.value_without_tax,
                value_with_tax: p.value_with_tax
            })),
            statusDistribution: [] as { status: string; count: number; percentage: number }[]
        }

        // Aggregate data
        proposals.forEach((proposal: any) => {
            // Status distribution
            const status = proposal.status || "unknown"
            analytics.byStatus[status] = (analytics.byStatus[status] || 0) + 1

            // Company distribution - use company_id to lookup name
            const companyName = proposal.company_id
                ? companyMap.get(proposal.company_id) || `Company ${proposal.company_id}`
                : "Unknown"
            analytics.byCompany[companyName] = (analytics.byCompany[companyName] || 0) + 1

            // Total value - collect both with and without tax
            if (proposal.value_without_tax !== undefined && proposal.value_without_tax !== null) {
                analytics.totalValue += Number(proposal.value_without_tax)
            }
            if (proposal.value_with_tax !== undefined && proposal.value_with_tax !== null) {
                analytics.totalValueWithTax += Number(proposal.value_with_tax)
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
        return NextResponse.json({error: err.message}, {status: 500})
    }
}
