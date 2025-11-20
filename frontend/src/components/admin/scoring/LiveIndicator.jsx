import React, { useState, useEffect } from 'react';

export default function LiveIndicator() {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (isExpanded) {
      // Auto-collapse after 3 seconds
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handleClick = () => {
    setIsExpanded(true);
  };

  return (
    <div className="fixed top-24 right-6 z-40">
      {isExpanded ? (
        <div className="animate-expand">
          <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 ring-2 ring-white ring-opacity-50 backdrop-blur-sm bg-opacity-90 cursor-pointer hover:bg-opacity-100 transition-all"
            onClick={handleClick}>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-glow"></span>
            Live Updates Active
          </div>
        </div>
      ) : (
        <div className="animate-collapse">
          <button
            onClick={handleClick}
            className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-glow ring-2 ring-white ring-opacity-50 hover:ring-opacity-100 transition-all cursor-pointer"
            title="Click to expand"
          />
        </div>
      )}
      <style>{`
        .shadow-glow { box-shadow: 0 0 8px rgba(255,255,255,0.8); }
        .animate-expand { animation: expandIn 0.4s ease-out forwards; }
        .animate-collapse { animation: collapseOut 0.4s ease-in forwards; }
        @keyframes expandIn {
          from {
            opacity: 0;
            transform: scale(0.3);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes collapseOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 1;
            transform: scale(0.3);
          }
        }
      `}</style>
    </div>
  );
}
