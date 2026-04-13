import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Doctors.css';

const DoctorCard = ({ doctor, onBook }) => {
  const stars = Math.round(doctor.rating || 4.5);
  return (
    <div className="doctor-card fade-in">
      <div className="doctor-card-top">
        <div className="doctor-avatar">
          {doctor.user?.fullName?.charAt(0) || 'D'}
        </div>
        <div className="doctor-availability">
          <span className={`avail-dot ${doctor.available ? 'available' : 'busy'}`} />
          {doctor.available ? 'Available' : 'Unavailable'}
        </div>
      </div>
      <div className="doctor-info">
        <h3>{doctor.user?.fullName}</h3>
        <p className="doctor-spec">{doctor.specialization}</p>
        <p className="doctor-dept">{doctor.department}</p>
        <div className="doctor-meta">
          <span className="meta-item">
            <span className="meta-icon">🎓</span>
            {doctor.qualification}
          </span>
          <span className="meta-item">
            <span className="meta-icon">⏱️</span>
            {doctor.experienceYears}+ yrs
          </span>
          <span className="meta-item">
            <span className="meta-icon">💰</span>
            {doctor.consultationFee}
          </span>
        </div>
        <div className="doctor-rating">
          <span className="stars">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
          <span className="rating-text">{doctor.rating?.toFixed(1)} ({doctor.totalReviews} reviews)</span>
        </div>
        {doctor.bio && <p className="doctor-bio">{doctor.bio.substring(0, 90)}...</p>}
      </div>
      <div className="doctor-card-actions">
        <button className="btn btn-primary" onClick={() => onBook(doctor)} disabled={!doctor.available}>
          {doctor.available ? 'Book Appointment' : 'Unavailable'}
        </button>
        <Link to={`/queue?doctorId=${doctor.id}`} className="btn btn-secondary">
          View Queue
        </Link>
      </div>
    </div>
  );
};

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, [page]);

  const fetchDoctors = async (searchTerm = search) => {
    setLoading(true);
    try {
      const res = await doctorsAPI.getAll(page, 9, searchTerm);
      setDoctors(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchDoctors(search);
  };

  const handleBook = (doctor) => {
    if (!user) { navigate('/login'); return; }
    navigate(`/book/${doctor.id}`);
  };

  return (
    <div className="doctors-page page-wrapper">
      <div className="grid-bg" />
      <div className="container">
        <div className="page-header fade-in">
          <span className="section-tag">Find Care</span>
          <h1>Our Specialists</h1>
          <p>Connect with Bengaluru's finest medical professionals</p>
        </div>

        <form className="search-bar fade-in" onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, specialization or department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
          {search && (
            <button type="button" className="btn btn-secondary"
              onClick={() => { setSearch(''); fetchDoctors(''); }}>
              Clear
            </button>
          )}
        </form>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
            <p>Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No doctors found</h3>
            <p>Try adjusting your search terms</p>
          </div>
        ) : (
          <>
            <div className="doctors-grid">
              {doctors.map(doc => (
                <DoctorCard key={doc.id} doctor={doc} onBook={handleBook} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-secondary" disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span className="page-info">Page {page + 1} of {totalPages}</span>
                <button className="btn btn-secondary" disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Doctors;
