import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children, hideAdmin = false }) {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header matching old system */}
      <nav className="shadow-md" style={{ 
        background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
        borderBottom: '3px solid #7C3AED'
      }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <h1 className="text-white text-2xl font-bold tracking-wide">TCC Tabulation</h1>
            </div>
            <div className="flex space-x-2">
              <Link
                to="/judge"
                className={`px-6 py-2 rounded-lg text-white font-medium transition-all ${
                  isActive('/judge')
                    ? 'bg-pink-500'
                    : 'bg-pink-400 hover:bg-pink-500'
                }`}
                style={{ letterSpacing: '0.5px' }}
              >
                Judge Scoring
              </Link>
              {!hideAdmin && (
                <Link
                  to="/admin"
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-all ${
                    isActive('/admin')
                      ? 'bg-pink-500'
                      : 'bg-pink-400 hover:bg-pink-500'
                  }`}
                  style={{ letterSpacing: '0.5px' }}
                >
                  Admin Tools
                </Link>
              )}
              <Link
                to="/scoreboard"
                className={`px-6 py-2 rounded-lg text-white font-medium transition-all ${
                  isActive('/scoreboard')
                    ? 'bg-pink-500'
                    : 'bg-pink-400 hover:bg-pink-500'
                }`}
                style={{ letterSpacing: '0.5px' }}
              >
                Scoreboard
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
