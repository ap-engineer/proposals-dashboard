interface EmptyStateProps {
    title: string
    description: string
    icon?: React.ReactNode
    action?: React.ReactNode
}

export const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => (
    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        {icon && <div className="mb-4">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {action && <div>{action}</div>}
    </div>
)
