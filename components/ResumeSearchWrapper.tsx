'use client';

import { Suspense } from 'react';
import { ResumeSearch } from './ResumeSearch';
import { Skeleton } from '@/components/ui/skeleton';

function ResumeSearchSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[140px]" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
}

export function ResumeSearchWrapper() {
  return (
    <Suspense fallback={<ResumeSearchSkeleton />}>
      <ResumeSearch />
    </Suspense>
  );
} 