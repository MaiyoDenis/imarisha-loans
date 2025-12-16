---
description: Repository Information Overview
alwaysApply: true
---

# Imarisha Loan Management System - Repository Information

## Summary

**Imarisha** is an enterprise-grade **loan management system** for financial institutions in Africa. The platform enables admin teams to manage loan products, branches, loan officers, and customer groups. Customers can apply for loans, make savings and repayments, with AI-powered risk scoring, real-time dashboards, mobile-first features, and comprehensive reporting.

**Key Business Model:** Group-based lending with flexible loan products, savings accounts, repayment tracking, and multi-branch management.

## Repository Structure

```
imarisha-loan/
├── backend/              # Flask REST API (Python)
├── frontend/             # React/TypeScript SPA (Vite)
├── docker-compose.yml    # Multi-container setup
├── nginx.conf            # Web server config
└── Documentation files   # Phase completion docs
```

### Main Components

- **Backend**: Flask microservices for loan processing, payments, analytics, and integrations
- **Frontend**: React/TypeScript customer & admin dashboards, web UI
- **Database**: PostgreSQL for persistent data
- **Tasks**: Celery for background jobs (notifications, reports)
- **Caching**: Redis for performance optimization
- **Mobile**: Progressive Web App (PWA) with offline support

## Language & Runtime

**Frontend**: 
- **Language**: TypeScript/JavaScript (ES Module)
- **Runtime**: Node.js 18+
- **Build System**: Vite
- **Package Manager**: npm

**Backend**:
- **Language**: Python 3.8+
- **Framework**: Flask
- **Package Manager**: pip

## Dependencies

### Frontend Key Dependencies
- **React 18** + **TypeScript 5.3** - UI framework
- **Vite 5** - Build tool with HMR
- **@tanstack/react-query 5** - Data fetching & caching
- **Material-UI 7** - Component library
- **Recharts 3.5** - Data visualizations
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible components
- **Wouter 3.8** - Lightweight routing
- **React Hook Form 7.48** - Form handling
- **Zod 3.22** - Schema validation

### Backend Key Dependencies
- **Flask** + **Flask-SQLAlchemy** - Web framework & ORM
- **Flask-JWT-Extended** - JWT authentication
- **Flask-CORS** - Cross-origin support
- **Flask-Migrate** - Database migrations
- **Marshmallow-SQLAlchemy** - Serialization
- **Flask-Caching** + **Redis** - Caching layer
- **Celery** - Task queue
- **Pandas**, **NumPy**, **Scikit-learn** - Data processing & ML
- **Prophet** - Time series forecasting

## Build & Installation

### Frontend Setup
```bash
cd frontend
npm install
npm run dev              # Development server
npm run build            # Production build
npm run lint             # ESLint check
```

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py            # Starts on http://localhost:5000
```

### Docker Setup
```bash
docker-compose up -d
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## Docker Configuration

**Frontend**: Node.js 18, Vite production build, port 3000
**Backend**: Python 3.9, Flask app, port 5000
**Database**: PostgreSQL, port 5432
**Cache**: Redis, port 6379

## Main Files & Resources

### Frontend Entry Points
- `frontend/client/src/main.tsx` - React app initialization
- `frontend/client/src/App.tsx` - Route definitions
- `frontend/client/src/lib/api.ts` - Centralized API client

### Key Dashboards (Frontend)
- `frontend/client/src/pages/Dashboard.tsx` - Main overview
- `frontend/client/src/pages/dashboards/ExecutiveDashboard.tsx` - Executive KPIs
- `frontend/client/src/pages/dashboards/OperationsDashboard.tsx` - Operations
- `frontend/client/src/pages/dashboards/RiskDashboard.tsx` - Risk management
- `frontend/client/src/pages/dashboards/MemberAnalyticsDashboard.tsx` - Member analytics
- `frontend/client/src/pages/dashboards/ForecastDashboard.tsx` - Financial forecasts

### Admin Pages (Frontend)
- `frontend/client/src/pages/Branches.tsx` - Branch management
- `frontend/client/src/pages/Users.tsx` - User management
- `frontend/client/src/pages/LoanProducts.tsx` - Loan product configuration
- `frontend/client/src/pages/Groups.tsx` - Customer group management

### Backend Entry Points
- `backend/run.py` - Flask app starter
- `backend/config.py` - Environment configuration
- `backend/app/models.py` - SQLAlchemy models
- `backend/app/routes/` - API endpoints
- `backend/app/services/dashboard_service.py` - Dashboard data aggregation
- `backend/app/services/ai_analytics_service.py` - AI insights

## Testing

### Frontend
- **Framework**: Jest/Vitest
- **Lint**: `npm run lint`
- **Type Check**: `tsc -b`

### Backend
- **Framework**: Pytest
- **Run**: `pytest backend/tests/`

## Current Implementation Status

✅ **Completed**:
- Core CRUD operations
- Authentication & RBAC
- Basic loan calculation
- Dashboard UI components
- Flask & React infrastructure
- Docker containerization
- 5 specialized dashboards

⚠️ **Issues (Production Blocking)**:
- Dashboard charts use hardcoded data (not connected to backend APIs)
- Real-time data refresh not implemented
- Missing API integration between frontend forms and backend
- Action buttons not fully functional (Create/Update/Delete)
- High load performance issues

🔧 **Needs Implementation**:
- Real-time WebSocket connections
- Data refresh mechanisms
- Complete CRUD button functionality
- Error handling & retry logic
- Performance optimization
- Security hardening
