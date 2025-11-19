export default function ScoringTable({ 
  candidates, 
  criteria, 
  scores, 
  scoresHidden,
  onScoreChange,
  onScoreSubmit 
}) {
  const femaleCandidates = candidates.filter(c => (c.category === 'Female' || c.gender === 'Female'));
  const maleCandidates = candidates.filter(c => (c.category === 'Male' || c.gender === 'Male'));

  const renderCandidateRow = (candidate) => {
    const candidateScores = criteria.map(crit => 
      parseFloat(scores[`${candidate.id}-${crit.id}`] || 0)
    );
    const average = candidateScores.reduce((sum, score) => sum + score, 0) / candidateScores.length || 0;
    
    return (
      <tr key={candidate.id}>
        <td style={{ 
          padding: '15px 10px',
          textTransform: 'uppercase',
          fontWeight: '800',
          color: '#000',
          border: '1px solid #ddd'
        }}>
          &ensp;&ensp;(#{candidate.number}). &nbsp; {candidate.name}
        </td>
        {criteria.map(criteriaItem => (
          <td key={criteriaItem.id} style={{ border: '1px solid #ddd', padding: '5px' }}>
            <input
              type={scoresHidden ? 'password' : 'number'}
              value={scores[`${candidate.id}-${criteriaItem.id}`] || ''}
              onChange={(e) => onScoreChange(candidate.id, criteriaItem.id, e.target.value)}
              onBlur={() => onScoreSubmit(candidate.id, criteriaItem.id)}
              max={criteriaItem.max_score}
              min="0"
              step="0.01"
              placeholder={`Score: 1-${criteriaItem.max_score}`}
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '1px solid #ccc',
                textAlign: 'center',
                padding: '8px',
                fontSize: '14px'
              }}
            />
          </td>
        ))}
        <td style={{ border: '1px solid #ddd', padding: '5px', textAlign: 'center' }}>
          <input
            type={scoresHidden ? 'password' : 'number'}
            value={average.toFixed(2)}
            readOnly
            style={{
              width: '100%',
              border: 'none',
              textAlign: 'center',
              padding: '8px',
              fontWeight: 'bold',
              backgroundColor: '#f9f9f9'
            }}
          />
        </td>
      </tr>
    );
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr>
            <td style={{ 
              letterSpacing: '2px', 
              textTransform: 'uppercase', 
              fontWeight: '800', 
              color: 'red',
              padding: '10px',
              border: '1px solid #ddd'
            }}>
              <strong style={{ fontWeight: 'bolder' }}>(BARANGAY)</strong>
              <br />
              Female Category
            </td>
            {criteria.map(criteriaItem => (
              <th key={criteriaItem.id} style={{ 
                textAlign: 'center',
                padding: '10px',
                border: '1px solid #ddd',
                backgroundColor: '#f9f9f9'
              }}>
                {criteriaItem.name} <b>({criteriaItem.max_score}%)</b>
              </th>
            ))}
            <th style={{ 
              textAlign: 'center',
              padding: '10px',
              border: '1px solid #ddd',
              backgroundColor: '#f9f9f9'
            }}>
              AVERAGE <b>(100%)</b>
            </th>
          </tr>
        </thead>
        <tbody>
          {femaleCandidates.map(renderCandidateRow)}
          
          {/* Male Category Header */}
          <tr>
            <td style={{ 
              letterSpacing: '2px', 
              textTransform: 'uppercase', 
              fontWeight: '800', 
              color: 'red',
              padding: '10px',
              border: '1px solid #ddd',
              textAlign: 'center'
            }}>
              <strong style={{ fontWeight: 'bolder' }}>(BARANGAY)</strong>
              <br />
              Male Category
            </td>
            {criteria.map(criteriaItem => (
              <th key={criteriaItem.id} style={{ 
                textAlign: 'center',
                padding: '10px',
                border: '1px solid #ddd',
                backgroundColor: '#f9f9f9'
              }}>
                {criteriaItem.name} <b>({criteriaItem.max_score}%)</b>
              </th>
            ))}
            <th style={{ 
              textAlign: 'center',
              padding: '10px',
              border: '1px solid #ddd',
              backgroundColor: '#f9f9f9'
            }}>
              AVERAGE <b>(100%)</b>
            </th>
          </tr>
          
          {/* Male Candidates */}
          {maleCandidates.map(renderCandidateRow)}
        </tbody>
      </table>
    </div>
  );
}
