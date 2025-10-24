import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Domains from './pages/Domains';
import DomainsHistory from './pages/DomainsHistory';
import TeamDomains from './pages/TeamDomains';
import MailerDomains from './pages/MailerDomains';
import ISPDomains from './pages/ISPDomains';
import Providers from './pages/Providers';
import Accounts from './pages/Accounts';
import Teams from './pages/Teams';
import Mailers from './pages/Mailers';
import ISPs from './pages/ISPs';
import Users from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/domains"
            element={
              <ProtectedRoute>
                <Domains />
              </ProtectedRoute>
            }
          />
          <Route
            path="/domains-history"
            element={
              <ProtectedRoute>
                <DomainsHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-domains"
            element={
              <ProtectedRoute>
                <TeamDomains />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mailer-domains"
            element={
              <ProtectedRoute>
                <MailerDomains />
              </ProtectedRoute>
            }
          />
          <Route
            path="/isp-domains"
            element={
              <ProtectedRoute>
                <ISPDomains />
              </ProtectedRoute>
            }
          />
          <Route
            path="/providers"
            element={
              <ProtectedRoute>
                <Providers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <Accounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mailers"
            element={
              <ProtectedRoute>
                <Mailers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/isps"
            element={
              <ProtectedRoute>
                <ISPs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
