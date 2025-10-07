#!/bin/bash

# DITS Database Restore Script
# This script restores a PostgreSQL database from backup

# Load environment variables
set -a
source "$(dirname "$0")/../.env"
set +a

# Configuration
BACKUP_DIR="$(dirname "$0")/../backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to list available backups
list_backups() {
  echo -e "${BLUE}Available backups:${NC}"
  ls -lht "$BACKUP_DIR"/dits_backup_*.sql.gz 2>/dev/null | nl
}

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
  echo -e "${RED}✗ Backup directory not found: $BACKUP_DIR${NC}"
  exit 1
fi

# If no backup file specified, list available backups
if [ -z "$1" ]; then
  list_backups
  echo ""
  echo -e "${YELLOW}Usage: $0 <backup_file>${NC}"
  echo "Example: $0 dits_backup_20251007_120000.sql.gz"
  exit 1
fi

BACKUP_FILE="$BACKUP_DIR/$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}✗ Backup file not found: $BACKUP_FILE${NC}"
  echo ""
  list_backups
  exit 1
fi

echo -e "${YELLOW}Database Restore${NC}"
echo "Database: $DATABASE_NAME"
echo "Host: $DATABASE_HOST:$DATABASE_PORT"
echo "Backup file: $BACKUP_FILE"
echo ""
echo -e "${RED}WARNING: This will replace all current data in the database!${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
  echo -e "${YELLOW}Decompressing backup...${NC}"
  TEMP_FILE="${BACKUP_FILE%.gz}"
  gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to decompress backup${NC}"
    exit 1
  fi
  
  RESTORE_FILE="$TEMP_FILE"
else
  RESTORE_FILE="$BACKUP_FILE"
fi

# Restore database
echo -e "${YELLOW}Restoring database...${NC}"

PGPASSWORD="$DATABASE_PASSWORD" psql \
  -h "$DATABASE_HOST" \
  -p "$DATABASE_PORT" \
  -U "$DATABASE_USER" \
  -f "$RESTORE_FILE"

# Check if restore was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Database restored successfully${NC}"
  
  # Clean up temporary file if created
  if [[ $BACKUP_FILE == *.gz ]]; then
    rm -f "$TEMP_FILE"
    echo -e "${GREEN}✓ Temporary files cleaned up${NC}"
  fi
  
  echo -e "${GREEN}Restore completed successfully!${NC}"
else
  echo -e "${RED}✗ Restore failed${NC}"
  
  # Clean up temporary file if created
  if [[ $BACKUP_FILE == *.gz ]]; then
    rm -f "$TEMP_FILE"
  fi
  
  exit 1
fi
