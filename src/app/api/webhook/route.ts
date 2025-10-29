import {NextResponse} from "next/server";
import {revalidatePath} from "next/cache";

// Webhook event types from Proposales
// Based on: https://docs.proposales.com/webhooks/*
type WebhookEvent = {
    event: string;
    data: {
        uuid?: string;
        id?: string;
        status?: string;
        proposal_uuid?: string;
        content_id?: number;
        integration_id?: number;
        [key: string]: any;
    };
    timestamp?: number;
};

// Store recent webhook events in memory (in production, use a database)
const recentEvents: Array<{
    id: string;
    event: string;
    timestamp: string;
    processed: boolean;
}> = [];

export async function POST(req: Request) {
    try {
        const event: WebhookEvent = await req.json();

        console.log("[Webhook] Received event:", {
            type: event.event,
            timestamp: event.timestamp || Date.now(),
            dataKeys: Object.keys(event.data || {})
        });

        // Handle different event types
        // Based on Proposales webhook documentation
        switch (event.event) {
            // Proposal Events
            case "proposal.created":
                console.log("[Webhook] New proposal created:", event.data.uuid);
                revalidatePath("/");
                revalidatePath("/api/proposals/list");
                revalidatePath("/analytics");
                break;

            case "proposal.updated":
                console.log("[Webhook] Proposal updated:", event.data.uuid);
                if (event.data.uuid) {
                    revalidatePath(`/proposals/${event.data.uuid}`);
                    revalidatePath(`/api/proposals/${event.data.uuid}`);
                }
                revalidatePath("/");
                break;

            case "proposal.status_changed":
            case "proposal.status_update":
                console.log("[Webhook] Proposal status changed:", {
                    uuid: event.data.uuid || event.data.proposal_uuid,
                    newStatus: event.data.status
                });
                revalidatePath("/analytics");
                revalidatePath("/api/analytics");
                const proposalId = event.data.uuid || event.data.proposal_uuid;
                if (proposalId) {
                    revalidatePath(`/proposals/${proposalId}`);
                }
                revalidatePath("/");
                break;

            case "proposal.deleted":
                console.log("[Webhook] Proposal deleted:", event.data.uuid);
                revalidatePath("/");
                revalidatePath("/api/proposals/list");
                revalidatePath("/analytics");
                break;

            // Content Events (for future integrations)
            case "content.import":
                console.log("[Webhook] Content import:", event.data.content_id);
                revalidatePath("/api/content");
                break;

            case "content.availability":
                console.log("[Webhook] Content availability changed:", event.data.content_id);
                revalidatePath("/api/content");
                break;

            case "content.details":
                console.log("[Webhook] Content details updated:", event.data.content_id);
                revalidatePath("/api/content");
                break;

            // Integration Events
            case "integration.config":
                console.log("[Webhook] Integration config:", event.data.integration_id);
                // Handle integration configuration changes
                break;

            case "recipients.search":
                console.log("[Webhook] Recipients search:", event.data);
                // Handle recipient search requests
                break;

            // Widget Events
            case "data.widget":
                console.log("[Webhook] Data widget event:", event.data);
                // Handle data widget interactions
                break;

            case "editor.widget":
                console.log("[Webhook] Editor widget event:", event.data);
                // Handle editor widget interactions
                break;

            default:
                console.log("[Webhook] Unhandled event type:", event.event);
            // Log for future implementation
        }

        // Store event in memory (in production, you'd store in a database)
        const eventLog = {
            id: crypto.randomUUID(),
            event: event.event,
            timestamp: new Date().toISOString(),
            processed: true
        };

        // Keep last 50 events in memory
        recentEvents.unshift(eventLog);
        if (recentEvents.length > 50) {
            recentEvents.pop();
        }

        console.log("[Webhook] Event processed:", eventLog.id);

        return NextResponse.json({
            ok: true,
            eventId: eventLog.id,
            message: "Webhook processed successfully",
            event: event.event
        });
    } catch (err: any) {
        console.error("[Webhook] Error:", err);
        return NextResponse.json({
            error: err.message,
            ok: false
        }, {status: 400});
    }
}

// GET endpoint to verify webhook status and view recent events
export async function GET() {
    return NextResponse.json({
        status: "active",
        message: "Proposales webhook endpoint is ready",
        supportedEvents: {
            proposals: [
                "proposal.created",
                "proposal.updated",
                "proposal.status_changed",
                "proposal.status_update",
                "proposal.deleted"
            ],
            content: [
                "content.import",
                "content.availability",
                "content.details"
            ],
            integrations: [
                "integration.config",
                "recipients.search"
            ],
            widgets: [
                "data.widget",
                "editor.widget"
            ]
        },
        recentEvents: recentEvents.slice(0, 10), // Last 10 events
        totalEventsProcessed: recentEvents.length,
        documentation: {
            webhooks: "https://docs.proposales.com/webhooks/",
            entities: "https://docs.proposales.com/api-reference/entities/"
        }
    });
}