"use client"
import useSWR from "swr"
import Link from "next/link"
import {PageHeader} from "@/components/PageHeader"
import {Card, CardContent, CardTitle} from "@/components/ui"
import {LoadingSpinner} from "@/components/LoadingSpinner"
import {ErrorMessage} from "@/components/ErrorMessage"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const AnalyticsPage = () => {
    const {data, error, isLoading} = useSWR("/api/analytics", fetcher, {
        refreshInterval: 30000
    })

    if (isLoading) {
        return (
            <main className="container max-w-7xl mx-auto py-8 px-4">
                <LoadingSpinner/>
            </main>
        )
    }

    if (error) {
        return (
            <main className="container max-w-7xl mx-auto py-8 px-4">
                <ErrorMessage message={`Error loading analytics: ${error.message}`}/>
            </main>
        )
    }

    const analytics = data || {}

    return (
        <main className="container max-w-7xl mx-auto py-8 px-4">
            <PageHeader
                title="Proposal Analytics"
                description="Track your proposal performance and metrics"
                backLink="/"
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Total Proposals</h3>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{analytics.total || 0}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Total Value</h3>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                            €{((analytics.totalValue || 0) / 100).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                        </p>
                        {analytics.totalValueWithTax !== undefined && analytics.totalValueWithTax > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Incl. tax: €{((analytics.totalValueWithTax || 0) / 100).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Companies</h3>
                        <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                            {Object.keys(analytics.byCompany || {}).length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Status Distribution */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <CardTitle className="mb-4">Status Distribution</CardTitle>
                    {analytics.statusDistribution && analytics.statusDistribution.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.statusDistribution.map((item: any) => (
                                <div key={item.status}>
                                    <div className="flex justify-between mb-1">
                                        <span
                                            className="text-sm font-medium capitalize text-gray-900 dark:text-gray-100">{item.status}</span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.count} ({item.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                                            style={{width: `${item.percentage}%`}}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No status data available</p>
                    )}
                </CardContent>
            </Card>

            {/* By Company */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <CardTitle className="mb-4">Proposals by Company</CardTitle>
                    {analytics.byCompany && Object.keys(analytics.byCompany).length > 0 ? (
                        <div className="space-y-2">
                            {Object.entries(analytics.byCompany).map(([company, count]: [string, any]) => (
                                <div key={company}
                                     className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{company}</span>
                                    <span className="text-gray-600 dark:text-gray-400">{count} proposals</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No company data available</p>
                    )}
                </CardContent>
            </Card>

            {/* Recent Proposals */}
            <Card>
                <CardContent className="p-6">
                    <CardTitle className="mb-4">Recent Proposals</CardTitle>
                    {analytics.recentProposals && analytics.recentProposals.length > 0 ? (
                        <div className="space-y-3">
                            {analytics.recentProposals.map((proposal: any) => (
                                <Link
                                    key={proposal.uuid}
                                    href={`/proposals/${proposal.uuid}`}
                                    className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                                {proposal.title || "Untitled"}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                {proposal.status || "Unknown status"}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {proposal.created_at
                                                ? new Date(proposal.created_at).toLocaleDateString()
                                                : "N/A"}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No recent proposals</p>
                    )}
                </CardContent>
            </Card>
        </main>
    )
}

export default AnalyticsPage
