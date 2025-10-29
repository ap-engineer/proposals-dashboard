import {updateContent} from "@/lib/proposales"
import {NextResponse} from "next/server"

export const PUT = async (req: Request) => {
    try {
        const body = await req.json()

        // Validate required fields
        if (!body.product_id || !body.variation_id || !body.language || !body.title) {
            return NextResponse.json(
                {error: "product_id, variation_id, language, and title are required"},
                {status: 400}
            )
        }

        const response = await updateContent(body)
        return NextResponse.json(response)
    } catch (err: any) {
        console.error("Error updating content:", err)
        return NextResponse.json({error: err.message}, {status: 500})
    }
}
