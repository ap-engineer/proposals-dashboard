"use client"
import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const ContentLibraryPage = () => {
    const { data, error, isLoading } = useSWR("/api/content", fetcher)
    const [filter, setFilter] = useState<"all" | "active" | "archived">("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [showGenerator, setShowGenerator] = useState(false)
    const [generatorPrompt, setGeneratorPrompt] = useState("")
    const [generating, setGenerating] = useState(false)
    const [generatedContent, setGeneratedContent] = useState<any>(null)

    if (isLoading) {
        return (
            <main className="p-8">
                <p className="text-gray-600">Loading content library...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="p-8">
                <p className="text-red-600">Error loading content: {error.message}</p>
            </main>
        )
    }

    const contentItems = data?.data || []

    // Filter content
    const filteredContent = contentItems.filter((item: any) => {
        const matchesFilter = 
            filter === "all" ? true :
            filter === "active" ? !item.is_archived :
            item.is_archived

        const matchesSearch = searchQuery === "" || 
            (item.title && JSON.stringify(item.title).toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.description && JSON.stringify(item.description).toLowerCase().includes(searchQuery.toLowerCase()))

        return matchesFilter && matchesSearch
    })

    const activeCount = contentItems.filter((item: any) => !item.is_archived).length
    const archivedCount = contentItems.filter((item: any) => item.is_archived).length

    const generateContent = async () => {
        if (!generatorPrompt.trim()) return
        
        setGenerating(true)
        try {
            const response = await fetch("/api/ai/generate-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: generatorPrompt })
            })

            const data = await response.json()
            
            if (data.error && data.fallback) {
                setGeneratedContent(data.fallback)
            } else if (data.title) {
                setGeneratedContent(data)
            }
        } catch (err: any) {
            console.error("Content generation error:", err)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <main className="container max-w-7xl mx-auto py-8 px-4">
            <div className="mb-6">
                <Link href="/" className="text-blue-600 hover:underline">
                    ← Back to proposals
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Content Library</h1>
                <p className="text-gray-600">Browse and manage your proposal content and products</p>
            </div>

            {/* AI Content Generator */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-green-900">✨ AI Content Generator</h3>
                        <p className="text-sm text-green-700">Generate product/service content ideas with AI</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowGenerator(!showGenerator)}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                        {showGenerator ? "Hide" : "Show"}
                    </button>
                </div>
                
                {showGenerator && (
                    <div className="space-y-3">
                        <textarea
                            value={generatorPrompt}
                            onChange={(e) => setGeneratorPrompt(e.target.value)}
                            placeholder="Describe a product or service... e.g., 'Professional website design service with SEO optimization and mobile responsiveness'"
                            rows={3}
                            className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                        <button
                            type="button"
                            onClick={generateContent}
                            disabled={generating || !generatorPrompt.trim()}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                            {generating ? "Generating..." : "Generate Content Item"}
                        </button>
                        
                        {generatedContent && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-green-300">
                                <h4 className="font-semibold text-lg mb-2">{generatedContent.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{generatedContent.description}</p>
                                <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Key Features:</p>
                                    <ul className="text-sm text-gray-600 list-disc list-inside">
                                        {generatedContent.keyFeatures?.map((feature: string, idx: number) => (
                                            <li key={idx}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                        Category: <span className="font-medium">{generatedContent.category}</span>
                                    </span>
                                    <span className="text-green-600 font-semibold">
                                        ${generatedContent.suggestedPrice}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-3 italic">
                                    💡 Copy this content and add it manually in Proposales to use it in proposals
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-gray-600 text-sm font-medium mb-2">Total Items</h3>
                    <p className="text-4xl font-bold text-blue-600">{contentItems.length}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-gray-600 text-sm font-medium mb-2">Active</h3>
                    <p className="text-4xl font-bold text-green-600">{activeCount}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-gray-600 text-sm font-medium mb-2">Archived</h3>
                    <p className="text-4xl font-bold text-gray-600">{archivedCount}</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === "all"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            All ({contentItems.length})
                        </button>
                        <button
                            onClick={() => setFilter("active")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === "active"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Active ({activeCount})
                        </button>
                        <button
                            onClick={() => setFilter("archived")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === "archived"
                                    ? "bg-gray-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Archived ({archivedCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            {contentItems.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-300">
                    <div className="max-w-md mx-auto">
                        <svg
                            className="w-20 h-20 mx-auto mb-4 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Content Items Yet</h3>
                        <p className="text-gray-600 mb-4">
                            Content items are products, services, or reusable content blocks you can add to proposals.
                        </p>
                        <div className="bg-white rounded-lg p-4 text-left mb-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">To add content:</p>
                            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                                <li>Go to <a href="https://secure.proposales.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Proposales Dashboard</a></li>
                                <li>Navigate to your Content or Products section</li>
                                <li>Add products, services, or content blocks</li>
                                <li>Refresh this page to see them here</li>
                            </ol>
                        </div>
                        <p className="text-xs text-gray-500">
                            Content items can include images, descriptions, pricing, and more
                        </p>
                    </div>
                </div>
            ) : filteredContent.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-600 mb-2">No content items match your filters</p>
                    <p className="text-sm text-gray-500">
                        Try a different search term or filter
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContent.map((item: any) => (
                        <div
                            key={item.product_id || item.variation_id}
                            className={`bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                                item.is_archived ? "opacity-60" : ""
                            }`}
                        >
                            {/* Image */}
                            {item.images && item.images.length > 0 && item.images[0].url ? (
                                <div className="aspect-video bg-gray-100 relative">
                                    <img
                                        src={item.images[0].url}
                                        alt={item.title || "Content image"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none"
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                    <svg
                                        className="w-16 h-16 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-lg flex-1">
                                        {typeof item.title === "string"
                                            ? item.title
                                            : item.title?.en || "Untitled"}
                                    </h3>
                                    {item.is_archived && (
                                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                                            Archived
                                        </span>
                                    )}
                                </div>

                                {item.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {typeof item.description === "string"
                                            ? item.description
                                            : item.description?.en || ""}
                                    </p>
                                )}

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div>
                                        {item.product_id && (
                                            <span className="mr-2">ID: {item.product_id}</span>
                                        )}
                                        {item.variation_id && (
                                            <span>Var: {item.variation_id}</span>
                                        )}
                                    </div>
                                    {item.created_at && (
                                        <span>
                                            {new Date(item.created_at * 1000).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                {/* Sources */}
                                {item.sources && Object.keys(item.sources).length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-gray-500">
                                            Sources: {Object.keys(item.sources).join(", ")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}

export default ContentLibraryPage
