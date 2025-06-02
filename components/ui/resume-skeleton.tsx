import { Skeleton } from "@/components/ui/skeleton";

export function ResumeSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-2/3">
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-32 bg-gray-950" />
                  <Skeleton className="h-6 w-40 bg-gray-950" />
                </div>
                <Skeleton className="h-12 w-64 bg-gray-950 mb-2" />
                <Skeleton className="h-8 w-48 bg-gray-950 mb-6" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-6 w-48 bg-gray-950" />
                  ))}
                </div>
                
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-6 w-20 bg-gray-950" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-64 mb-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-lg p-6">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-20 mx-auto mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 