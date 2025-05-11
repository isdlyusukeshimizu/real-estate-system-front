"""
Test script for API endpoints.
This script tests the API endpoints without starting the server.
"""
import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.db.init_db import init_db, init_sample_data
from app.db.session import SessionLocal

client = TestClient(app)

class TestAPIEndpoints(unittest.TestCase):
    """Test API endpoints."""
    
    @classmethod
    def setUpClass(cls):
        """Set up test database."""
        init_db()
        db = SessionLocal()
        try:
            from app.models.user import User
            admin = db.query(User).filter(User.email == "admin@example.com").first()
            if not admin:
                init_sample_data(db)
            else:
                print("Using existing sample data for tests")
        finally:
            db.close()
    
    def test_healthz(self):
        """Test health check endpoint."""
        response = client.get("/healthz")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
    
    def test_auth_register(self):
        """Test user registration endpoint."""
        import time
        timestamp = int(time.time())
        username = f"testuser{timestamp}"
        email = f"testuser{timestamp}@example.com"
        
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": username,
                "email": email,
                "password": "testpassword",
                "role": "member",
                "company": "Test Company"
            }
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.json())
        self.assertEqual(response.json()["username"], username)
        self.assertEqual(response.json()["email"], email)
        self.assertEqual(response.json()["role"], "member")
    
    def test_auth_login(self):
        """Test login endpoint."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "loginuser",
                "email": "loginuser@example.com",
                "password": "loginpassword",
                "role": "member",
                "company": "Login Company"
            }
        )
        
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "loginuser@example.com",
                "password": "loginpassword"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", response.json())
        self.assertEqual(response.json()["token_type"], "bearer")
    
    def test_users_list(self):
        """Test users list endpoint."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testowner",
                "email": "testowner@example.com",
                "password": "testpassword",
                "role": "owner",
                "company": "Test Company"
            }
        )
        
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testowner@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        response = client.get(
            "/api/v1/users/",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
    
    def test_customers_list(self):
        """Test customers list endpoint."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testowner2",
                "email": "testowner2@example.com",
                "password": "testpassword",
                "role": "owner",
                "company": "Test Company"
            }
        )
        
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testowner2@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        response = client.get(
            "/api/v1/customers/",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
    
    def test_create_customer(self):
        """Test create customer endpoint."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testowner3",
                "email": "testowner3@example.com",
                "password": "testpassword",
                "role": "owner",
                "company": "Test Company"
            }
        )
        
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testowner3@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        response = client.post(
            "/api/v1/customers/",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Test Customer",
                "phone_number": "123-456-7890",
                "email": "customer@example.com",
                "current_address": "123 Test St",
                "postal_code": "123-4567",
                "property_type": "Residential",
                "status": "new"
            }
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.json())
        self.assertEqual(response.json()["name"], "Test Customer")
    
    def test_external_postal_code(self):
        """Test postal code lookup endpoint."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testowner4",
                "email": "testowner4@example.com",
                "password": "testpassword",
                "role": "owner",
                "company": "Test Company"
            }
        )
        
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testowner4@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        response = client.get(
            "/api/v1/external/postal-code/123-4567",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("postal_code", response.json())
        self.assertIn("prefecture", response.json())
    
    def test_external_phone_number(self):
        """Test phone number lookup endpoint."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testowner5",
                "email": "testowner5@example.com",
                "password": "testpassword",
                "role": "owner",
                "company": "Test Company"
            }
        )
        
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testowner5@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        response = client.get(
            "/api/v1/external/phone-number/123-456-7890",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("phone_number", response.json())
        self.assertIn("type", response.json())
    
    def test_analytics_dashboard(self):
        """Test analytics dashboard endpoint."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testowner6",
                "email": "testowner6@example.com",
                "password": "testpassword",
                "role": "owner",
                "company": "Test Company"
            }
        )
        
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testowner6@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        response = client.get(
            "/api/v1/analytics/dashboard",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("total_customers", response.json())
        self.assertIn("status_distribution", response.json())
    
    def test_analytics_status(self):
        """Test analytics status endpoint."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testowner7",
                "email": "testowner7@example.com",
                "password": "testpassword",
                "role": "owner",
                "company": "Test Company"
            }
        )
        
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testowner7@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        response = client.get(
            "/api/v1/analytics/status",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("status_counts", response.json())
        self.assertIn("conversion_rates", response.json())
    
    def test_analytics_sales(self):
        """Test analytics sales endpoint."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testowner8",
                "email": "testowner8@example.com",
                "password": "testpassword",
                "role": "owner",
                "company": "Test Company"
            }
        )
        
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testowner8@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        response = client.get(
            "/api/v1/analytics/sales",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("total_customers", response.json())
        self.assertIn("sales_reps", response.json())

if __name__ == "__main__":
    unittest.main()
