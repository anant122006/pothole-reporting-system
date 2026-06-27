# 🕳️ FixMyRoad — Pothole Reporting System

A full-stack pothole reporting and tracking web application.

🔗 **Live Demo:** https://pothole-reporting-system-production.up.railway.app

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js + Express
- **Storage:** JSON file-based (no database required)
- **File Uploads:** Multer (photo uploads)

## Project Structure
pothole-app/

├── server.js          # Express backend

├── package.json

├── data/

│   └── reports.json   # Auto-created on first run

├── uploads/           # Auto-created for photo uploads

└── public/

├── index.html     # Citizen report form

└── admin.html     # Admin dashboard
## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
node server.js
```

Or for auto-restart during development:
```bash
npm run dev
```

### 3. Open in browser
- Citizen form: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin.html

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reports | Submit a new report |
| GET | /api/reports | Get all reports |
| GET | /api/reports/:id | Get single report |
| PATCH | /api/reports/:id/status | Update report status |
| DELETE | /api/reports/:id | Delete a report |
| GET | /api/stats | Get dashboard statistics |

## Features
- 📝 Citizen report form with photo upload
- 📍 GPS geolocation capture
- 🔴 Severity levels (Low / Medium / High)
- 📊 Admin dashboard with live stats
- 🔧 Status management (Pending → In Progress → Resolved)
- 🔍 Search and filter reports
- 📱 Responsive design
