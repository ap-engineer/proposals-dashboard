import { Input } from "./ui"

interface SearchFilterProps {
    searchValue: string
    onSearchChange: (value: string) => void
    filters?: {
        label: string
        value: string
        count?: number
    }[]
    activeFilter?: string
    onFilterChange?: (value: string) => void
}

export const SearchFilter = ({
    searchValue,
    onSearchChange,
    filters,
    activeFilter,
    onFilterChange
}: SearchFilterProps) => {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {filters && onFilterChange && (
                    <div className="flex gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => onFilterChange(filter.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeFilter === filter.value
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                }`}
                            >
                                {filter.label}
                                {filter.count !== undefined && (
                                    <span className="ml-2 text-sm opacity-75">({filter.count})</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
