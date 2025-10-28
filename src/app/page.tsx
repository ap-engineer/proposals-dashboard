"use client"
import useSWR from "swr"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Page() {
    const { data, error, isLoading } = useSWR("/api/proposals/list", fetcher)

    if (isLoading) {
        return (
            <main className="p-8">
                <p className="text-gray-600">Loading proposals...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="p-8">
                <p className="text-red-600">Error loading proposals: {error.message}</p>
            </main>
        )
    }

    // API returns { data: { ... } } structure
    const proposalData = data?.data
    
    if (!proposalData) {
        return (
            <main className="p-8">
                <p className="text-gray-600">No proposals found. Try creating one in Proposales.</p>
            </main>
        )
    }

    // The proposal-search endpoint returns a single proposal object in data, not an array
    // We'll display it as a single item or handle it as an array if it's an array
    const proposals = Array.isArray(proposalData) ? proposalData : [proposalData]

    return (
        <main className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Proposals Dashboard</h1>
                <p className="text-gray-600">Manage and analyze your proposals with AI-powered insights</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
                <Link
                    href="/create"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    + Create Proposal
                </Link>
                <Link
                    href="/analytics"
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                    📊 View Analytics
                </Link>
                <a
                    href="/api/webhook"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                    🔗 Webhook Status
                </a>
            </div>

            {/* Proposals List */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Your Proposals</h2>
                {proposals.map((p: any) => (
                    <div key={p.uuid || p.id} className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow bg-white">
                        <Link href={`/proposals/${p.uuid || p.id}`} className="block">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                                    {p.title || "Untitled proposal"}
                                </h3>
                                {p.status && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
                                        {p.status}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                {p.created_at && (
                                    <p>📅 Created: {new Date(p.created_at * 1000).toLocaleString()}</p>
                                )}
                                {p.company_name && <p>🏢 Company: {p.company_name}</p>}
                                {p.recipient_name && <p>👤 Recipient: {p.recipient_name}</p>}
                                {p.value_without_tax && (
                                    <p>💰 Value: ${p.value_without_tax.toLocaleString()}</p>
                                )}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </main>
    )
}
