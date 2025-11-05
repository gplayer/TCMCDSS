import sqlite3
import json
from datetime import datetime

def get_db_connection(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path):
    """Initialize the database with required tables"""
    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    # Patients table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date_of_birth TEXT,
            gender TEXT,
            phone TEXT,
            email TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')

    # Visits table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            visit_date TEXT NOT NULL,
            chief_complaint TEXT,
            status TEXT DEFAULT 'in_progress',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (patient_id) REFERENCES patients (id)
        )
    ''')

    # Observations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS observations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_id INTEGER NOT NULL,
            section TEXT NOT NULL,
            data TEXT NOT NULL,
            completed BOOLEAN DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (visit_id) REFERENCES visits (id)
        )
    ''')

    # Interrogations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS interrogations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_id INTEGER NOT NULL,
            section TEXT NOT NULL,
            data TEXT NOT NULL,
            completed BOOLEAN DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (visit_id) REFERENCES visits (id)
        )
    ''')

    # Pattern analysis results table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pattern_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_id INTEGER NOT NULL,
            patterns TEXT NOT NULL,
            confidence REAL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (visit_id) REFERENCES visits (id)
        )
    ''')

    # Chief Complaints table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chief_complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_id INTEGER UNIQUE NOT NULL,
            western_conditions TEXT,
            primary_concern TEXT,
            recent_symptoms TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (visit_id) REFERENCES visits (id)
        )
    ''')

    conn.commit()
    conn.close()

class Patient:
    @staticmethod
    def create(db_path, name, date_of_birth=None, gender=None, phone=None, email=None):
        conn = get_db_connection(db_path)
        cursor = conn.cursor()
        now = datetime.now().isoformat()

        cursor.execute('''
            INSERT INTO patients (name, date_of_birth, gender, phone, email, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (name, date_of_birth, gender, phone, email, now, now))

        patient_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return patient_id

    @staticmethod
    def get_all(db_path):
        conn = get_db_connection(db_path)
        patients = conn.execute('SELECT * FROM patients ORDER BY created_at DESC').fetchall()
        conn.close()
        return [dict(p) for p in patients]

    @staticmethod
    def get_by_id(db_path, patient_id):
        conn = get_db_connection(db_path)
        patient = conn.execute('SELECT * FROM patients WHERE id = ?', (patient_id,)).fetchone()
        conn.close()
        return dict(patient) if patient else None

class Visit:
    @staticmethod
    def create(db_path, patient_id, chief_complaint=None):
        conn = get_db_connection(db_path)
        cursor = conn.cursor()
        now = datetime.now().isoformat()

        cursor.execute('''
            INSERT INTO visits (patient_id, visit_date, chief_complaint, status, created_at, updated_at)
            VALUES (?, ?, ?, 'in_progress', ?, ?)
        ''', (patient_id, now, chief_complaint, now, now))

        visit_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return visit_id

    @staticmethod
    def get_by_id(db_path, visit_id):
        conn = get_db_connection(db_path)
        visit = conn.execute('SELECT * FROM visits WHERE id = ?', (visit_id,)).fetchone()
        conn.close()
        return dict(visit) if visit else None

    @staticmethod
    def get_by_patient(db_path, patient_id):
        conn = get_db_connection(db_path)
        visits = conn.execute(
            'SELECT * FROM visits WHERE patient_id = ? ORDER BY visit_date DESC',
            (patient_id,)
        ).fetchall()
        conn.close()
        return [dict(v) for v in visits]

class Observation:
    @staticmethod
    def save(db_path, visit_id, section, data, completed=False):
        conn = get_db_connection(db_path)
        cursor = conn.cursor()
        now = datetime.now().isoformat()

        # Check if observation already exists for this visit and section
        existing = cursor.execute(
            'SELECT id FROM observations WHERE visit_id = ? AND section = ?',
            (visit_id, section)
        ).fetchone()

        data_json = json.dumps(data)

        if existing:
            cursor.execute('''
                UPDATE observations
                SET data = ?, completed = ?, updated_at = ?
                WHERE id = ?
            ''', (data_json, completed, now, existing[0]))
        else:
            cursor.execute('''
                INSERT INTO observations (visit_id, section, data, completed, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (visit_id, section, data_json, completed, now, now))

        conn.commit()
        conn.close()

    @staticmethod
    def get_by_visit(db_path, visit_id):
        conn = get_db_connection(db_path)
        observations = conn.execute(
            'SELECT * FROM observations WHERE visit_id = ? ORDER BY section',
            (visit_id,)
        ).fetchall()
        conn.close()

        result = {}
        for obs in observations:
            result[obs['section']] = {
                'data': json.loads(obs['data']),
                'completed': bool(obs['completed']),
                'updated_at': obs['updated_at']
            }
        return result

class Interrogation:
    @staticmethod
    def save(db_path, visit_id, section, data, completed=False):
        conn = get_db_connection(db_path)
        cursor = conn.cursor()
        now = datetime.now().isoformat()

        # Check if interrogation already exists for this visit and section
        existing = cursor.execute(
            'SELECT id FROM interrogations WHERE visit_id = ? AND section = ?',
            (visit_id, section)
        ).fetchone()

        data_json = json.dumps(data)

        if existing:
            cursor.execute('''
                UPDATE interrogations
                SET data = ?, completed = ?, updated_at = ?
                WHERE id = ?
            ''', (data_json, completed, now, existing[0]))
        else:
            cursor.execute('''
                INSERT INTO interrogations (visit_id, section, data, completed, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (visit_id, section, data_json, completed, now, now))

        conn.commit()
        conn.close()

    @staticmethod
    def get_by_visit(db_path, visit_id):
        conn = get_db_connection(db_path)
        interrogations = conn.execute(
            'SELECT * FROM interrogations WHERE visit_id = ? ORDER BY section',
            (visit_id,)
        ).fetchall()
        conn.close()

        result = {}
        for interr in interrogations:
            result[interr['section']] = {
                'data': json.loads(interr['data']),
                'completed': bool(interr['completed']),
                'updated_at': interr['updated_at']
            }
        return result

class PatternAnalysis:
    @staticmethod
    def save(db_path, visit_id, patterns, confidence):
        conn = get_db_connection(db_path)
        cursor = conn.cursor()
        now = datetime.now().isoformat()

        patterns_json = json.dumps(patterns)

        cursor.execute('''
            INSERT INTO pattern_analyses (visit_id, patterns, confidence, created_at)
            VALUES (?, ?, ?, ?)
        ''', (visit_id, patterns_json, confidence, now))

        conn.commit()
        conn.close()

    @staticmethod
    def get_latest(db_path, visit_id):
        conn = get_db_connection(db_path)
        analysis = conn.execute(
            'SELECT * FROM pattern_analyses WHERE visit_id = ? ORDER BY created_at DESC LIMIT 1',
            (visit_id,)
        ).fetchone()
        conn.close()

        if analysis:
            return {
                'patterns': json.loads(analysis['patterns']),
                'confidence': analysis['confidence'],
                'created_at': analysis['created_at']
            }
        return None

class ChiefComplaint:
    @staticmethod
    def save(db_path, visit_id, western_conditions=None, primary_concern=None, recent_symptoms=None):
        conn = get_db_connection(db_path)
        cursor = conn.cursor()
        now = datetime.now().isoformat()

        # Check if chief complaint already exists for this visit
        existing = cursor.execute(
            'SELECT id FROM chief_complaints WHERE visit_id = ?',
            (visit_id,)
        ).fetchone()

        if existing:
            cursor.execute('''
                UPDATE chief_complaints
                SET western_conditions = ?, primary_concern = ?, recent_symptoms = ?, updated_at = ?
                WHERE id = ?
            ''', (western_conditions, primary_concern, recent_symptoms, now, existing[0]))
        else:
            cursor.execute('''
                INSERT INTO chief_complaints (visit_id, western_conditions, primary_concern, recent_symptoms, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (visit_id, western_conditions, primary_concern, recent_symptoms, now, now))

        conn.commit()
        conn.close()

    @staticmethod
    def get_by_visit(db_path, visit_id):
        conn = get_db_connection(db_path)
        chief_complaint = conn.execute(
            'SELECT * FROM chief_complaints WHERE visit_id = ?',
            (visit_id,)
        ).fetchone()
        conn.close()

        if chief_complaint:
            return {
                'western_conditions': chief_complaint['western_conditions'],
                'primary_concern': chief_complaint['primary_concern'],
                'recent_symptoms': chief_complaint['recent_symptoms'],
                'created_at': chief_complaint['created_at'],
                'updated_at': chief_complaint['updated_at']
            }
        return None
