#!/usr/bin/env python3
"""
Test script to verify the backend implementation of the Imarisha Loan System
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE = "http://localhost:5000/api"
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

session = requests.Session()

def test_login():
    """Test authentication"""
    print("🔐 Testing Authentication...")
    
    login_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    }
    
    try:
        response = session.post(f"{API_BASE}/auth/login", json=login_data)
        if response.status_code == 200:
            print("✅ Authentication test passed")
            return True
        else:
            print(f"⚠️  Authentication failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return False

def test_dashboards():
    """Test dashboard endpoints"""
    print("📊 Testing Dashboards...")
    dashboards = ['executive', 'operations', 'risk', 'member-analytics', 'forecast', 'admin']
    
    for db_type in dashboards:
        try:
            response = session.get(f"{API_BASE}/dashboards/{db_type}")
            if response.status_code == 200:
                print(f"✅ {db_type.capitalize()} Dashboard passed")
            else:
                print(f"⚠️  {db_type.capitalize()} Dashboard failed: {response.status_code}")
        except Exception as e:
            print(f"❌ {db_type.capitalize()} Dashboard error: {e}")

def test_branches():
    """Test branch endpoints"""
    print("🏢 Testing Branches...")
    try:
        response = session.get(f"{API_BASE}/branches")
        if response.status_code == 200:
            branches = response.json()
            print(f"✅ Get Branches passed ({len(branches)} found)")
            return branches
        else:
            print(f"⚠️  Get Branches failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Branches error: {e}")

def test_ai_analytics():
    """Test AI analytics endpoints"""
    print("🧠 Testing AI Analytics...")
    endpoints = ['arrears-forecast', 'member-behavior', 'cohort-analysis', 'summary']
    
    for endpoint in endpoints:
        try:
            response = session.get(f"{API_BASE}/ai-analytics/{endpoint}")
            if response.status_code == 200:
                print(f"✅ AI {endpoint.replace('-', ' ').capitalize()} passed")
            else:
                print(f"⚠️  AI {endpoint.replace('-', ' ').capitalize()} failed: {response.status_code}")
        except Exception as e:
            print(f"❌ AI {endpoint.replace('-', ' ').capitalize()} error: {e}")

def run_tests():
    """Run all tests"""
    print("🚀 Starting Imarisha Loan System Backend Tests")
    print("=" * 60)
    
    if test_login():
        test_dashboards()
        test_ai_analytics()
        test_branches()
        
        # Test other core entities
        for entity in ['members', 'loans', 'loan-products', 'users', 'groups']:
            try:
                response = session.get(f"{API_BASE}/{entity}")
                if response.status_code == 200:
                    print(f"✅ Get {entity.capitalize()} passed")
                else:
                    print(f"⚠️  Get {entity.capitalize()} failed: {response.status_code}")
            except Exception as e:
                print(f"❌ {entity.capitalize()} error: {e}")

    print("\n" + "=" * 60)
    print("🏁 Tests completed")

if __name__ == "__main__":
    run_tests()
