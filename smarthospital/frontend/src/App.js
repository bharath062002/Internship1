import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import Queue from './pages/Queue';
import AdminDashboard from './pages/AdminDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import Notifications from './pages/Notifications';
import './styles/globals.css';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/book/:doctorId" element={
          <PrivateRoute roles={['PATIENT', 'ADMIN']}><BookAppointment /></PrivateRoute>
        } />
        <Route path="/appointments" element={
          <PrivateRoute roles={['PATIENT']}><MyAppointments /></PrivateRoute>
        } />
        <Route path="/doctor/appointments" element={
          <PrivateRoute roles={['DOCTOR', 'ADMIN']}><DoctorAppointments /></PrivateRoute>
        } />
        <Route path="/doctor/queue" element={
          <PrivateRoute roles={['DOCTOR', 'ADMIN']}><Queue /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute roles={['ADMIN']}><AdminDashboard /></PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute><Notifications /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
