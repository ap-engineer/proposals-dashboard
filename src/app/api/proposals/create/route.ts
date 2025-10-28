import { createProposal } from "@/lib/proposales"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        
        // Validate required fields
        if (!body.company_id || !body.title_md) {
            return NextResponse.json(
                { error: "company_id and title_md are required" },
                { status: 400 }
            )
        }

        const response = await createProposal(body)
        return NextResponse.json(response)
    } catch (err: any) {
        console.error("Error creating proposal:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
