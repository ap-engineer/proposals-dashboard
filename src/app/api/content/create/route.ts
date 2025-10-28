import { createContent } from "@/lib/proposales"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
    try {
        const body = await req.json()
        
        // Validate required fields
        if (!body.company_id || !body.language || !body.title) {
            return NextResponse.json(
                { error: "company_id, language, and title are required" },
                { status: 400 }
            )
        }

        const response = await createContent(body)
        return NextResponse.json(response)
    } catch (err: any) {
        console.error("Error creating content:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
