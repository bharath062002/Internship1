import React, { useState, useEffect } from 'react';
import { appointmentsAPI } from '../utils/api';
import './Appointments.css';

const statusColors = {
  PENDING: 'badge-warning',
  CONFIRMED: 'badge-info',
  IN_PROGRESS: 'badge-purple',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  NO_SHOW: 'badge-danger',
};

const AppointmentCard = ({ appt, onCancel }) => {
  const [cancelling, setCancelling] = useState(false);
  const canCancel = ['PENDING', 'CONFIRMED'].includes(appt.status);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this appointment?')) return;
    setCancelling(true);
    try {
      await onCancel(appt.id);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="appt-card fade-in">
      <div className="appt-header">
        <div className="appt-token">{appt.tokenNumber}</div>
        <span className={`badge ${statusColors[appt.status] || 'badge-info'}`}>{appt.status}</span>
      </div>

      <div className="appt-doctor">
        <div className="appt-doc-avatar">
          {appt.doctor?.user?.fullName?.charAt(0) || 'D'}
        </div>
        <div>
          <div className="appt-doc-name">Dr. {appt.doctor?.user?.fullName}</div>
          <div className="appt-doc-spec">{appt.doctor?.specialization}</div>
        </div>
      </div>

      <div className="appt-details">
        <div className="appt-detail">
          <span className="appt-detail-icon">📅</span>
          <span>{new Date(appt.appointmentDate).toDateString()}</span>
        </div>
        <div className="appt-detail">
          <span className="appt-detail-icon">⏰</span>
          <span>{appt.appointmentTime}</span>
        </div>
        <div className="appt-detail">
          <span className="appt-detail-icon">🔢</span>
          <span>Queue #{appt.queueNumber} (Position: {appt.currentQueuePosition})</span>
        </div>
        <div className="appt-detail">
          <span className="appt-detail-icon">📝</span>
          <span className="appt-reason">{appt.reason}</span>
        </div>
      </div>

      {appt.notes && (
        <div className="appt-notes">
          <span className="notes-label">Doctor's Notes:</span>
          <p>{appt.notes}</p>
        </div>
      )}

      {canCancel && (
        <button className="btn btn-danger appt-cancel-btn" onClick={handleCancel} disabled={cancelling}>
          {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
        </button>
      )}
    </div>
  );
};

const MyAppointments = () => {
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
      const res = await appointmentsAPI.getMyAppointments(page, 10);
      setAppointments(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await appointmentsAPI.cancel(id, 'Cancelled by patient');
      fetchAppointments();
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  const filtered = filter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const statuses = ['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="appts-page page-wrapper">
      <div className="grid-bg" />
      <div className="container">
        <div className="page-header fade-in">
          <span className="section-tag">My Health</span>
          <h1>My Appointments</h1>
          <p>Track and manage all your bookings</p>
        </div>

        <div className="filter-tabs fade-in">
          {statuses.map(s => (
            <button key={s}
              className={`filter-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <h3>No appointments found</h3>
            <p>{filter === 'ALL' ? 'Book your first appointment to get started.' : `No ${filter.toLowerCase()} appointments.`}</p>
          </div>
        ) : (
          <div className="appts-grid">
            {filtered.map(a => (
              <AppointmentCard key={a.id} appt={a} onCancel={handleCancel} />
            ))}
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

export default MyAppointments;
