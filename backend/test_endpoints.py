#!/usr/bin/env python3
"""Test script to check available endpoints"""

import requests
import sys

def test_endpoints():
    base_url = "http://localhost:8000"
    
    endpoints_to_test = [
        "/",
        "/api/v1/auth/login",
        "/api/v1/auth/token", 
        "/api/users/auth/login",
        "/api/users/auth/token",
        "/api/v1/users/auth/login",
        "/api/v1/users/auth/token",
        "/api/v1/projects",
        "/api/v1/tasks"
    ]
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=2)
            print(f"{endpoint}: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"{endpoint}: Error - {e}")

if __name__ == "__main__":
    test_endpoints()
