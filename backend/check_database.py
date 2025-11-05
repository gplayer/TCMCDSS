#!/usr/bin/env python3
"""
Simple script to check what data is in your TCM CDSS database
Run this on PythonAnywhere Console
"""

import sqlite3
import json

# Connect to database
conn = sqlite3.connect('/home/gplayer/TCMCDSS/backend/instance/tcm_cdss.db')
cursor = conn.cursor()

print("=" * 60)
print("TCM CDSS DATABASE DIAGNOSTIC CHECK")
print("=" * 60)

# Check patients
patients = cursor.execute('SELECT id, name FROM patients').fetchall()
print(f"\n1. PATIENTS: {len(patients)} total")
for p in patients:
    print(f"   - ID {p[0]}: {p[1]}")

# Check visits
visits = cursor.execute('SELECT id, patient_id, visit_date, status FROM visits').fetchall()
print(f"\n2. VISITS: {len(visits)} total")
for v in visits[-5:]:  # Last 5
    print(f"   - Visit ID {v[0]}, Patient {v[1]}, Date: {v[2]}, Status: {v[3]}")

# Check observations
observations = cursor.execute('SELECT id, visit_id, section, data, completed FROM observations').fetchall()
print(f"\n3. OBSERVATIONS: {len(observations)} total")
if len(observations) > 0:
    print("\n   Last 5 observations:")
    for o in observations[-5:]:
        try:
            data = json.loads(o[3])
            field_count = len(data)
            field_names = list(data.keys())[:3]  # First 3 fields
            print(f"   - ID {o[0]}, Visit {o[1]}, Section '{o[2]}'")
            print(f"     Fields: {field_count} total, Examples: {field_names}")
            print(f"     Completed: {bool(o[4])}")
        except:
            print(f"   - ID {o[0]}, Visit {o[1]}, Section '{o[2]}' (JSON error)")
else:
    print("   *** NO OBSERVATIONS FOUND IN DATABASE ***")

# Check interrogations
interrogations = cursor.execute('SELECT id, visit_id, section, data, completed FROM interrogations').fetchall()
print(f"\n4. INTERROGATIONS: {len(interrogations)} total")
if len(interrogations) > 0:
    print("\n   Last 5 interrogations:")
    for i in interrogations[-5:]:
        try:
            data = json.loads(i[3])
            field_count = len(data)
            field_names = list(data.keys())[:3]
            print(f"   - ID {i[0]}, Visit {i[1]}, Section '{i[2]}'")
            print(f"     Fields: {field_count} total, Examples: {field_names}")
            print(f"     Completed: {bool(i[4])}")
        except:
            print(f"   - ID {i[0]}, Visit {i[1]}, Section '{i[2]}' (JSON error)")
else:
    print("   *** NO INTERROGATIONS FOUND IN DATABASE ***")

# Check pattern analyses
analyses = cursor.execute('SELECT id, visit_id, confidence, created_at FROM pattern_analyses').fetchall()
print(f"\n5. PATTERN ANALYSES: {len(analyses)} total")
if len(analyses) > 0:
    for a in analyses[-3:]:  # Last 3
        print(f"   - ID {a[0]}, Visit {a[1]}, Confidence: {a[2]}, Date: {a[3]}")
else:
    print("   *** NO PATTERN ANALYSES FOUND ***")

print("\n" + "=" * 60)
print("DIAGNOSTIC COMPLETE")
print("=" * 60)

conn.close()

print("\n\nWhat does this mean?")
print("-" * 60)
print("If OBSERVATIONS = 0:")
print("  → Data is NOT being saved from frontend")
print("  → This is the main problem!")
print("")
print("If OBSERVATIONS > 0 but PATTERN ANALYSES confidence = 0:")
print("  → Data exists but pattern engine has issues")
print("  → Need to fix pattern matching algorithm")
print("")
print("If INTERROGATIONS = 0:")
print("  → Interrogation module not saving (less critical)")
print("-" * 60)