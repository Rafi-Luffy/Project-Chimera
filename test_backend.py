#!/usr/bin/env python3
"""
Test script to verify Project Chimera backend API
"""
import requests
import json

API_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing /health endpoint...")
    response = requests.get(f"{API_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}\n")

def test_query():
    """Test query endpoint"""
    print("🔍 Testing /query endpoint...")
    query_data = {
        "question": "What are the effects of microgravity on plant growth?",
        "persona": "Research Scientist"
    }
    
    response = requests.post(
        f"{API_URL}/query",
        json=query_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   Success: {data.get('success')}")
        print(f"   Consensus (first 200 chars): {data.get('brief', {}).get('consensus', 'N/A')[:200]}...")
        print(f"   Evidence count: {len(data.get('evidence', []))}")
        print(f"   Confidence: {data.get('brief', {}).get('confidence', 'N/A')}")
    else:
        print(f"   Error: {response.text}")
    print()

def test_categories():
    """Test categories endpoint"""
    print("🔍 Testing /api/categories endpoint...")
    response = requests.get(f"{API_URL}/api/categories")
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   Categories count: {len(data.get('categories', []))}")
        if data.get('categories'):
            print(f"   First category: {data['categories'][0]}")
    print()

if __name__ == "__main__":
    print("=" * 60)
    print("PROJECT CHIMERA - Backend API Test")
    print("=" * 60)
    print()
    
    try:
        test_health()
        test_categories()
        test_query()
        
        print("=" * 60)
        print("✅ All tests completed!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to backend at", API_URL)
        print("   Make sure the backend is running on port 8000")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
