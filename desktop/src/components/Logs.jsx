import React, { useEffect, useRef } from 'react';
import './Logs.css';

function Logs({ logs }) {
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h2>Application Logs</h2>
        <p>{logs.length} entries</p>
      </div>
      <div className="logs-content">
        {logs.length === 0 ? (
          <div className="logs-empty">
            <p>No logs yet. Perform actions to see logs here.</p>
          </div>
        ) : (
          <div className="logs-list">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Logs;
