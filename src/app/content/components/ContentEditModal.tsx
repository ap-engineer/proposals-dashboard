import { FormEvent } from "react"
import { Modal, Input, Textarea, Select, Button, Alert } from "@/components/ui"

interface ContentEditModalProps {
    isOpen: boolean
    onClose: () => void
    item: any
    onItemChange: (item: any) => void
    onSubmit: (e: FormEvent) => void
    loading: boolean
    error: string
    success: boolean
}

const LANGUAGES = [
    { value: "en", label: "English" },
    { value: "nl", label: "Dutch" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "es", label: "Spanish" }
]

export const ContentEditModal = ({
    isOpen,
    onClose,
    item,
    onItemChange,
    onSubmit,
    loading,
    error,
    success
}: ContentEditModalProps) => {
    if (!item) return null

    const currentLanguage = item.language || "en"
    const availableLanguages = typeof item.title === "object" ? Object.keys(item.title) : [currentLanguage]
    
    const titleValue = typeof item.title === "string"
        ? item.title
        : item.title?.[currentLanguage] || ""
    
    const descriptionValue = typeof item.description === "string"
        ? item.description
        : item.description?.[currentLanguage] || ""

    const handleTitleChange = (value: string) => {
        const lang = currentLanguage
        onItemChange({
            ...item,
            title: typeof item.title === "string"
                ? value
                : { ...item.title, [lang]: value }
        })
    }

    const handleDescriptionChange = (value: string) => {
        const lang = currentLanguage
        onItemChange({
            ...item,
            description: typeof item.description === "string"
                ? value
                : { ...item.description, [lang]: value }
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Content Item" size="md">
            <form onSubmit={onSubmit} className="space-y-4">
                {success && (
                    <Alert variant="success">
                        Content updated successfully! Refreshing...
                    </Alert>
                )}

                {error && (
                    <Alert variant="error">
                        {error}
                    </Alert>
                )}

                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Product ID</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{item.product_id}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Variation ID</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{item.variation_id}</p>
                    </div>
                </div>

                <div>
                    <Select
                        label="Language"
                        value={currentLanguage}
                        onChange={(e) => onItemChange({ ...item, language: e.target.value })}
                        options={LANGUAGES}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Available: {availableLanguages.join(", ")}
                    </p>
                </div>

                <Input
                    label="Title *"
                    required
                    value={titleValue}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Professional Website Design"
                />

                <Textarea
                    label="Description"
                    value={descriptionValue}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    rows={4}
                    placeholder="Detailed description..."
                />

                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? "Updating..." : "Update Content"}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
