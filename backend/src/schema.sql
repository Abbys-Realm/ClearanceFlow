-- ============================================================================
-- CLEARANCEFLOW — Normalized PostgreSQL Database Schema & Seeds
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO roles (name, description) VALUES
    ('student', 'Undergraduate and postgraduate students'),
    ('department_staff', 'Office and department reviewers'),
    ('registrar', 'University Registrar officers with final authorization credentials'),
    ('admin', 'System administrators')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL
);

INSERT INTO departments (name, code) VALUES
    ('University Library', 'LIB'),
    ('Dormitory Administration', 'DORM'),
    ('Student Cafeteria', 'CAF'),
    ('Software Engineering', 'DEP_SE'),
    ('Cost-Sharing & Finance', 'FIN'),
    ('Office of the Registrar', 'REG')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    department_id INTEGER REFERENCES departments(id),
    dorm_block VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS clearance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2025/2026',
    status VARCHAR(30) NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
