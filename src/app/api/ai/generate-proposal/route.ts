import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { z } from "zod"
import { NextResponse } from "next/server"

const proposalSchema = z.object({
    title: z.string().describe("A compelling proposal title"),
    description: z.string().describe("Detailed proposal description in markdown format"),
    keyPoints: z.array(z.string()).describe("3-5 key selling points"),
    estimatedValue: z.number().describe("Estimated proposal value in dollars"),
})

export async function POST(req: Request) {
    try {
        const { prompt, companyName, recipientName } = await req.json()

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
        }

        const groqKey = process.env.GROQ_API_KEY
        if (!groqKey) {
            return NextResponse.json({
                error: "Groq API key not configured",
                fallback: {
                    title: "Sample Proposal",
                    description: "Get free Groq API key at https://console.groq.com and add GROQ_API_KEY to enable AI generation",
                    keyPoints: ["Get free Groq API key", "Add to .env file", "Enjoy AI features"],
                    estimatedValue: 0
                }
            }, { status: 200 })
        }

        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            prompt: `You are an expert business proposal writer. Generate a professional proposal based on this request.

You MUST respond with valid JSON matching this exact structure:
{
  "title": "string",
  "description": "string (markdown format)",
  "keyPoints": ["string"],
  "estimatedValue": number
}

Generate a proposal for:

Request: ${prompt}
${companyName ? `Company: ${companyName}` : ''}
${recipientName ? `Recipient: ${recipientName}` : ''}

Create a compelling, professional proposal with:
- A clear, engaging title
- Detailed description with benefits and deliverables (use markdown formatting)
- 3-5 key selling points
- A realistic estimated value

Make it persuasive and professional.

Respond ONLY with the JSON object, no other text.`,
        })

        const object = JSON.parse(text)
        return NextResponse.json(object)

    } catch (err: any) {
        console.error("Error generating proposal:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
