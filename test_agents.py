#!/usr/bin/env python3
"""
Test script to demonstrate agentic AI functionality
"""
import asyncio
import httpx
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

async def test_agent_system():
    """Test the agentic AI system"""

    print("🤖 Testing Agentic AI System")
    print("=" * 50)

    async with httpx.AsyncClient() as client:
        # Test 1: Get agent capabilities
        print("\n1. Getting Agent Capabilities")
        try:
            response = await client.get(f"{BASE_URL}/agents/capabilities")
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                capabilities = response.json()
                print("✅ Agent capabilities retrieved")
                print(f"Available agents: {len(capabilities.get('agents', []))}")
                for agent in capabilities.get('agents', []):
                    print(f"  - {agent['name']} ({agent['type']}): {len(agent['capabilities'])} capabilities")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")

        # Test 2: Get agent status
        print("\n2. Getting Agent Status")
        try:
            response = await client.get(f"{BASE_URL}/agents/status")
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                status = response.json()
                print("✅ Agent status retrieved")
                print(f"Total agents: {status['total_agents']}")
                print(f"Active agents: {status['active_agents']}")
                print(f"Total decisions: {status['total_decisions']}")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")

        # Test 3: Get context data
        print("\n3. Getting Context Data for Agents")
        try:
            response = await client.post(f"{BASE_URL}/agents/context")
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                context = response.json()
                print("✅ Context data retrieved")
                print(f"Products: {context['products_count']}")
                print(f"Sales records: {context['sales_records']}")
                print(f"Competitor data: {context['competitor_data']}")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")

        # Test 4: Run inventory optimization agent
        print("\n4. Running Inventory Optimization Agent")
        try:
            # First get context
            context_response = await client.post(f"{BASE_URL}/agents/context")
            if context_response.status_code == 200:
                context_data = context_response.json()

                # Now run the agent
                analysis_request = {
                    "context": {
                        "products": [
                            {
                                "id": 1,
                                "product_title": "Red Lipstick",
                                "stock_quantity": 15,  # Low stock
                                "reorder_point": 20,
                                "price": 15.99
                            },
                            {
                                "id": 2,
                                "product_title": "Blue Eyeshadow",
                                "stock_quantity": 50,  # Overstock
                                "reorder_point": 30,
                                "price": 12.50
                            }
                        ],
                        "sales_history": [
                            {"product_id": 1, "quantity": 8, "date": "2025-12-20"},
                            {"product_id": 1, "quantity": 5, "date": "2025-12-21"},
                            {"product_id": 2, "quantity": 12, "date": "2025-12-20"},
                            {"product_id": 2, "quantity": 10, "date": "2025-12-21"}
                        ]
                    }
                }

                response = await client.post(
                    f"{BASE_URL}/agents/analyze/inventory_optimization",
                    json=analysis_request
                )
                print(f"Status: {response.status_code}")
                if response.status_code == 200:
                    result = response.json()
                    print("✅ Inventory optimization completed")
                    print(f"Decision: {result['decision']}")
                    print(f"Confidence: {result['confidence_score']:.2f}")
                    print(f"Actions suggested: {len(result['actions'])}")
                    print(f"Reasoning: {result['reasoning'][:100]}...")

                    for i, action in enumerate(result['actions'][:2]):  # Show first 2 actions
                        print(f"  Action {i+1}: {action['description']}")
                else:
                    print(f"❌ Unexpected status code: {response.status_code}")
                    print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Request failed: {e}")

        # Test 5: Run demand forecasting agent
        print("\n5. Running Demand Forecasting Agent")
        try:
            forecast_request = {
                "context": {
                    "products": [
                        {
                            "id": 1,
                            "product_title": "Red Lipstick",
                            "stock_quantity": 25,
                            "price": 15.99
                        }
                    ],
                    "sales_history": [
                        {"product_id": 1, "quantity": 10, "date": "2025-12-15"},
                        {"product_id": 1, "quantity": 12, "date": "2025-12-16"},
                        {"product_id": 1, "quantity": 15, "date": "2025-12-17"},  # Increasing trend
                        {"product_id": 1, "quantity": 18, "date": "2025-12-18"},
                        {"product_id": 1, "quantity": 20, "date": "2025-12-19"},
                        {"product_id": 1, "quantity": 22, "date": "2025-12-20"},
                        {"product_id": 1, "quantity": 25, "date": "2025-12-21"}
                    ]
                }
            }

            response = await client.post(
                f"{BASE_URL}/agents/analyze/demand_forecasting",
                json=forecast_request
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print("✅ Demand forecasting completed")
                print(f"Decision: {result['decision']}")
                print(f"Confidence: {result['confidence_score']:.2f}")
                print(f"Actions suggested: {len(result['actions'])}")
                print(f"Reasoning: {result['reasoning'][:100]}...")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")

        # Test 6: Run all agents
        print("\n6. Running All Agents Simultaneously")
        try:
            all_agents_request = {
                "context": {
                    "products": [
                        {
                            "id": 1,
                            "product_title": "Red Lipstick",
                            "stock_quantity": 15,
                            "reorder_point": 20,
                            "price": 15.99,
                            "cost": 8.00
                        }
                    ],
                    "sales_history": [
                        {"product_id": 1, "quantity": 10, "unit_price": 15.99, "date": "2025-12-20"}
                    ],
                    "competitor_prices": {
                        1: {"average_price": 16.50}
                    }
                }
            }

            response = await client.post(
                f"{BASE_URL}/agents/analyze/all",
                json=all_agents_request
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                results = response.json()
                print("✅ All agents analysis completed")
                print(f"Agent decisions: {len(results)}")
                for result in results:
                    print(f"  - {result['agent_type']}: {len(result['actions'])} actions")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")

    print("\n" + "=" * 50)
    print("✅ Agentic AI system test completed!")
    print("\n📋 Available Agent Endpoints:")
    print("  GET  /agents/capabilities - List agent capabilities")
    print("  GET  /agents/status - Get agent status")
    print("  POST /agents/context - Get context data")
    print("  POST /agents/analyze/{agent_type} - Run specific agent")
    print("  POST /agents/analyze/all - Run all agents")
    print("  POST /agents/execute-action - Execute agent action")
    print("  GET  /agents/history - Get decision history")

if __name__ == "__main__":
    print("Note: Make sure the FastAPI server is running on http://127.0.0.1:8000")
    print("Run: uvicorn main:app --reload")
    print("Then run this test script")

    asyncio.run(test_agent_system())