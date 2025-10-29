import Link from "next/link"
import {ReactNode} from "react"

interface PageHeaderProps {
    title: string
    description?: string
    backLink?: string
    actions?: ReactNode
}

export const PageHeader = ({title, description, backLink, actions}: PageHeaderProps) => {
    return (
        <div className="mb-8">
            {backLink && (
                <div className="mb-6">
                    <Link href={backLink} className="text-blue-600 hover:underline dark:text-blue-400">
                        ← Back
                    </Link>
                </div>
            )}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">{title}</h1>
                    {description && (
                        <p className="text-gray-600 dark:text-gray-400">{description}</p>
                    )}
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
            </div>
        </div>
    )
}
