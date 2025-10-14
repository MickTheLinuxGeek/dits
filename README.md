# DITS - Developer Issue Tracking System

> A purpose-built issue tracker designed exclusively for individual software developers.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com/MickTheLinuxGeek/dits)
[![Coverage](https://img.shields.io/badge/Coverage-85%25-green)](https://github.com/MickTheLinuxGeek/dits)
[Project Status](https://img.shields.io/badge/Project_Status-Development-blue)

## 🎯 Overview

DITS eliminates the "collaboration tax" imposed by team-oriented tools while providing deep integration with developer ecosystems. Built for developers who need a powerful, fast, and distraction-free issue tracking system that actually understands their workflow.

**Why DITS?** Most issue trackers are built for teams and adapted for individuals. DITS is purpose-built from the ground up for the solo developer experience, removing complexity while adding the deep integrations that matter to your daily workflow.

### Core Principles

- **⚡ Frictionless Capture** - Zero-friction issue creation from anywhere in your workflow
- **🎯 Optimized for Flow State** - Sub-100ms interactions, keyboard-first design, minimal context switching
- **🔗 Context is King** - Deep bidirectional Git integration with automatic branch management
- **💾 User Owns Their Data** - Complete data portability, local-first architecture, full export capabilities

## ✨ Key Features

### Issue Management
- Rich Markdown descriptions with syntax highlighting and code blocks
- Flexible organization with Projects (finite work) and Areas (ongoing responsibilities)
- Parent-child relationships and task dependencies with visual relationship graphs
- Custom workflows with per-project status transitions
- Priority levels, labels, start/due dates
- Full-text search with advanced filters

### Smart Views
- **Inbox** - Default destination for newly captured issues
- **Today** - Curated list for your current day
- **Upcoming** - Chronological view with scheduled dates
- **Logbook** - Archive of completed issues
- **Custom Views** - Create and save personalized issue filters

### Git Integration
- Automatic branch creation with semantic naming
- Branch naming based on issue priority and labels (hotfix/bugfix/feature)
- PR/MR tracking and automatic linking
- Webhook-driven status updates and synchronization
- Automatic issue closure on merge
- Commit linking with bi-directional references

### Developer Experience
- Command Palette (Cmd/Ctrl+K) for power users
- Keyboard shortcuts for every action
- Offline-first architecture with seamless sync
- Multiple platforms: Web, Desktop (macOS/Windows/Linux), Mobile, IDE extensions
- Distraction-free UI designed for maximum focus

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

#### Backend Services
- **Auth Service** - JWT authentication with OAuth2 for Git providers
- **Issue Service** - Core CRUD operations and search
- **Project Service** - Project and area organization
- **Sync Service** - Real-time updates via WebSocket
- **Integration Service** - Git provider integrations (GitHub, GitLab, Bitbucket)

#### Data Layer
- PostgreSQL - Primary relational database
- Redis - Caching and session management
- Elasticsearch - Full-text search

#### Frontend Applications
- **Web App** - React 18+ with TypeScript, Vite build system
- **Desktop Apps** - Native per platform (Swift/SwiftUI for macOS, .NET MAUI for Windows, Electron for Linux)
- **Mobile Apps** - React Native for iOS and Android
- **IDE Extensions** - VS Code and JetBrains plugins

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
│   ├── requirements.md     # Complete functional & non-functional requirements
│   ├── plan.md             # Detailed architecture and implementation strategy
│   └── tasks.md            # Enumerated task breakdown
├── docs/                   # Additional documentation
├── scripts/                # Build and deployment scripts
├── docker/                 # Docker configurations
└── tests/                  # Test files
```

### Core Data Models

- **User** - Single-tenant model (no team entity)
- **Project** - Finite bodies of work with clear endpoints
- **Area** - Ongoing spheres of responsibility (Work, Personal, Learning)
- **Issue** - Core task/bug entity with rich metadata (title, description, priority, status, dates, labels)
- **Status/Workflow** - Customizable per-project status transitions
- **Label** - Color-coded flexible categorization
- **GitIntegration** - Links issues to branches, PRs, commits

Issues support:
- Parent-child relationships (sub-tasks)
- Dependencies (blocked by, blocking, related to)
- Full Markdown descriptions with syntax highlighting
- Start dates and due dates
- Multiple labels

### API Architecture

- **GraphQL (Primary)** - Main API for complex queries with precise field selection
- **REST (Fallback)** - Simpler integrations and webhooks

## 📜 Documentation

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

## 🔗 Links

- [GitHub Repository](https://github.com/MickTheLinuxGeek/dits)
- [Issue Tracker](https://github.com/MickTheLinuxGeek/dits/issues)
- [Documentation](docs/)

## 💡 Philosophy

DITS is built on the belief that individual developers deserve tools designed specifically for their workflow, not adapted from team collaboration tools. Every design decision prioritizes:

1. **Speed** - Sub-100ms interactions maintain flow state and minimize context switching
2. **Simplicity** - No artificial complexity from team features or unnecessary collaboration overhead
3. **Integration** - Deep connections to developer tools and workflows you actually use
4. **Ownership** - Complete control over your data and workflow with no vendor lock-in

## 🔒 Security & Privacy

DITS takes your data privacy seriously:
- All data stored locally by default with optional remote sync
- End-to-end encryption for sensitive data
- No telemetry or tracking without explicit opt-in
- OAuth2 with proper scopes for third-party integrations

---

**Status:** Early Development (Phase 1)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

Built with ❤️ for developers who value their time and flow state.
