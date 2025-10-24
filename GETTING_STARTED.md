# Getting Started with Gestion Domains

## Overview

This is a complete domain management system with:
- **Backend**: FastAPI REST API with PostgreSQL database
- **Frontend**: Modern React application with TailwindCSS

## Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL 12+

## Step-by-Step Setup

### 1. Database Setup

Create PostgreSQL database:

```sql
CREATE DATABASE gestion_domains;
CREATE USER gestion_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gestion_domains TO gestion_user;
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://gestion_user:your_password@localhost:5432/gestion_domains

# Create database tables
python create_tables.py

# Initialize with default data (creates admin, operator, and 3 providers)
python init_data.py

# Run the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Run the development server
npm run dev
```

Frontend will be available at: http://localhost:3000

### 4. Login

Open http://localhost:3000 in your browser and login with:

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Operator Account:**
- Username: `operator`
- Password: `operator123`

## What's Included

### Backend Features
- ✅ User authentication with JWT
- ✅ Role-based access control (Admin/Operator)
- ✅ Complete CRUD for all entities
- ✅ Domain assignment to teams/mailers
- ✅ 3 pre-configured providers (GoDaddy, Namecheap, Dynadot)

### Frontend Features
- ✅ Modern, responsive UI
- ✅ Dashboard with statistics
- ✅ Domain management with assignment
- ✅ Provider management
- ✅ Role-based navigation
- ✅ Authentication flow

## User Roles

### Admin
Can access:
- Dashboard
- Domains (full CRUD + assign/unassign)
- Providers (full CRUD)
- Teams (full CRUD)
- Mailers (full CRUD)
- ISPs (full CRUD)
- Users (full CRUD)

### Operator
Can access:
- Dashboard
- Domains (view + assign/unassign)
- Providers (view only)

## API Endpoints

All endpoints are documented at: http://localhost:8000/docs

### Authentication
- POST `/api/v1/auth/login` - Login

### Domains
- GET `/api/v1/domains/` - List domains
- POST `/api/v1/domains/` - Create domain (Admin)
- GET `/api/v1/domains/{id}` - Get domain
- PUT `/api/v1/domains/{id}` - Update domain (Admin)
- DELETE `/api/v1/domains/{id}` - Delete domain (Admin)
- POST `/api/v1/domains/assign` - Assign domain
- POST `/api/v1/domains/{id}/unassign` - Unassign domain

### Providers
- GET `/api/v1/providers/` - List providers
- POST `/api/v1/providers/` - Create provider (Admin)
- PUT `/api/v1/providers/{id}` - Update provider (Admin)
- DELETE `/api/v1/providers/{id}` - Delete provider (Admin)

Similar endpoints exist for Users, Teams, Mailers, and ISPs.

## Next Steps

1. **Change default passwords** - Update admin and operator passwords
2. **Configure providers** - Add API keys and credentials for GoDaddy, Namecheap, Dynadot
3. **Add ISPs** - Create ISPs (Gmail, Yahoo, Outlook, etc.)
4. **Create teams** - Set up teams for each ISP
5. **Add mailers** - Create mailers within teams
6. **Import domains** - Add your domain inventory
7. **Assign domains** - Assign domains to teams or mailers

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure all dependencies are installed

### Frontend won't start
- Check Node.js version (16+)
- Delete node_modules and run `npm install` again
- Verify backend is running on port 8000

### Can't login
- Ensure you ran `python init_data.py`
- Check backend logs for errors
- Verify database connection

### CORS errors
- Check BACKEND_CORS_ORIGINS in backend/.env
- Ensure frontend URL is included

## Project Structure

```
gestion_domains/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Config & security
│   │   ├── crud/         # Database operations
│   │   ├── db/           # Database setup
│   │   ├── models/       # SQLAlchemy models
│   │   └── schemas/      # Pydantic schemas
│   ├── create_tables.py  # Create DB tables
│   ├── init_data.py      # Seed initial data
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/          # API clients
    │   ├── components/   # React components
    │   ├── contexts/     # React contexts
    │   ├── pages/        # Page components
    │   └── App.jsx
    └── package.json
```

## Support

For issues or questions, refer to:
- Backend: `backend/SETUP.md`
- Frontend: `frontend/README.md`
- API Documentation: http://localhost:8000/docs
