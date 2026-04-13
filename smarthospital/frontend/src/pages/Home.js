import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const stats = [
  { value: '500+', label: 'Doctors', icon: '🩺' },
  { value: '50K+', label: 'Patients Served', icon: '❤️' },
  { value: '98%', label: 'Satisfaction Rate', icon: '⭐' },
  { value: '24/7', label: 'Support', icon: '🛡️' },
];

const features = [
  {
    icon: '⚡',
    title: 'Instant Booking',
    desc: 'Book appointments in under 60 seconds. Real-time slot availability with instant confirmation.',
    color: 'cyan',
  },
  {
    icon: '📡',
    title: 'Live Queue Tracking',
    desc: 'Monitor your exact queue position in real time. No more waiting room uncertainty.',
    color: 'teal',
  },
  {
    icon: '🔔',
    title: 'Smart Notifications',
    desc: 'Email and SMS reminders. Never miss an appointment with intelligent pre-visit alerts.',
    color: 'purple',
  },
  {
    icon: '🩺',
    title: 'Top Specialists',
    desc: 'Access Bengaluru\'s finest doctors across 15+ specialties, all verified and rated.',
    color: 'amber',
  },
  {
    icon: '🔐',
    title: 'Secure & Private',
    desc: 'JWT-secured authentication with role-based access. Your health data stays yours.',
    color: 'pink',
  },
  {
    icon: '📊',
    title: 'Admin Dashboard',
    desc: 'Complete hospital management: doctors, patients, analytics — one command center.',
    color: 'green',
  },
];

const testimonials = [
  {
    name: 'Priya Nair',
    role: 'Patient',
    avatar: 'P',
    text: 'SmartHospital transformed how I manage my healthcare. Queue tracking alone saved me hours of waiting.',
    rating: 5,
    highlight: true,
  },
  {
    name: 'Dr. Amit Kumar',
    role: 'Orthopedic Surgeon',
    avatar: 'A',
    text: 'The scheduling system is incredibly intuitive. My patient throughput has improved by 40% since we switched.',
    rating: 5,
    highlight: false,
  },
  {
    name: 'Ravi Menon',
    role: 'Patient',
    avatar: 'R',
    text: 'Booking my follow-up with my cardiologist took less than a minute. The reminder system is superb.',
    rating: 5,
    highlight: false,
  },
];

const specialties = [
  { icon: '❤️', name: 'Cardiology' },
  { icon: '🧠', name: 'Neurology' },
  { icon: '🦴', name: 'Orthopedics' },
  { icon: '👶', name: 'Pediatrics' },
  { icon: '🌿', name: 'Dermatology' },
  { icon: '👁️', name: 'Ophthalmology' },
  { icon: '🫁', name: 'Pulmonology' },
  { icon: '🔬', name: 'Oncology' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <div className="grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span className="badge-dot" /> Next-Gen Healthcare Platform
        </div>
        <h1 className="hero-title">
          Your Health,<br />
          <span className="gradient-text">Intelligently</span><br />
          Managed.
        </h1>
        <p className="hero-subtitle">
          Book appointments, track queues live, and connect with Bengaluru's top specialists.
          SmartHospital brings hospital management into the future.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link to="/doctors" className="btn btn-primary btn-lg">Find a Doctor →</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free →</Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
            </>
          )}
        </div>
        <div className="hero-demo-creds">
          <span>Demo:</span>
          <code>admin / admin123</code>
          <code>dr.sharma / doctor123</code>
          <code>patient1 / patient123</code>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        {stats.map((s, i) => (
          <div className="stat-card fade-in" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Specialties */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Medical Excellence</span>
          <h2>15+ Specializations</h2>
          <p>Expert care across every medical discipline</p>
        </div>
        <div className="specialties-grid">
          {specialties.map((s, i) => (
            <Link to="/doctors" className="specialty-chip" key={i}>
              <span className="specialty-icon">{s.icon}</span>
              <span>{s.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Platform Features</span>
          <h2>Everything You Need</h2>
          <p>A complete healthcare management ecosystem</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className={`feature-card feature-${f.color} fade-in`}
                 key={i}
                 style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-icon-wrap">
                <span className="feature-icon">{f.icon}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Patient Stories</span>
          <h2>Trusted by Thousands</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div className={`testimonial-card ${t.highlight ? 'highlighted' : ''} fade-in`}
                 key={i}>
              {t.highlight && <div className="highlight-badge">⭐ Featured Review</div>}
              <div className="stars">{'★'.repeat(t.rating)}</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.avatar}</div>
                <div>
                  <div className="author-name">{t.name}</div>
                  <div className="author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Start Your Health Journey Today</h2>
          <p>Join thousands of patients already using SmartHospital for smarter healthcare.</p>
          <div className="hero-actions">
            {!user && (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Create Account →</Link>
                <Link to="/doctors" className="btn btn-secondary btn-lg">Browse Doctors</Link>
              </>
            )}
            {user && (
              <Link to="/doctors" className="btn btn-primary btn-lg">Book Appointment →</Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-icon">⊕</span>
          <span>SmartHospital © 2024</span>
        </div>
        <p className="footer-note">Built with Spring Boot + React | Bengaluru, India</p>
      </footer>
    </div>
  );
};

export default Home;
