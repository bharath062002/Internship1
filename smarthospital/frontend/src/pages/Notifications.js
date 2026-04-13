import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../utils/api';
import './Notifications.css';

const typeIcons = {
  APPOINTMENT_BOOKED: '📅',
  APPOINTMENT_CONFIRMED: '✅',
  APPOINTMENT_CANCELLED: '❌',
  APPOINTMENT_REMINDER: '🔔',
  QUEUE_UPDATE: '⬡',
  SYSTEM: '⚙️',
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll(page, 15);
      setNotifications(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    await notificationsAPI.markAsRead(id);
    setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  };

  return (
    <div className="notifs-page page-wrapper">
      <div className="grid-bg" />
      <div className="container" style={{ maxWidth: 780 }}>
        <div className="page-header fade-in">
          <span className="section-tag">Updates</span>
          <h1>Notifications</h1>
          <p>Your activity feed and alerts</p>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔔</span>
            <h3>No notifications yet</h3>
            <p>Your alerts and updates will appear here.</p>
          </div>
        ) : (
          <div className="notifs-list fade-in">
            {notifications.map((n, i) => (
              <div key={n.id}
                className={`notif-item ${!n.read ? 'unread' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="notif-icon-wrap">
                  {typeIcons[n.type] || '🔔'}
                </div>
                <div className="notif-content">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-message">{n.message}</div>
                  <div className="notif-meta">
                    <span className="notif-time">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    <span className="notif-type-badge">{n.type?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                {!n.read && (
                  <button className="notif-mark-read" onClick={() => handleMarkRead(n.id)}>
                    Mark Read
                  </button>
                )}
                {n.read && <span className="notif-read-badge">✓ Read</span>}
              </div>
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

export default Notifications;
