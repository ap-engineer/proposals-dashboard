import {ReactNode, ButtonHTMLAttributes} from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
    size?: "sm" | "md" | "lg"
    className?: string
}

const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700",
    ghost: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300"
}

const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
}

export const Button = ({
                           children,
                           variant = "primary",
                           size = "md",
                           className = "",
                           disabled,
                           ...props
                       }: ButtonProps) => {
    return (
        <button
            className={`
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                rounded-lg font-medium
                transition-colors
                disabled:cursor-not-allowed
                ${className}
            `}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
}
