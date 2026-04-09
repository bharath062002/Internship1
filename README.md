# 💬 Nexus Chat — Full-Stack Real-Time Messaging App

A WhatsApp-inspired real-time chat application built with **Spring Boot**, **React**, **WebSocket (STOMP)**, **Redis**, and **JWT authentication**.

---

## 🏗️ Architecture

```
chatapp/
├── backend/          # Spring Boot 3.2 (Java 17)
│   ├── src/main/java/com/chatapp/
│   │   ├── config/       # Security, WebSocket, Redis, JPA configs
│   │   ├── controller/   # REST: Auth, Messages, Users, Groups, Notifications
│   │   ├── dto/          # Request/Response DTOs
│   │   ├── model/        # JPA entities: User, Message, ChatGroup, Notification
│   │   ├── repository/   # Spring Data JPA repositories
│   │   ├── security/     # JWT utils & filter
│   │   ├── service/      # Business logic
│   │   └── websocket/    # STOMP WebSocket controller & events
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/         # React 18 + Vite
    └── src/
        ├── components/   # Sidebar, ChatWindow, MessageBubble, Modals, etc.
        ├── hooks/        # useWebSocket (STOMP client)
        ├── pages/        # Login, Register, ChatPage
        ├── store/        # Zustand global state
        ├── styles/       # Global CSS variables & animations
        └── utils/        # Axios API client
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **User Authentication** | Register, login, JWT access + refresh tokens |
| **Private Chat** | Real-time 1-on-1 messaging via WebSocket |
| **Group Chat** | Create groups, add/remove members, admin roles |
| **Message History** | Paginated REST API with infinite scroll |
| **Online / Offline Status** | Live presence via WebSocket connect/disconnect events |
| **Typing Indicators** | Debounced "is typing…" sent over STOMP |
| **Read Receipts** | ✓ Sent / ✓✓ Delivered / ✓✓ Read (green) |
| **Delete Messages** | Soft-delete with tombstone placeholder |
| **Notifications** | Push via WebSocket + REST CRUD |
| **Redis Caching** | Messages, users, groups, online-status all cached |
| **User Search** | Search by username, display name, or email |

---

## 🚀 Quick Start

### Option 1 — Docker Compose (recommended)

```bash
# Clone / unzip the project, then:
cd chatapp
docker compose up --build
```

- Frontend → http://localhost:3000  
- Backend API → http://localhost:8080  
- H2 Console (dev) → http://localhost:8080/h2-console  

> **Note:** Docker Compose uses MySQL + Redis. The default dev profile uses H2 in-memory DB.

---

### Option 2 — Run locally

#### Prerequisites
- Java 17+
- Node.js 20+
- Redis (running on `localhost:6379`)

#### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend starts on **http://localhost:8080** using H2 in-memory DB.  
If you want MySQL, set the environment variables in `application.properties`.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:3000** and proxies `/api` and `/ws` to the backend.

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (client-side) |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update profile |
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/users/search?q=` | Search users |
| GET | `/api/users/conversations` | Get all conversations |
| POST | `/api/users/status?status=ONLINE` | Update online status |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/messages/send` | Send a message |
| GET | `/api/messages/private/{receiverId}` | Get private chat history |
| GET | `/api/messages/group/{groupId}` | Get group chat history |
| POST | `/api/messages/read/{senderId}` | Mark messages as read |
| DELETE | `/api/messages/{id}` | Delete a message |

### Groups
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/groups` | Create group |
| GET | `/api/groups/{id}` | Get group |
| GET | `/api/groups/my` | Get user's groups |
| POST | `/api/groups/{id}/members/{userId}` | Add member |
| DELETE | `/api/groups/{id}/members/{userId}` | Remove member |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get notifications (paged) |
| GET | `/api/notifications/unread-count` | Get unread count |
| POST | `/api/notifications/mark-all-read` | Mark all read |

---

## 🔌 WebSocket (STOMP)

**Endpoint:** `ws://localhost:8080/ws` (with SockJS fallback)

**Connect** with header: `Authorization: Bearer <token>`

### Client → Server (publish)
| Destination | Payload | Description |
|---|---|---|
| `/app/chat.send` | `SendMessageRequest` | Send message |
| `/app/chat.typing` | `TypingEvent` | Broadcast typing state |
| `/app/chat.read` | `ReadReceiptEvent` | Acknowledge read |

### Server → Client (subscribe)
| Destination | Description |
|---|---|
| `/user/queue/messages` | Incoming private messages |
| `/user/queue/typing` | Typing events |
| `/user/queue/read-receipts` | Read receipt events |
| `/user/queue/notifications` | Push notifications |
| `/topic/status` | Global user status updates |
| `/topic/group/{id}` | Group messages |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.2, Spring Security, Spring WebSocket |
| Database | H2 (dev) / MySQL 8 (prod) |
| Cache | Redis (Spring Cache) |
| Auth | JWT (jjwt 0.11.5) |
| ORM | Spring Data JPA / Hibernate |
| Frontend | React 18, Vite 5 |
| State | Zustand |
| WS Client | @stomp/stompjs + SockJS |
| HTTP Client | Axios (with JWT interceptor & auto-refresh) |
| Routing | React Router v6 |
| Notifications | react-hot-toast |
| Containerization | Docker + Docker Compose |

---

## 🎨 Design System

The UI uses a custom **dark industrial** theme with acid-green accents:

- **Fonts:** Syne (display) + Space Mono (code/labels)
- **Accent:** `#a8ff3e` (acid green) with glow effects
- **Background:** Deep navy-blacks with subtle grid overlays
- **Animations:** CSS keyframes for message entrance, typing blink, status glow

---

## 🔧 Configuration

Key settings in `backend/src/main/resources/application.properties`:

```properties
# Change JWT secret in production!
app.jwt.secret=your-secret-key-here

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379

# Allowed WebSocket origins
app.websocket.allowed-origins=http://localhost:3000
```

---

## 📦 Production Notes

1. **JWT Secret** — Use a 256-bit random key in production
2. **Redis** — Configure persistence (`AOF` or `RDB`) for production
3. **MySQL** — Replace H2 with MySQL and set `ddl-auto=update`  
4. **HTTPS** — Use a reverse proxy (Nginx/Traefik) with TLS
5. **Token Blacklist** — Add Redis-based JWT invalidation for proper logout
6. **File Upload** — Integrate S3 or MinIO for media messages

---

## 📄 License

MIT — feel free to use for personal and commercial projects.
