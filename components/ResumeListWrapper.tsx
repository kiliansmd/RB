'use client';

import { Suspense } from 'react';
import { ResumeList } from './ResumeList';
import { Skeleton } from '@/components/ui/skeleton';

function ResumeListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6 flex-1">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-7 w-64" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-48" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-6 w-16 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResumeListWrapper() {
  return (
    <Suspense fallback={<ResumeListSkeleton />}>
      <ResumeList />
    </Suspense>
  );
} 