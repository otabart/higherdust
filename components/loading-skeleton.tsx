export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00c389] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading SWAPDUST...</p>
      </div>
    </div>
  );
} 