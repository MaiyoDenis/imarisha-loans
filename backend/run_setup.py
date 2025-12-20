#!/usr/bin/env python3
"""Setup and seed the database"""
import os
import sys
from pathlib import Path

db_file = Path('imarisha.db')
if db_file.exists():
    db_file.unlink()
    print(f"✅ Deleted old database: {db_file}")

os.system("flask db upgrade")
print("\n" + "="*60)
print("Running seed script...")
print("="*60 + "\n")
os.system("python seed.py")
