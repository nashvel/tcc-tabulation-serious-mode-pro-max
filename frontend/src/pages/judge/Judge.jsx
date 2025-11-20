            import { useState, useEffect } from 'react';
import { candidatesAPI, criteriaAPI, roundsAPI, pointsAPI } from '../../api/services';

const palette = {
  pageBg: '#f1f5f9',
  headerGradient: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
  headerAccent: '#e11d48',
  headerText: '#f8fafc',
  cardBg: '#ffffff',
  cardBorder: '#dbeafe',
  cardShadow: '0 18px 36px rgba(15, 23, 42, 0.1)',
  sectionTitle: '#0f172a',
  subtleText: '#64748b',
  tableHeaderGradient: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
  tableHeaderDivider: 'rgba(226, 232, 240, 0.18)',
  tableHeaderText: '#e2e8f0',
  tableHeaderAccent: '#22c55e',
  rowOdd: '#ffffff',
  rowEven: '#f8fafc',
  rowBorder: '#e2e8f0',
  averageGradient: 'linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)',
  averageText: '#f8fafc',
  inputBorder: '#cbd5f5',
  inputBg: '#f8fafc',
  inputText: '#0f172a',
  savingBorder: '#f59e0b',
  savedBorder: '#22c55e',
  savedBg: '#f0fdf4',
  legendBorder: '#e2e8f0',
  legendText: '#475569'
};

const layoutStyles = {
  page: {
    minHeight: '100vh',
    backgroundColor: palette.pageBg,
    paddingBottom: '72px'
  },
  header: {
    backgroundImage: palette.headerGradient,
    color: palette.headerText,
    padding: '28px 48px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 14px 38px rgba(15, 23, 42, 0.22)',
    borderBottom: `4px solid ${palette.headerAccent}`
  },
  headerBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  headerTitle: {
    margin: 0,
    fontSize: '30px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  },
  headerMeta: {
    margin: 0,
    fontSize: '13px',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    opacity: 0.8
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px'
  },
  progressCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    padding: '18px 24px',
    borderRadius: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '200px',
    border: '1px solid rgba(248, 250, 252, 0.2)',
    backdropFilter: 'blur(6px)'
  },
  progressCount: {
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: '0.04em'
  },
  progressLabel: {
    fontSize: '11px',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    opacity: 0.75
  },
  progressTrack: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(248, 250, 252, 0.28)',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f8fafc',
    transition: 'width 0.3s ease'
  },
  toggleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '12px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase'
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    opacity: 0.85
  },
  content: {
    padding: '44px 56px',
    display: 'flex',
    flexDirection: 'column',
    gap: '36px'
  },
  helperText: {
    fontSize: '12px',
    letterSpacing: '0.18em',
    color: palette.subtleText,
    textTransform: 'uppercase',
    margin: 0
  }
};

const tableStyles = {
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  sectionAccent: {
    width: '6px',
    height: '28px',
    borderRadius: '999px',
    backgroundColor: palette.headerAccent,
    boxShadow: '0 6px 20px rgba(225, 29, 72, 0.45)'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: palette.sectionTitle
  },
  card: {
    backgroundColor: palette.cardBg,
    borderRadius: '18px',
    border: `1px solid ${palette.cardBorder}`,
    boxShadow: palette.cardShadow,
    overflow: 'hidden'
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    minWidth: '960px'
  },
  headerRow: {
    backgroundImage: palette.tableHeaderGradient,
    color: palette.tableHeaderText,
    boxShadow: `inset 0 -1px 0 ${palette.tableHeaderDivider}`
  },
  headerCellBase: {
    padding: '18px 14px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontSize: '12px',
    fontWeight: 700,
    textAlign: 'center',
    position: 'relative'
  },
  headerAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '3px',
    backgroundColor: palette.tableHeaderAccent,
    opacity: 0.75
  },
  rowBase: {
    borderBottom: `1px solid ${palette.rowBorder}`
  },
  bodyCell: {
    padding: '18px 14px',
    fontSize: '15px',
    color: '#1f2937',
    verticalAlign: 'middle'
  },
  numberCell: {
    fontWeight: 700,
    fontSize: '16px'
  },
  nameCell: {
    fontWeight: 600,
    color: palette.sectionTitle,
    textAlign: 'left',
    paddingLeft: '24px'
  },
  averageCell: {
    padding: '18px 14px',
    textAlign: 'center',
    fontWeight: 700,
    fontSize: '18px',
    color: palette.averageText,
    backgroundImage: palette.averageGradient
  }
};

const legendStyles = {
  container: {
    padding: '18px 24px',
    backgroundColor: palette.cardBg,
    borderRadius: '16px',
    border: `1px solid ${palette.legendBorder}`,
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap'
  },
  label: {
    fontSize: '14px',
    fontWeight: 700,
    color: palette.sectionTitle,
    letterSpacing: '0.12em',
    textTransform: 'uppercase'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: palette.legendText,
    letterSpacing: '0.04em'
  },
  swatch: {
    width: '26px',
    height: '26px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '13px'
  }
};

const statusSwatches = {
  empty: {
    border: `2px solid ${palette.legendBorder}`,
    backgroundColor: palette.cardBg,
    color: palette.legendText
  },
  saving: {
    border: `2px solid ${palette.savingBorder}`,
    backgroundColor: '#fff7ed',
    color: palette.savingBorder
  },
  saved: {
    border: `2px solid ${palette.savedBorder}`,
    backgroundColor: palette.savedBg,
    color: palette.savedBorder
  }
};

const getHeaderCellStyle = (extra = {}) => ({
  ...tableStyles.headerCellBase,
  ...extra
});

const getRowStyle = (index) => ({
  ...tableStyles.rowBase,
  backgroundColor: index % 2 === 0 ? palette.rowOdd : palette.rowEven
});

const getInputStyle = (isSaved, isSaving, scoresHidden) => ({
  width: '100%',
  padding: '12px',
  fontSize: '15px',
  fontWeight: 600,
  textAlign: 'center',
  border: '2px solid',
  borderColor: isSaved ? palette.savedBorder : isSaving ? palette.savingBorder : palette.inputBorder,
  borderRadius: '8px',
  backgroundColor: isSaved ? palette.savedBg : palette.inputBg,
  color: scoresHidden ? 'transparent' : palette.inputText,
  boxShadow: isSaving ? '0 0 0 4px rgba(245, 158, 11, 0.12)' : '0 2px 6px rgba(15, 23, 42, 0.08)',
  transition: 'all 0.25s ease',
  outline: 'none',
  fontFamily: 'inherit'
});

const mockCandidates = [
  { id: 101, number: 5, name: 'BSBA', gender: 'Female', image: 'https://via.placeholder.com/60x60/dc2626/ffffff?text=5' },
  { id: 102, number: 6, name: 'HM', gender: 'Female', image: 'https://via.placeholder.com/60x60/dc2626/ffffff?text=6' },
  { id: 103, number: 7, name: 'IT', gender: 'Female', image: 'https://via.placeholder.com/60x60/dc2626/ffffff?text=7' },
  { id: 104, number: 8, name: 'BSED', gender: 'Female', image: 'https://via.placeholder.com/60x60/dc2626/ffffff?text=8' },
  { id: 105, number: 9, name: 'BEED', gender: 'Female', image: 'https://via.placeholder.com/60x60/dc2626/ffffff?text=9' },
  { id: 106, number: 1, name: 'BSBA', gender: 'Male', image: 'https://via.placeholder.com/60x60/dc2626/ffffff?text=1' },
  { id: 107, number: 2, name: 'HM', gender: 'Male', image: 'https://via.placeholder.com/60x60/dc2626/ffffff?text=2' },
  { id: 108, number: 3, name: 'IT', gender: 'Male', image: 'https://via.placeholder.com/60x60/dc2626/ffffff?text=3' },
  { id: 109, number: 4, name: 'BSED', gender: 'Male', image: 'https://via.placeholder.com/60x60/dc2626/ffffff?text=4' }
];

const mockCriteria = [
  { id: 201, name: 'Appreciation of Fashion Trends', max_score: 25 },
  { id: 202, name: 'Stage Presence', max_score: 25 },
  { id: 203, name: 'Overall Impact', max_score: 25 },
  { id: 204, name: 'Poise & Bearing', max_score: 20 },
  { id: 205, name: 'Projection', max_score: 15 },
  { id: 206, name: 'Beauty & Physique', max_score: 10 }
];

export default function Judge() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [scores, setScores] = useState({});
  const [savedScores, setSavedScores] = useState({});
  const [saving, setSaving] = useState({});
  const [scoresHidden, setScoresHidden] = useState(false);
  const [judgeId, setJudgeId] = useState(() => localStorage.getItem('judgeId') || '');
  const [showJudgeSelection, setShowJudgeSelection] = useState(!localStorage.getItem('judgeId'));
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    if (useMockData) {
      loadMockData();
    } else {
      loadLiveData();
    }
  }, [useMockData]);

  useEffect(() => {
    if (judgeId) {
      localStorage.setItem('judgeId', judgeId);
    }
  }, [judgeId]);

  const buildInitialScores = (listCandidates, listCriteria) => {
    const initial = {};
    listCandidates.forEach(candidate => {
      listCriteria.forEach(criterion => {
        initial[`${candidate.id}-${criterion.id}`] = '';
      });
    });
    setScores(initial);
    setSavedScores({});
    setSaving({});
  };

  const loadMockData = () => {
    setCandidates(mockCandidates);
    setCriteria(mockCriteria);
    setRounds([]);
    setSelectedRound('');
    buildInitialScores(mockCandidates, mockCriteria);
    setLoading(false);
  };

  const loadLiveData = async () => {
    setLoading(true);
    try {
      const [candidatesRes, criteriaRes, roundsRes] = await Promise.all([
        candidatesAPI.getAll(),
        criteriaAPI.getAll(),
        roundsAPI.getAll()
      ]);

      setCandidates(candidatesRes.data);
      setCriteria(criteriaRes.data);
      setRounds(roundsRes.data);
      const firstRound = roundsRes.data?.[0]?.id ? String(roundsRes.data[0].id) : '';
      setSelectedRound(firstRound);
      buildInitialScores(candidatesRes.data, criteriaRes.data);
    } catch (error) {
      console.error('Error loading judge data:', error);
      alert('Failed to load data from server. You can toggle "Use Mock Data" to continue testing.');
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (value, maxPoints) => {
    if (value === '') return '';
    const pattern = /^\d*\.?\d*$/;
    if (!pattern.test(value)) return null;
    const num = parseFloat(value);
    if (Number.isNaN(num)) return value;
    if (num < 0) return '0';
    if (maxPoints !== undefined && num > maxPoints) return String(maxPoints);
    return value;
  };

  const handleScoreChange = (candidateId, criteriaItem, rawValue) => {
    const key = `${candidateId}-${criteriaItem.id}`;
    const nextValue = validateInput(rawValue, criteriaItem.max_score);
    if (nextValue === null) return;
    setScores(prev => ({ ...prev, [key]: nextValue }));
  };

  const handleScoreSubmit = async (candidateId, criteriaId) => {
    const key = `${candidateId}-${criteriaId}`;
    const points = scores[key];
    if (!points || Number.isNaN(parseFloat(points))) return;
    if (!judgeId) {
      alert('Please select your judge number before scoring.');
      return;
    }

    const candidate = candidates.find((c) => c.id === candidateId);
    const category = (candidate?.category || candidate?.gender || '').toString().trim();
    if (!category) {
      alert('Candidate category is missing. Please ensure candidate data is complete.');
      return;
    }

    const normalizedPoints = parseInt(points, 10);
    if (Number.isNaN(normalizedPoints)) {
      alert('Scores must be whole numbers for this event.');
      return;
    }

    try {
      setSaving(prev => ({ ...prev, [key]: true }));
      await pointsAPI.create({
        candidate_id: candidateId,
        criteria_id: criteriaId,
        judge_id: judgeId,
        round_id: selectedRound || null,
        points: normalizedPoints,
        category
      });
      setSavedScores(prev => ({ ...prev, [key]: normalizedPoints.toString() }));
    } catch (error) {
      console.error('Error saving score:', error);
      alert('Failed to save score. Please try again.');
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const calculateAverage = (candidateId, filteredCriteria) => {
    if (!filteredCriteria.length) return '0.00';
    const total = filteredCriteria.reduce((sum, criterion) => {
      const score = parseFloat(scores[`${candidateId}-${criterion.id}`] || 0);
      return sum + (Number.isNaN(score) ? 0 : score);
    }, 0);
    return (total / filteredCriteria.length).toFixed(2);
  };

  const calculateProgress = (filteredCandidates, filteredCriteria) => {
    const totalFields = filteredCandidates.length * filteredCriteria.length || 1;
    let filled = 0;
    filteredCandidates.forEach(candidate => {
      filteredCriteria.forEach(criterion => {
        const key = `${candidate.id}-${criterion.id}`;
        if (scores[key] && scores[key] !== '') {
          filled += 1;
        }
      });
    });
    return { filled, total: totalFields };
  };

  const filteredCriteria = selectedRound
    ? criteria.filter(c => String(c.round_id) === selectedRound)
    : criteria;

  const femaleCandidates = candidates.filter(c => (c.category === 'Female' || c.gender === 'Female'));
  const maleCandidates = candidates.filter(c => (c.category === 'Male' || c.gender === 'Male'));
  const filteredCandidates = [...femaleCandidates, ...maleCandidates];
  const progress = calculateProgress(filteredCandidates, filteredCriteria);
  const progressPercent = Math.min(100, Math.round((progress.filled / progress.total) * 100) || 0);
  const activeRound = rounds.find(round => String(round.id) === selectedRound);
  const headerTitle = (activeRound?.name || 'Best in Swimwear').toUpperCase();
  const headerSubtitle = `${judgeId ? `JUDGE #${judgeId}` : 'SELECT A JUDGE'} · ${activeRound ? (activeRound.display_name || activeRound.name || 'ROUND ONE') : 'ROUND ONE'}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading judge panel…</p>
      </div>
    );
  }

  if (showJudgeSelection) {
    return (
      <div style={{ ...layoutStyles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...tableStyles.card, padding: '48px', textAlign: 'center', maxWidth: '640px', width: '100%' }}>
          <h1 style={{ ...layoutStyles.headerTitle, marginBottom: '32px', color: palette.sectionTitle }}>Select Your Judge Number</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
            {[1, 2, 3, 4, 5].map((id) => (
              <button
                key={id}
                onClick={() => setJudgeId(String(id))}
                style={{
                  padding: '24px 32px',
                  borderRadius: '14px',
                  border: `2px solid ${judgeId === String(id) ? palette.headerAccent : palette.cardBorder}`,
                  backgroundColor: judgeId === String(id) ? palette.headerAccent : palette.pageBg,
                  color: judgeId === String(id) ? '#fff' : palette.sectionTitle,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '26px' }}>#{String(id).padStart(2, '0')}</span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>Judge</span>
              </button>
            ))}
          </div>
          <button
            disabled={!judgeId}
            onClick={() => setShowJudgeSelection(false)}
            style={{
              padding: '16px 40px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: palette.tableHeaderAccent,
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              cursor: judgeId ? 'pointer' : 'not-allowed',
              opacity: judgeId ? 1 : 0.5
            }}
          >
            Proceed
          </button>
          <div style={{ marginTop: '24px', ...layoutStyles.toggleWrapper, justifyContent: 'center', color: palette.subtleText }}>
            <label style={layoutStyles.toggleLabel}>
              <input type="checkbox" checked={useMockData} onChange={(e) => setUseMockData(e.target.checked)} />
              Use Mock Data
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={layoutStyles.page}>
      <header style={layoutStyles.header}>
        <div style={layoutStyles.headerBlock}>
          <h1 style={layoutStyles.headerTitle}>{headerTitle}</h1>
          <p style={layoutStyles.headerMeta}>{headerSubtitle}</p>
        </div>
        <div style={layoutStyles.headerControls}>
          <div style={layoutStyles.progressCard}>
            <span style={layoutStyles.progressLabel}>Scores Entered</span>
            <span style={layoutStyles.progressCount}>
              {progress.filled} / {progress.total}
            </span>
            <div style={layoutStyles.progressTrack}>
              <div style={{ ...layoutStyles.progressFill, width: `${progressPercent}%` }} />
            </div>
          </div>
          <div>
            <button
              onClick={() => setScoresHidden(!scoresHidden)}
              style={{
                backgroundColor: 'rgba(248,250,252,0.15)',
                border: '1px solid rgba(248,250,252,0.3)',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: '999px',
                letterSpacing: '0.1em',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              {scoresHidden ? 'Show Scores' : 'Hide Scores'}
            </button>
          </div>
          <div style={layoutStyles.toggleWrapper}>
            <label style={layoutStyles.toggleLabel}>
              <input type="checkbox" checked={useMockData} onChange={(e) => setUseMockData(e.target.checked)} />
              Mock Data
            </label>
          </div>
        </div>
      </header>

      <main style={layoutStyles.content}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={layoutStyles.helperText}>Scores auto-save as you type</p>
          <label style={{ ...layoutStyles.toggleWrapper, color: palette.subtleText }}>
            <span>Round</span>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: `1px solid ${palette.cardBorder}`,
                backgroundColor: palette.cardBg,
                color: palette.sectionTitle,
                fontSize: '14px'
              }}
            >
              <option value="">All rounds</option>
              {rounds.map((round) => (
                <option key={round.id} value={round.id}>
                  {round.name || `Round ${round.id}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ScoringTable
          title="Female"
          candidates={femaleCandidates}
          criteria={filteredCriteria}
          scores={scores}
          savedScores={savedScores}
          saving={saving}
          scoresHidden={scoresHidden}
          onScoreChange={handleScoreChange}
          onScoreSubmit={handleScoreSubmit}
          calculateAverage={calculateAverage}
        />
        <ScoringTable
          title="Male"
          candidates={maleCandidates}
          criteria={filteredCriteria}
          scores={scores}
          savedScores={savedScores}
          saving={saving}
          scoresHidden={scoresHidden}
          onScoreChange={handleScoreChange}
          onScoreSubmit={handleScoreSubmit}
          calculateAverage={calculateAverage}
        />

        <Legend />
      </main>
    </div>
  );
}

function ScoringTable({ title, candidates, criteria, scores, savedScores, saving, scoresHidden, onScoreChange, onScoreSubmit, calculateAverage }) {
  return (
    <section style={tableStyles.section}>
      <div style={tableStyles.sectionHeader}>
        <div style={tableStyles.sectionAccent} />
        <h2 style={tableStyles.sectionTitle}>{title} Candidates</h2>
      </div>
      <div style={tableStyles.card}>
        <div style={tableStyles.tableWrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr style={tableStyles.headerRow}>
                <th style={getHeaderCellStyle({ width: '120px' })}>
                  #
                  <span style={tableStyles.headerAccent} />
                </th>
                <th style={getHeaderCellStyle({ textAlign: 'left', paddingLeft: '24px', minWidth: '200px' })}>
                  Name
                  <span style={tableStyles.headerAccent} />
                </th>
                {criteria.map((criterion) => (
                  <th key={criterion.id} style={getHeaderCellStyle({ minWidth: '150px' })}>
                    <div>{criterion.name}</div>
                    <div style={{ fontSize: '11px', fontWeight: 500, opacity: 0.85 }}>Max: {criterion.max_score}</div>
                    <span style={tableStyles.headerAccent} />
                  </th>
                ))}
                <th style={getHeaderCellStyle({ width: '150px' })}>
                  Average
                  <span style={tableStyles.headerAccent} />
                </th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate, index) => (
                <tr key={candidate.id} style={getRowStyle(index)}>
                  <td style={{ ...tableStyles.bodyCell, ...tableStyles.numberCell }}>{candidate.number}</td>
                  <td style={{ ...tableStyles.bodyCell, ...tableStyles.nameCell }}>{candidate.name}</td>
                  {criteria.map((criterion) => {
                    const key = `${candidate.id}-${criterion.id}`;
                    const isSaved = savedScores[key] === scores[key] && scores[key] !== '';
                    const isSaving = Boolean(saving[key]);

                    return (
                      <td key={criterion.id} style={tableStyles.bodyCell}>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={scoresHidden ? 'password' : 'number'}
                            step="0.01"
                            value={scores[key] || ''}
                            onChange={(event) => onScoreChange(candidate.id, criterion, event.target.value)}
                            onBlur={() => onScoreSubmit(candidate.id, criterion.id)}
                            onKeyDown={(event) => {
                              if (event.key === '-' || event.key === 'e' || event.key === 'E' || event.key === '+') {
                                event.preventDefault();
                              }
                            }}
                            onPaste={(event) => {
                              const pasted = event.clipboardData.getData('text');
                              if (!/^\d*\.?\d*$/.test(pasted)) {
                                event.preventDefault();
                              }
                            }}
                            placeholder="0"
                            style={getInputStyle(isSaved, isSaving, scoresHidden)}
                          />
                          {isSaved && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: palette.savedBorder,
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td style={tableStyles.averageCell}>{calculateAverage(candidate.id, criteria)}</td>
                </tr>
              ))}
              {!candidates.length && (
                <tr>
                  <td colSpan={criteria.length + 2} style={{ padding: '32px', textAlign: 'center', color: palette.subtleText }}>
                    No candidates in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Legend() {
  return (
    <div style={legendStyles.container}>
      <span style={legendStyles.label}>Score Status</span>
      <div style={legendStyles.item}>
        <span style={{ ...legendStyles.swatch, ...statusSwatches.empty }}>–</span>
        Empty
      </div>
      <div style={legendStyles.item}>
        <span style={{ ...legendStyles.swatch, ...statusSwatches.saving }}>…</span>
        Saving
      </div>
      <div style={legendStyles.item}>
        <span style={{ ...legendStyles.swatch, ...statusSwatches.saved }}>✓</span>
        Saved
      </div>
    </div>
  );
}
