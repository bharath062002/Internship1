import React, { useState, useEffect } from 'react';
import { appointmentsAPI } from '../utils/api';
import './Appointments.css';
import './DoctorAppointments.css';

const statusColors = {
  PENDING: 'badge-warning', CONFIRMED: 'badge-info',
  IN_PROGRESS: 'badge-purple', COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger', NO_SHOW: 'badge-danger',
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchAppointments();
  }, [page]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.getDoctorAppointments(page, 15);
      setAppointments(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentsAPI.updateStatus(id, status);
      fetchAppointments();
    } catch { alert('Failed to update status'); }
  };

  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter);
  const statuses = ['ALL', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="appts-page page-wrapper">
      <div className="grid-bg" />
      <div className="container">
        <div className="page-header fade-in">
          <span className="section-tag">Doctor Panel</span>
          <h1>My Patient Queue</h1>
          <p>Manage your appointments and patient consultations</p>
        </div>

        <div className="filter-tabs fade-in">
          {statuses.map(s => (
            <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No appointments</h3>
          </div>
        ) : (
          <div className="doc-appts-table-wrap fade-in">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Token</th><th>Patient</th><th>Date & Time</th>
                  <th>Queue #</th><th>Reason</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td><span className="q-token">{a.tokenNumber}</span></td>
                    <td className="td-name">
                      <div className="table-avatar">{a.patient?.fullName?.charAt(0)}</div>
                      <div>
                        <div className="td-main">{a.patient?.fullName}</div>
                        <div className="td-sub">{a.patient?.phone}</div>
                      </div>
                    </td>
                    <td>
                      <div className="td-main">{new Date(a.appointmentDate).toDateString()}</div>
                      <div className="td-sub">{a.appointmentTime}</div>
                    </td>
                    <td className="q-num">#{a.queueNumber}</td>
                    <td className="td-sub">{a.reason}</td>
                    <td><span className={`badge ${statusColors[a.status]}`}>{a.status}</span></td>
                    <td>
                      {a.status === 'CONFIRMED' && (
                        <button className="btn btn-primary table-action-btn"
                          onClick={() => handleStatusChange(a.id, 'IN_PROGRESS')}>
                          Start
                        </button>
                      )}
                      {a.status === 'IN_PROGRESS' && (
                        <button className="btn btn-secondary table-action-btn"
                          onClick={() => handleStatusChange(a.id, 'COMPLETED')}>
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span className="page-info">Page {page + 1} of {totalPages}</span>
            <button className="btn btn-secondary" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
