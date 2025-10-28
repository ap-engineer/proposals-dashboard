import { useState } from "react"
import { AIContentGenerator } from "./AIContentGenerator"
import { ContentCreateForm } from "./ContentCreateForm"

interface ContentPageWrapperProps {
    onCreateContent: (data: any) => Promise<void>
}

export const ContentPageWrapper = ({ onCreateContent }: ContentPageWrapperProps) => {
    const [generatedContent, setGeneratedContent] = useState<any>(null)

    const handleAIGenerate = (content: any) => {
        // Transform AI response to form data
        const formData = {
            title: content.title || "",
            description: content.description || "",
            imageUrl: content.imageUrl || ""
        }
        setGeneratedContent(formData)
    }

    const handleCreate = async (data: any) => {
        await onCreateContent(data)
        setGeneratedContent(null) // Clear after creation
    }

    return (
        <>
            <AIContentGenerator onGenerate={handleAIGenerate} />
            <ContentCreateForm 
                onSubmit={handleCreate}
                prefillData={generatedContent}
            />
        </>
    )
}
