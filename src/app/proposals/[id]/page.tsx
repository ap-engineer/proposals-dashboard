"use client"
import { useParams } from "next/navigation"
import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then(r => r.json())

type Insights = {
    summary: string
    keyPoints: string[]
    suggestions: string[]
    sentiment: "positive" | "neutral" | "negative"
    confidence: number
}

export default function ProposalDetail() {
    const { id } = useParams()
    const { data, error, isLoading } = useSWR(`/api/proposals/${id}`, fetcher)
    const [showInsights, setShowInsights] = useState(false)
    const [insights, setInsights] = useState<Partial<Insights> | null>(null)
    const [loadingInsights, setLoadingInsights] = useState(false)
    const [insightsError, setInsightsError] = useState<string>("")
    const [healthCheck, setHealthCheck] = useState<any>(null)
    const [loadingHealth, setLoadingHealth] = useState(false)
    const [healthError, setHealthError] = useState<string>("")

    const generateInsights = async () => {
        setShowInsights(true)
        setLoadingInsights(true)
        setInsightsError("")
        setInsights(null)

        try {
            const response = await fetch(`/api/proposals/${id}/insights`, {
                method: "POST"
            })

            // Check content type to determine if it's JSON or stream
            const contentType = response.headers.get("content-type")
            
            if (contentType?.includes("application/json")) {
                // It's a JSON response (fallback or error)
                const data = await response.json()
                if (data.fallback) {
                    setInsights(data.fallback)
                    setLoadingInsights(false)
                    return
                }
                if (data.error) {
                    throw new Error(data.error)
                }
            }

            if (!response.ok) {
                throw new Error("Failed to generate insights")
            }

            // Handle streaming response from Vercel AI SDK
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
                throw new Error("No response body")
            }

            let fullText = ""

            while (true) {
                const { done, value } = await reader.read()
                
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                fullText += chunk
                
                // Try to parse the accumulated text as JSON
                try {
                    // Remove any markdown code blocks if present
                    const cleanText = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
                    const parsed = JSON.parse(cleanText)
                    setInsights(parsed)
                } catch (e) {
                    // Continue accumulating until we have valid JSON
                }
            }
            
            // Final parse attempt
            try {
                const cleanText = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
                const parsed = JSON.parse(cleanText)
                setInsights(parsed)
            } catch (e) {
                console.error("Failed to parse final JSON:", e)
            }

        } catch (err: any) {
            setInsightsError(err.message)
        } finally {
            setLoadingInsights(false)
        }
    }

    const runHealthCheck = async () => {
        setLoadingHealth(true)
        setHealthError("")
        
        try {
            const response = await fetch(`/api/proposals/${id}/health-check`, {
                method: "POST"
            })

            const data = await response.json()
            
            if (data.error && data.fallback) {
                setHealthCheck(data.fallback)
            } else if (data.overallScore !== undefined) {
                setHealthCheck(data)
            } else {
                throw new Error("Invalid response")
            }
        } catch (err: any) {
            setHealthError(err.message)
        } finally {
            setLoadingHealth(false)
        }
    }

    if (isLoading) {
        return (
            <main className="p-8">
                <p className="text-gray-600">Loading proposal...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="p-8">
                <p className="text-red-600">Error loading proposal: {error.message}</p>
                <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                    ← Back to proposals
                </Link>
            </main>
        )
    }

    // API returns { data: { ... } } structure
    const proposal = data?.data

    if (!proposal) {
        return (
            <main className="p-8">
                <p className="text-gray-600">No proposal found.</p>
                <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                    ← Back to proposals
                </Link>
            </main>
        )
    }

    return (
        <main className="p-8 max-w-4xl mx-auto">
            <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
                ← Back to proposals
            </Link>
            
            <h1 className="text-3xl font-bold mb-2">{proposal.title || "Untitled Proposal"}</h1>
            
            <div className="mb-6 space-y-2">
                {proposal.status && (
                    <p className="text-lg">
                        Status: <span className="font-semibold text-blue-600">{proposal.status}</span>
                    </p>
                )}
                {proposal.company_name && (
                    <p className="text-gray-700">Company: {proposal.company_name}</p>
                )}
                {proposal.recipient_name && (
                    <p className="text-gray-700">Recipient: {proposal.recipient_name}</p>
                )}
                {proposal.created_at && (
                    <p className="text-gray-600 text-sm">
                        Created: {new Date(proposal.created_at).toLocaleString()}
                    </p>
                )}
            </div>

            {proposal.description_md && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                    <div className="prose max-w-none whitespace-pre-wrap">
                        {proposal.description_md}
                    </div>
                </div>
            )}

            {/* AI Insights Section - Using Vercel AI SDK */}
            <div className="mb-8 border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Powered by Vercel AI SDK with streaming
                        </p>
                    </div>
                    <button
                        onClick={generateInsights}
                        disabled={loadingInsights}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        {loadingInsights && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {loadingInsights ? "Streaming..." : insights ? "Regenerate Insights" : "Generate Insights"}
                    </button>
                </div>

                {insightsError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                        <p className="text-red-800 text-sm">{insightsError}</p>
                    </div>
                )}

                {showInsights && insights && (
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                        {/* Sentiment Badge */}
                        {insights.sentiment && (
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    insights.sentiment === "positive" ? "bg-green-100 text-green-800" :
                                    insights.sentiment === "negative" ? "bg-red-100 text-red-800" :
                                    "bg-gray-100 text-gray-800"
                                }`}>
                                    {insights.sentiment.charAt(0).toUpperCase() + insights.sentiment.slice(1)} Sentiment
                                </span>
                                {insights.confidence !== undefined && (
                                    <span className="text-sm text-gray-600">
                                        Confidence: {insights.confidence}%
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Summary */}
                        {insights.summary && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-purple-900 mb-2">📝 Summary</h3>
                                <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
                            </div>
                        )}

                        {/* Key Points */}
                        {insights.keyPoints && insights.keyPoints.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-purple-900 mb-2">🎯 Key Points</h3>
                                <ul className="space-y-2">
                                    {insights.keyPoints.map((point: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-purple-600 mt-1">•</span>
                                            <span className="text-gray-700 flex-1">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Suggestions */}
                        {insights.suggestions && insights.suggestions.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-purple-900 mb-2">💡 Suggestions</h3>
                                <ul className="space-y-2">
                                    {insights.suggestions.map((suggestion: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-purple-600 mt-1">→</span>
                                            <span className="text-gray-700 flex-1">{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Loading state during streaming */}
                        {loadingInsights && (
                            <div className="mt-4 text-sm text-purple-600 animate-pulse">
                                ✨ Streaming insights in real-time...
                            </div>
                        )}
                    </div>
                )}

                {!showInsights && !loadingInsights && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 mb-2">
                            Get AI-powered analysis of this proposal
                        </p>
                        <p className="text-sm text-gray-500">
                            Uses Vercel AI SDK with structured streaming for real-time insights
                        </p>
                    </div>
                )}
            </div>

            {/* Health Check Section */}
            <div className="mb-8 border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">🏥 Proposal Health Check</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            AI-powered quality assessment
                        </p>
                    </div>
                    <button
                        onClick={runHealthCheck}
                        disabled={loadingHealth}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                        {loadingHealth ? "Analyzing..." : healthCheck ? "Re-analyze" : "Run Health Check"}
                    </button>
                </div>

                {healthError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                        <p className="text-red-800 text-sm">{healthError}</p>
                    </div>
                )}

                {healthCheck && (
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                        {/* Overall Score */}
                        <div className="mb-6 text-center">
                            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white shadow-lg mb-3">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-green-600">{healthCheck.overallScore}</div>
                                    <div className="text-xs text-gray-600">out of 100</div>
                                </div>
                            </div>
                            <div className="mt-2">
                                <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                                    healthCheck.verdict === "excellent" ? "bg-green-100 text-green-800" :
                                    healthCheck.verdict === "good" ? "bg-blue-100 text-blue-800" :
                                    healthCheck.verdict === "needs_work" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                }`}>
                                    {healthCheck.verdict.replace("_", " ").toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Individual Scores */}
                        {healthCheck.scores && (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {Object.entries(healthCheck.scores).map(([key, value]: [string, any]) => (
                                    <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="text-sm text-gray-600 capitalize mb-1">{key}</div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${value}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold">{value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Strengths */}
                        {healthCheck.strengths && healthCheck.strengths.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-green-900 mb-2">💪 Strengths</h3>
                                <ul className="space-y-2">
                                    {healthCheck.strengths.map((strength: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-green-600 mt-1">✓</span>
                                            <span className="text-gray-700 flex-1">{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Weaknesses */}
                        {healthCheck.weaknesses && healthCheck.weaknesses.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-orange-900 mb-2">⚠️ Areas for Improvement</h3>
                                <ul className="space-y-2">
                                    {healthCheck.weaknesses.map((weakness: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-orange-600 mt-1">!</span>
                                            <span className="text-gray-700 flex-1">{weakness}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Recommendations */}
                        {healthCheck.recommendations && healthCheck.recommendations.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2">💡 Recommendations</h3>
                                <ul className="space-y-2">
                                    {healthCheck.recommendations.map((rec: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-1">→</span>
                                            <span className="text-gray-700 flex-1">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {!healthCheck && !loadingHealth && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 mb-2">
                            Get a comprehensive quality assessment
                        </p>
                        <p className="text-sm text-gray-500">
                            AI analyzes clarity, completeness, professionalism, and persuasiveness
                        </p>
                    </div>
                )}
            </div>

            <details className="mt-8">
                <summary className="cursor-pointer text-lg font-semibold text-gray-700 hover:text-gray-900">
                    View Full Data (JSON)
                </summary>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto mt-2 max-h-96">
                    {JSON.stringify(proposal, null, 2)}
                </pre>
            </details>
        </main>
    )
}
