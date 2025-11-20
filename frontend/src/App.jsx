import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AgentDashboard from './pages/AgentDashboard';
import VerifyEmail from './pages/VerifyEmail';
import './App.css';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));

  const getRoleFromUser = (user) => {
    if (user?.roles && Array.isArray(user.roles)) {
      if (user.roles.some(role => role.name === 'AGENT')) {
        return 'AGENT';
      }
      return user.roles[0]?.name;
    }
    return user?.role;
  };

  const [userRole, setUserRole] = useState(() => {
    const userStr = localStorage.getItem('user');
    try {
      const user = userStr ? JSON.parse(userStr) : null;
      return getRoleFromUser(user);
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token) {
      setIsAuthenticated(true);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserRole(getRoleFromUser(user));
        } catch (e) {
          console.error("Error parsing user", e);
        }
      }
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(getRoleFromUser(user));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              userRole === 'AGENT' ? (
                <AgentDashboard onLogout={handleLogout} />
              ) : (
                <Dashboard onLogout={handleLogout} />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
