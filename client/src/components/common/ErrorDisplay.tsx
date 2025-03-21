interface ErrorDisplayProps {
    error: string;
    onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
            <div className="p-8 bg-white rounded-lg shadow-lg text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 text-red-600">
                    <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-red-800">
                    Error Loading Classroom
                </h3>
                <p className="mb-4 text-gray-600">{error}</p>
                <button
                    onClick={onRetry || (() => window.location.reload())}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
};

export default ErrorDisplay;