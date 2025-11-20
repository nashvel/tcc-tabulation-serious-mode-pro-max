import React from 'react';
import { CalendarX } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-fade-in">
      <div className="bg-slate-50 p-6 rounded-full mb-4 ring-1 ring-slate-100 shadow-sm">
        <CalendarX size={48} className="text-slate-300" />
      </div>
      <p className="text-lg font-medium text-slate-600">No event selected</p>
      <p className="text-sm opacity-70">Please continue an event from Setup to begin scoring.</p>
    </div>
  );
}
