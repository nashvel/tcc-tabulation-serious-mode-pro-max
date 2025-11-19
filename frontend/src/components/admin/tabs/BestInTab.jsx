import { useState, useEffect, useRef } from 'react';

export default function BestInTab({ candidates }) {
  const mockCategories = [
    { id: 1, name: 'Swimsuit Competition' },
    { id: 2, name: 'Evening Gown' },
    { id: 3, name: 'Question & Answer' },
    { id: 4, name: 'Talent Show' },
    { id: 5, name: 'Production Number' },
    { id: 6, name: 'Casual Wear' },
    { id: 7, name: 'National Costume' },
    { id: 8, name: 'Sports Wear' },
    { id: 9, name: 'Interview Round' },
    { id: 10, name: 'Final Walk' }
  ];

  // Generate best in category results
  const mockBestInResults = mockCategories.map(category => {
    const categoryResults = (candidates || []).map(candidate => {
      const seed = category.id * 1000 + candidate.id;
      const pseudoRandom = (Math.sin(seed) * 10000) % 1;
      const score = (Math.abs(pseudoRandom) * 30 + 70).toFixed(2);
      return {
        candidate,
        score: parseFloat(score)
      };
    }).sort((a, b) => b.score - a.score);

    return {
      category,
      allResults: categoryResults
    };
  });

  const [bestInResults] = useState(mockBestInResults);
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [selectedRank, setSelectedRank] = useState(0);
  const mainCardRef = useRef(null);

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

  const getBorderColor = (index) => {
    if (index === 0) return 'border-yellow-400';
    if (index === 1) return 'border-gray-400';
    if (index === 2) return 'border-orange-400';
    return 'border-gray-300';
  };

  const getGradient = (index) => {
    if (index === 0) return 'from-yellow-400 to-yellow-600';
    if (index === 1) return 'from-gray-300 to-gray-500';
    if (index === 2) return 'from-orange-400 to-orange-600';
    return 'from-gray-400 to-gray-600';
  };

  const result = bestInResults.find(r => r.category.id === selectedCategory);
  if (!result || !result.allResults.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        <span className="material-icons" style={{ fontSize: '48px', color: '#ff6600' }}>emoji_events</span>
        <p className="mt-4 text-lg">No candidates available</p>
      </div>
    );
  }

  const currentWinner = result.allResults[selectedRank];

  return (
    <>
      {/* Category Tabs */}
      <div className="px-4 py-3 border-b-2 border-gray-200 bg-gray-50 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {mockCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedRank(0);
              }}
              className={`relative px-4 py-2 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'text-orange-600 font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-icons" style={{ fontSize: '14px' }}>star</span>
              {cat.name}
              {selectedCategory === cat.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full"></div>
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
                  <span className="material-icons" style={{ fontSize: '120px', color: '#ccc' }}>person</span>
                </div>
                <div className="absolute top-4 left-4 bg-yellow-500 rounded-full p-4 shadow-lg">
                  <span className="material-icons text-white" style={{ fontSize: '32px' }}>emoji_events</span>
                </div>
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 px-6 py-3 rounded-full">
                  <span className="text-white font-bold text-3xl">{currentWinner.score.toFixed(2)}</span>
                </div>
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-4 py-2 rounded-full">
                  <span className="text-gray-900 font-bold text-sm">{getRankLabel(selectedRank)}</span>
                </div>
              </div>

              {/* Winner Info */}
              <div className={`bg-gradient-to-br ${getGradient(selectedRank)} p-6 text-white text-center`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="material-icons" style={{ fontSize: '24px' }}>emoji_events</span>
                  <h3 className="text-xl font-bold">{getRankLabel(selectedRank).toUpperCase()}</h3>
                </div>
                <div className="text-4xl font-bold mb-2">#{currentWinner.candidate.number}</div>
                <div className="text-2xl font-bold">{currentWinner.candidate.name}</div>
              </div>
            </div>

            {/* Other Category Stats - Compact */}
            <div className="mt-3 bg-gray-50 rounded p-2">
              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                <span className="material-icons" style={{ fontSize: '12px' }}>bar_chart</span>
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
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${getGradient(index)} flex items-center justify-center text-white text-xs font-bold`}>
                      {index + 1}
                    </div>

                    {/* Candidate Image - Small */}
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                      <span className="material-icons text-gray-400" style={{ fontSize: '20px' }}>person</span>
                    </div>

                    {/* Candidate Info - Compact */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-bold text-xs text-gray-900 truncate">
                          #{item.candidate.number}
                        </div>
                        {index < 3 && <span className="material-icons text-yellow-600" style={{ fontSize: '12px' }}>emoji_events</span>}
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
    </>
  );
}
