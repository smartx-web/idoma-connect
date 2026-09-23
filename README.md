# IDOMA-CONNECT

### The Digital Gateway to Idoma Land

IDOMA-CONNECT is a digital platform built to connect, document, promote, and preserve the people, businesses, heritage, stories, events, and achievements of Idoma Land.

The project began as a directory-focused platform and is evolving into a long-term digital ecosystem for the Idoma community.

---

## 🌍 Vision

To build a trusted digital gateway to Idoma Land — connecting people with businesses, places, culture, history, events, and opportunities while preserving the identity and heritage of the Idoma people.

> **We should document Idoma history before it becomes memory.**

---

## 🎯 Core Objectives

IDOMA-CONNECT aims to:

* Digitize businesses and services across Idoma Land.
* Make local businesses easier to discover.
* Preserve Idoma history, culture, traditions, and stories.
* Document important places, festivals, music, artifacts, and heritage.
* Highlight achievements and developments within the Idoma community.
* Create a platform for discovering events and happenings.
* Recognize individuals who have made significant contributions to Idoma Land.
* Encourage digital participation and innovation within the Idoma community.
* Create a foundation for a wider Idoma digital economy.

---

# ✨ Current Platform Features

## 1. Idoma Business Directory

Businesses and service providers can be submitted to the platform.

Each business can contain:

* Business name
* Description
* Category
* LGA
* Address
* Phone number
* WhatsApp number
* Image
* Video
* Latitude
* Longitude
* Verification status
* Approval status

### Business approval workflow

Public users can submit businesses, but submitted businesses do not immediately become publicly visible.

```text
Public Submission
       ↓
Pending
       ↓
Admin Review
       ↓
Approved / Rejected
       ↓
Public Directory
```

This provides an important layer of moderation and quality control.

---

## 2. Happenings in Idoma Land

The Happenings section provides a place to document events, activities, achievements, announcements, and developments across Idoma Land.

A happening can contain:

* Title
* Description
* Image
* Location
* Event date
* Category
* Published status

Administrators can:

* Create happenings
* Edit happenings
* Publish/unpublish happenings
* Delete happenings
* View happening statistics

Public users only see published happenings.

---

## 3. Premium Listings

IDOMA-CONNECT supports premium/featured business listings.

Premium listings can include:

* Business
* Title
* Description
* Image
* Start date
* End date
* Active status

This creates a foundation for future monetization while giving businesses additional visibility on the platform.

---

## 4. Heritage & History

The Heritage section is designed to preserve and showcase the cultural identity of Idoma Land.

The platform can document:

* Historical places
* Festivals
* Traditions
* Cultural practices
* Artifacts
* Stories
* Language
* Music
* Community history

The long-term objective is to build a meaningful digital archive that future generations can access.

---

## 5. Idoma Hall of Fame

The Hall of Fame is intended to recognize people who have made significant contributions to Idoma Land.

The long-term vision includes documenting:

* Community leaders
* Scholars
* Professionals
* Entrepreneurs
* Artists
* Humanitarians
* Cultural figures
* Other notable contributors

Where appropriate, living honourees may be personally visited and presented with IDOMA-CONNECT recognition awards.

---

## 6. Idoma Digital Community

IDOMA-CONNECT is being developed as more than a directory.

The wider vision includes creating digital spaces where Idoma people can interact around:

* Technology
* Business
* Culture
* Education
* Innovation
* Community development
* Digital opportunities

The project also aims to interface with prominent Idoma sons and daughters on technology-related issues and ways to grow the Idoma digital economy.

---

# 🏗️ Technology Stack

## Frontend

* HTML5
* CSS3
* JavaScript
* Vanilla JavaScript

## Backend

* Go
* Gin Web Framework
* PostgreSQL
* pgx
* JWT authentication
* bcrypt password hashing

## Database

* PostgreSQL
* Neon PostgreSQL

## Media

* Cloudinary

## Development Environment

* Linux
* VS Code
* Git
* GitHub

---

# 📁 Project Structure

```text
idoma-connect/
│
├── backend/
│   ├── cmd/
│   ├── internal/
│   │   ├── auth/
│   │   │   ├── controller/
│   │   │   └── middleware/
│   │   │
│   │   ├── business/
│   │   │   ├── controller/
│   │   │   ├── model/
│   │   │   └── repository/
│   │   │
│   │   ├── category/
│   │   ├── happening/
│   │   │   ├── controller/
│   │   │   ├── model/
│   │   │   └── repository/
│   │   │
│   │   ├── lga/
│   │   ├── premium/
│   │   └── router/
│   │
│   ├── .env
│   ├── go.mod
│   └── go.sum
│
├── frontend/
│   ├── admin/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── happenings.html
│   └── index.html
│
└── README.md
```

> `.env` should never be committed to the repository.

---

# 🔐 Admin System

The platform includes a protected administrator system.

The admin area currently supports:

### Dashboard

Displays:

* Approved businesses
* Pending businesses
* Rejected businesses
* Total happenings
* Published happenings
* Unpublished happenings
* Pending business approvals

### Business Management

Administrators can:

* View pending businesses
* Approve businesses
* Reject businesses
* View approved businesses
* View rejected businesses

### Happenings Management

Administrators can:

* Create happenings
* Edit happenings
* Publish/unpublish happenings
* Delete happenings
* View statistics

### Premium Management

Administrators can:

* View premium listings
* Create premium listings
* Activate/deactivate listings

---

# 🔒 Authentication & Security

The admin API uses JWT-based authentication.

Protected routes are grouped under:

```text
/api/v1/admin
```

and protected by the `RequireAdmin` middleware.

The authentication flow is:

```text
Admin Login
    ↓
JWT Token
    ↓
Bearer Authorization
    ↓
JWT Signature Verification
    ↓
Token Expiration Check
    ↓
Admin Role Verification
    ↓
Protected Controller
```

The system currently includes:

* JWT authentication
* HS256 signing
* JWT secret stored in environment variables
* Token expiration
* Admin role verification
* Protected admin routes
* bcrypt password verification
* Unauthorized request handling
* Frontend authentication redirects

---

# 🌐 API

The API is currently available under:

```text
/api/v1
```

## Public endpoints

### Health

```http
GET /api/v1/health
```

### Authentication

```http
POST /api/v1/auth/login
```

### Businesses

```http
GET  /api/v1/businesses
GET  /api/v1/businesses/:id
POST /api/v1/businesses
```

### Categories

```http
GET /api/v1/categories
```

### LGAs

```http
GET /api/v1/lgas
```

### Happenings

```http
GET /api/v1/happenings
```

### Premium

```http
GET /api/v1/premium
```

---

# 🔐 Protected Admin Endpoints

All endpoints below require a valid administrator JWT.

## Businesses

```http
GET /api/v1/admin/businesses/approved
GET /api/v1/admin/businesses/pending
GET /api/v1/admin/businesses/rejected

PUT /api/v1/admin/businesses/:id/approve
PUT /api/v1/admin/businesses/:id/reject
```

## Happenings

```http
GET    /api/v1/admin/happenings
GET    /api/v1/admin/happenings/stats
POST   /api/v1/admin/happenings
PUT    /api/v1/admin/happenings/:id
PUT    /api/v1/admin/happenings/:id/status
DELETE /api/v1/admin/happenings/:id
```

## Premium

```http
GET /api/v1/admin/premium
POST /api/v1/admin/premium
PUT /api/v1/admin/premium/:id/status
```

---

# 🗄️ Database

The application currently uses PostgreSQL.

Major database entities include:

```text
businesses
happenings
premium_listings
```

Business submissions use an approval status system:

```text
pending
approved
rejected
```

Happenings use:

```text
published = true / false
```

Premium listings use:

```text
active = true / false
```

---

# 🚀 Running the Project Locally

## 1. Clone the repository

```bash
git clone https://github.com/smartx-web/idoma-connect.git
cd idoma-connect
```

## 2. Configure environment variables

Create the backend environment file:

```bash
cd backend
nano .env
```

The application requires environment configuration for items such as:

```text
DATABASE_URL
JWT_SECRET
ADMIN_USERNAME
ADMIN_PASSWORD_HASH
```

Additional media configuration may also be required for Cloudinary.

**Never commit `.env` or expose secrets publicly.**

---

## 3. Install backend dependencies

From the backend directory:

```bash
go mod download
```

---

## 4. Run backend tests

```bash
go test ./...
```

---

## 5. Start the backend

Run the backend using the project's configured entry point.

The API is expected to run locally on:

```text
http://localhost:8080
```

---

## 6. Start the frontend

From the frontend directory:

```bash
cd ../frontend
python3 -m http.server 5500
```

The frontend is then available at:

http://localhost:5500


---

# ☁️ Cloudinary

IDOMA-CONNECT uses Cloudinary for image uploads.

The frontend uploads media directly to Cloudinary using an unsigned upload preset.

The backend stores the resulting media URL.

This keeps large media files out of the PostgreSQL database.

---

# 📍 Current Geographic Scope

The platform currently uses the nine LGAs of the Idoma-speaking region represented in the project:

* Otukpo
* Apa
* Agatu
* Ado
* Ogbadibo
* Ohimini
* Oju
* Okpokwu
* Obi

The initial development and testing focus has been on **Otukpo**, with the architecture designed to expand across the wider Idoma region.

---

# 🧪 Development Status

IDOMA-CONNECT is currently under active development.

### Working

* [x] Backend API
* [x] PostgreSQL database integration
* [x] Business directory
* [x] Business submission workflow
* [x] Business approval/rejection
* [x] Public happenings
* [x] Admin happenings management
* [x] Happenings publishing workflow
* [x] Happenings statistics
* [x] Premium listings
* [x] Admin dashboard
* [x] JWT authentication
* [x] Protected admin routes
* [x] Role-based admin authorization
* [x] Cloudinary image uploads
* [x] Heritage pages
* [x] Festival pages
* [x] Hall of Fame foundation

### In Development

* [ ] Advanced search and discovery
* [ ] Location/proximity-based discovery
* [ ] Richer business profiles
* [ ] Reviews and community interaction
* [ ] Ask an Elder
* [ ] Idoma Sounds
* [ ] Expanded Hall of Fame
* [ ] More heritage and historical content
* [ ] Production deployment
* [ ] Production security hardening
* [ ] Analytics and monitoring

---

# 🛣️ Long-Term Roadmap

## Phase 1 — Foundation

* Business directory
* Categories
* LGAs
* Business approval
* Admin system
* Happenings
* Heritage
* Hall of Fame

## Phase 2 — Discovery

* Search improvements
* Location-based discovery
* Maps
* Business profiles
* Reviews
* Better media support

## Phase 3 — Culture & Community

* Ask an Elder
* Idoma Sounds
* Cultural archive
* Stories
* Language resources
* Community contributions

## Phase 4 — Digital Economy

* Business promotion
* Premium listings
* Partnerships
* Digital advertising
* Business analytics
* Community marketplace opportunities

## Phase 5 — Wider Ecosystem

The long-term ambition is to make IDOMA-CONNECT a comprehensive digital gateway connecting people, culture, businesses, institutions, opportunities, and stories across Idoma Land.

---

# 🤝 Contributing

IDOMA-CONNECT is intended to grow through collaboration.

Contributions may eventually include:

* Code
* Documentation
* Historical information
* Cultural stories
* Business information
* Photography
* Community knowledge
* Partnerships
* Mentorship
* Technical expertise

Before contributing code, please ensure that:

```bash
go test ./...
```

passes successfully for backend changes.

---

# 🔐 Security

If you discover a security issue, please do not publicly expose sensitive credentials, database connection strings, JWT secrets, or other private configuration.

Never commit:

```text
.env
database credentials
JWT secrets
API secrets
private keys
```

If credentials are accidentally committed, rotate them immediately and remove them from repository history where necessary.

---

# 👥 Project

**IDOMA-CONNECT**

**Tagline:**

> The Digital Gateway to Idoma Land.

Built with the goal of connecting today's Idoma community while preserving its story for tomorrow.

---

## 📜 Project Principle

> **Document the people.
> Preserve the culture.
> Connect the community.
> Build the future.**
