# Gestion Domains - Domain Management System

Full-stack application for managing domains, providers, teams, and mailers.

## Tech Stack

- **Backend**: FastAPI + PostgreSQL + SQLAlchemy
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Authentication**: JWT tokens

## Quick Start

### Backend Setup

1. Create PostgreSQL database
2. Navigate to backend: `cd backend`
3. Create virtual environment: `python -m venv venv`
4. Activate: `venv\Scripts\activate` (Windows)
5. Install: `pip install -r requirements.txt`
6. Configure `.env` file
7. Create tables: `python create_tables.py`
8. Initialize data: `python init_data.py`
9. Run: `uvicorn app.main:app --reload`

### Frontend Setup

1. Navigate to frontend: `cd frontend`
2. Install: `npm install`
3. Configure `.env` file
4. Run: `npm run dev`

## Default Credentials

- Admin: `admin` / `admin123`
- Operator: `operator` / `operator123`

## Features

### Core Functionality
- **User Management**: Admin and Operator roles with JWT authentication
- **Domain Inventory**: Complete domain management with assignment tracking
- **Provider Integration**: GoDaddy, Namecheap, Dynadot API support
- **Team & Mailer Management**: Organize domains by teams and mailers
- **ISP Management**: Gmail, Yahoo, Outlook, and custom ISP support
- **Domain Assignment**: Assign domains to teams or mailers with rotation tracking

### Advanced Features
- **Assignment History**: Track all domain assignments with timestamps and user info
- **DNS A Record Lookup**: Automatic IP address resolution for all domains
- **Bulk DNS Refresh**: Update A records for all domains at once
- **Domain Views**: Filter domains by Team, Mailer, or ISP
- **Search & Filters**: Advanced filtering by status, provider, and search terms
- **Pagination**: Handle large domain portfolios efficiently
- **Assignment Display**: See who each domain is assigned to at a glance

## Provider API Setup

### Namecheap Configuration

1. **Enable API Access**: Log into Namecheap → Profile → Tools → API Access
2. **Get API Key**: Generate your API key
3. **Whitelist IP**: Add your server's public IP address to the whitelist
4. **Find Your IP**: Visit https://api.ipify.org/ or run `curl ifconfig.me`
5. **Add Account**: In the app, use:
   - **API Key**: Your Namecheap API key
   - **Email**: Your Namecheap username/email
   - **Password/Client IP**: Your whitelisted public IP address (e.g., `123.45.67.89`)

### GoDaddy Configuration

- **API Key**: Your GoDaddy API key
- **Password**: Your GoDaddy API secret

### Dynadot Configuration

- **API Key**: Your Dynadot API key
- **Password**: Leave empty

See backend/SETUP.md and frontend/README.md for detailed instructions.

## Project Structure

```
Gestion_domains/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── crud/         # Database operations
│   │   ├── db/           # Database configuration
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── utils/        # Utility functions (DNS lookup, etc.)
│   ├── create_tables.py  # Database initialization
│   ├── init_data.py      # Seed data
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/          # API client functions
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts (Auth)
│   │   ├── pages/        # Page components
│   │   └── App.jsx       # Main app component
│   └── package.json      # Node dependencies
└── README.md

```

## Key Pages

- **Dashboard**: Overview and statistics
- **Domains**: Main domain management with assignment
- **Assignment History**: Track all domain assignments
- **Team Domains**: View domains by team
- **Mailer Domains**: View domains by mailer
- **ISP Domains**: View domains by ISP
- **Providers**: Manage domain providers
- **Accounts**: Provider account management
- **Teams**: Team management
- **Mailers**: Mailer management
- **ISPs**: ISP management
- **Users**: User management (Admin only)

## Documentation

- `ASSIGNMENT_HISTORY_SETUP.md` - Assignment tracking feature guide
- `DNS_LOOKUP_FEATURE.md` - DNS A record lookup documentation
- `DOMAIN_VIEWS_FEATURE.md` - Domain filtering views guide
- `GETTING_STARTED.md` - Detailed setup instructions

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
