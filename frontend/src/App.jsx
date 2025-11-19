import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import JudgeLayout from './components/JudgeLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Judge from './pages/judge/JudgeRefactored';
import AdminTools from './pages/admin/AdminTools';
import AdminLogin from './pages/admin/AdminLogin';
import Setup from './pages/admin/Setup';
import CreateEvent from './pages/admin/CreateEvent';
import EventDetails from './pages/admin/EventDetails';
import Certificates from './pages/admin/Certificates';
import Documentation from './pages/admin/Documentation';
import JudgeConfigure from './pages/judges/JudgeConfigure';
import EventSummary from './pages/EventSummary';
import Scoreboard from './pages/Scoreboard';
import PrintResults from './pages/PrintResults';
import NotFound from './pages/NotFound';
import './index.css';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        containerStyle={{
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/judge" element={<JudgeLayout><Judge /></JudgeLayout>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route path="/setup" element={
          <ProtectedRoute>
            <Setup />
          </ProtectedRoute>
        } />
        <Route path="/create-event" element={
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        } />
        <Route path="/get_started" element={
          <ProtectedRoute>
            <AdminTools />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminTools />
          </ProtectedRoute>
        } />
        <Route path="/admin/events/:eventId/details" element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        } />
        <Route path="/admin/certificates" element={
          <ProtectedRoute>
            <Certificates />
          </ProtectedRoute>
        } />
        <Route path="/admin/documentation" element={
          <ProtectedRoute>
            <Documentation />
          </ProtectedRoute>
        } />
        <Route path="/judges/configure" element={
          <ProtectedRoute>
            <JudgeConfigure />
          </ProtectedRoute>
        } />
        
        {/* Public Routes */}
        <Route path="/event/:eventId/summary" element={<EventSummary />} />
        <Route path="/scoreboard" element={<Layout><Scoreboard /></Layout>} />
        <Route path="/print" element={<PrintResults />} />
        
        {/* 404 Catch-all Route - Must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
