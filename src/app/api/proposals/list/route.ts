import { listProposals } from "@/lib/proposales"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const response = await listProposals()
        // API returns { data: { ... } }, we'll pass it through
        return NextResponse.json(response)
    } catch (err: any) {
        console.error("Error fetching proposals:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
