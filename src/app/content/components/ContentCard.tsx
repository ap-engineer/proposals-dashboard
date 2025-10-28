import { Card, CardContent, Badge, Button } from "@/components/ui"

interface ContentCardProps {
    item: any
    onEdit: (item: any) => void
}

export const ContentCard = ({ item, onEdit }: ContentCardProps) => {
    const title = typeof item.title === "string"
        ? item.title
        : item.title?.en || item.title?.fr || item.title?.nl || Object.values(item.title || {})[0] || "Untitled"
    
    const description = typeof item.description === "string"
        ? item.description
        : item.description?.en || item.description?.fr || item.description?.nl || Object.values(item.description || {})[0] || ""

    return (
        <Card className={item.deactivated_at ? "opacity-60" : ""}>
            {/* Image Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                <svg
                    className="w-16 h-16 text-gray-400 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                </svg>
            </div>

            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg flex-1 text-gray-900 dark:text-gray-100">
                        {title}
                    </h3>
                    {item.deactivated_at && (
                        <Badge variant="default">Archived</Badge>
                    )}
                </div>

                {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {description}
                    </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <div>
                        {item.product_id && (
                            <span className="mr-2">Product: {item.product_id}</span>
                        )}
                        {item.variation_id && (
                            <span>Variation: {item.variation_id}</span>
                        )}
                    </div>
                </div>

                {item.created_at && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Created: {new Date(item.created_at).toLocaleDateString()}
                    </div>
                )}

                {item.integration_id && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mb-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Integration ID: {item.integration_id}
                        </p>
                    </div>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="w-full"
                >
                    Edit Content
                </Button>
            </CardContent>
        </Card>
    )
}
