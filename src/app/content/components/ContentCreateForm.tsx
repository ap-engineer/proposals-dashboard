import { FormEvent, useState, useEffect } from "react"
import { Card, CardContent, Input, Textarea, Select, Button, Alert } from "@/components/ui"

interface ContentCreateFormProps {
    onSubmit: (data: any) => Promise<void>
    prefillData?: {
        title?: string
        description?: string
        imageUrl?: string
    }
}

const LANGUAGES = [
    { value: "en", label: "English" },
    { value: "nl", label: "Dutch" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "es", label: "Spanish" }
]

export const ContentCreateForm = ({ onSubmit, prefillData }: ContentCreateFormProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: "",
        language: "en"
    })

    // Prefill form when AI generates content
    useEffect(() => {
        if (prefillData) {
            setFormData(prev => ({
                ...prev,
                title: prefillData.title || prev.title,
                description: prefillData.description || prev.description,
                imageUrl: prefillData.imageUrl || prev.imageUrl
            }))
            setIsOpen(true) // Auto-open form when prefilled
        }
    }, [prefillData])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess(false)

        try {
            await onSubmit(formData)
            setSuccess(true)
            setFormData({ title: "", description: "", imageUrl: "", language: "en" })
            setTimeout(() => {
                window.location.reload()
            }, 1500)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-300">Create Content Item</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400">Add a new product or service to your library</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? "Hide" : "Show"}
                    </Button>
                </div>

                {isOpen && (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {prefillData && (
                            <Alert variant="info">
                                ✨ Form prefilled with AI-generated content. Review and edit as needed.
                            </Alert>
                        )}

                        {success && (
                            <Alert variant="success">
                                Content created successfully! Refreshing...
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="error">
                                {error}
                            </Alert>
                        )}

                        <Input
                            label="Title *"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Professional Website Design"
                        />

                        <Textarea
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed description of your product or service..."
                            rows={3}
                        />

                        <Input
                            label="Image URL (optional)"
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                            Provide a publicly accessible image URL
                        </p>

                        <Select
                            label="Language"
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            options={LANGUAGES}
                        />

                        <Button type="submit" disabled={loading || !formData.title} className="w-full">
                            {loading ? "Creating..." : "Create Content Item"}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}
