import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Sliders, Calendar, FileText } from 'lucide-react';
import Header from './components/Header';
import ServiceControl from './components/ServiceControl';
import EventManagement from './components/EventManagement';
import Logs from './components/Logs';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('services');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  return (
    <div className="app">
      <Toaster position="top-right" />
      <Header />
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <Sliders size={18} /> Service Control
        </button>
        <button 
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={18} /> Event Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <FileText size={18} /> Logs
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'services' && <ServiceControl addLog={addLog} />}
        {activeTab === 'events' && <EventManagement addLog={addLog} />}
        {activeTab === 'logs' && <Logs logs={logs} />}
      </div>
    </div>
  );
}

export default App;
