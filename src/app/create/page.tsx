"use client"
import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import {fetcher, swrConfig} from "@/lib/swrFetcher"
import {API} from "@/lib/constants"

interface CompaniesResponse {
    data: Array<{
        id: number
        name: string
    }>
}

const CreateProposalPage = () => {
    const router = useRouter()
    const {data: companiesData} = useSWR<CompaniesResponse>(API.COMPANIES, fetcher, swrConfig)

    const [formData, setFormData] = useState({
        company_id: "",
        title_md: "",
        description_md: "",
        recipient_name: "",
        recipient_email: "",
        recipient_company_name: ""
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState<{ uuid: string; url: string } | null>(null)
    const [aiPrompt, setAiPrompt] = useState("")
    const [generatingAI, setGeneratingAI] = useState(false)
    const [showAIHelper, setShowAIHelper] = useState(false)

    const companies = companiesData?.data || []

    const generateWithAI = async () => {
        if (!aiPrompt.trim()) return

        setGeneratingAI(true)
        try {
            const response = await fetch(API.AI_GENERATE_PROPOSAL, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    prompt: aiPrompt,
                    companyName: companies.find((c: any) => c.id === parseInt(formData.company_id))?.name,
                    recipientName: formData.recipient_name
                })
            })

            const data = await response.json()

            if (data.error && data.fallback) {
                // Use fallback
                setFormData({
                    ...formData,
                    title_md: data.fallback.title,
                    description_md: data.fallback.description
                })
            } else if (data.title) {
                // Use AI generated content
                setFormData({
                    ...formData,
                    title_md: data.title,
                    description_md: data.description
                })
                setShowAIHelper(false)
                setAiPrompt("")
            }
        } catch (err: any) {
            console.error("AI generation error:", err)
        } finally {
            setGeneratingAI(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess(null)

        try {
            const payload: any = {
                company_id: parseInt(formData.company_id),
                title_md: formData.title_md,
                description_md: formData.description_md || undefined,
            }

            // Add recipient if provided
            if (formData.recipient_name || formData.recipient_email || formData.recipient_company_name) {
                payload.recipient = {}
                if (formData.recipient_name) payload.recipient.first_name = formData.recipient_name
                if (formData.recipient_email) payload.recipient.email = formData.recipient_email
                if (formData.recipient_company_name) payload.recipient.company_name = formData.recipient_company_name
            }

            const response = await fetch(API.PROPOSAL_CREATE, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to create proposal")
            }

            setSuccess(data.proposal)

            // Redirect after 2 seconds
            setTimeout(() => {
                router.push(`/proposals/${data.proposal.uuid}`)
            }, 2000)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="p-8 max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/" className="text-blue-600 hover:underline">
                    ← Back to proposals
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-8">Create New Proposal</h1>

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">✓ Proposal created successfully!</p>
                    <p className="text-sm text-green-700 mt-1">
                        Redirecting to proposal page...
                    </p>
                    <a
                        href={success.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                    >
                        View in Proposales →
                    </a>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">Error: {error}</p>
                </div>
            )}

            {/* AI Helper */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-purple-900">✨ AI Proposal Generator</h3>
                        <p className="text-sm text-purple-700">Let AI help you write a professional proposal</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAIHelper(!showAIHelper)}
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                        {showAIHelper ? "Hide" : "Show"}
                    </button>
                </div>

                {showAIHelper && (
                    <div className="space-y-3">
                        <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Describe what you want to propose... e.g., 'Website redesign for an e-commerce company, including mobile optimization and SEO improvements'"
                            rows={3}
                            className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        />
                        <button
                            type="button"
                            onClick={generateWithAI}
                            disabled={generatingAI || !aiPrompt.trim()}
                            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                            {generatingAI ? "Generating..." : "Generate Proposal Content"}
                        </button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Selection */}
                <div>
                    <label htmlFor="company_id" className="block text-sm font-medium text-gray-700 mb-2">
                        Company *
                    </label>
                    <select
                        id="company_id"
                        required
                        value={formData.company_id}
                        onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select a company</option>
                        {companies.map((company: any) => (
                            <option key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Title */}
                <div>
                    <label htmlFor="title_md" className="block text-sm font-medium text-gray-700 mb-2">
                        Proposal Title *
                    </label>
                    <input
                        type="text"
                        id="title_md"
                        required
                        value={formData.title_md}
                        onChange={(e) => setFormData({...formData, title_md: e.target.value})}
                        placeholder="e.g., Website Redesign Proposal"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description_md" className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Markdown)
                    </label>
                    <textarea
                        id="description_md"
                        value={formData.description_md}
                        onChange={(e) => setFormData({...formData, description_md: e.target.value})}
                        placeholder="Enter proposal description in markdown format..."
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    />
                </div>

                {/* Recipient Information */}
                <div className="border-t pt-6">
                    <h2 className="text-lg font-semibold mb-4">Recipient Information (Optional)</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="recipient_name" className="block text-sm font-medium text-gray-700 mb-2">
                                Recipient Name
                            </label>
                            <input
                                type="text"
                                id="recipient_name"
                                value={formData.recipient_name}
                                onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                                placeholder="John Doe"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="recipient_email" className="block text-sm font-medium text-gray-700 mb-2">
                                Recipient Email
                            </label>
                            <input
                                type="email"
                                id="recipient_email"
                                value={formData.recipient_email}
                                onChange={(e) => setFormData({...formData, recipient_email: e.target.value})}
                                placeholder="john@example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="recipient_company_name"
                                   className="block text-sm font-medium text-gray-700 mb-2">
                                Recipient Company
                            </label>
                            <input
                                type="text"
                                id="recipient_company_name"
                                value={formData.recipient_company_name}
                                onChange={(e) => setFormData({...formData, recipient_company_name: e.target.value})}
                                placeholder="Acme Corp"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading || !formData.company_id || !formData.title_md}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Creating..." : "Create Proposal"}
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </main>
    )
}

export default CreateProposalPage
