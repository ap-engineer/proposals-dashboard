import {listCompanies} from "@/lib/proposales"
import {NextResponse} from "next/server"

export async function GET() {
    try {
        const response = await listCompanies()
        return NextResponse.json(response)
    } catch (err: any) {
        console.error("Error fetching companies:", err)
        return NextResponse.json({error: err.message}, {status: 500})
    }
}
