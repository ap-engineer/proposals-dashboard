"use client"
import { useState, useMemo } from "react"
import useSWR from "swr"
import Link from "next/link"
import { debounce } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const ContentLibraryPage = () => {
    const { data, error, isLoading } = useSWR("/api/content", fetcher)
    const [filter, setFilter] = useState<"all" | "active" | "archived">("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [showGenerator, setShowGenerator] = useState(false)
    const [generatorPrompt, setGeneratorPrompt] = useState("")
    const [generating, setGenerating] = useState(false)
    const [generatedContent, setGeneratedContent] = useState<any>(null)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState("")
    const [createSuccess, setCreateSuccess] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: "",
        language: "en"
    })
    const [editingItem, setEditingItem] = useState<any>(null)
    const [updating, setUpdating] = useState(false)
    const [updateError, setUpdateError] = useState("")
    const [updateSuccess, setUpdateSuccess] = useState(false)

    // Debounced search handler
    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            setDebouncedSearchQuery(value)
        }, 300),
        []
    )

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        debouncedSearch(value)
    }

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
            filter === "active" ? !item.deactivated_at :
            item.deactivated_at

        const matchesSearch = debouncedSearchQuery === "" || 
            (item.title && JSON.stringify(item.title).toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
            (item.description && JSON.stringify(item.description).toLowerCase().includes(debouncedSearchQuery.toLowerCase()))

        return matchesFilter && matchesSearch
    })

    const activeCount = contentItems.filter((item: any) => !item.deactivated_at).length
    const archivedCount = contentItems.filter((item: any) => item.deactivated_at).length

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

    const handleEditClick = (item: any) => {
        // Detect the first available language from title
        const availableLanguages = typeof item.title === "object" ? Object.keys(item.title) : ["en"]
        const defaultLanguage = availableLanguages[0] || "en"
        
        setEditingItem({
            ...item,
            language: defaultLanguage
        })
        setUpdateError("")
        setUpdateSuccess(false)
    }

    const handleUpdateContent = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        setUpdateError("")
        setUpdateSuccess(false)

        try {
            const language = editingItem.language || "en"
            const title = typeof editingItem.title === "string" 
                ? editingItem.title 
                : editingItem.title?.[language] || ""
            
            const description = typeof editingItem.description === "string"
                ? editingItem.description
                : editingItem.description?.[language] || ""

            // Validate title is not empty
            if (!title || title.trim() === "") {
                throw new Error("Title is required and cannot be empty")
            }

            const payload: any = {
                product_id: editingItem.product_id,
                variation_id: editingItem.variation_id,
                language: language,
                title: title.trim(),
            }

            if (description && description.trim()) {
                payload.description = description.trim()
            }

            const response = await fetch("/api/content/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to update content")
            }

            setUpdateSuccess(true)
            
            // Refresh content list
            setTimeout(() => {
                setEditingItem(null)
                window.location.reload()
            }, 1500)

        } catch (err: any) {
            setUpdateError(err.message)
        } finally {
            setUpdating(false)
        }
    }

    const handleCreateContent = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        setCreateError("")
        setCreateSuccess(false)

        try {
            // Get company_id from companies data
            const companiesResponse = await fetch("/api/companies")
            const companiesData = await companiesResponse.json()
            const companies = companiesData?.data || []
            
            if (companies.length === 0) {
                throw new Error("No companies found. Please create a company first.")
            }

            const payload: any = {
                company_id: companies[0].id, // Use first company
                language: formData.language,
                title: formData.title,
            }

            if (formData.description) payload.description = formData.description
            if (formData.imageUrl) {
                payload.images = [{
                    uuid: "",
                    url: formData.imageUrl
                }]
            }

            const response = await fetch("/api/content/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to create content")
            }

            setCreateSuccess(true)
            setFormData({ title: "", description: "", imageUrl: "", language: "en" })
            
            // Refresh content list
            setTimeout(() => {
                window.location.reload()
            }, 1500)

        } catch (err: any) {
            setCreateError(err.message)
        } finally {
            setCreating(false)
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
                <p className="text-sm text-gray-500 mt-2">
                    Note: The v3 API endpoint doesn't return images. Images are available via the web interface.
                </p>
            </div>

            {/* Create Content Form */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-blue-900">➕ Create Content Item</h3>
                        <p className="text-sm text-blue-700">Add a new product or service to your library</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        {showCreateForm ? "Hide" : "Show"}
                    </button>
                </div>

                {showCreateForm && (
                    <form onSubmit={handleCreateContent} className="space-y-4 mt-4">
                        {createSuccess && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 text-sm">✓ Content created successfully! Refreshing...</p>
                            </div>
                        )}

                        {createError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 text-sm">Error: {createError}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Professional Website Design"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed description of your product or service..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL (optional)
                            </label>
                            <input
                                type="url"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Provide a publicly accessible image URL</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Language
                            </label>
                            <select
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="en">English</option>
                                <option value="nl">Dutch</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="es">Spanish</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={creating || !formData.title}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                            {creating ? "Creating..." : "Create Content Item"}
                        </button>
                    </form>
                )}
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
                            onChange={(e) => handleSearchChange(e.target.value)}
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
                                item.deactivated_at ? "opacity-60" : ""
                            }`}
                        >
                            {/* Image Placeholder - Images not returned by API */}
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
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                </svg>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-lg flex-1">
                                        {typeof item.title === "string"
                                            ? item.title
                                            : item.title?.en || item.title?.fr || item.title?.nl || Object.values(item.title || {})[0] || "Untitled"}
                                    </h3>
                                    {item.deactivated_at && (
                                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                                            Archived
                                        </span>
                                    )}
                                </div>

                                {item.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {typeof item.description === "string"
                                            ? item.description
                                            : item.description?.en || item.description?.fr || item.description?.nl || Object.values(item.description || {})[0] || ""}
                                    </p>
                                )}

                                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                    <div>
                                        {item.product_id && (
                                            <span className="mr-2">Product: {item.product_id}</span>
                                        )}
                                        {item.variation_id && (
                                            <span>Variation: {item.variation_id}</span>
                                        )}
                                    </div>
                                </div>

                                {item.created_at && (
                                    <div className="text-xs text-gray-500">
                                        Created: {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                )}

                                {/* Integration Info */}
                                {item.integration_id && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-gray-500">
                                            Integration ID: {item.integration_id}
                                        </p>
                                    </div>
                                )}

                                {/* Edit Button */}
                                <button
                                    onClick={() => handleEditClick(item)}
                                    className="mt-4 w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                >
                                    ✏️ Edit Content
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold">Edit Content Item</h2>
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {updateSuccess && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-800 text-sm">✓ Content updated successfully! Refreshing...</p>
                                </div>
                            )}

                            {updateError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800 text-sm">Error: {updateError}</p>
                                </div>
                            )}

                            <form onSubmit={handleUpdateContent} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-600">Product ID</p>
                                        <p className="font-medium">{editingItem.product_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Variation ID</p>
                                        <p className="font-medium">{editingItem.variation_id}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Language
                                    </label>
                                    <select
                                        value={editingItem.language || "en"}
                                        onChange={(e) => setEditingItem({ ...editingItem, language: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="en">English</option>
                                        <option value="nl">Dutch</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                        <option value="es">Spanish</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Available: {typeof editingItem.title === "object" ? Object.keys(editingItem.title).join(", ") : editingItem.language || "en"}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={
                                            typeof editingItem.title === "string"
                                                ? editingItem.title
                                                : editingItem.title?.[editingItem.language || "en"] || ""
                                        }
                                        onChange={(e) => {
                                            const lang = editingItem.language || "en"
                                            setEditingItem({
                                                ...editingItem,
                                                title: typeof editingItem.title === "string"
                                                    ? e.target.value
                                                    : { ...editingItem.title, [lang]: e.target.value }
                                            })
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={
                                            typeof editingItem.description === "string"
                                                ? editingItem.description
                                                : editingItem.description?.[editingItem.language || "en"] || ""
                                        }
                                        onChange={(e) => {
                                            const lang = editingItem.language || "en"
                                            setEditingItem({
                                                ...editingItem,
                                                description: typeof editingItem.description === "string"
                                                    ? e.target.value
                                                    : { ...editingItem.description, [lang]: e.target.value }
                                            })
                                        }}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {updating ? "Updating..." : "Update Content"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingItem(null)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default ContentLibraryPage
