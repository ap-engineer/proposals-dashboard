import { listContent } from "@/lib/proposales"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const response = await listContent()
        return NextResponse.json(response)
    } catch (err: any) {
        console.error("Error fetching content:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
