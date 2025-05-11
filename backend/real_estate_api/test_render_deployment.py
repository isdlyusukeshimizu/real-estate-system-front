"""
Test script for verifying the Render deployment of the backend API.
Run this script after the backend is deployed to Render.

Usage:
    python test_render_deployment.py https://your-backend-url.render.com
"""

import sys
import requests
import json
import time

def test_health_check(base_url):
    """Test the health check endpoint"""
    print("\n=== Testing Health Check Endpoint ===")
    try:
        response = requests.get(f"{base_url}/healthz")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_auth_endpoints(base_url):
    """Test authentication endpoints"""
    print("\n=== Testing Authentication Endpoints ===")
    api_url = f"{base_url}/api/v1"
    
    print("\nTesting Registration:")
    register_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword",
        "role": "member",
        "company": "Test Company"
    }
    
    try:
        response = requests.post(f"{api_url}/auth/register", json=register_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        registration_success = response.status_code in [200, 201]
    except Exception as e:
        print(f"Error: {e}")
        registration_success = False
    
    print("\nTesting Login:")
    login_data = {
        "email": "testuser@example.com",
        "password": "testpassword"
    }
    
    try:
        response = requests.post(f"{api_url}/auth/login/json", json=login_data)
        print(f"Status Code: {response.status_code}")
        response_data = response.json()
        print(f"Response: {response_data}")
        
        if response.status_code == 200 and "access_token" in response_data:
            token = response_data["access_token"]
            print("Login successful, token received")
            return token, True
        else:
            print("Login failed or token not received")
            
            print("\nTrying with admin credentials:")
            admin_login = {
                "email": "admin@example.com",
                "password": "password"
            }
            response = requests.post(f"{api_url}/auth/login/json", json=admin_login)
            print(f"Status Code: {response.status_code}")
            response_data = response.json()
            
            if response.status_code == 200 and "access_token" in response_data:
                token = response_data["access_token"]
                print("Admin login successful, token received")
                return token, True
            else:
                print("All login attempts failed")
                return None, False
    except Exception as e:
        print(f"Error: {e}")
        return None, False

def test_customer_endpoints(base_url, token):
    """Test customer management endpoints"""
    print("\n=== Testing Customer Management Endpoints ===")
    api_url = f"{base_url}/api/v1"
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\nTesting Get Customers:")
    try:
        response = requests.get(f"{api_url}/customers", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        customers_success = response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        customers_success = False
    
    print("\nTesting Create Customer:")
    customer_data = {
        "name": "Test Customer",
        "phone_number": "090-1111-2222",
        "email": "testcustomer@example.com",
        "current_address": "Tokyo, Test-ku, 1-1-1",
        "postal_code": "100-0001",
        "inheritance_address": "Osaka, Test-ku, 2-2-2",
        "property_type": "Apartment",
        "status": "new",
        "source": "Test"
    }
    
    try:
        response = requests.post(f"{api_url}/customers", json=customer_data, headers=headers)
        print(f"Status Code: {response.status_code}")
        response_data = response.json()
        print(f"Response: {response_data}")
        
        if response.status_code in [200, 201] and "id" in response_data:
            customer_id = response_data["id"]
            print(f"Customer created with ID: {customer_id}")
            
            print(f"\nTesting Get Customer by ID ({customer_id}):")
            response = requests.get(f"{api_url}/customers/{customer_id}", headers=headers)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            return True
        else:
            print("Failed to create customer")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_analytics_endpoints(base_url, token):
    """Test analytics endpoints"""
    print("\n=== Testing Analytics Endpoints ===")
    api_url = f"{base_url}/api/v1"
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\nTesting Dashboard Analytics:")
    try:
        response = requests.get(f"{api_url}/analytics/dashboard", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        dashboard_success = response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        dashboard_success = False
    
    print("\nTesting Status Analytics:")
    try:
        response = requests.get(f"{api_url}/analytics/status", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        status_success = response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        status_success = False
    
    print("\nTesting Sales Analytics:")
    try:
        response = requests.get(f"{api_url}/analytics/sales", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        sales_success = response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        sales_success = False
    
    return dashboard_success and status_success and sales_success

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_render_deployment.py https://your-backend-url.render.com")
        sys.exit(1)
    
    base_url = sys.argv[1].rstrip('/')
    print(f"Testing backend deployment at: {base_url}")
    
    health_check_success = test_health_check(base_url)
    if not health_check_success:
        print("\n❌ Health check failed. Backend may not be deployed correctly.")
        sys.exit(1)
    
    token, auth_success = test_auth_endpoints(base_url)
    if not auth_success:
        print("\n❌ Authentication tests failed.")
        sys.exit(1)
    
    customer_success = test_customer_endpoints(base_url, token)
    if not customer_success:
        print("\n❌ Customer endpoint tests failed.")
    
    analytics_success = test_analytics_endpoints(base_url, token)
    if not analytics_success:
        print("\n❌ Analytics endpoint tests failed.")
    
    if health_check_success and auth_success and customer_success and analytics_success:
        print("\n✅ All tests passed! Backend deployment is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the logs above for details.")

if __name__ == "__main__":
    main()
