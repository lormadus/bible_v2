
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center mt-6 py-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-sky-600"></div>
      <p className="ml-3 text-sky-700">말씀을 찾고 있습니다...</p>
    </div>
  );
};
