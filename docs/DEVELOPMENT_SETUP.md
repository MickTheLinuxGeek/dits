# Development Setup Guide

This guide will help you set up the DITS development environment on your local machine.

## Prerequisites

- **Node.js** v18.x or v20.x
- **npm** v9.x or later
- **Docker** and **Docker Compose** (for local database and cache)
- **Git**

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/MickTheLinuxGeek/dits.git
   cd dits
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update any values as needed. The defaults work for local development.

4. **Start Docker services**
   ```bash
   docker-compose up -d
   ```
   
   This starts PostgreSQL and Redis containers.

5. **Run tests**
   ```bash
   npm test
   ```

## Environment Configuration

The project uses environment variables for configuration. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Key Environment Variables

For local development, the defaults in `.env.example` should work fine. The most important ones are:

- `NODE_ENV` - Set to `development` for local work
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT tokens (change in production!)
- `SESSION_SECRET` - Secret for sessions (change in production!)
- `ENCRYPTION_KEY` - Key for encrypting sensitive data (change in production!)

**Note:** Never commit the `.env` file to version control. It's already in `.gitignore`.

## Docker Services

The development environment includes Docker containers for:

### PostgreSQL
- **Port:** 5432
- **Database:** dits_dev
- **Test Database:** dits_test
- **Username:** dits_user
- **Password:** dits_password

### Redis
- **Port:** 6379
- **Persistence:** Enabled

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (data will be lost!)
docker-compose down -v

# Restart services
docker-compose restart
```

### Connecting to Services

**PostgreSQL:**
```bash
# Using psql
docker exec -it dits-postgres psql -U dits_user -d dits_dev

# Connection string
postgresql://dits_user:dits_password@localhost:5432/dits_dev
```

**Redis:**
```bash
# Using redis-cli
docker exec -it dits-redis redis-cli
```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/config/env.test.ts
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check formatting
npx prettier --check "src/**/*.{ts,tsx,js,jsx,json}"

# Format code
npx prettier --write "src/**/*.{ts,tsx,js,jsx,json}"
```

### Type Checking

```bash
# Check TypeScript types without emitting files
npx tsc --noEmit
```

### Git Hooks

The project uses Husky to run pre-commit hooks:

- **Lint-staged:** Automatically runs ESLint and Prettier on staged files
- **Tests:** Can be configured to run tests before commit

These hooks run automatically when you commit, but you can also run them manually:

```bash
npm run prepare  # Install Husky hooks
```

## Project Structure

```
dits/
├── .github/              # GitHub Actions workflows
│   └── workflows/
│       └── ci.yml       # CI/CD pipeline
├── docker/              # Docker documentation
├── scripts/             # Utility scripts
│   └── init-db.sql     # Database initialization
├── src/                 # Source code
│   ├── config/         # Configuration modules
│   │   ├── env.ts      # Environment configuration
│   │   └── env.test.ts # Environment tests
│   └── index.ts        # Application entry point
├── design_docs/         # Comprehensive design documentation
├── .env.example         # Example environment variables
├── .gitignore          # Git ignore rules
├── docker-compose.yml   # Docker services configuration
├── jest.config.js      # Jest configuration
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── WARP.md            # Warp AI guidance
```

## Continuous Integration

The project uses GitHub Actions for CI/CD. The pipeline runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### CI Jobs

1. **Test** - Runs tests on Node.js 18.x and 20.x with PostgreSQL and Redis
2. **Lint** - Checks code quality, TypeScript types, and formatting
3. **Build** - Verifies TypeScript compilation
4. **Security** - Runs npm audit for vulnerabilities

View workflow status in the repository's Actions tab.

## Troubleshooting

### Docker Issues

**Containers won't start:**
```bash
# Check if ports are in use
sudo lsof -i :5432  # PostgreSQL
sudo lsof -i :6379  # Redis

# Remove containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

**Database connection errors:**
```bash
# Check if PostgreSQL is ready
docker exec dits-postgres pg_isready -U dits_user

# Check logs
docker logs dits-postgres
```

### Test Failures

**Environment variable issues:**
- Make sure `.env` file exists and has correct values
- Check that Docker services are running

**Database test failures:**
- Ensure test database exists: `dits_test`
- Check DATABASE_URL in environment

### Lint Errors

**Pre-commit hook fails:**
```bash
# Run lint with auto-fix
npm run lint:fix

# Format all files
npx prettier --write "src/**/*.{ts,tsx,js,jsx,json}"

# Stage changes and commit again
git add .
git commit -m "Your message"
```

## Additional Resources

- [Design Documentation](../design_docs/plan.md) - Comprehensive implementation plan
- [Requirements](../design_docs/requirements.md) - Full application requirements
- [Task List](../design_docs/tasks.md) - Detailed task breakdown
- [Docker Setup](../docker/README.md) - Detailed Docker documentation

## Getting Help

If you encounter issues:

1. Check this documentation
2. Review the design documents in `design_docs/`
3. Check existing GitHub issues
4. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
   - Relevant logs or error messages
