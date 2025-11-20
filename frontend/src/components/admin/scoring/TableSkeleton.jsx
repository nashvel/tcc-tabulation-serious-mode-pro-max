import React from 'react';

export default function TableSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Premium Skeleton Loader */}
      <div className="w-full h-20 bg-slate-100 rounded-xl mb-8"></div>
      
      <div className="space-y-6">
        {/* Table Header Skeleton */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-8 w-1 bg-slate-200 rounded-full"></div>
          <div className="h-8 w-48 bg-slate-200 rounded"></div>
        </div>

        {/* Table Skeleton */}
        <div className="w-full border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="h-12 bg-slate-50 border-b border-slate-200 flex">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex-1 mx-2 my-3 bg-slate-200 rounded h-6"></div>
            ))}
          </div>
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 bg-white border-b border-slate-100 flex items-center px-4">
              <div className="w-8 h-8 bg-slate-100 rounded-full mr-4"></div>
              <div className="w-48 h-6 bg-slate-100 rounded mr-auto"></div>
              {[1,2,3,4,5].map(j => (
                <div key={j} className="w-16 h-8 bg-slate-50 rounded mx-2"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
