import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI } from '../utils/api';
import './Queue.css';

const Queue = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(searchParams.get('doctorId') || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    doctorsAPI.getAll(0, 50).then(res => setDoctors(res.data.content || []));
  }, []);

  const fetchQueue = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;
    setLoading(true);
    try {
      const res = await appointmentsAPI.getQueue(selectedDoctor, selectedDate);
      setQueue(res.data || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchQueue]);

  const activeQueue = queue.filter(q => !['CANCELLED', 'NO_SHOW'].includes(q.status));
  const currentServing = activeQueue.find(q => q.status === 'IN_PROGRESS');
  const waiting = activeQueue.filter(q => ['PENDING', 'CONFIRMED'].includes(q.status));
  const completed = queue.filter(q => q.status === 'COMPLETED');

  const statusConfig = {
    IN_PROGRESS: { label: 'In Consultation', color: 'var(--accent-cyan)', icon: '🔵' },
    CONFIRMED: { label: 'Waiting', color: 'var(--accent-amber)', icon: '🟡' },
    PENDING: { label: 'Pending', color: 'var(--text-muted)', icon: '⚪' },
    COMPLETED: { label: 'Done', color: 'var(--accent-green)', icon: '🟢' },
    CANCELLED: { label: 'Cancelled', color: 'var(--accent-pink)', icon: '🔴' },
  };

  return (
    <div className="queue-page page-wrapper">
      <div className="grid-bg" />
      <div className="container">
        <div className="page-header fade-in">
          <span className="section-tag">Live Tracking</span>
          <h1>Queue Monitor</h1>
          <p>Real-time patient queue status</p>
          {lastUpdated && (
            <div className="last-updated">
              <span className="live-dot" />
              Last updated: {lastUpdated}
              <button className="refresh-toggle" onClick={() => setAutoRefresh(p => !p)}>
                {autoRefresh ? '⏸ Auto-refresh ON' : '▶ Auto-refresh OFF'}
              </button>
            </div>
          )}
        </div>

        <div className="queue-controls fade-in">
          <div className="form-group">
            <label>Select Doctor</label>
            <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
              <option value="">-- Choose a doctor --</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  Dr. {d.user?.fullName} — {d.specialization}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={fetchQueue} disabled={loading}>
            {loading ? '⟳ Refreshing...' : '⟳ Refresh Queue'}
          </button>
        </div>

        {selectedDoctor && (
          <>
            {/* Summary stats */}
            <div className="queue-stats fade-in">
              <div className="qstat active-stat">
                <span className="qstat-icon">🔵</span>
                <span className="qstat-val">{currentServing ? `#${currentServing.queueNumber}` : '—'}</span>
                <span className="qstat-label">Now Serving</span>
              </div>
              <div className="qstat">
                <span className="qstat-icon">⏳</span>
                <span className="qstat-val">{waiting.length}</span>
                <span className="qstat-label">Waiting</span>
              </div>
              <div className="qstat">
                <span className="qstat-icon">✅</span>
                <span className="qstat-val">{completed.length}</span>
                <span className="qstat-label">Completed</span>
              </div>
              <div className="qstat">
                <span className="qstat-icon">📋</span>
                <span className="qstat-val">{activeQueue.length}</span>
                <span className="qstat-label">Total Active</span>
              </div>
            </div>

            {/* Currently serving */}
            {currentServing && (
              <div className="current-serving fade-in">
                <div className="serving-label">
                  <span className="live-dot" /> NOW SERVING
                </div>
                <div className="serving-info">
                  <div className="serving-queue-num">#{currentServing.queueNumber}</div>
                  <div className="serving-details">
                    <div className="serving-name">
                      {currentServing.patient?.fullName || 'Patient'}
                    </div>
                    <div className="serving-token">{currentServing.tokenNumber}</div>
                    <div className="serving-time">{currentServing.appointmentTime}</div>
                  </div>
                  <div className="serving-reason">{currentServing.reason}</div>
                </div>
              </div>
            )}

            {/* Queue list */}
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : queue.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <h3>No appointments for this date</h3>
                <p>Queue is empty for the selected doctor and date.</p>
              </div>
            ) : (
              <div className="queue-list fade-in">
                <h3 className="queue-list-title">Full Queue ({queue.length} patients)</h3>
                <div className="queue-table">
                  <div className="queue-thead">
                    <span>#</span>
                    <span>Token</span>
                    <span>Patient</span>
                    <span>Time</span>
                    <span>Reason</span>
                    <span>Status</span>
                  </div>
                  {queue.map((q, i) => {
                    const cfg = statusConfig[q.status] || {};
                    return (
                      <div key={q.id}
                        className={`queue-row ${q.status === 'IN_PROGRESS' ? 'serving-row' : ''} ${q.status === 'COMPLETED' ? 'done-row' : ''} ${q.status === 'CANCELLED' ? 'cancelled-row' : ''}`}
                        style={{ animationDelay: `${i * 0.04}s` }}>
                        <span className="q-num">{q.queueNumber}</span>
                        <span className="q-token">{q.tokenNumber}</span>
                        <span className="q-patient">{q.patient?.fullName || '—'}</span>
                        <span className="q-time">{q.appointmentTime}</span>
                        <span className="q-reason">{q.reason?.substring(0, 40)}...</span>
                        <span className="q-status" style={{ color: cfg.color }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {!selectedDoctor && (
          <div className="empty-state">
            <span className="empty-icon">📡</span>
            <h3>Select a doctor to view queue</h3>
            <p>Choose a doctor and date from the controls above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;
