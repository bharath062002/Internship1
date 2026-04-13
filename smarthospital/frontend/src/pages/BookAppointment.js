import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI } from '../utils/api';
import './BookAppointment.css';

const timeSlots = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','17:00','17:30','18:00','18:30','19:00','19:30'
];

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({ date: '', time: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    doctorsAPI.getById(doctorId)
      .then(res => setDoctor(res.data))
      .catch(() => navigate('/doctors'));
  }, [doctorId, navigate]);

  const minDate = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time || !form.reason) {
      setError('Please fill all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await appointmentsAPI.book({
        doctorId: parseInt(doctorId),
        date: form.date,
        time: form.time,
        reason: form.reason,
      });
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return (
    <div className="loading-center" style={{ minHeight: '80vh' }}>
      <div className="spinner" />
    </div>
  );

  if (success) return (
    <div className="book-page page-wrapper">
      <div className="container">
        <div className="success-card fade-in">
          <div className="success-icon-wrap">
            <span>✓</span>
          </div>
          <h2>Appointment Confirmed!</h2>
          <p>Your appointment has been successfully booked.</p>
          <div className="booking-details">
            <div className="detail-row">
              <span>Doctor</span>
              <strong>Dr. {doctor.user?.fullName}</strong>
            </div>
            <div className="detail-row">
              <span>Date</span>
              <strong>{new Date(success.appointmentDate).toDateString()}</strong>
            </div>
            <div className="detail-row">
              <span>Time</span>
              <strong>{success.appointmentTime}</strong>
            </div>
            <div className="detail-row highlight">
              <span>Token</span>
              <strong>{success.tokenNumber}</strong>
            </div>
            <div className="detail-row">
              <span>Queue #</span>
              <strong>{success.queueNumber}</strong>
            </div>
          </div>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/appointments')}>
              View My Appointments
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/doctors')}>
              Book Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="book-page page-wrapper">
      <div className="grid-bg" />
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/doctors')}>
          ← Back to Doctors
        </button>

        <div className="book-layout">
          {/* Doctor Info Panel */}
          <div className="doctor-panel fade-in">
            <div className="doctor-panel-avatar">
              {doctor.user?.fullName?.charAt(0)}
            </div>
            <h2>{doctor.user?.fullName}</h2>
            <p className="panel-spec">{doctor.specialization}</p>
            <p className="panel-dept">{doctor.department}</p>
            <div className="panel-stats">
              <div className="pstat">
                <span className="pstat-val">{doctor.experienceYears}+</span>
                <span className="pstat-label">Years Exp.</span>
              </div>
              <div className="pstat">
                <span className="pstat-val">{doctor.rating?.toFixed(1)}</span>
                <span className="pstat-label">Rating</span>
              </div>
              <div className="pstat">
                <span className="pstat-val">{doctor.totalReviews}</span>
                <span className="pstat-label">Reviews</span>
              </div>
            </div>
            <div className="panel-info">
              <div className="pinfo-row"><span>💰 Fee</span><strong>{doctor.consultationFee}</strong></div>
              <div className="pinfo-row"><span>🎓 Qual</span><strong>{doctor.qualification}</strong></div>
              <div className="pinfo-row"><span>⏰ Morning</span>
                <strong>{doctor.morningStartTime} - {doctor.morningEndTime}</strong></div>
              <div className="pinfo-row"><span>🌆 Evening</span>
                <strong>{doctor.eveningStartTime} - {doctor.eveningEndTime}</strong></div>
            </div>
            <div className="working-days">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => {
                const fullDay = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'][i];
                const active = doctor.workingDays?.includes(fullDay);
                return (
                  <span key={d} className={`day-chip ${active ? 'active' : ''}`}>{d}</span>
                );
              })}
            </div>
          </div>

          {/* Booking Form */}
          <div className="book-form-card fade-in" style={{ animationDelay: '0.1s' }}>
            <h2>Book Appointment</h2>
            <p className="form-subtitle">Select your preferred date and time slot</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Date</label>
                <input type="date" value={form.date} min={minDate}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
              </div>

              <div className="form-group">
                <label>Select Time Slot</label>
                <div className="time-slots">
                  {timeSlots.map(t => (
                    <button type="button" key={t}
                      className={`time-slot ${form.time === t ? 'selected' : ''}`}
                      onClick={() => setForm(p => ({ ...p, time: t }))}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Visit</label>
                <textarea
                  value={form.reason}
                  onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                  placeholder="Describe your symptoms or reason for consultation..."
                  rows={4}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary book-submit" disabled={loading}>
                {loading ? 'Booking...' : '✓ Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
