# Gestion Domains - Frontend

React frontend for the Domain Management System.

## Features

- **Modern UI**: Built with React, TailwindCSS, and shadcn/ui
- **Authentication**: JWT-based authentication with role-based access
- **Dashboard**: Overview of domains, providers, teams, and mailers
- **Domain Management**: View, create, edit, assign, and unassign domains
- **Provider Management**: Manage domain providers (GoDaddy, Namecheap, Dynadot)
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
copy .env.example .env
```

4. Update `.env` with your API URL (default is http://localhost:8000)

### Running the Application

Development mode:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Default Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Operator**: username: `operator`, password: `operator123`

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client functions
│   ├── components/       # Reusable components
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/        # React contexts (Auth)
│   ├── pages/           # Page components
│   ├── lib/             # Utility functions
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
└── package.json         # Dependencies
```

## Available Pages

- `/login` - Login page
- `/dashboard` - Dashboard with statistics
- `/domains` - Domain management (both Admin and Operator)
- `/providers` - Provider management (both Admin and Operator)
- `/teams` - Team management (Admin only)
- `/mailers` - Mailer management (Admin only)
- `/isps` - ISP management (Admin only)
- `/users` - User management (Admin only)

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Radix UI** - Headless UI components
- **Lucide React** - Icons
- **Axios** - HTTP client
