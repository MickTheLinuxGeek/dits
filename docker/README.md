# Docker Development Environment

This directory contains Docker configuration for the DITS development environment.

## Quick Start

Start the development environment:
```bash
docker-compose up -d
```

Stop the development environment:
```bash
docker-compose down
```

Stop and remove volumes (data will be lost):
```bash
docker-compose down -v
```

## Services

### PostgreSQL
- **Host:** localhost
- **Port:** 5432
- **Database:** dits_dev
- **User:** dits_user
- **Password:** dits_password
- **Test Database:** dits_test

### Redis
- **Host:** localhost
- **Port:** 6379
- **Persistence:** Enabled (AOF)

## Health Checks

Both services include health checks:
- PostgreSQL: Checks database readiness every 10 seconds
- Redis: Pings the server every 10 seconds

## Connecting to Services

### PostgreSQL Connection String
```
postgresql://dits_user:dits_password@localhost:5432/dits_dev
```

### Redis Connection String
```
redis://localhost:6379
```

## Useful Commands

### PostgreSQL
```bash
# Connect to PostgreSQL
docker exec -it dits-postgres psql -U dits_user -d dits_dev

# View logs
docker logs dits-postgres

# Backup database
docker exec dits-postgres pg_dump -U dits_user dits_dev > backup.sql

# Restore database
docker exec -i dits-postgres psql -U dits_user dits_dev < backup.sql
```

### Redis
```bash
# Connect to Redis CLI
docker exec -it dits-redis redis-cli

# View logs
docker logs dits-redis

# Monitor commands
docker exec -it dits-redis redis-cli MONITOR
```

## Data Persistence

Data is persisted in Docker volumes:
- `postgres_data`: PostgreSQL data
- `redis_data`: Redis data

These volumes persist even when containers are stopped or removed.
