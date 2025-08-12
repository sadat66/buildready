"use client";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">
            Loading...
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Please wait while we load your content.
          </p>
        </div>
      </div>
    </div>
  );
}
