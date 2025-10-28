"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CreateProposalPage() {
    const router = useRouter()
    const { data: companiesData } = useSWR("/api/companies", fetcher)
    
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

    const companies = companiesData?.data || []

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
                payload.recipient = {
                    name: formData.recipient_name || undefined,
                    email: formData.recipient_email || undefined,
                    company_name: formData.recipient_company_name || undefined
                }
            }

            const response = await fetch("/api/proposals/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
                        onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, title_md: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, description_md: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                                placeholder="john@example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="recipient_company_name" className="block text-sm font-medium text-gray-700 mb-2">
                                Recipient Company
                            </label>
                            <input
                                type="text"
                                id="recipient_company_name"
                                value={formData.recipient_company_name}
                                onChange={(e) => setFormData({ ...formData, recipient_company_name: e.target.value })}
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
