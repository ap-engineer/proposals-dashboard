import { getProposal } from "@/lib/proposales"
import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import { z } from "zod"

// Define structured output schema using Zod
const insightsSchema = z.object({
    summary: z.string().describe("A brief 2-3 sentence summary of the proposal"),
    keyPoints: z.array(z.string()).describe("3-5 key points about this proposal"),
    suggestions: z.array(z.string()).describe("2-3 actionable suggestions to improve the proposal"),
    sentiment: z.enum(["positive", "neutral", "negative"]).describe("Overall sentiment of the proposal"),
    confidence: z.number().min(0).max(100).describe("Confidence score of the analysis (0-100)")
})

export async function POST(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const response = await getProposal(id)
        const proposal = response.data

        if (!proposal) {
            return new Response(
                JSON.stringify({ error: "Proposal not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            )
        }

        // Check for Groq API key
        const groqKey = process.env.GROQ_API_KEY
        
        if (!groqKey) {
            // No API key - return fallback with instructions
            return new Response(
                JSON.stringify({
                    error: "Groq API key not configured",
                    fallback: {
                        summary: `Proposal: ${proposal.title || "Untitled"}. Add OPENAI_API_KEY to enable AI-powered insights.`,
                        keyPoints: [
                            `Status: ${proposal.status || "Unknown"}`,
                            `Company: ${proposal.company_name || "N/A"}`,
                            `Created: ${proposal.created_at ? new Date(proposal.created_at).toLocaleDateString() : "N/A"}`
                        ],
                        suggestions: [
                            "Get free Groq API key at https://console.groq.com",
                            "Add GROQ_API_KEY to your .env file"
                        ],
                        sentiment: "neutral" as const,
                        confidence: 0
                    }
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            )
        }

        // Use Vercel AI SDK with Groq (JSON mode)
        const result = await streamText({
            model: groq("llama-3.3-70b-versatile"),
            prompt: `You are an expert business analyst. Analyze this proposal and provide detailed insights.

You MUST respond with valid JSON matching this exact structure:
{
  "summary": "string",
  "keyPoints": ["string"],
  "suggestions": ["string"],
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": number (0-100)
}

Analyze this proposal:

Proposal Details:
- Title: ${proposal.title || "Untitled"}
- Status: ${proposal.status || "Unknown"}
- Description: ${proposal.description_md || proposal.description_html || "No description"}
- Company: ${proposal.company_name || "N/A"}
- Recipient: ${proposal.recipient_name || "N/A"}
- Recipient Company: ${proposal.recipient_company_name || "N/A"}
- Value: ${proposal.value_without_tax ? `$${proposal.value_without_tax}` : "N/A"}
- Created: ${proposal.created_at ? new Date(proposal.created_at).toLocaleDateString() : "N/A"}

Provide:
1. A compelling summary highlighting the proposal's purpose and value
2. 3-5 key points about strengths, opportunities, or important details
3. 2-3 specific, actionable suggestions to improve the proposal
4. Overall sentiment (positive/neutral/negative)
5. Your confidence level in this analysis (0-100)

Respond ONLY with the JSON object, no other text.`,
        })

        return result.toTextStreamResponse()

    } catch (err: any) {
        console.error("Error generating insights:", err)
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        )
    }
}
