import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import './AdminDashboard.css';

const StatCard = ({ icon, label, value, color, trend }) => (
  <div className={`admin-stat-card color-${color} fade-in`}>
    <div className="astat-icon">{icon}</div>
    <div className="astat-content">
      <div className="astat-value">{value ?? '—'}</div>
      <div className="astat-label">{label}</div>
    </div>
    {trend && <div className="astat-trend">{trend}</div>}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, userRes, docRes] = await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getUsers(0, 20),
          adminAPI.getDoctors(0, 20),
        ]);
        setStats(dashRes.data);
        setUsers(userRes.data.content || []);
        setDoctors(docRes.data.content || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      setUsers(u => u.map(x => x.id === userId ? { ...x, role } : x));
    } catch {
      alert('Failed to update role');
    }
  };

  const handleDeleteDoctor = async (docId) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await adminAPI.deleteDoctor(docId);
      setDoctors(d => d.filter(x => x.id !== docId));
    } catch {
      alert('Failed to delete doctor');
    }
  };

  if (loading) return (
    <div className="loading-center" style={{ minHeight: '80vh' }}>
      <div className="spinner" /><p>Loading dashboard...</p>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '⬡' },
    { id: 'doctors', label: 'Doctors', icon: '🩺' },
    { id: 'users', label: 'Users', icon: '👥' },
  ];

  return (
    <div className="admin-page page-wrapper">
      <div className="grid-bg" />
      <div className="container">
        <div className="page-header fade-in">
          <span className="section-tag">Administration</span>
          <h1>Admin Dashboard</h1>
          <p>Hospital management command center</p>
        </div>

        <div className="admin-tabs fade-in">
          {tabs.map(t => (
            <button key={t.id}
              className={`admin-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="fade-in">
            <div className="admin-stats-grid">
              <StatCard icon="👥" label="Total Patients" value={stats?.totalPatients} color="cyan" trend="↑ 12%" />
              <StatCard icon="🩺" label="Total Doctors" value={stats?.totalDoctors} color="teal" trend="↑ 2%" />
              <StatCard icon="📅" label="Total Appointments" value={stats?.totalAppointments} color="purple" trend="↑ 8%" />
              <StatCard icon="✅" label="Confirmed" value={stats?.confirmedAppointments} color="green" />
              <StatCard icon="🏁" label="Completed" value={stats?.completedAppointments} color="amber" />
              <StatCard icon="❌" label="Cancelled" value={stats?.cancelledAppointments} color="pink" />
            </div>

            <div className="admin-overview-cards">
              <div className="overview-card">
                <h3>System Status</h3>
                <div className="system-status-list">
                  <div className="sys-item"><span className="sys-dot green" />API Server — Online</div>
                  <div className="sys-item"><span className="sys-dot green" />Database — Connected</div>
                  <div className="sys-item"><span className="sys-dot amber" />Email Service — Simulated</div>
                  <div className="sys-item"><span className="sys-dot amber" />SMS Service — Simulated</div>
                  <div className="sys-item"><span className="sys-dot green" />Scheduler — Running</div>
                </div>
              </div>
              <div className="overview-card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button className="qaction-btn" onClick={() => setActiveTab('doctors')}>
                    <span>🩺</span> Manage Doctors
                  </button>
                  <button className="qaction-btn" onClick={() => setActiveTab('users')}>
                    <span>👥</span> Manage Users
                  </button>
                  <button className="qaction-btn">
                    <span>📊</span> Export Reports
                  </button>
                  <button className="qaction-btn">
                    <span>🔔</span> Send Broadcast
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="fade-in">
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h3>Doctor Management</h3>
                <span className="badge badge-info">{doctors.length} doctors</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Department</th>
                    <th>Experience</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doc => (
                    <tr key={doc.id}>
                      <td className="td-name">
                        <div className="table-avatar">{doc.user?.fullName?.charAt(0)}</div>
                        <div>
                          <div className="td-main">Dr. {doc.user?.fullName}</div>
                          <div className="td-sub">{doc.user?.email}</div>
                        </div>
                      </td>
                      <td><span className="badge badge-info">{doc.specialization}</span></td>
                      <td>{doc.department}</td>
                      <td>{doc.experienceYears}+ yrs</td>
                      <td>
                        <span className="rating-stars">{'★'.repeat(Math.round(doc.rating || 4))} {doc.rating?.toFixed(1)}</span>
                      </td>
                      <td>
                        <span className={`badge ${doc.available ? 'badge-success' : 'badge-danger'}`}>
                          {doc.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-danger table-action-btn"
                          onClick={() => handleDeleteDoctor(doc.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="fade-in">
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h3>User Management</h3>
                <span className="badge badge-info">{users.length} users</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Blood Group</th>
                    <th>Gender</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="td-name">
                        <div className="table-avatar">{u.fullName?.charAt(0) || u.username?.charAt(0)}</div>
                        <div>
                          <div className="td-main">{u.fullName || u.username}</div>
                          <div className="td-sub">@{u.username}</div>
                        </div>
                      </td>
                      <td>
                        <div className="td-main">{u.email}</div>
                        <div className="td-sub">{u.phone}</div>
                      </td>
                      <td>
                        {u.bloodGroup ? (
                          <span className="badge badge-danger">{u.bloodGroup}</span>
                        ) : '—'}
                      </td>
                      <td>{u.gender || '—'}</td>
                      <td>
                        <select className="role-select-inline"
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}>
                          <option value="PATIENT">PATIENT</option>
                          <option value="DOCTOR">DOCTOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${u.enabled ? 'badge-success' : 'badge-danger'}`}>
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
