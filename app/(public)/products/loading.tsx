import React from 'react';

const Loading: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            <span className="ml-4 text-gray-700">Loading...</span>
        </div>
    );
};

export default Loading;