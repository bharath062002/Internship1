# ⊕ SmartHospital — Intelligent Hospital Management System

A full-stack hospital management platform built with **Spring Boot** + **React**, featuring real-time queue tracking, JWT authentication, role-based access control, and smart appointment scheduling.

---

## 🏗️ Project Structure

```
smarthospital/
├── backend/          ← Spring Boot REST API
│   ├── src/main/java/com/smarthospital/
│   │   ├── controller/    ← REST controllers
│   │   ├── model/         ← JPA entities
│   │   ├── repository/    ← Spring Data repositories
│   │   ├── service/       ← Business logic
│   │   ├── security/      ← JWT auth filters
│   │   ├── scheduler/     ← Appointment reminders
│   │   └── config/        ← Security, CORS, data seed
│   └── pom.xml
└── frontend/         ← React SPA
    ├── src/
    │   ├── pages/         ← All page components
    │   ├── components/    ← Shared UI (Navbar)
    │   ├── context/       ← Auth context (React Context)
    │   ├── utils/         ← Axios API helpers
    │   └── styles/        ← Global CSS design tokens
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+

---

### Backend Setup

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**

**H2 Console** (in-memory DB for dev):  
→ http://localhost:8080/h2-console  
JDBC URL: `jdbc:h2:mem:smarthospitaldb`

> **For MySQL:** Update `application.properties` — uncomment the MySQL section and set your credentials.

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

React app starts on **http://localhost:3000**

---

## 👥 Demo Credentials

| Role    | Username   | Password    |
|---------|------------|-------------|
| Admin   | admin      | admin123    |
| Doctor  | dr.sharma  | doctor123   |
| Patient | patient1   | patient123  |

---

## 🔑 Key Features

### 🔐 Authentication & Roles
- JWT-based login/registration
- Role-based access: **ADMIN**, **DOCTOR**, **PATIENT**
- Spring Security with `@PreAuthorize` method-level security

### 📅 Appointment Booking
- Search doctors by name / specialization / department
- Select date + time slot
- Auto-assigned queue number and token (e.g. `TKN-20240415-003`)
- Booking confirmation with instant notification

### 📡 Live Queue Tracking
- Real-time queue view per doctor/date
- Auto-refresh every 15 seconds
- Shows: Now Serving, Waiting count, Completed count
- Visual row indicators per status

### 🔔 Smart Notifications
- Email & SMS simulation (console logging)
- In-app notification bell with unread count
- Types: BOOKED, CONFIRMED, CANCELLED, REMINDER, QUEUE_UPDATE

### 🗓️ Scheduler
- `@Scheduled` cron job: sends reminders at 8 AM for next-day appointments
- Hourly scan: marks no-shows from past confirmed appointments

### 📊 Admin Dashboard
- Stats: Total patients, doctors, appointments by status
- Doctor management: view, delete, toggle availability
- User management: view all users, change roles inline
- System status panel

### 🩺 Doctor Panel
- View assigned patient queue
- Update appointment status: CONFIRMED → IN_PROGRESS → COMPLETED
- Filter by status

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint             | Access  |
|--------|----------------------|---------|
| POST   | /api/auth/login      | Public  |
| POST   | /api/auth/register   | Public  |

### Doctors
| Method | Endpoint                    | Access       |
|--------|-----------------------------|--------------|
| GET    | /api/doctors                | Public       |
| GET    | /api/doctors/{id}           | Public       |
| POST   | /api/doctors/profile        | DOCTOR       |
| PUT    | /api/doctors/{id}/availability | ADMIN/DOCTOR |

### Appointments
| Method | Endpoint                         | Access    |
|--------|----------------------------------|-----------|
| POST   | /api/appointments/book           | PATIENT   |
| PUT    | /api/appointments/{id}/cancel    | PATIENT   |
| GET    | /api/appointments/my             | PATIENT   |
| GET    | /api/appointments/doctor         | DOCTOR    |
| GET    | /api/appointments/queue/{docId}  | Public    |
| PUT    | /api/appointments/{id}/status    | DOCTOR    |

### Admin
| Method | Endpoint                    | Access |
|--------|-----------------------------|--------|
| GET    | /api/admin/dashboard        | ADMIN  |
| GET    | /api/admin/users            | ADMIN  |
| PUT    | /api/admin/users/{id}/role  | ADMIN  |
| GET    | /api/admin/doctors          | ADMIN  |
| DELETE | /api/admin/doctors/{id}     | ADMIN  |

### Notifications
| Method | Endpoint                       | Access |
|--------|--------------------------------|--------|
| GET    | /api/notifications             | Auth   |
| GET    | /api/notifications/unread-count| Auth   |
| PUT    | /api/notifications/{id}/read   | Auth   |

---

## 🎨 UI Design System

The frontend uses a dark **deep navy / cyan** design system:
- **Fonts**: Sora (display) + DM Sans (body)
- **Colors**: `--accent-cyan: #00d4ff` as primary
- **Animations**: `fadeIn`, `slide-in`, `pulse-glow` via CSS keyframes
- **Hover effects**: `transform: translateY()` + `scale()` on all interactive cards
- **Testimonial**: Center card highlighted + scaled (1.03×) — the "Highlight one plan" pattern

---

## 🛠️ Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Backend  | Spring Boot 3.2, Spring Security   |
| Auth     | JWT (jjwt 0.11.5)                  |
| ORM      | Spring Data JPA + Hibernate        |
| Database | H2 (dev) / MySQL (prod)            |
| Schedule | Spring `@Scheduled` tasks          |
| Frontend | React 18, React Router 6           |
| HTTP     | Axios with JWT interceptors        |
| Styling  | Pure CSS with CSS Variables        |

---

## 📦 Production Notes

1. Switch `application.properties` to MySQL
2. Set `spring.jpa.hibernate.ddl-auto=update` (not `create-drop`)
3. Update CORS origins to your production domain
4. Set a strong JWT secret (256+ bit)
5. Configure real SMTP for email notifications
6. Build React: `npm run build` → serve `/build` folder

---

*Built with ❤️ — SmartHospital © 2024*
