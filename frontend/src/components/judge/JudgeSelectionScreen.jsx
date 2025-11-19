export default function JudgeSelectionScreen({ onJudgeSelect, onProceed, selectedJudgeId }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff' }}>
      {/* Header matching old system - Orange */}
      <div style={{ 
        backgroundColor: '#f97316',
        borderBottom: '5px solid #ea580c',
        padding: '8px 0',
        marginBottom: '20px'
      }}>
        {/* Empty orange header bar - matches old system exactly */}
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <hr className="border-gray-300 mb-8" />
          
          {/* Judge Selection Buttons */}
          <div className="text-center space-y-6">
            {/* First Row - 3 Judges */}
            <div className="flex justify-center gap-4">
              {[1, 2, 3].map((id) => (
                <button
                  key={id}
                  onClick={() => onJudgeSelect(id)}
                  className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-8 py-6 transition-all flex flex-col items-center gap-3"
                  style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '15px' }}
                >
                  <img src="/assets/icon/2994536.png" alt="Judge" className="h-20" />
                  <div>
                    SELECT <br />
                    JUDGE <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">{String(id).padStart(2, '0')}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Second Row - 3 Judges */}
            <div className="flex justify-center gap-4">
              {[4, 5, 6].map((id) => (
                <button
                  key={id}
                  onClick={() => onJudgeSelect(id)}
                  className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-8 py-6 transition-all flex flex-col items-center gap-3"
                  style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '15px' }}
                >
                  <img src="/assets/icon/2994536.png" alt="Judge" className="h-20" />
                  <div>
                    SELECT <br />
                    JUDGE <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">{String(id).padStart(2, '0')}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Third Row - 1 Judge */}
            <div className="flex justify-center gap-4">
              {[7].map((id) => (
                <button
                  key={id}
                  onClick={() => onJudgeSelect(id)}
                  className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-8 py-6 transition-all flex flex-col items-center gap-3"
                  style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '15px' }}
                >
                  <img src="/assets/icon/2994536.png" alt="Judge" className="h-20" />
                  <div>
                    SELECT <br />
                    JUDGE <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">{String(id).padStart(2, '0')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Proceed Button */}
          {selectedJudgeId && (
            <div className="text-center mt-8">
              <button
                onClick={onProceed}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all"
                style={{ letterSpacing: '2px', textTransform: 'uppercase' }}
              >
                Proceed to Scoring
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
