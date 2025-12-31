#!/usr/bin/env python3
"""
Comprehensive Agentic AI Demo - Starts server and runs tests
"""
import asyncio
import threading
import httpx
import uvicorn

def start_server():
    """Start the FastAPI server in a separate thread"""
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="warning"  # Reduce log noise
    )

async def run_demo():
    """Run the agent demonstration"""
    print("🤖 Agentic AI System Comprehensive Demo")
    print("=" * 60)
    print("🚀 Starting server...")

    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Wait for server to start
    print("⏳ Waiting for server to start...")
    await asyncio.sleep(3)

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Test 1: API Root
            print("\n1. Testing API Root Endpoint")
            response = await client.get("http://127.0.0.1:8000/")
            print(f"✅ Status: {response.status_code}")
            print(f"   Message: {response.json()['message']}")

            # Test 2: Agent Capabilities
            print("\n2. Getting Agent Capabilities")
            response = await client.get("http://127.0.0.1:8000/agents/capabilities")
            if response.status_code == 200:
                caps = response.json()
                print(f"✅ Found {len(caps['agents'])} agent types:")
                for agent in caps['agents']:
                    print(f"   • {agent['name']}")
                    print(f"     Type: {agent['agent_type']}")
                    print(f"     Capabilities: {', '.join(agent['capabilities'])}")
            else:
                print(f"❌ Failed: {response.status_code}")

            # Test 3: Agent Status
            print("\n3. Checking Agent System Status")
            response = await client.get("http://127.0.0.1:8000/agents/status")
            if response.status_code == 200:
                status = response.json()
                print("✅ Agent Status Retrieved:")
                print(f"   Total Agents: {status['total_agents']}")
                print(f"   Active Agents: {status['active_agents']}")
                print(f"   Total Decisions: {status['total_decisions']}")
            else:
                print(f"❌ Failed: {response.status_code}")

            # Test 4: Get Context Data
            print("\n4. Gathering Context Data for Agents")
            response = await client.post("http://127.0.0.1:8000/agents/context")
            if response.status_code == 200:
                context = response.json()
                print("✅ Context Data Retrieved:")
                print(f"   Products: {context['products_count']}")
                print(f"   Sales Records: {context['sales_records']}")
                print(f"   Competitor Data: {context['competitor_data']}")
            else:
                print(f"❌ Failed: {response.status_code}")

            # Test 5: Run Inventory Optimization Agent
            print("\n5. Running Inventory Optimization Agent")
            analysis_request = {
                "context": {
                    "products": [
                        {
                            "id": 1,
                            "product_title": "Red Lipstick",
                            "stock_quantity": 15,
                            "reorder_point": 20,
                            "price": 15.99
                        },
                        {
                            "id": 2,
                            "product_title": "Blue Eyeshadow",
                            "stock_quantity": 50,
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
                "http://127.0.0.1:8000/agents/analyze/inventory_optimization",
                json=analysis_request
            )
            if response.status_code == 200:
                result = response.json()
                print("✅ Inventory Optimization Completed:")
                print(f"   Decision: {result['decision']}")
                print(f"   Confidence: {result['confidence_score']:.2f}")
                print(f"   Actions: {len(result['actions'])}")
                print(f"   Reasoning: {result['reasoning'][:100]}...")
            else:
                print(f"❌ Failed: {response.status_code}")

            # Test 6: Run Demand Forecasting Agent
            print("\n6. Running Demand Forecasting Agent")
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
                        {"product_id": 1, "quantity": 15, "date": "2025-12-17"},
                        {"product_id": 1, "quantity": 18, "date": "2025-12-18"},
                        {"product_id": 1, "quantity": 20, "date": "2025-12-19"},
                        {"product_id": 1, "quantity": 22, "date": "2025-12-20"},
                        {"product_id": 1, "quantity": 25, "date": "2025-12-21"}
                    ]
                }
            }

            response = await client.post(
                "http://127.0.0.1:8000/agents/analyze/demand_forecasting",
                json=forecast_request
            )
            if response.status_code == 200:
                result = response.json()
                print("✅ Demand Forecasting Completed:")
                print(f"   Decision: {result['decision']}")
                print(f"   Confidence: {result['confidence_score']:.2f}")
                print(f"   Actions: {len(result['actions'])}")
            else:
                print(f"❌ Failed: {response.status_code}")

            print("\n" + "=" * 60)
            print("🎉 Agentic AI Demo Completed Successfully!")
            print("\n📋 Available Endpoints:")
            print("   GET  / - API root")
            print("   GET  /docs - API documentation")
            print("   GET  /agents/capabilities - Agent capabilities")
            print("   GET  /agents/status - System status")
            print("   POST /agents/context - Context data")
            print("   POST /agents/analyze/{agent_type} - Run specific agent")
            print("   POST /agents/analyze/all - Run all agents")
            print("   GET  /agents/history - Decision history")

        except Exception as e:
            print(f"❌ Demo failed: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    # Change to the project directory
    import os
    os.chdir("d:\\Projects\\fastapi_inventory")

    asyncio.run(run_demo())