# NestJS + Vite + Vitest + TypeORM + SQLite

A full-stack application with NestJS backend, React frontend, comprehensive testing setup, and TypeORM with SQLite.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Or install separately
npm install
cd frontend && npm install
```

### Development

```bash
# Start both backend and frontend in development mode (using Vite)
npm start
# or
npm run dev

# Start only backend with Vite (hot reload)
npm run nest:dev

# Start only frontend
npm run frontend:dev

# This will start:
# - NestJS backend on http://localhost:3000 (powered by Vite)
# - React frontend on http://localhost:5173
```

## 📜 Available Commands

### Development Commands

```bash
# Start full development environment (backend + frontend)
npm start
npm run dev

# Start only backend
npm run nest:start

# Start only frontend
npm run frontend:dev

# Production build
npm run build

# Production start
npm run dev:prod
```

### Testing Commands

#### Backend E2E Tests

```bash
# Run backend e2e tests only
npm run e2e:backend

# Run all backend tests
npm run nest:test

# Run backend tests in watch mode
npm run nest:test:watch
```

#### Frontend E2E Tests

```bash
# Run frontend e2e tests with UI (opens Playwright interface)
npm run e2e:frontend:ui

# Run frontend e2e tests headless (no UI)
npm run e2e:frontend:no-ui

# Run frontend e2e tests with browser visible
npm run e2e:frontend:headed

# Run frontend e2e tests in debug mode
npm run e2e:frontend:debug
```

#### Full Stack E2E Tests

```bash
# Run full stack e2e tests with UI
npm run e2e:full:ui

# Run full stack e2e tests headless
npm run e2e:full:no-ui

# Run all tests (backend + frontend headless)
npm run test:all

# Run all tests with UI
npm run test:all:ui
```

### Build & Clean Commands

```bash
# Build both backend and frontend
npm run build

# Install all dependencies
npm run install:all

# Clean all node_modules and build artifacts
npm run clean

# Clean install (removes node_modules and reinstalls)
npm run clean-install
```

### Utility Commands

```bash
# Interactive test runner
npm run test:runner

# Backend commands
npm run nest:build      # Build backend
npm run nest:start:prod # Start backend in production

# Frontend commands
npm run frontend:build  # Build frontend
npm run frontend:preview # Preview built frontend
```

## 🏗️ Project Structure

```
├── src/                    # NestJS backend source
│   ├── app.module.ts      # Main application module
│   ├── main.ts            # Application entry point
│   ├── configuration.ts   # App configuration
│   ├── orm.config.ts      # Database configuration
│   └── modules/
│       └── product/       # Product module
│           ├── dto/       # Data transfer objects
│           ├── entities/  # TypeORM entities
│           ├── product.controller.ts
│           ├── product.service.ts
│           └── product.module.ts
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── e2e/           # Playwright e2e tests
│   ├── playwright.config.ts
│   └── package.json
├── test/                  # Backend tests
│   ├── product-e2e.spec.ts
│   ├── nestjs-typeorm-sqlite-crud.spec.ts
│   └── vitest-setup.ts
├── dist/                  # Backend build output
└── package.json
```

## ⚡ Vite + NestJS Setup

This project uses **Vite** to run the NestJS backend for improved development experience:

### Features:

- **Hot Reload**: Instant code changes without restarting server
- **Fast Startup**: Vite's optimized bundling for quicker development
- **ESM Support**: Modern ES modules with full TypeScript support
- **Concurrent Development**: Backend and frontend run simultaneously

### Vite Configuration:

- **Port**: 3000 (matches frontend API calls)
- **Adapter**: NestJS-specific adapter for seamless integration
- **SWC Compiler**: Fast TypeScript compilation
- **Hot Module Replacement**: Real-time updates during development

### Development Workflow:

```bash
# Full development environment
npm start          # Both backend + frontend

# Backend only development
npm run nest:dev   # Vite-powered NestJS with hot reload

# Production build
npm run build      # Optimized builds for both services
```

## 🧪 Testing

### Backend Tests

- Uses Vitest for fast testing
- SQLite in-memory database for tests
- Comprehensive CRUD operation tests
- Validation and error handling tests

### Frontend Tests

- Playwright for e2e testing
- Tests full user workflows
- API integration tests
- UI interaction tests

### Running Tests

```bash
# Run all backend tests
npm run nest:test

# Run all frontend tests (headless)
npm run e2e:frontend:no-ui

# Run full stack tests
npm run test:all
```

## 🔧 Configuration

### Backend (NestJS)

- **Port**: 3000
- **Database**: SQLite (better-sqlite3 in prod, sqlite3 in test)
- **CORS**: Enabled
- **Validation**: Global validation pipes

### Frontend (React + Vite)

- **Port**: 5173
- **Build tool**: Vite
- **Testing**: Playwright
- **API Base URL**: http://localhost:3000

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production

```bash
# Build both frontend and backend
npm run build

# Start in production mode
npm run dev:prod
```

## 📦 Dependencies

### Backend

- NestJS framework
- TypeORM with SQLite
- Class-validator for validation
- Vitest for testing

### Frontend

- React 19
- Vite for build tooling
- Playwright for e2e testing
- TypeScript

## 🔍 API Endpoints

### Products

- `GET /product` - Get all products
- `GET /product/:id` - Get product by ID
- `POST /product` - Create new product
- `PATCH /product/:id` - Update product
- `DELETE /product/:id` - Delete product

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000 and 5173 are available
2. **Database issues**: Check SQLite file permissions
3. **Build failures**: Run `npm run clean` then `npm run install:all`
4. **Test failures**: Ensure backend is running for frontend e2e tests

### Database

- Development: SQLite file-based database
- Testing: SQLite in-memory database
- Production: SQLite file-based database

## 📝 Scripts Overview

| Command                      | Description                     |
| ---------------------------- | ------------------------------- |
| `npm start`                  | Start development environment   |
| `npm run dev`                | Same as npm start               |
| `npm run build`              | Build for production            |
| `npm run test:all`           | Run all tests                   |
| `npm run e2e:backend`        | Backend e2e tests only          |
| `npm run e2e:frontend:no-ui` | Frontend e2e tests (headless)   |
| `npm run e2e:full:no-ui`     | Full stack e2e tests (headless) |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:all`
5. Submit a pull request

## 📄 License

This project is licensed under the UNLICENSED license.
