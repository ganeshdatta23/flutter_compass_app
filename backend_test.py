#!/usr/bin/env python3
"""
Backend API Testing for Compass App
Tests the Supabase integration and location endpoints
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any

# Backend URL from frontend environment
BACKEND_URL = "https://swamiji-locator.preview.emergentagent.com/api"

class CompassAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response"] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def test_basic_connectivity(self):
        """Test basic API connectivity"""
        try:
            response = self.session.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Basic API Connectivity", True, f"Status: {response.status_code}, Message: {data.get('message', 'N/A')}")
                return True
            else:
                self.log_test("Basic API Connectivity", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Basic API Connectivity", False, f"Connection error: {str(e)}")
            return False

    def test_initialize_location(self):
        """Test POST /api/location/initialize endpoint"""
        try:
            response = self.session.post(f"{self.base_url}/location/initialize", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Verify response structure
                if "message" in data and "location" in data:
                    location = data["location"]
                    expected_fields = ["id", "latitude", "longitude", "address", "updated_at"]
                    missing_fields = [field for field in expected_fields if field not in location]
                    
                    if not missing_fields:
                        # Verify default coordinates
                        if (location["latitude"] == 12.308367 and 
                            location["longitude"] == 76.645467 and
                            location["address"] == "Avadhoota Datta Peetham"):
                            self.log_test("Initialize Default Location", True, 
                                        f"Default location set correctly: {location['address']} at ({location['latitude']}, {location['longitude']})")
                            return True
                        else:
                            self.log_test("Initialize Default Location", False, 
                                        f"Incorrect default coordinates or address", data)
                            return False
                    else:
                        self.log_test("Initialize Default Location", False, 
                                    f"Missing fields in response: {missing_fields}", data)
                        return False
                else:
                    self.log_test("Initialize Default Location", False, 
                                "Invalid response structure - missing 'message' or 'location'", data)
                    return False
            else:
                self.log_test("Initialize Default Location", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Initialize Default Location", False, f"Request error: {str(e)}")
            return False

    def test_get_swamiji_location(self):
        """Test GET /api/location/swamiji endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/location/swamiji", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Verify response structure matches LocationData model
                required_fields = ["id", "latitude", "longitude", "updated_at"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    # Verify data types and values
                    if (isinstance(data["latitude"], (int, float)) and 
                        isinstance(data["longitude"], (int, float)) and
                        data["id"] == "swamiji_location"):
                        self.log_test("Get Swamiji Location", True, 
                                    f"Location retrieved: {data.get('address', 'No address')} at ({data['latitude']}, {data['longitude']})")
                        return data
                    else:
                        self.log_test("Get Swamiji Location", False, 
                                    "Invalid data types or incorrect ID", data)
                        return None
                else:
                    self.log_test("Get Swamiji Location", False, 
                                f"Missing required fields: {missing_fields}", data)
                    return None
            else:
                self.log_test("Get Swamiji Location", False, 
                            f"HTTP {response.status_code}", response.text)
                return None
                
        except Exception as e:
            self.log_test("Get Swamiji Location", False, f"Request error: {str(e)}")
            return None

    def test_update_swamiji_location(self):
        """Test POST /api/location/swamiji endpoint"""
        # Test data - different coordinates to verify update works
        test_location = {
            "latitude": 13.0827,  # Bangalore coordinates for testing
            "longitude": 77.5877,
            "address": "Test Location - Bangalore"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/location/swamiji", 
                json=test_location,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                # Verify response structure and updated values
                if (data.get("latitude") == test_location["latitude"] and 
                    data.get("longitude") == test_location["longitude"] and
                    data.get("address") == test_location["address"]):
                    self.log_test("Update Swamiji Location", True, 
                                f"Location updated successfully to: {data['address']} at ({data['latitude']}, {data['longitude']})")
                    return True
                else:
                    self.log_test("Update Swamiji Location", False, 
                                "Location not updated correctly", data)
                    return False
            else:
                self.log_test("Update Swamiji Location", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Update Swamiji Location", False, f"Request error: {str(e)}")
            return False

    def test_update_validation(self):
        """Test update endpoint with invalid data"""
        invalid_data = {
            "latitude": "invalid",  # Should be float
            "longitude": 77.5877
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/location/swamiji", 
                json=invalid_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            # Should return 422 for validation error
            if response.status_code == 422:
                self.log_test("Update Validation Error Handling", True, 
                            "Correctly rejected invalid latitude data")
                return True
            else:
                self.log_test("Update Validation Error Handling", False, 
                            f"Expected 422, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Update Validation Error Handling", False, f"Request error: {str(e)}")
            return False

    def test_restore_default_location(self):
        """Restore default location after testing"""
        default_location = {
            "latitude": 12.308367,
            "longitude": 76.645467,
            "address": "Avadhoota Datta Peetham"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/location/swamiji", 
                json=default_location,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                self.log_test("Restore Default Location", True, 
                            "Default location restored successfully")
                return True
            else:
                self.log_test("Restore Default Location", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Restore Default Location", False, f"Request error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🧭 Starting Compass App Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests_passed = 0
        total_tests = 0
        
        # 1. Basic connectivity
        total_tests += 1
        if self.test_basic_connectivity():
            tests_passed += 1
        
        # 2. Initialize default location
        total_tests += 1
        if self.test_initialize_location():
            tests_passed += 1
        
        # 3. Get location
        total_tests += 1
        if self.test_get_swamiji_location():
            tests_passed += 1
        
        # 4. Update location
        total_tests += 1
        if self.test_update_swamiji_location():
            tests_passed += 1
        
        # 5. Test validation
        total_tests += 1
        if self.test_update_validation():
            tests_passed += 1
        
        # 6. Restore default
        total_tests += 1
        if self.test_restore_default_location():
            tests_passed += 1
        
        # Summary
        print("=" * 60)
        print(f"🧭 Backend API Test Results: {tests_passed}/{total_tests} tests passed")
        
        if tests_passed == total_tests:
            print("✅ All backend API endpoints are working correctly!")
            print("✅ Supabase integration is functional")
            print("✅ Location data persistence is working")
            return True
        else:
            print(f"❌ {total_tests - tests_passed} tests failed")
            print("❌ Backend API has issues that need to be addressed")
            return False

def main():
    """Main test execution"""
    tester = CompassAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()