import { ReactNode } from "react"

interface CardProps {
    children: ReactNode
    className?: string
}

export const Card = ({ children, className = "" }: CardProps) => (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}>
        {children}
    </div>
)

export const CardHeader = ({ children, className = "" }: CardProps) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
)

export const CardContent = ({ children, className = "" }: CardProps) => (
    <div className={`p-6 pt-0 ${className}`}>
        {children}
    </div>
)

export const CardTitle = ({ children, className = "" }: CardProps) => (
    <h3 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
        {children}
    </h3>
)

export const CardDescription = ({ children, className = "" }: CardProps) => (
    <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
        {children}
    </p>
)
