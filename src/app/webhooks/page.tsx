"use client"
import { useState, useEffect } from "react"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardTitle, Badge } from "@/components/ui"
import { LoadingSpinner } from "@/components/LoadingSpinner"

const WebhooksPage = () => {
    const [webhookData, setWebhookData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchWebhookStatus = async () => {
            try {
                const response = await fetch("/api/webhook")
                const data = await response.json()
                setWebhookData(data)
            } catch (err) {
                console.error("Error fetching webhook status:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchWebhookStatus()
        // Refresh every 10 seconds
        const interval = setInterval(fetchWebhookStatus, 10000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <main className="container max-w-7xl mx-auto py-8 px-4">
                <LoadingSpinner />
            </main>
        )
    }

    return (
        <main className="container max-w-7xl mx-auto py-8 px-4">
            <PageHeader
                title="Webhook Status"
                description="Monitor real-time events from Proposales"
                backLink="/"
            />

            {/* Status Card */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="mb-2">Webhook Endpoint</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {webhookData?.message || "Webhook endpoint is active"}
                            </p>
                        </div>
                        <Badge variant="success">
                            {webhookData?.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Webhook URL:</p>
                        <code className="text-sm text-gray-900 dark:text-gray-100">
                            {typeof window !== "undefined" ? `${window.location.origin}/api/webhook` : "/api/webhook"}
                        </code>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Events */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <CardTitle className="mb-4">
                        Recent Events ({webhookData?.totalEventsProcessed || 0})
                    </CardTitle>
                    {webhookData?.recentEvents && webhookData.recentEvents.length > 0 ? (
                        <div className="space-y-2">
                            {webhookData.recentEvents.map((event: any) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge variant={event.processed ? "success" : "warning"}>
                                            {event.processed ? "Processed" : "Pending"}
                                        </Badge>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {event.event}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(event.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                            No events received yet. Webhooks will appear here when triggered.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Supported Events */}
            <Card>
                <CardContent className="p-6">
                    <CardTitle className="mb-4">Supported Events</CardTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {webhookData?.supportedEvents && Object.entries(webhookData.supportedEvents).map(([category, events]: [string, any]) => (
                            <div key={category}>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 capitalize">
                                    {category}
                                </h3>
                                <ul className="space-y-1">
                                    {events.map((event: string) => (
                                        <li key={event} className="text-sm text-gray-600 dark:text-gray-400">
                                            • {event}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Documentation Links */}
            {webhookData?.documentation && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        Documentation
                    </h3>
                    <div className="space-y-1">
                        {Object.entries(webhookData.documentation).map(([key, url]: [string, any]) => (
                            <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {key.charAt(0).toUpperCase() + key.slice(1)} Documentation →
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </main>
    )
}

export default WebhooksPage
