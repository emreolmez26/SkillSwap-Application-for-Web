import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Notification from './pages/Notification';
import Matching from './pages/Matching';
import Chat from './pages/Chat';
import Skills from './pages/Skills';

// Protected Route component - giriş yapmayan kullanıcıları login'e yönlendirir
const ProtectedRoute = ({ children }) => {
  // localStorage'dan JWT token'ı al (kullanıcı giriş yaptığında kaydedilir)
  const token = localStorage.getItem('skillswap_token');
  
  // MANTIK: Eğer token varsa (giriş yapmış), sayfayı göster
  //         Eğer token yoksa (giriş yapmamış), login sayfasına yönlendir
  return token ? children : <Navigate to="/" replace />;
  
  // Örnek: /dashboard'a gitmek istiyorsun
  // Token varsa: Dashboard sayfasını gösterir
  // Token yoksa: Ana sayfaya (login) yönlendirir
};

// Public Route component - giriş yapmış kullanıcıları dashboard'a yönlendirir  
const PublicRoute = ({ children }) => {
  // Yine aynı token kontrolü
  const token = localStorage.getItem('skillswap_token');
  
  // MANTIK: Eğer token yoksa (giriş yapmamış), sayfayı göster
  //         Eğer token varsa (zaten giriş yapmış), dashboard'a yönlendir
  return !token ? children : <Navigate to="/dashboard" replace />;
  
  // Örnek: /login sayfasına gitmek istiyorsun
  // Token yoksa: Login sayfasını gösterir (normal)
  // Token varsa: Dashboard'a yönlendirir (çünkü zaten giriş yapmışsın)
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Giriş yapmamış kullanıcılar için */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Protected Routes - Giriş yapmış kullanıcılar için */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <Notification />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/matching" 
          element={
            <ProtectedRoute>
              <Matching />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/skills" 
          element={
            <ProtectedRoute>
              <Skills />
            </ProtectedRoute>
          } 
        />

        {/* 404 - Olmayan sayfalar için */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App