import { useState, FormEvent } from "react"
import { Card, CardContent, Input, Button, Alert } from "@/components/ui"

interface AIContentGeneratorProps {
    onGenerate: (content: any) => void
}

export const AIContentGenerator = ({ onGenerate }: AIContentGeneratorProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [prompt, setPrompt] = useState("")
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState("")

    const handleGenerate = async (e: FormEvent) => {
        e.preventDefault()
        if (!prompt.trim()) return

        setGenerating(true)
        setError("")

        try {
            const response = await fetch("/api/ai/generate-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            })

            const data = await response.json()

            if (data.error && data.fallback) {
                // Use fallback data
                onGenerate(data.fallback)
                setPrompt("")
                setIsOpen(false)
            } else if (data.title) {
                // Use AI generated data
                onGenerate(data)
                setPrompt("")
                setIsOpen(false)
            } else {
                setError("Failed to generate content")
            }
        } catch (err: any) {
            console.error("Content generation error:", err)
            setError("Failed to generate content. Please try again.")
        } finally {
            setGenerating(false)
        }
    }

    return (
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-green-900 dark:text-green-300">✨ AI Content Generator</h3>
                        <p className="text-sm text-green-700 dark:text-green-400">
                            Generate product/service content ideas with AI
                        </p>
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
                    <form onSubmit={handleGenerate} className="space-y-4 mt-4">
                        {error && (
                            <Alert variant="error">
                                {error}
                            </Alert>
                        )}

                        <Input
                            label="Describe what you want to create"
                            placeholder="e.g., A premium web design service for small businesses"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            disabled={generating || !prompt.trim()}
                            className="w-full"
                        >
                            {generating ? "Generating..." : "✨ Generate Content"}
                        </Button>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            AI will generate a title, description, and suggestions for your content item
                        </p>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}
