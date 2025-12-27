#!/usr/bin/env python3
"""
Simple demonstration of agentic AI endpoints
"""
import httpx
import asyncio

BASE_URL = "http://127.0.0.1:8000"

async def demo_agents():
    """Demonstrate agent endpoints"""

    print("🤖 Agentic AI System Demo")
    print("=" * 50)

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Test root endpoint
            print("\n1. Testing API Root")
            response = await client.get(f"{BASE_URL}/")
            print(f"✅ API Status: {response.status_code}")
            print(f"   Message: {response.json()['message']}")

            # Test agent capabilities
            print("\n2. Agent Capabilities")
            response = await client.get(f"{BASE_URL}/agents/capabilities")
            if response.status_code == 200:
                caps = response.json()
                print(f"✅ Found {len(caps['agents'])} agent types:")
                for agent in caps['agents']:
                    print(f"   • {agent['name']} ({agent['type']})")
                    print(f"     Capabilities: {len(agent['capabilities'])}")
            else:
                print(f"❌ Failed to get capabilities: {response.status_code}")

            # Test agent status
            print("\n3. Agent System Status")
            response = await client.get(f"{BASE_URL}/agents/status")
            if response.status_code == 200:
                status = response.json()
                print(f"✅ Agent Status:")
                print(f"   Total Agents: {status['total_agents']}")
                print(f"   Active Agents: {status['active_agents']}")
                print(f"   Total Decisions: {status['total_decisions']}")
            else:
                print(f"❌ Failed to get status: {response.status_code}")

            print("\n" + "=" * 50)
            print("🎯 Available Agent Endpoints:")
            print("   GET  /agents/capabilities - List agent capabilities")
            print("   GET  /agents/status - Get system status")
            print("   POST /agents/context - Get context data")
            print("   POST /agents/analyze/inventory_optimization - Run inventory agent")
            print("   POST /agents/analyze/demand_forecasting - Run forecasting agent")
            print("   POST /agents/analyze/pricing_optimization - Run pricing agent")
            print("   POST /agents/analyze/all - Run all agents")
            print("   GET  /agents/history - Get decision history")
            print("\n📖 API Documentation: http://127.0.0.1:8000/docs")

        except Exception as e:
            print(f"❌ Connection failed: {e}")
            print("💡 Make sure the server is running with: python start_server.py")

if __name__ == "__main__":
    asyncio.run(demo_agents())