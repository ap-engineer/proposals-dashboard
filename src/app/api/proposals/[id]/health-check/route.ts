import {getProposal} from "@/lib/proposales"
import {groq} from "@ai-sdk/groq"
import {generateText} from "ai"
import {z} from "zod"
import {NextResponse} from "next/server"

const healthCheckSchema = z.object({
    overallScore: z.number().min(0).max(100).describe("Overall proposal quality score 0-100"),
    scores: z.object({
        clarity: z.number().min(0).max(100).describe("How clear and understandable is the proposal"),
        completeness: z.number().min(0).max(100).describe("How complete is the information"),
        professionalism: z.number().min(0).max(100).describe("Professional quality and tone"),
        persuasiveness: z.number().min(0).max(100).describe("How persuasive and compelling it is"),
    }),
    strengths: z.array(z.string()).describe("2-3 key strengths of this proposal"),
    weaknesses: z.array(z.string()).describe("2-3 areas that need improvement"),
    recommendations: z.array(z.string()).describe("3-4 specific actionable recommendations"),
    verdict: z.enum(["excellent", "good", "needs_work", "poor"]).describe("Overall verdict"),
})

export async function POST(
    _: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    try {
        const {id} = await params
        const response = await getProposal(id)
        const proposal = response.data

        if (!proposal) {
            return NextResponse.json({error: "Proposal not found"}, {status: 404})
        }

        const groqKey = process.env.GROQ_API_KEY
        if (!groqKey) {
            return NextResponse.json({
                error: "Groq API key not configured",
                fallback: {
                    overallScore: 50,
                    scores: {clarity: 50, completeness: 50, professionalism: 50, persuasiveness: 50},
                    strengths: ["Proposal exists", "Has basic structure"],
                    weaknesses: ["Add OpenAI API key to get detailed analysis"],
                    recommendations: ["Get free Groq API key at https://console.groq.com", "Add GROQ_API_KEY to .env", "Try the health check again"],
                    verdict: "needs_work" as const
                }
            }, {status: 200})
        }

        const {text} = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            prompt: `You are an expert business proposal reviewer. Analyze this proposal and provide a detailed health check.

You MUST respond with valid JSON matching this exact structure:
{
  "overallScore": number (0-100),
  "scores": {
    "clarity": number (0-100),
    "completeness": number (0-100),
    "professionalism": number (0-100),
    "persuasiveness": number (0-100)
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "verdict": "excellent" | "good" | "needs_work" | "poor"
}

Analyze this proposal:

Proposal Details:
- Title: ${proposal.title || "Untitled"}
- Description: ${proposal.description_md || proposal.description_html || "No description provided"}
- Status: ${proposal.status || "Unknown"}
- Company: ${proposal.company_name || "N/A"}
- Recipient: ${proposal.recipient_name || "N/A"}
- Value: ${proposal.value_without_tax ? `$${proposal.value_without_tax}` : "Not specified"}

Evaluate the proposal on:
1. Clarity - Is it easy to understand?
2. Completeness - Does it have all necessary information?
3. Professionalism - Is the tone and presentation professional?
4. Persuasiveness - Is it compelling and likely to win?

Provide:
- Overall score (0-100)
- Individual scores for each criterion
- 2-3 key strengths
- 2-3 weaknesses or areas for improvement
- 3-4 specific, actionable recommendations
- Overall verdict (excellent/good/needs_work/poor)

Be constructive and specific in your feedback.

Respond ONLY with the JSON object, no other text.`,
        })

        const object = JSON.parse(text)
        return NextResponse.json(object)

    } catch (err: any) {
        console.error("Error generating health check:", err)
        return NextResponse.json({error: err.message}, {status: 500})
    }
}
