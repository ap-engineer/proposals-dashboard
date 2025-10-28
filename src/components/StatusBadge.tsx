import { getStatusColor } from "@/lib/utils"

interface StatusBadgeProps {
    status?: string
    className?: string
}

export const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
    if (!status) return null
    
    return (
        <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusColor(status)} ${className}`}>
            {status}
        </span>
    )
}
