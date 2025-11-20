import React, { useMemo, useState, useEffect } from 'react';

// Counter component for animated numbers
function CountUpNumber({ target, delay }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1000; // 1 second animation
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setCount(Math.floor(target * progress));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };
      
      animate();
    }, delay);

    return () => clearTimeout(timer);
  }, [target, delay]);

  return count;
}

export default function CriteriaChart({ categories = [] }) {
  // Generate mock data for criteria visualization
  const chartData = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [];
    }

    return categories.slice(0, 6).map((category, idx) => ({
      name: category.name?.substring(0, 14) || 'Category',
      value: Math.floor(Math.random() * 100) + 20,
      color: ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500', 'bg-cyan-500'][idx % 6],
      colorHex: ['#10b981', '#3b82f6', '#a855f7', '#ec4899', '#f59e0b', '#06b6d4'][idx % 6]
    }));
  }, [categories]);

  const maxValue = Math.max(...chartData.map(d => d.value), 100);
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  // Generate pie chart SVG
  const generatePieChart = () => {
    let currentAngle = 0;
    const paths = chartData.map((item) => {
      const sliceAngle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);
      
      const largeArc = sliceAngle > 180 ? 1 : 0;
      
      const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      currentAngle = endAngle;
      
      return (
        <path key={item.name} d={path} fill={item.colorHex} opacity="0.9" />
      );
    });
    
    return paths;
  };

  return (
    <div className="space-y-3">
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fillBar {
          from {
            width: 0 !important;
          }
          to {
            width: var(--bar-width);
          }
        }
        @keyframes countUp {
          from {
            --num: 0;
          }
          to {
            --num: var(--target-num);
          }
        }
        @keyframes rotatePie {
          from {
            transform: rotate(-360deg);
            opacity: 0;
          }
          to {
            transform: rotate(0deg);
            opacity: 1;
          }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.4s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }
        .animate-fill-bar {
          animation: fillBar 1s ease-out forwards;
        }
        .animate-count-up {
          animation: countUp 1s ease-out forwards;
        }
        .animate-rotate-pie {
          animation: rotatePie 1.2s ease-out forwards;
        }
      `}</style>
      {chartData.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">No criteria data</p>
        </div>
      ) : (
        <>
          {chartData.map((item, idx) => (
            <div key={idx} className="space-y-1.5 animate-slide-in-left" style={{ animationDelay: `${idx * 50}ms` }}>
              {/* Label with percentage */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 truncate pr-2">
                  {item.name}
                </span>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap animate-count-up" style={{ animationDelay: `${idx * 50 + 100}ms` }}>
                  <CountUpNumber target={item.value} delay={idx * 50 + 100} />%
                </span>
              </div>

              {/* Bar */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full shadow-sm animate-fill-bar`}
                  style={{ 
                    '--bar-width': `${(item.value / maxValue) * 100}%`,
                    animationDelay: `${idx * 50 + 100}ms`
                  }}
                />
              </div>
            </div>
          ))}

          {/* Stats Footer */}
          <div className="pt-4 mt-4 border-t border-slate-200 animate-fade-in-up" style={{ animationDelay: `${chartData.length * 50}ms` }}>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="py-2 px-2 bg-slate-100 rounded">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
                  Total
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {chartData.length}
                </p>
              </div>
              <div className="py-2 px-2 bg-slate-100 rounded">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
                  Avg
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length)}%
                </p>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="pt-6 mt-6 border-t border-slate-200 animate-fade-in-up" style={{ animationDelay: `${chartData.length * 50 + 100}ms` }}>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-3 text-center">
              Distribution
            </p>
            <div className="flex justify-center animate-rotate-pie" style={{ animationDelay: `${chartData.length * 50 + 150}ms` }}>
              <svg width="120" height="120" viewBox="0 0 100 100" className="drop-shadow-md">
                {generatePieChart()}
              </svg>
            </div>
            
            {/* Legend */}
            <div className="mt-3 space-y-1">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] animate-slide-in-left" style={{ animationDelay: `${chartData.length * 50 + 200 + idx * 30}ms` }}>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.colorHex }}
                  />
                  <span className="text-slate-600 truncate flex-1">{item.name}</span>
                  <span className="font-semibold text-slate-700">
                    {Math.round((item.value / total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
