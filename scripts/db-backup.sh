#!/bin/bash

# DITS Database Backup Script
# This script creates a backup of the PostgreSQL database

# Load environment variables
set -a
source "$(dirname "$0")/../.env"
set +a

# Configuration
BACKUP_DIR="$(dirname "$0")/../backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/dits_backup_$TIMESTAMP.sql"
COMPRESSED_FILE="$BACKUP_FILE.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting database backup...${NC}"
echo "Database: $DATABASE_NAME"
echo "Host: $DATABASE_HOST:$DATABASE_PORT"
echo "Backup file: $BACKUP_FILE"

# Create backup using pg_dump
PGPASSWORD="$DATABASE_PASSWORD" pg_dump \
  -h "$DATABASE_HOST" \
  -p "$DATABASE_PORT" \
  -U "$DATABASE_USER" \
  -d "$DATABASE_NAME" \
  -F p \
  --clean \
  --if-exists \
  --create \
  > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Backup created successfully${NC}"
  
  # Compress the backup
  echo -e "${YELLOW}Compressing backup...${NC}"
  gzip "$BACKUP_FILE"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup compressed: $COMPRESSED_FILE${NC}"
    
    # Display file size
    SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    echo "Backup size: $SIZE"
    
    # Cleanup old backups (keep last 7 days)
    echo -e "${YELLOW}Cleaning up old backups...${NC}"
    find "$BACKUP_DIR" -name "dits_backup_*.sql.gz" -type f -mtime +7 -delete
    echo -e "${GREEN}✓ Old backups removed (kept last 7 days)${NC}"
    
    # List recent backups
    echo ""
    echo "Recent backups:"
    ls -lht "$BACKUP_DIR"/dits_backup_*.sql.gz | head -5
    
  else
    echo -e "${RED}✗ Failed to compress backup${NC}"
    exit 1
  fi
else
  echo -e "${RED}✗ Backup failed${NC}"
  exit 1
fi

echo -e "${GREEN}Backup completed successfully!${NC}"
