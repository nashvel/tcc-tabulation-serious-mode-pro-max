import React from 'react';

export default function RoundHeader({ roundName }) {
  if (!roundName) return null;

  return (
    <div className="mb-8 relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg text-center py-6 px-4 border-t-4 border-amber-500">
      <h2 className="text-white text-xl md:text-2xl font-serif font-bold uppercase tracking-widest relative z-10">
        <span className="text-amber-500 mr-3 opacity-80 font-sans text-sm align-middle tracking-normal normal-case block mb-1">Currently Scoring</span>
        {roundName}
      </h2>
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/assets/pattern.png')] pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500 rounded-full blur-[60px] opacity-20"></div>
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20"></div>
    </div>
  );
}
