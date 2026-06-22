import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPredictions from './pages/admin/AdminPredictions';
import AdminDonors from './pages/admin/AdminDonors';
import AdminResults from './pages/admin/AdminResults';
import AdminLayout from './layouts/AdminLayout';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-pitch-900">
      <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full" />
    </div>
  );
  return admin ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f1a14',
              color: '#f1f5f9',
              border: '1px solid rgba(245,158,11,0.2)',
            },
            success: { iconTheme: { primary: '#f59e0b', secondary: '#000' } },
          }}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="predictions" element={<AdminPredictions />} />
            <Route path="donors" element={<AdminDonors />} />
            <Route path="results" element={<AdminResults />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
