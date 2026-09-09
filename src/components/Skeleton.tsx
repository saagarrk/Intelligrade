import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-zinc-800 via-zinc-700/60 to-zinc-800 rounded-lg ${className}`}
    />
  );
};

export const KPICardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-36" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="border-b border-zinc-800/60">
      <td className="py-3.5 px-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </td>
      <td className="py-3.5 px-3">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="py-3.5 px-3">
        <Skeleton className="h-5 w-14 rounded-md" />
      </td>
      <td className="py-3.5 px-3">
        <Skeleton className="h-3 w-12" />
      </td>
      <td className="py-3.5 px-3">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="py-3.5 px-3 text-right">
        <Skeleton className="h-7 w-24 rounded-lg ml-auto" />
      </td>
    </tr>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center pb-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-7 w-36 rounded-lg" />
      </div>
      <div className="overflow-x-auto border border-zinc-800 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/80 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-3"><Skeleton className="h-3 w-24" /></th>
              <th className="py-3 px-3"><Skeleton className="h-3 w-16" /></th>
              <th className="py-3 px-3"><Skeleton className="h-3 w-16" /></th>
              <th className="py-3 px-3"><Skeleton className="h-3 w-16" /></th>
              <th className="py-3 px-3"><Skeleton className="h-3 w-14" /></th>
              <th className="py-3 px-3 text-right"><Skeleton className="h-3 w-16 ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="bg-zinc-900/50">
            {Array.from({ length: rows }).map((_, idx) => (
              <TableRowSkeleton key={idx} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-52' }) => {
  return (
    <div className={`w-full ${height} bg-zinc-950/60 rounded-xl border border-zinc-800 p-4 flex flex-col justify-between`}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex items-end justify-around gap-2 h-32 px-4 pt-4">
        <Skeleton className="h-[45%] w-10 rounded-t-md" />
        <Skeleton className="h-[80%] w-10 rounded-t-md" />
        <Skeleton className="h-[65%] w-10 rounded-t-md" />
        <Skeleton className="h-[90%] w-10 rounded-t-md" />
        <Skeleton className="h-[35%] w-10 rounded-t-md" />
      </div>
      <div className="flex justify-around pt-2 border-t border-zinc-800/80">
        <Skeleton className="h-2.5 w-8" />
        <Skeleton className="h-2.5 w-8" />
        <Skeleton className="h-2.5 w-8" />
        <Skeleton className="h-2.5 w-8" />
        <Skeleton className="h-2.5 w-8" />
      </div>
    </div>
  );
};

export const TeacherDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner Skeleton */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-3 w-80" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
            <Skeleton className="h-9 w-44 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Notification Banner Skeleton */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>

      {/* Main 2-Column Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
            <Skeleton className="h-4 w-52" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>

          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
            <TableSkeleton rows={4} />
          </div>

          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
            <ChartSkeleton />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const StudentDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Student Banner */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-3.5 w-72" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 pb-2">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      {/* Main Content Area */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height="h-64" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
