# DITS - Developer Issue Tracking System

> A purpose-built issue tracker designed exclusively for individual software developers.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

## 🎯 Overview

DITS eliminates the "collaboration tax" imposed by team-oriented tools while providing deep integration with developer ecosystems. Built for developers who need a powerful, fast, and distraction-free issue tracking system.

### Core Principles

- **⚡ Frictionless Capture** - Zero-friction issue creation from anywhere
- **🎯 Optimized for Flow State** - Sub-100ms interactions, keyboard-first design
- **🔗 Context is King** - Deep bidirectional Git integration
- **💾 User Owns Their Data** - Complete data portability and export

## ✨ Key Features

### Issue Management
- Rich Markdown descriptions with syntax highlighting
- Flexible organization with Projects (finite work) and Areas (ongoing responsibilities)
- Parent-child relationships and task dependencies
- Custom workflows with per-project status transitions
- Priority levels, labels, start/due dates

### Smart Views
- **Inbox** - Default destination for newly captured issues
- **Today** - Curated list for your current day
- **Upcoming** - Chronological view with scheduled dates
- **Logbook** - Archive of completed issues

### Git Integration
- Automatic branch creation with semantic naming
- PR/MR tracking and automatic linking
- Webhook-driven status updates
- Issue closure on merge

### Developer Experience
- Command Palette (Cmd/Ctrl+K) for power users
- Keyboard shortcuts for every action
- Offline-first architecture
- Multiple platforms: Web, Desktop (macOS/Windows/Linux), Mobile, IDE extensions

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14+
- Redis 7+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/MickTheLinuxGeek/dits.git
cd dits

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Docker Setup (Alternative)

```bash
# Start all services with Docker Compose
docker-compose up -d

# Run migrations
npm run db:migrate
```

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm run build:clean      # Clean build artifacts

# Testing
npm test                 # Run test suite
npm run test:coverage    # Run tests with coverage report

# Code Quality
npm run lint             # Lint TypeScript files
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Run TypeScript type checking
npm run ci:check         # Run all checks (CI pipeline)

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database (caution!)
npm run db:studio        # Open Prisma Studio GUI
```

### Git Hooks

The project uses Husky with lint-staged for pre-commit hooks. On commit:
- ESLint runs with auto-fix on staged TypeScript files
- Prettier formats staged TypeScript files
- TypeScript type checking validates changes

## 🏗️ Architecture

### Technology Stack

**Backend:**
- TypeScript with Node.js
- Express.js for REST API
- Apollo Server for GraphQL
- Prisma ORM with PostgreSQL
- Redis for caching and sessions
- JWT authentication with OAuth2

**Frontend (Planned):**
- React 18+ with TypeScript
- Vite build system
- React Native for mobile

**DevOps:**
- Docker & Docker Compose
- Jest for testing
- ESLint & Prettier
- GitHub Actions for CI/CD

### Project Structure

```
dits/
├── src/                    # Source code
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── models/             # Data models
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── graphql/            # GraphQL schema & resolvers
│   └── utils/              # Utility functions
├── prisma/                 # Database schema & migrations
├── design_docs/            # Comprehensive design documentation
├── docs/                   # Additional documentation
├── scripts/                # Build and deployment scripts
├── docker/                 # Docker configurations
└── tests/                  # Test files
```

### Core Data Models

- **User** - Single-tenant model (no team entity)
- **Project** - Finite bodies of work with clear endpoints
- **Area** - Ongoing spheres of responsibility
- **Issue** - Core task/bug entity with rich metadata
- **Status/Workflow** - Customizable per-project status transitions
- **Label** - Color-coded flexible categorization
- **GitIntegration** - Links issues to branches, PRs, commits

## 📖 Documentation

- [Requirements](design_docs/requirements.md) - Complete functional & non-functional requirements
- [Implementation Plan](design_docs/plan.md) - Detailed architecture and implementation strategy
- [Tasks](design_docs/tasks.md) - Enumerated task breakdown
- [Contributing](CONTRIBUTING.md) - Contribution guidelines
- [Testing Guide](TESTING.md) - Testing strategies and best practices

## 🧪 Testing

DITS follows a pyramid testing approach:
- 70% Unit tests
- 20% Integration tests
- 10% E2E tests

All new features must include appropriate tests. Run the test suite with:

```bash
npm test
```

For coverage reports:

```bash
npm run test:coverage
```

## 🗺️ Roadmap

### Phase 1: Foundation (Months 1-3) - Current
- [x] Core backend setup
- [x] Database schema design
- [x] Authentication system
- [ ] Basic web application
- [ ] Core issue CRUD operations

### Phase 2: Integrations (Months 4-6)
- [ ] Git provider integrations (GitHub, GitLab, Bitbucket)
- [ ] Desktop applications (macOS, Windows, Linux)
- [ ] VS Code extension
- [ ] JetBrains IDE plugin

### Phase 3: Mobile & Polish (Months 7-9)
- [ ] React Native mobile apps
- [ ] Advanced search with Elasticsearch
- [ ] Performance optimizations
- [ ] Offline-first support

### Phase 4: Launch Preparation (Months 10-12)
- [ ] Beta testing program
- [ ] Production infrastructure
- [ ] Documentation finalization
- [ ] Public launch

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Code Style

- TypeScript for all code
- ESLint rules strictly enforced
- Prettier formatting (semicolons, trailing commas, single quotes)
- 80 character line width
- Comprehensive JSDoc comments

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/MickTheLinuxGeek/dits)
- [Issue Tracker](https://github.com/MickTheLinuxGeek/dits/issues)
- [Documentation](docs/)

## 💡 Philosophy

DITS is built on the belief that individual developers deserve tools designed for their workflow, not adapted from team collaboration tools. Every design decision prioritizes:

1. **Speed** - Sub-100ms interactions maintain flow state
2. **Simplicity** - No artificial complexity from team features
3. **Integration** - Deep connections to developer tools and workflows
4. **Ownership** - Complete control over your data and workflow

---

**Status:** Early Development (Phase 1)

Built with ❤️ for developers who value their time and flow state.
