-- DITS Database Initialization Script
-- This script creates initial database extensions and schema

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a test database for running tests
CREATE DATABASE dits_test;

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE dits_dev TO dits_user;
GRANT ALL PRIVILEGES ON DATABASE dits_test TO dits_user;
