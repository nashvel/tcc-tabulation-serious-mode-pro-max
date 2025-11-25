import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Play, Square, RotateCw, ExternalLink, Settings, BarChart3 } from 'lucide-react';
import './ServiceControl.css';

function ServiceControl({ addLog }) {
  const [services, setServices] = useState({
    redis: false,
    laravel: false,
    echo: false,
    frontend: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAllServices();
    const interval = setInterval(checkAllServices, 2000);
    return () => clearInterval(interval);
  }, []);

  const checkAllServices = async () => {
    if (!window.electron) {
      console.warn('Electron API not available');
      return;
    }
    for (const service of Object.keys(services)) {
      try {
        const status = await window.electron.checkServiceStatus(service);
        setServices(prev => ({ ...prev, [service]: status.running }));
      } catch (error) {
        console.error(`Error checking ${service} status:`, error);
      }
    }
  };

  const startService = async (service) => {
    if (!window.electron) {
      toast.error('Electron API not available');
      return;
    }
    setLoading(true);
    try {
      const result = await window.electron.startService(service);
      addLog(result.message);
      toast.success(result.message);
      await checkAllServices();
    } catch (error) {
      addLog(`Error: ${error.message}`);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const stopService = async (service) => {
    if (!window.electron) {
      toast.error('Electron API not available');
      return;
    }
    setLoading(true);
    try {
      const result = await window.electron.stopService(service);
      addLog(result.message);
      toast.success(result.message);
      await checkAllServices();
    } catch (error) {
      addLog(`Error: ${error.message}`);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startAllServices = async () => {
    setLoading(true);
    try {
      addLog('Starting all services...');
      for (const service of ['redis', 'laravel', 'echo', 'frontend']) {
        await startService(service);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      toast.success('All services started!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const stopAllServices = async () => {
    setLoading(true);
    try {
      addLog('Stopping all services...');
      for (const service of Object.keys(services)) {
        await stopService(service);
      }
      toast.success('All services stopped!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openPage = async (page) => {
    if (!window.electron) {
      toast.error('Electron API not available');
      return;
    }
    const url = page === 'setup' 
      ? 'http://localhost:5173/admin/setup'
      : 'http://localhost:5173/admin';
    try {
      await window.electron.openBrowser(url);
      addLog(`Opening ${page} page...`);
    } catch (error) {
      addLog(`Error: ${error.message}`);
      toast.error(error.message);
    }
  };

  const ServiceCard = ({ name, label, running }) => (
    <div className="service-card">
      <div className="service-info">
        <h3>{label}</h3>
        <div className={`status ${running ? 'running' : 'stopped'}`}>
          <span className="dot"></span>
          {running ? 'Running' : 'Stopped'}
        </div>
      </div>
      <div className="service-actions">
        {!running ? (
          <button 
            onClick={() => startService(name)}
            disabled={loading}
            className="btn btn-success"
          >
            <Play size={16} /> Start
          </button>
        ) : (
          <button 
            onClick={() => stopService(name)}
            disabled={loading}
            className="btn btn-danger"
          >
            <Square size={16} /> Stop
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="service-control">
      <div className="control-panel">
        <h2>Service Management</h2>
        <div className="control-buttons">
          <button 
            onClick={startAllServices}
            disabled={loading}
            className="btn btn-lg btn-success"
          >
            <Play size={18} /> Start All
          </button>
          <button 
            onClick={stopAllServices}
            disabled={loading}
            className="btn btn-lg btn-danger"
          >
            <Square size={18} /> Stop All
          </button>
          <button 
            onClick={checkAllServices}
            disabled={loading}
            className="btn btn-lg btn-info"
          >
            <RotateCw size={18} /> Refresh
          </button>
          <button 
            onClick={() => openPage('setup')}
            className="btn btn-lg btn-purple"
          >
            <Settings size={18} /> Setup
          </button>
          <button 
            onClick={() => openPage('admin')}
            className="btn btn-lg btn-orange"
          >
            <BarChart3 size={18} /> Admin
          </button>
        </div>
      </div>

      <div className="services-grid">
        <ServiceCard name="redis" label="Redis" running={services.redis} />
        <ServiceCard name="laravel" label="Laravel Backend" running={services.laravel} />
        <ServiceCard name="echo" label="Echo Server" running={services.echo} />
        <ServiceCard name="frontend" label="Frontend Dev" running={services.frontend} />
      </div>
    </div>
  );
}

export default ServiceControl;
