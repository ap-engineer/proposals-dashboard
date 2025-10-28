import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Webhook event types from Proposales
type WebhookEvent = {
    event: string;
    data: {
        uuid?: string;
        id?: string;
        status?: string;
        [key: string]: any;
    };
    timestamp?: number;
};

export async function POST(req: Request) {
    try {
        const event: WebhookEvent = await req.json();
        
        console.log("[Webhook] Received event:", {
            type: event.event,
            timestamp: event.timestamp || Date.now(),
            dataKeys: Object.keys(event.data || {})
        });

        // Handle different event types
        switch (event.event) {
            case "proposal.created":
                console.log("[Webhook] New proposal created:", event.data.uuid);
                // Revalidate the proposals list page
                revalidatePath("/");
                revalidatePath("/api/proposals/list");
                break;

            case "proposal.updated":
                console.log("[Webhook] Proposal updated:", event.data.uuid);
                // Revalidate specific proposal page
                if (event.data.uuid) {
                    revalidatePath(`/proposals/${event.data.uuid}`);
                    revalidatePath(`/api/proposals/${event.data.uuid}`);
                }
                revalidatePath("/");
                break;

            case "proposal.status_changed":
                console.log("[Webhook] Proposal status changed:", {
                    uuid: event.data.uuid,
                    newStatus: event.data.status
                });
                // Revalidate analytics and proposal pages
                revalidatePath("/analytics");
                revalidatePath("/api/analytics");
                if (event.data.uuid) {
                    revalidatePath(`/proposals/${event.data.uuid}`);
                }
                break;

            case "proposal.deleted":
                console.log("[Webhook] Proposal deleted:", event.data.uuid);
                revalidatePath("/");
                revalidatePath("/api/proposals/list");
                revalidatePath("/analytics");
                break;

            default:
                console.log("[Webhook] Unhandled event type:", event.event);
        }

        // Store event in memory (in production, you'd store in a database)
        // This is just for demonstration
        const eventLog = {
            id: crypto.randomUUID(),
            event: event.event,
            data: event.data,
            receivedAt: new Date().toISOString(),
            processed: true
        };

        console.log("[Webhook] Event processed:", eventLog.id);

        return NextResponse.json({ 
            ok: true, 
            eventId: eventLog.id,
            message: "Webhook processed successfully"
        });
    } catch (err: any) {
        console.error("[Webhook] Error:", err);
        return NextResponse.json({ 
            error: err.message,
            ok: false 
        }, { status: 400 });
    }
}

// Optional: Add GET endpoint to verify webhook is working
export async function GET() {
    return NextResponse.json({
        status: "active",
        message: "Proposales webhook endpoint is ready",
        supportedEvents: [
            "proposal.created",
            "proposal.updated",
            "proposal.status_changed",
            "proposal.deleted"
        ]
    });
}