import { SelectHTMLAttributes, forwardRef } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    options?: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, children, className = "", ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`
                        w-full px-3 py-2
                        border border-gray-300 dark:border-gray-600
                        rounded-lg
                        bg-white dark:bg-gray-800
                        text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        disabled:bg-gray-100 dark:disabled:bg-gray-900
                        disabled:cursor-not-allowed
                        ${error ? "border-red-500" : ""}
                        ${className}
                    `}
                    {...props}
                >
                    {options ? (
                        options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))
                    ) : children}
                </select>
                {error && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
            </div>
        )
    }
)

Select.displayName = "Select"
