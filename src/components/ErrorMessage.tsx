interface ErrorMessageProps {
    message: string
}

export const ErrorMessage = ({message}: ErrorMessageProps) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">
            <span className="font-semibold">Error:</span> {message}
        </p>
    </div>
)
