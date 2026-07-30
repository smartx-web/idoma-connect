IDOMA CONNECT

The Digital Gateway to Idoma Land

Overview

IDOMA CONNECT is a location-based digital platform that connects residents, visitors, investors, and the diaspora with businesses, essential services, tourism, cultural heritage, historical sites, and community events across the nine Idoma-speaking Local Government Areas of Benue State, Nigeria.

Our vision is to make Idoma land more discoverable, digitally connected, and economically vibrant through technology.

---

Problem Statement

Information about businesses, healthcare facilities, hotels, tourist attractions, cultural heritage, and community events within Idoma land is scattered and difficult to access.

IDOMA CONNECT solves this challenge by bringing everything together on one digital platform.

---

Proposed Solution

The platform enables users to:

- Discover nearby businesses and essential services.
- Locate hospitals, pharmacies, hotels, restaurants, banks, and markets.
- Explore tourist attractions and cultural sites.
- Learn about Idoma history and heritage.
- Stay informed about community events.
- Connect directly with businesses through their contact information.

---

Current MVP

The current hackathon prototype demonstrates the backend architecture of the platform and includes:

- Health Check API
- Business Directory API
- Categories API
- Local Government Areas (LGAs) API
- RESTful API architecture using Go and Gin

The current version uses temporary in-memory data for rapid prototyping. PostgreSQL integration and persistent data storage are planned for the next development phase.

---

Technology Stack

Backend

- Go (Golang)
- Gin Framework
- GORM (prepared for integration)
- PostgreSQL (planned)

Version Control

- Git
- GitHub

---

Project Structure

backend/
├── cmd/
├── configs/
├── internal/
│   ├── business/
│   ├── category/
│   ├── lga/
│   ├── router/
│   └── ...
└── docs/

---

Available API Endpoints

Method| Endpoint
GET| /api/v1/health
GET| /api/v1/businesses
POST| /api/v1/businesses
GET| /api/v1/categories
GET| /api/v1/lgas

---

Future Roadmap

- PostgreSQL database integration
- User authentication and authorization
- Interactive maps and geolocation
- AI-powered digital assistant
- Business verification
- Mobile application
- Reviews and ratings
- Event management
- Tourism guide
- Digital cultural archive

---

Team

Team IDOMA CONNECT

Project Lead

- Musa Bilyamin Umar

Team Members

- Gabriel Oche
- Mohammed Idi
- Ummulkusum Musa
- Juliet Okoh
- Akatu Worthy Akatu

---

Vision

To become the official digital gateway to Idoma land by connecting people with businesses, culture, tourism, and opportunities while preserving the rich heritage of the Idoma people through technology.

---

Hackathon

Submitted for the IDOMA Centenary Plus Hackathon 2026.

---

License

MIT License
