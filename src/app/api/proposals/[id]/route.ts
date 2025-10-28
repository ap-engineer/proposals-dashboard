import { getProposal } from "@/lib/proposales"
import { NextResponse } from "next/server"

export async function GET(
    _: Request, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const response = await getProposal(id)
        // API returns { data: { ... } }, we'll pass it through
        return NextResponse.json(response)
    } catch (err: any) {
        console.error("Error fetching proposal:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
