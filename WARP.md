# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

DITS (Developer Issue Tracking System) is a purpose-built issue tracker designed exclusively for individual software developers. The project aims to eliminate the "collaboration tax" imposed by team-oriented tools while providing deep integration with developer ecosystems.

**Core Principles:**
- Frictionless Capture - Zero-friction issue creation from anywhere
- Optimized for Flow State - Sub-100ms interactions, keyboard-first design
- Context is King - Deep bidirectional Git integration
- User Owns Their Data - Complete data portability and export

## Technology Stack

- **Language:** TypeScript with Node.js
- **Testing:** Jest with ts-jest
- **Code Quality:** ESLint, Prettier, Husky for pre-commit hooks
- **Package Manager:** npm

## Common Development Commands

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Linting & Formatting
```bash
# Lint TypeScript files
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Git Hooks
The project uses Husky with lint-staged for pre-commit hooks. On commit, the following automatically runs:
- ESLint with auto-fix on staged TypeScript files
- Prettier formatting on staged TypeScript files

## Project Architecture

### High-Level Design

DITS follows a cloud-native microservices architecture with the following key components:

**Backend Services:**
- Auth Service - JWT authentication with OAuth2 for Git providers
- Issue Service - Core CRUD operations and search
- Project Service - Project and area organization
- Sync Service - Real-time updates via WebSocket
- Integration Service - Git provider integrations (GitHub, GitLab, Bitbucket)

**Data Layer:**
- PostgreSQL - Primary relational database
- Redis - Caching and session management
- Elasticsearch - Full-text search

**Frontend Applications:**
- Web App - React 18+ with TypeScript, Vite build system
- Desktop Apps - Native per platform (Swift/SwiftUI for macOS, .NET MAUI for Windows, Electron for Linux)
- Mobile Apps - React Native
- IDE Extensions - VS Code and JetBrains

### Key Data Models

The system is built around these core entities:

1. **User** - Single-tenant model (no team entity)
2. **Project** - Finite bodies of work with clear endpoints
3. **Area** - Ongoing spheres of responsibility (Work, Personal, Learning)
4. **Issue** - Core task/bug entity with rich metadata (title, description, priority, status, dates, labels)
5. **Status/Workflow** - Customizable per-project status transitions
6. **Label** - Color-coded flexible categorization
7. **GitIntegration** - Links issues to branches, PRs, commits

Issues support:
- Parent-child relationships (sub-tasks)
- Dependencies (blocked by, blocking, related to)
- Full Markdown descriptions with syntax highlighting
- Start dates and due dates
- Multiple labels

### API Architecture

**GraphQL (Primary):** Main API for complex queries with precise field selection
**REST (Fallback):** Simpler integrations and webhooks

**Smart Views:**
- Inbox - Default destination for newly captured issues
- Today - Curated list for current day
- Upcoming - Chronological view with scheduled dates
- Logbook - Archive of completed issues

### Git Integration Strategy

The system provides deep, bidirectional Git integration:

**Branch Management:**
- Automatic branch creation with semantic naming (e.g., `feature/a1b2c3d4-implement-auth`)
- Branch naming based on issue priority and labels (hotfix/bugfix/feature)

**PR/MR Integration:**
- Automatic linking using keywords (Fixes #123, Closes #123)
- Status tracking and updates
- Automatic issue closure on merge

**Webhook Processing:**
- Real-time event handling from Git providers
- Automatic status transitions (branch created → In Progress, PR merged → Done)
- Signature validation for security

### Performance Requirements

- All UI interactions must complete in < 100ms
- API response times < 100ms (95th percentile)
- Optimized for flow state with minimal context switches
- Efficient search across large datasets (1000+ issues)

## Development Phases

The project is organized into 4 phases (see `design_docs/plan.md` and `design_docs/tasks.md` for details):

**Phase 1 (Months 1-3):** Foundation - Core backend, web app, basic features
**Phase 2 (Months 4-6):** Integrations - Git integration, desktop apps, IDE extensions  
**Phase 3 (Months 7-9):** Mobile & Polish - Mobile apps, advanced features, performance
**Phase 4 (Months 10-12):** Launch Preparation - Beta testing, production readiness

Current Status: Early Phase 1 - Core infrastructure setup

## Code Organization

```
dits/
├── src/                    # Source code (currently minimal - project starting)
├── design_docs/            # Comprehensive design documentation
│   ├── requirements.md     # Full functional & non-functional requirements
│   ├── plan.md            # Detailed implementation plan with architecture
│   └── tasks.md           # Enumerated task list with checkboxes
├── .husky/                # Git hooks configuration
└── node_modules/          # Dependencies
```

## Key Design Documents

1. **`design_docs/requirements.md`** - Complete application requirements including:
   - Functional requirements (issue management, views, integrations)
   - Non-functional requirements (performance, security, platforms)
   - Business requirements (target audience, monetization)

2. **`design_docs/plan.md`** - Comprehensive implementation plan covering:
   - System architecture with diagrams
   - Technology stack decisions
   - Data model design
   - API architecture (GraphQL + REST)
   - Security implementation
   - Testing strategy
   - Deployment infrastructure
   - Development timeline

3. **`design_docs/tasks.md`** - Detailed task breakdown with ~600+ enumerated tasks

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the configured ESLint rules
- Use Prettier formatting (semicolons, trailing commas, single quotes)
- 80 character line width

### Testing Philosophy
- Target 70% unit tests, 20% integration tests, 10% E2E tests
- All new features must include tests
- Test files use `.test.ts` or `.spec.ts` suffix

### Git Workflow
- Pre-commit hooks automatically run linting and formatting
- Commit messages should reference issue numbers when applicable
- Follow the branch naming strategy defined in the architecture

### Performance
- Keep in mind the sub-100ms interaction time requirement
- Optimize database queries with proper indexing
- Use caching strategies appropriately
- Consider offline-first design for desktop/mobile

### Security
- Never commit sensitive data (API keys, tokens, passwords)
- Use encryption for sensitive data at rest
- Implement proper input validation and sanitization
- Follow OAuth2 best practices for third-party integrations

## Key Integrations to Consider

When working on features, keep in mind the planned integrations:
- Git providers (GitHub, GitLab, Bitbucket) via OAuth2
- VS Code extension API
- JetBrains Plugin SDK
- React Native for mobile (iOS/Android)
- WebSocket for real-time updates
- Elasticsearch for search

## Important Notes

- This is a **single-user focused** tool - avoid team-oriented patterns
- Keyboard-first design is critical - every action should have a shortcut
- The Command Palette (Cmd/Ctrl+K) is the primary interface for power users
- Issues are "living documents" - design for mutability, not static records
- The distinction between Projects (finite) and Areas (ongoing) is fundamental
