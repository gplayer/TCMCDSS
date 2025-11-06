-- Cloudflare D1 Database Schema for TCM CDSS
-- Longenix Health - TCM Clinical Decision Support System

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date_of_birth TEXT,
    gender TEXT,
    phone TEXT,
    email TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    visit_date TEXT NOT NULL,
    chief_complaint TEXT,
    status TEXT DEFAULT 'in_progress',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients (id)
);

-- Observations table
CREATE TABLE IF NOT EXISTS observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER NOT NULL,
    section TEXT NOT NULL,
    data TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (visit_id) REFERENCES visits (id),
    UNIQUE(visit_id, section)
);

-- Interrogations table
CREATE TABLE IF NOT EXISTS interrogations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER NOT NULL,
    section TEXT NOT NULL,
    data TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (visit_id) REFERENCES visits (id),
    UNIQUE(visit_id, section)
);

-- Pattern analysis results table
CREATE TABLE IF NOT EXISTS pattern_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER NOT NULL,
    patterns TEXT NOT NULL,
    confidence REAL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (visit_id) REFERENCES visits (id)
);

-- Chief Complaints table
CREATE TABLE IF NOT EXISTS chief_complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER UNIQUE NOT NULL,
    western_conditions TEXT,
    primary_concern TEXT,
    recent_symptoms TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (visit_id) REFERENCES visits (id)
);

-- TCM Reasoning Profiles table
CREATE TABLE IF NOT EXISTS tcm_reasoning_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER UNIQUE NOT NULL,
    profile_data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (visit_id) REFERENCES visits (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_observations_visit ON observations(visit_id);
CREATE INDEX IF NOT EXISTS idx_interrogations_visit ON interrogations(visit_id);
CREATE INDEX IF NOT EXISTS idx_pattern_analyses_visit ON pattern_analyses(visit_id);
