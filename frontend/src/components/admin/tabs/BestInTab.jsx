import { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Trophy, BarChart3, User } from 'lucide-react';
import Swal from 'sweetalert2';

export default function BestInTab({ candidates, continuingEvent }) {
  const [categories, setCategories] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRank, setSelectedRank] = useState(0);
  const mainCardRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, categoryId: null });

  const apiBase = useMemo(() => {
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.hostname}:8000`;
  }, []);

  const eventId = useMemo(() => {
    if (continuingEvent?.id) return continuingEvent.id;
    const continuingEventStr = localStorage.getItem('continuingEvent');
    if (continuingEventStr) {
      try {
        return JSON.parse(continuingEventStr).id;
      } catch (e) {
        console.error('Error parsing continuingEvent:', e);
      }
    }
    return 1;
  }, [continuingEvent]);

  // Fetch categories and scores
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await fetch(`${apiBase}/api/criteria?event_id=${eventId}`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
          if (categoriesData.length > 0) {
            setSelectedCategory(categoriesData[0].id);
          }
        }

        // Fetch scores
        const scoresResponse = await fetch(`${apiBase}/api/points?event_id=${eventId}`);
        if (scoresResponse.ok) {
          const scoresData = await scoresResponse.json();
          // Organize scores by criteria (category)
          const scoresMap = {};
          scoresData.forEach(score => {
            if (!scoresMap[score.criteria_id]) {
              scoresMap[score.criteria_id] = [];
            }
            scoresMap[score.criteria_id].push({
              candidate_id: score.candidate_id,
              points: score.points
            });
          });
          setScores(scoresMap);
        }
      } catch (error) {
        console.error('Error fetching best in data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, apiBase]);

  // Calculate best in category results
  const bestInResults = useMemo(() => {
    if (!categories.length || !candidates || !candidates.length) return [];

    return categories.map(category => {
      const categoryScores = scores[category.id] || [];
      
      // Group scores by candidate and calculate average
      const candidateAverages = {};
      categoryScores.forEach(score => {
        if (!candidateAverages[score.candidate_id]) {
          candidateAverages[score.candidate_id] = [];
        }
        candidateAverages[score.candidate_id].push(score.points);
      });

      // Create results with average scores
      const categoryResults = candidates
        .map(candidate => {
          const scores = candidateAverages[candidate.id] || [];
          const avgScore = scores.length > 0 
            ? scores.reduce((a, b) => a + b, 0) / scores.length 
            : 0;
          return {
            candidate,
            score: avgScore
          };
        })
        .filter(r => r.score > 0) // Only include candidates with scores
        .sort((a, b) => b.score - a.score);

      return {
        category,
        allResults: categoryResults
      };
    });
  }, [categories, candidates, scores]);

  // Set initial selected category
  useEffect(() => {
    if (selectedCategory === null && categories.length > 0) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (mainCardRef.current) {
      mainCardRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }
  }, [selectedRank]);

  const handleSwapRank = (newRankIndex) => {
    setSelectedRank(newRankIndex);
  };

  const getRankLabel = (index) => {
    if (index === 0) return '1st Place';
    if (index === 1) return '2nd Place';
    if (index === 2) return '3rd Place';
    return `${index + 1}th Place`;
  };

  const getThemeColor = () => {
    return getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#3B82F6';
  };

  const getBorderColor = (index) => {
    const themeColor = getThemeColor();
    if (index === 0) return 'border-yellow-400';
    if (index === 1) return 'border-gray-400';
    if (index === 2) return 'border-gray-400';
    return 'border-gray-300';
  };

  const getGradientStyle = (index) => {
    const themeColor = getThemeColor();
    if (index === 0) return { background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` };
    if (index === 1) return { background: 'linear-gradient(135deg, #9CA3AF, #6B7280)' };
    if (index === 2) return { background: 'linear-gradient(135deg, #9CA3AF, #6B7280)' };
    return { background: 'linear-gradient(135deg, #9CA3AF, #6B7280)' };
  };

  const handleTabContextMenu = (e, categoryId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      categoryId
    });
  };

  const handleOpenNewWindow = () => {
    if (contextMenu.categoryId) {
      const newWindow = window.open(`${window.location.pathname}?category=${contextMenu.categoryId}`, '_blank');
      if (newWindow) newWindow.focus();
    }
    setContextMenu({ visible: false, x: 0, y: 0, categoryId: null });
  };

  const handleEditBeta = () => {
    setContextMenu({ visible: false, x: 0, y: 0, categoryId: null });
    Swal.fire({
      icon: 'info',
      title: 'Edit Mode - Beta',
      html: '<p style="text-align: left;">This feature is currently in <strong>beta</strong> and may have limited functionality.</p><p style="text-align: left;">We are actively working on improving the editing experience.</p>',
      confirmButtonText: 'Got it!',
      confirmButtonColor: '#F59E0B'
    });
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => {
      setContextMenu({ visible: false, x: 0, y: 0, categoryId: null });
    };
    
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.visible]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading best in results...</p>
        </div>
      </div>
    );
  }

  const result = bestInResults.find(r => r.category.id === selectedCategory);
  if (!result || !result.allResults.length) {
    return (
      <>
        {/* Category Tabs */}
        <div className="px-4 py-3 border-b-2 border-gray-200 bg-gray-50 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedRank(0);
                }}
                className={`relative px-4 py-2 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Star size={16} />
                {cat.name}
                {selectedCategory === cat.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full" style={{ backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#1F2937' }}></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className="p-8 text-center text-gray-500">
          <Trophy size={48} className="mx-auto mb-4" style={{ color: getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#1F2937' }} />
          <p className="mt-4 text-lg">No scores available for this category</p>
          <p className="text-sm text-gray-400 mt-2">Scores will appear once judges submit their evaluations</p>
        </div>
      </>
    );
  }

  const currentWinner = result.allResults[selectedRank];

  return (
    <>
      {/* Category Tabs */}
      <div className="px-4 py-3 border-b-2 border-gray-200 bg-gray-50 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedRank(0);
              }}
              onContextMenu={(e) => handleTabContextMenu(e, cat.id)}
              className={`relative px-4 py-2 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={selectedCategory === cat.id ? { color: getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#1F2937' } : {}}
              title="Right-click to open in new tab"
            >
              <Star size={16} />
              {cat.name}
              {selectedCategory === cat.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full" style={{ backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#1F2937' }}></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Winner Display with Rankings List */}
      <div className="p-8">
        <div className="flex gap-6 max-w-7xl mx-auto">
          {/* Main Winner Card */}
          <div className="flex-1" ref={mainCardRef}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Best in {result.category.name}
            </h2>

            <div className={`bg-white rounded-xl overflow-hidden shadow-2xl border-4 ${getBorderColor(selectedRank)}`}>
              {/* Large Winner Image */}
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <User size={120} color="#ccc" />
                </div>
                <div className="absolute top-4 left-4 rounded-full p-4 shadow-lg" style={{ backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#1F2937' }}>
                  <Trophy size={32} className="text-white" />
                </div>
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 px-6 py-3 rounded-full">
                  <span className="text-white font-bold text-3xl">{currentWinner.score.toFixed(2)}</span>
                </div>
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-4 py-2 rounded-full">
                  <span className="text-gray-900 font-bold text-sm">{getRankLabel(selectedRank)}</span>
                </div>
              </div>

              {/* Winner Info */}
              <div className="p-6 text-white text-center" style={getGradientStyle(selectedRank)}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy size={24} />
                  <h3 className="text-xl font-bold">{getRankLabel(selectedRank).toUpperCase()}</h3>
                </div>
                <div className="text-4xl font-bold mb-2">#{currentWinner.candidate.number}</div>
                <div className="text-2xl font-bold">{currentWinner.candidate.name}</div>
              </div>
            </div>

            {/* Other Category Stats - Compact */}
            <div className="mt-3 bg-gray-50 rounded p-2">
              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                <BarChart3 size={12} />
                Other Categories
              </h4>
              <div className="grid grid-cols-3 gap-1.5">
                {bestInResults
                  .filter(r => r.category.id !== selectedCategory)
                  .map(otherCategory => {
                    const candidateResult = otherCategory.allResults.find(
                      r => r.candidate.id === currentWinner.candidate.id
                    );
                    if (!candidateResult) return null;
                    
                    const rank = otherCategory.allResults.findIndex(
                      r => r.candidate.id === currentWinner.candidate.id
                    ) + 1;

                    return (
                      <div
                        key={otherCategory.category.id}
                        className="bg-white rounded border border-gray-200 p-1.5 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-semibold text-gray-600 truncate leading-tight">
                            {otherCategory.category.name}
                          </span>
                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                            rank <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            #{rank}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-gray-900">
                          {candidateResult.score.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Rankings List - Right Side - Compact */}
          <div className="w-64">
            <h3 className="text-sm font-bold text-gray-900 mb-3">All Rankings</h3>
            <div className="space-y-1.5">
              {result.allResults.map((item, index) => (
                <div
                  key={item.candidate.id}
                  onClick={() => handleSwapRank(index)}
                  className={`bg-white rounded border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    selectedRank === index ? getBorderColor(index) + ' border-2' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 p-2">
                    {/* Rank Badge - Small */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={getGradientStyle(index)}>
                      {index + 1}
                    </div>

                    {/* Candidate Image - Small */}
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                      <User size={20} className="text-gray-400" />
                    </div>

                    {/* Candidate Info - Compact */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-bold text-xs text-gray-900 truncate">
                          #{item.candidate.number}
                        </div>
                        {index < 3 && <Trophy size={12} className="text-yellow-600" />}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {item.candidate.name}
                      </div>
                      <div className="text-sm font-bold text-gray-700">
                        {item.score.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Context Menu */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            zIndex: 1000,
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            minWidth: '200px',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={handleOpenNewWindow}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#1F2937',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            📂 Open in a New Window
          </button>
          <div style={{ height: '1px', backgroundColor: '#E5E7EB' }}></div>
          <button
            onClick={handleEditBeta}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#1F2937',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ✏️ Edit (Beta)
          </button>
        </div>
      )}
    </>
  );
}
