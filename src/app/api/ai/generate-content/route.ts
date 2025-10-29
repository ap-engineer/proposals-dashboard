import {groq} from "@ai-sdk/groq"
import {generateText} from "ai"
import {z} from "zod"
import {NextResponse} from "next/server"

const contentSchema = z.object({
    title: z.string().describe("Product/service title"),
    description: z.string().describe("Detailed description in markdown"),
    keyFeatures: z.array(z.string()).describe("3-5 key features or benefits"),
    suggestedPrice: z.number().describe("Suggested price in dollars"),
    category: z.string().describe("Product category"),
})

export async function POST(req: Request) {
    try {
        const {prompt, category} = await req.json()

        if (!prompt) {
            return NextResponse.json({error: "Prompt is required"}, {status: 400})
        }

        const groqKey = process.env.GROQ_API_KEY
        if (!groqKey) {
            return NextResponse.json({
                error: "Groq API key not configured",
                fallback: {
                    title: "Sample Product",
                    description: "Get free Groq API key at https://console.groq.com",
                    keyFeatures: ["Feature 1", "Feature 2", "Feature 3"],
                    suggestedPrice: 0,
                    category: "General"
                }
            }, {status: 200})
        }

        const {text} = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            prompt: `You are an expert product manager. Generate a professional product/service content item.

You MUST respond with valid JSON matching this exact structure:
{
  "title": "string",
  "description": "string (markdown format)",
  "keyFeatures": ["string"],
  "suggestedPrice": number,
  "category": "string"
}

Generate content for:
Product/Service: ${prompt}
${category ? `Category: ${category}` : ''}

Create a compelling product/service with:
- A clear, professional title
- Detailed description with benefits (use markdown formatting)
- 3-5 key features or selling points
- A realistic suggested price
- Appropriate category

Make it professional and market-ready.

Respond ONLY with the JSON object, no other text.`,
        })

        const object = JSON.parse(text)
        return NextResponse.json(object)

    } catch (err: any) {
        console.error("Error generating content:", err)
        return NextResponse.json({error: err.message}, {status: 500})
    }
}
