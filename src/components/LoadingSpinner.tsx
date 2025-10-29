interface LoadingSpinnerProps {
    message?: string
}

export const LoadingSpinner = ({message = "Loading..."}: LoadingSpinnerProps) => (
    <div className="flex items-center justify-center p-8">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"/>
            <p className="text-gray-600">{message}</p>
        </div>
    </div>
)
