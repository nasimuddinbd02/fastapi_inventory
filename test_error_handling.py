#!/usr/bin/env python3
"""
Test script to verify centralized error handling
"""
import asyncio
import httpx
import json

BASE_URL = "http://127.0.0.1:8000"

async def test_error_handling():
    """Test various error scenarios"""

    print("🧪 Testing Centralized Error Handling")
    print("=" * 50)

    async with httpx.AsyncClient() as client:
        # Test 1: Not Found Error
        print("\n1. Testing Not Found Error (Inventory ID 999)")
        try:
            response = await client.get(f"{BASE_URL}/inventory/999")
            print(f"Status: {response.status_code}")
            if response.status_code == 404:
                error_data = response.json()
                print("✅ Error response format correct")
                print(f"Error Code: {error_data['error']['code']}")
                print(f"Message: {error_data['error']['message']}")
                print(f"Request ID: {error_data.get('request_id', 'N/A')}")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")

        # Test 2: Validation Error (try to create inventory with negative quantity)
        print("\n2. Testing Validation Error (Negative stock quantity)")
        try:
            payload = {
                "product_id": 1,
                "stock_quantity": -5,
                "location": "Test Location"
            }
            response = await client.post(f"{BASE_URL}/inventory/", json=payload)
            print(f"Status: {response.status_code}")
            if response.status_code == 400:
                error_data = response.json()
                print("✅ Error response format correct")
                print(f"Error Code: {error_data['error']['code']}")
                print(f"Message: {error_data['error']['message']}")
                print(f"Field: {error_data['error']['details'].get('field', 'N/A')}")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")

        # Test 3: Authentication Error (try to access protected endpoint without token)
        print("\n3. Testing Authentication Error (Protected endpoint without token)")
        try:
            response = await client.get(f"{BASE_URL}/users/me")
            print(f"Status: {response.status_code}")
            if response.status_code == 401:
                error_data = response.json()
                print("✅ Error response format correct")
                print(f"Error Code: {error_data['error']['code']}")
                print(f"Message: {error_data['error']['message']}")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")

        # Test 4: Test v1 endpoint error handling
        print("\n4. Testing V1 Endpoint Error Handling")
        try:
            response = await client.get(f"{BASE_URL}/v1/inventory/999")
            print(f"Status: {response.status_code}")
            if response.status_code == 404:
                error_data = response.json()
                print("✅ V1 Error response format correct")
                print(f"Error Code: {error_data['error']['code']}")
                print(f"Path: {error_data.get('path', 'N/A')}")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")

    print("\n" + "=" * 50)
    print("✅ Error handling tests completed!")

if __name__ == "__main__":
    # Note: This test assumes the server is running
    # In a real scenario, you'd start the server first
    print("Note: Make sure the FastAPI server is running on http://127.0.0.1:8000")
    print("Run: uvicorn main:app --reload")
    print("Then run this test script")

    asyncio.run(test_error_handling())