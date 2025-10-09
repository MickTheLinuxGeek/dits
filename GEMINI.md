# GEMINI.md

## Project Overview

This project is a **Developer Issue Tracking System (DITS)**. It is a web application built with **Node.js** and **TypeScript**. The database is **PostgreSQL**, and it uses **Prisma** as an ORM. **Redis** is also used, likely for caching or session management.

The project is in its early stages, with a well-defined database schema but minimal application logic so far.

## Building and Running

### Prerequisites

*   Node.js
*   npm
*   Docker

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

### Database

The project uses PostgreSQL with Prisma for database management.

1.  **Start the database:**
    ```bash
    docker-compose up -d
    ```

2.  **Run database migrations:**
    ```bash
    npm run db:migrate
    ```

3.  **Seed the database (optional):**
    ```bash
    npm run db:seed
    ```

### Running the Application

The main entry point `src/index.ts` is currently empty. To run the application, you would typically have a start script in `package.json`.

```bash
# TODO: Add a start script to package.json
npm start
```

### Testing

The project uses **Jest** for testing.

*   **Run all tests:**
    ```bash
    npm test
    ```

*   **Run tests with coverage:**
    ```bash
    npm run test:coverage
    ```

## Development Conventions

### Linting

The project uses **ESLint** with **Prettier** for code linting and formatting.

*   **Run the linter:**
    ```bash
    npm run lint
    ```

*   **Fix linting errors:**
    ```bash
    npm run lint:fix
    ```

### Git Hooks

The project uses **Husky** for pre-commit hooks. The pre-commit hook runs ESLint and Prettier to ensure code quality before committing.

### Database Migrations

Database schema changes are managed with **Prisma Migrate**.

*   **Create a new migration:**
    ```bash
    npx prisma migrate dev --name <migration-name>
    ```
