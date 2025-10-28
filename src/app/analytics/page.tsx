"use client"
import useSWR from "swr"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const AnalyticsPage = () => {
    const { data, error, isLoading } = useSWR("/api/analytics", fetcher, {
        refreshInterval: 30000 // Refresh every 30 seconds
    })

    if (isLoading) {
        return (
            <main className="p-8">
                <p className="text-gray-600">Loading analytics...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="p-8">
                <p className="text-red-600">Error loading analytics: {error.message}</p>
            </main>
        )
    }

    const analytics = data || {}

    return (
        <main className="p-8 max-w-7xl mx-auto">
            <div className="mb-6">
                <Link href="/" className="text-blue-600 hover:underline">
                    ← Back to proposals
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-8">Proposal Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-gray-600 text-sm font-medium mb-2">Total Proposals</h3>
                    <p className="text-4xl font-bold text-blue-600">{analytics.total || 0}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-gray-600 text-sm font-medium mb-2">Total Value</h3>
                    <p className="text-4xl font-bold text-green-600">
                        ${(analytics.totalValue || 0).toLocaleString()}
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-gray-600 text-sm font-medium mb-2">Companies</h3>
                    <p className="text-4xl font-bold text-purple-600">
                        {Object.keys(analytics.byCompany || {}).length}
                    </p>
                </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-4">Status Distribution</h2>
                {analytics.statusDistribution && analytics.statusDistribution.length > 0 ? (
                    <div className="space-y-4">
                        {analytics.statusDistribution.map((item: any) => (
                            <div key={item.status}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium capitalize">{item.status}</span>
                                    <span className="text-sm text-gray-600">
                                        {item.count} ({item.percentage}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No status data available</p>
                )}
            </div>

            {/* By Company */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-4">Proposals by Company</h2>
                {analytics.byCompany && Object.keys(analytics.byCompany).length > 0 ? (
                    <div className="space-y-2">
                        {Object.entries(analytics.byCompany).map(([company, count]: [string, any]) => (
                            <div key={company} className="flex justify-between py-2 border-b border-gray-100">
                                <span className="font-medium">{company}</span>
                                <span className="text-gray-600">{count} proposals</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No company data available</p>
                )}
            </div>

            {/* Recent Proposals */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Recent Proposals</h2>
                {analytics.recentProposals && analytics.recentProposals.length > 0 ? (
                    <div className="space-y-3">
                        {analytics.recentProposals.map((proposal: any) => (
                            <Link
                                key={proposal.uuid}
                                href={`/proposals/${proposal.uuid}`}
                                className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-blue-600 hover:text-blue-800">
                                            {proposal.title || "Untitled"}
                                        </h3>
                                        <p className="text-sm text-gray-600 capitalize">
                                            {proposal.status || "Unknown status"}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {proposal.created_at
                                            ? new Date(proposal.created_at).toLocaleDateString()
                                            : "N/A"}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No recent proposals</p>
                )}
            </div>
        </main>
    )
}

export default AnalyticsPage
