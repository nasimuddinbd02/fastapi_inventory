# Cosmetics Inventory API with Agentic AI

A modern, asynchronous FastAPI application for managing cosmetics inventory with clean n-tier architecture, ViewModel pattern, API versioning, and **intelligent agentic AI capabilities** for autonomous inventory management.

## 🚀 Features

- **Asynchronous API**: Built with FastAPI for high-performance async operations
- **Clean Architecture**: N-tier design with separation of concerns
- **ViewModel Pattern**: Business validation and user input/output separation
- **Dependency Injection**: Clean service layer with injectable dependencies
- **Database**: SQLite with SQLAlchemy async ORM and aiosqlite
- **Authentication**: Password hashing with bcrypt and JWT authentication
- **API Versioning**: Support for both unversioned and v1 endpoints for backward compatibility
- **Interactive Documentation**: Auto-generated Swagger UI at `/docs`
- **Logging**: Comprehensive logging configuration
- **Auto-migration**: Database tables created automatically on startup
- **🤖 Agentic AI**: Intelligent agents powered by LangGraph and OpenAI GPT for inventory optimization, demand forecasting, and pricing optimization
- **Centralized Error Handling**: Custom exceptions with standardized error responses
- **Decision History**: Track and audit AI agent decisions and actions

## 🛠️ Technologies Used

- **Framework**: FastAPI (async web framework)
- **ORM**: SQLAlchemy 2.0+ with async support
- **Database**: SQLite with aiosqlite driver
- **Validation**: Pydantic for data models and validation
- **Authentication**: Passlib with bcrypt for password hashing
- **JWT**: PyJWT for JSON Web Tokens
- **Server**: Uvicorn ASGI server
- **HTTP Client**: HTTPX for async HTTP requests
- **Migration**: Alembic for database migrations
- **AI Agents**: LangGraph framework with OpenAI GPT models for advanced agentic AI

## 📁 Project Structure

```
fastapi_inventory/
├── 📄 main.py                          # Application entry point
├── 📄 start_server.py                  # Server startup script
├── 📄 requirements.txt                  # Python dependencies
├── 📄 pyproject.toml                    # Python project configuration
├── 📄 pytest.ini                        # Pytest configuration
├── 📄 README.md                         # Backend documentation
├── 📄 VERIFICATION_CHECKLIST.md         # Verification checklist
├── 📄 postman_scripts.json              # Postman API collection
├── 📄 demo_agents.py                    # AI agents demo script
├── 📄 full_demo.py                      # Full system demo
├── 📄 test_error_handling.py            # Error handling tests
├── 📄 package.json                      # Node.js scripts configuration
├── 🗄️ inventory.db                     # SQLite database (auto-generated)
├── 📁 .venv/                           # Virtual environment (not in repo)
│
├── 📁 app/                             # Main application package
│   ├── 📄 __init__.py                  # Package initializer
│   ├── 📄 main.py                      # FastAPI app instance and routes
│   ├── 📄 database.py                  # Database configuration and engine
│   ├── 📄 dependencies.py              # Dependency injection setup
│   ├── 📄 logging_config.py            # Logging configuration
│   ├── 📄 auth.py                      # JWT authentication utilities
│   ├── 📄 agents.py                    # AI agent system (LangGraph)
│   ├── 📄 exceptions.py                # Custom exception definitions
│   ├── 📄 error_responses.py           # Error response formatting
│   │
│   ├── 📁 models/                      # SQLAlchemy ORM models
│   │   ├── 📄 __init__.py
│   │   ├── 📄 category.py              # Category database model
│   │   ├── 📄 supplier.py              # Supplier database model
│   │   ├── 📄 product.py               # Product database model
│   │   ├── 📄 inventory.py             # Inventory database model
│   │   ├── 📄 user.py                  # User database model
│   │   ├── 📄 intake.py                # Intake database model
│   │   └── 📄 dispatch.py              # Dispatch database model
│   │
│   ├── 📁 schemas/                     # Pydantic DTOs (for data operations)
│   │   ├── 📄 __init__.py
│   │   ├── 📄 category.py              # Category DTOs
│   │   ├── 📄 supplier.py              # Supplier DTOs
│   │   ├── 📄 product.py               # Product DTOs
│   │   ├── 📄 inventory.py             # Inventory DTOs
│   │   └── 📄 user.py                  # User DTOs
│   │
│   ├── 📁 viewmodels/                  # Pydantic ViewModels (API I/O)
│   │   ├── 📄 __init__.py
│   │   ├── 📄 category.py              # Category API models
│   │   ├── 📄 supplier.py              # Supplier API models
│   │   ├── 📄 product.py               # Product API models
│   │   ├── 📄 inventory.py             # Inventory API models
│   │   ├── 📄 user.py                  # User API models
│   │   ├── 📄 agent.py                 # AI agent API models
│   │   ├── 📄 intake.py                # Intake API models
│   │   ├── 📄 dispatch.py              # Dispatch API models
│   │   └── 📄 pagination.py            # Pagination models
│   │
│   ├── 📁 mappers/                     # ViewModel to DTO mappers
│   │   ├── 📄 __init__.py
│   │   ├── 📄 category_mapper.py       # Category mapping logic
│   │   ├── 📄 supplier_mapper.py       # Supplier mapping logic
│   │   ├── 📄 product_mapper.py        # Product mapping logic
│   │   ├── 📄 inventory_mapper.py      # Inventory mapping logic
│   │   ├── 📄 user_mapper.py           # User mapping logic
│   │   ├── 📄 intake_mapper.py         # Intake mapping logic
│   │   └── 📄 dispatch_mapper.py       # Dispatch mapping logic
│   │
│   ├── 📁 dbAccess/                    # Data Access Layer
│   │   ├── 📄 __init__.py
│   │   ├── 📄 category.py              # Category data access
│   │   ├── 📄 supplier.py              # Supplier data access
│   │   ├── 📄 product.py               # Product data access
│   │   ├── 📄 inventory.py             # Inventory data access
│   │   ├── 📄 user.py                  # User data access
│   │   ├── 📄 intake.py                # Intake data access
│   │   └── 📄 dispatch.py              # Dispatch data access
│   │
│   ├── 📁 services/                    # Business logic layer
│   │   ├── 📄 __init__.py
│   │   ├── 📄 category_service.py      # Category business logic
│   │   ├── 📄 supplier_service.py      # Supplier business logic
│   │   ├── 📄 product_service.py       # Product business logic
│   │   ├── 📄 inventory_service.py     # Inventory business logic
│   │   ├── 📄 user_service.py          # User business logic
│   │   ├── 📄 agent_service.py         # AI agent business logic
│   │   ├── 📄 intake_service.py        # Intake business logic
│   │   └── 📄 dispatch_service.py      # Dispatch business logic
│   │
│   ├── 📁 routers/                     # API route handlers
│   │   ├── 📄 __init__.py
│   │   ├── 📄 categories.py            # Category endpoints
│   │   ├── 📄 suppliers.py             # Supplier endpoints
│   │   ├── 📄 products.py              # Product endpoints
│   │   ├── 📄 inventory.py             # Inventory endpoints
│   │   ├── 📄 users.py                 # User & auth endpoints
│   │   ├── 📄 agents.py                # AI agent endpoints
│   │   ├── 📄 intake.py                # Intake endpoints
│   │   └── 📄 dispatch.py              # Dispatch endpoints
│   │
│   └── 📁 tests/                       # Test suite
│       ├── 📄 __init__.py
│       ├── 📄 conftest.py              # Pytest fixtures & configuration
│       ├── 📁 core/                    # Core functionality tests
│       │   ├── 📄 test_agents.py       # AI agent tests
│       │   ├── 📄 test_auth_database.py # Auth & DB tests
│       │   └── 📄 test_misc.py         # Miscellaneous tests
│       ├── 📁 dbAccess/                # Data access layer tests
│       ├── 📁 mappers/                 # Mapper tests
│       ├── 📁 models/                  # Model tests
│       ├── 📁 routers/                 # Router/endpoint tests
│       ├── 📁 schemas/                 # Schema tests
│       ├── 📁 services/                # Service layer tests
│       └── 📁 viewmodels/              # ViewModel tests
│
├── 📁 frontend/                        # Next.js frontend application
│   ├── 📄 package.json                 # Frontend dependencies
│   ├── 📄 next.config.js               # Next.js configuration
│   ├── 📄 tsconfig.json                # TypeScript configuration
│   ├── 📄 tailwind.config.cjs          # Tailwind CSS configuration
│   ├── 📄 postcss.config.cjs           # PostCSS configuration
│   ├── 📄 components.json              # shadcn/ui configuration
│   ├── 📄 README.md                    # Frontend documentation
│   ├── 📄 ENVIRONMENT_SETUP.md         # Environment setup guide
│   └── 📁 src/                         # Frontend source code
│       ├── 📁 app/                     # Next.js app directory
│       ├── 📁 components/              # React components
│       ├── 📁 config/                  # Configuration files
│       ├── 📁 hooks/                   # Custom React hooks
│       ├── 📁 lib/                     # Utility functions
│       ├── 📁 providers/               # React context providers
│       └── 📁 store/                   # State management (Redux)
│
└── 📁 tools/                           # Development tools
    ├── 📄 cleanup_unused_imports.py    # Clean up unused imports
    └── 📄 run_tests.ps1                # PowerShell test runner
```

### Architecture Layers

The backend follows a clean **N-tier architecture** with clear separation of concerns:

1. **API Layer** (`routers/`): HTTP endpoint handlers, request/response handling
2. **Service Layer** (`services/`): Business logic and orchestration
3. **Mapper Layer** (`mappers/`): Transform ViewModels ↔ DTOs
4. **Data Access Layer** (`dbAccess/`): Database operations and queries
5. **Model Layer** (`models/`): SQLAlchemy ORM entities
6. **Schema Layer** (`schemas/`): Internal DTOs for database operations
7. **ViewModel Layer** (`viewmodels/`): External API contracts with validation

### Frontend Structure

The frontend is built with **Next.js 14** and follows modern React patterns:

- **App Directory**: Next.js 14 app router for routing
- **Components**: Reusable UI components (shadcn/ui)
- **State Management**: Redux Toolkit for global state
- **Styling**: Tailwind CSS for utility-first styling
- **Type Safety**: TypeScript for type checking
- **dbAccess**: Data access layer with async database operations
- **Models**: SQLAlchemy ORM entities
- **Schemas**: Internal DTOs for database operations

## 🤖 Agentic AI System with LangGraph

The application includes an intelligent agentic AI system built with **LangGraph** and **OpenAI GPT models** for autonomous inventory management. The system uses advanced AI workflows to analyze data, make decisions, and generate actionable recommendations.

### AI Framework

- **LangGraph**: Advanced graph-based workflow orchestration for complex AI decision-making
- **OpenAI GPT**: Latest GPT models for intelligent analysis and reasoning
- **Structured Outputs**: JSON-based responses for consistent, parseable results
- **Multi-step Reasoning**: Sophisticated analysis workflows with context awareness

### AI Agents Available

- **Inventory Optimization Agent**: Uses AI to monitor stock levels, predict stockouts, calculate optimal reorder points, and suggest inventory adjustments
- **Demand Forecasting Agent**: Leverages AI to analyze sales patterns, forecast future demand, identify seasonal trends, and detect demand anomalies
- **Pricing Optimization Agent**: Applies AI to analyze pricing strategies, monitor competitors, optimize profit margins, and implement dynamic pricing

### Agent Features

- **Advanced AI Analysis**: GPT-powered context analysis and pattern recognition
- **Intelligent Decision Making**: Multi-step reasoning workflows for complex decisions
- **Actionable Recommendations**: AI-generated specific actions with parameters and priorities
- **Confidence Scoring**: AI-assessed reliability scores for decisions
- **Context-Aware Processing**: Comprehensive analysis of inventory, sales, and market data
- **Structured Workflows**: LangGraph orchestrates complex analysis pipelines

### Environment Configuration

Create a `.env` file in the project root:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: OpenAI Model Configuration
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.1
```

### Agent API Endpoints

- `GET /agents/capabilities` - List all available agents and their capabilities
- `GET /agents/status` - Get current system status and agent counts
- `POST /agents/context` - Gather context data for agent analysis
- `POST /agents/analyze/{agent_type}` - Run analysis with a specific agent
- `POST /agents/analyze/all` - Run analysis with all agents simultaneously
- `POST /agents/execute-action` - Execute recommended agent actions
- `GET /agents/history` - Retrieve decision history and audit trail

## 📦 Installation & Setup

### Prerequisites

- **Python**: 3.13+ (for backend)
- **Node.js**: 18.x or higher (for frontend)
- **npm**: 8.x or higher (for frontend)
- **Virtual environment**: Recommended for Python

### Backend Setup

1. **Clone the repository** (if applicable)

   ```bash
   git clone <repository-url>
   cd fastapi_inventory
   ```

2. **Create virtual environment**

   ```bash
   python -m venv .venv
   ```

3. **Activate virtual environment**

   - Windows:
     ```powershell
     .venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source .venv/bin/activate
     ```

4. **Install backend dependencies**

   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables** (Optional - for AI features)

   Create a `.env` file in the project root:

   ```env
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Optional: OpenAI Model Configuration
   OPENAI_MODEL=gpt-4o-mini
   OPENAI_TEMPERATURE=0.1
   ```

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed)

   The frontend defaults to `http://localhost:8000`. If your backend runs on a different URL, update the API configuration in the frontend code.

## 🚀 Running the Application

### Running Backend Server

1. **Activate virtual environment** (if not already activated)

   ```powershell
   .venv\Scripts\activate  # Windows
   ```

   ```bash
   source .venv/bin/activate  # Linux/Mac
   ```

2. **Start the FastAPI server**

   Option 1 - Using uvicorn directly:

   ```bash
   uvicorn main:app --reload
   ```

   Option 2 - Using the start script:

   ```bash
   python start_server.py
   ```

3. **Verify backend is running**
   - API Base URL: `http://127.0.0.1:8000`
   - Interactive API Docs: `http://127.0.0.1:8000/docs`
   - Alternative Docs: `http://127.0.0.1:8000/redoc`

### Running Frontend Application

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

3. **Access the frontend**
   - Development URL: `http://localhost:3000`

### Running Both Applications

For a complete development environment:

**Terminal 1 - Backend:**

```powershell
# Windows
.venv\Scripts\activate
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**

```powershell
cd frontend
npm run dev
```

### Production Build

**Backend:**

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**

```bash
cd frontend
npm run build
npm run start
```

## 🧪 Testing the Agentic AI System

The application includes comprehensive testing scripts for the agentic AI functionality:

### Quick Demo

Run the comprehensive demo to test all agent features:

```bash
python full_demo.py
```

This will:

- Start the server automatically
- Test all agent endpoints
- Demonstrate inventory optimization and demand forecasting
- Show agent capabilities and system status

### Individual Agent Testing

Test specific agents with custom data:

```bash
python demo_agents.py
```

### Manual Testing

Use the interactive API documentation at `http://127.0.0.1:8000/docs` to manually test agent endpoints.

### Running Tests

Run the project test suite (pytest) to verify imports and unit tests. From the project root run:

```bash
python -m pytest -q
```

On Windows you can use the included helper script to install test deps (if needed) and run tests:

```powershell
tools\run_tests.ps1
```

Note: the test suite includes import-level tests that use lightweight stubs for optional LLM-related packages, so tests run offline by default. For integration tests with real LLMs, install the actual LLM packages and remove or adjust the stubs in `app/tests/conftest.py`.

### Postman Collection

An export of the Postman collection is available at `postman_scripts.json` in the repository root. To use it:

- Open Postman and choose "Import" → "File" and select `postman_scripts.json`.
- Set the collection variable `base_url` to `http://localhost:8000` (or your server URL).
- After running a successful `POST /users/login`, the `jwt_token` collection variable will be populated by the login test script.

### Example Agent Requests

**Get Agent Capabilities:**

```bash
GET /agents/capabilities
```

**Run Inventory Optimization:**

```bash
POST /agents/analyze/inventory_optimization
Content-Type: application/json

{
  "context": {
    "products": [
      {
        "id": 1,
        "product_title": "Red Lipstick",
        "stock_quantity": 15,
        "reorder_point": 20,
        "price": 15.99
      }
    ],
    "sales_history": [
      {"product_id": 1, "quantity": 8, "date": "2025-12-20"}
    ]
  }
}
```

## 📡 API Endpoints

The API provides both unversioned (current stable) and versioned (v1) endpoints for all resources.

### Categories

- `POST /categories` | `POST /v1/categories` - Create a category
- `GET /categories` | `GET /v1/categories` - List categories (with pagination)
- `GET /categories/{id}` | `GET /v1/categories/{id}` - Get category by ID
- `PUT /categories/{id}` | `PUT /v1/categories/{id}` - Update category
- `DELETE /categories/{id}` | `DELETE /v1/categories/{id}` - Delete category

### Suppliers

- `POST /suppliers` | `POST /v1/suppliers` - Create a supplier
- `GET /suppliers` | `GET /v1/suppliers` - List suppliers (with pagination)
- `GET /suppliers/{id}` | `GET /v1/suppliers/{id}` - Get supplier by ID
- `PUT /suppliers/{id}` | `PUT /v1/suppliers/{id}` - Update supplier
- `DELETE /suppliers/{id}` | `DELETE /v1/suppliers/{id}` - Delete supplier

### Products

- `POST /products` | `POST /v1/products` - Create a product
- `GET /products` | `GET /v1/products` - List products (with pagination)
- `GET /products/{id}` | `GET /v1/products/{id}` - Get product by ID
- `PUT /products/{id}` | `PUT /v1/products/{id}` - Update product
- `DELETE /products/{id}` | `DELETE /v1/products/{id}` - Delete product

### Inventory

- `POST /inventory` | `POST /v1/inventory` - Create inventory entry
- `GET /inventory` | `GET /v1/inventory` - List inventory entries (with pagination)
- `GET /inventory/{id}` | `GET /v1/inventory/{id}` - Get inventory entry by ID
- `PUT /inventory/{id}` | `PUT /v1/inventory/{id}` - Update inventory entry
- `DELETE /inventory/{id}` | `DELETE /v1/inventory/{id}` - Delete inventory entry

### Users

- `POST /users/` | `POST /v1/users/` - Create a user (public)
- `POST /users/login` | `POST /v1/users/login` - Authenticate user and get JWT token (public)
- `GET /users/me` | `GET /v1/users/me` - Get current authenticated user info (protected)
- `GET /users/` | `GET /v1/users/` - List users (protected, requires authentication)
- `GET /users/{id}` | `GET /v1/users/{id}` - Get user by ID (public)
- `PUT /users/{id}` | `PUT /v1/users/{id}` - Update user (protected)
- `DELETE /users/{id}` | `DELETE /v1/users/{id}` - Delete user (protected)

### 🤖 AI Agents

- `GET /agents/capabilities` | `GET /v1/agents/capabilities` - List agent capabilities
- `GET /agents/status` | `GET /v1/agents/status` - Get agent system status
- `POST /agents/context` | `POST /v1/agents/context` - Gather context data
- `POST /agents/analyze/inventory_optimization` | `POST /v1/agents/analyze/inventory_optimization` - Run inventory optimization
- `POST /agents/analyze/demand_forecasting` | `POST /v1/agents/analyze/demand_forecasting` - Run demand forecasting
- `POST /agents/analyze/pricing_optimization` | `POST /v1/agents/analyze/pricing_optimization` - Run pricing optimization
- `POST /agents/analyze/all` | `POST /v1/agents/analyze/all` - Run all agents
- `POST /agents/execute-action` | `POST /v1/agents/execute-action` - Execute agent action
- `GET /agents/history` | `GET /v1/agents/history` - Get decision history

### Root

- `GET /` | `GET /v1/` - API information

## 📊 Database

- **Type**: SQLite
- **File**: `inventory.db` (auto-created in project root)
- **Driver**: aiosqlite for async operations
- **Migration**: Tables created automatically on startup using SQLAlchemy metadata

### 🗄️ Database Tables Schema

#### 1. users

System users for authentication and authorization.

| Column            | Type     | Key    | attributes  | Description            |
| ----------------- | -------- | ------ | ----------- | ---------------------- |
| `id`              | Integer  | PK     |             | Unique identifier      |
| `username`        | String   | Unique | Index       | Login username         |
| `email`           | String   | Unique | Index       | User email address     |
| `hashed_password` | String   |        |             | Bcrypt hashed password |
| `full_name`       | String   |        | Nullable    | User's full name       |
| `is_active`       | Integer  |        | Default 1   | Account status         |
| `created_at`      | DateTime |        | Default Now | Creation timestamp     |
| `updated_at`      | DateTime |        |             | Last update timestamp  |

#### 2. categories

Product categories hierarchy.

| Column        | Type    | Key    | attributes | Description          |
| ------------- | ------- | ------ | ---------- | -------------------- |
| `id`          | Integer | PK     |            | Unique identifier    |
| `name`        | String  | Unique | Index      | Category name        |
| `description` | Text    |        | Nullable   | Category description |

#### 3. suppliers

Product vendors and suppliers.

| Column          | Type    | Key    | attributes | Description             |
| --------------- | ------- | ------ | ---------- | ----------------------- |
| `id`            | Integer | PK     |            | Unique identifier       |
| `name`          | String  | Unique | Index      | Supplier company name   |
| `contact_info`  | Text    |        | Nullable   | General contact details |
| `contact_email` | String  |        | Nullable   | Contact email address   |

#### 4. products

Master product catalog.

| Column        | Type    | Key | attributes | Description            |
| ------------- | ------- | --- | ---------- | ---------------------- |
| `id`          | Integer | PK  |            | Unique identifier      |
| `name`        | String  |     | Index      | Product Name           |
| `description` | Text    |     | Nullable   | Product description    |
| `price`       | Float   |     |            | Product unit price     |
| `category_id` | Integer | FK  |            | Ref -> `categories.id` |
| `supplier_id` | Integer | FK  |            | Ref -> `suppliers.id`  |

#### 5. inventory

Current stock levels for products.

| Column       | Type    | Key | attributes | Description              |
| ------------ | ------- | --- | ---------- | ------------------------ |
| `id`         | Integer | PK  |            | Unique identifier        |
| `product_id` | Integer | FK  |            | Ref -> `products.id`     |
| `quantity`   | Float   |     |            | Current stock quantity   |
| `location`   | String  |     | Nullable   | Warehouse/Shelf location |

#### 6. intake_orders

Incoming stock shipments (Purchase Orders).

| Column          | Type     | Key    | attributes      | Description                   |
| --------------- | -------- | ------ | --------------- | ----------------------------- |
| `id`            | Integer  | PK     |                 | Unique identifier             |
| `intake_number` | String   | Unique | Index           | PO Number (e.g., PO-2024-001) |
| `intake_date`   | DateTime |        |                 | Date of intake                |
| `supplier_id`   | Integer  | FK     |                 | Ref -> `suppliers.id`         |
| `status`        | Enum     |        | Default 'draft' | draft, confirmed, cancelled   |
| `total_cost`    | Numeric  |        |                 | Total order cost              |
| `notes`         | String   |        | Nullable        | Notes                         |
| `created_at`    | DateTime |        |                 | Creation timestamp            |
| `updated_at`    | DateTime |        |                 | Last update timestamp         |

#### 7. intake_items

Line items for intake orders.

| Column            | Type    | Key | attributes | Description               |
| ----------------- | ------- | --- | ---------- | ------------------------- |
| `id`              | Integer | PK  |            | Unique identifier         |
| `intake_order_id` | Integer | FK  |            | Ref -> `intake_orders.id` |
| `product_id`      | Integer | FK  |            | Ref -> `products.id`      |
| `quantity`        | Integer |     |            | Quantity received         |
| `unit_cost`       | Numeric |     |            | Cost per unit             |
| `total_cost`      | Numeric |     |            | Line total (qty \* cost)  |

#### 8. dispatch_orders

Outgoing stock (Sales Orders).

| Column            | Type     | Key    | attributes      | Description                      |
| ----------------- | -------- | ------ | --------------- | -------------------------------- |
| `id`              | Integer  | PK     |                 | Unique identifier                |
| `dispatch_number` | String   | Unique | Index           | SO Number (e.g., DO-2024-001)    |
| `dispatch_date`   | DateTime |        |                 | Date of dispatch                 |
| `customer_name`   | String   |        | Nullable        | Customer name                    |
| `status`          | Enum     |        | Default 'draft' | draft, completed, cancelled      |
| `payment_method`  | Enum     |        | Nullable        | cash, credit_card, bank_transfer |
| `subtotal`        | Numeric  |        |                 | Subtotal amount                  |
| `tax_amount`      | Numeric  |        |                 | Tax amount                       |
| `total_amount`    | Numeric  |        |                 | Grand total                      |
| `created_at`      | DateTime |        |                 | Creation timestamp               |
| `updated_at`      | DateTime |        |                 | Last update timestamp            |

#### 9. dispatch_items

Line items for dispatch orders.

| Column              | Type    | Key | attributes | Description                 |
| ------------------- | ------- | --- | ---------- | --------------------------- |
| `id`                | Integer | PK  |            | Unique identifier           |
| `dispatch_order_id` | Integer | FK  |            | Ref -> `dispatch_orders.id` |
| `product_id`        | Integer | FK  |            | Ref -> `products.id`        |
| `quantity`          | Integer |     |            | Quantity sold               |
| `unit_price`        | Numeric |     |            | Price per unit              |
| `total_price`       | Numeric |     |            | Line total (qty \* price)   |

#### 10. app_settings

Dynamic application configuration.

| Column        | Type    | Key    | attributes        | Description                  |
| ------------- | ------- | ------ | ----------------- | ---------------------------- |
| `id`          | Integer | PK     |                   | Unique identifier            |
| `key`         | String  | Unique | Index             | Setting key name             |
| `value`       | String  |        | Nullable          | Setting value                |
| `value_type`  | String  |        | Default 'string'  | Data type identifier         |
| `category`    | String  |        | Default 'general' | Grouping category            |
| `description` | String  |        | Nullable          | Description of functionality |

### 🔗 Entity Relationships Diagram (Textual)

```mermaid
erDiagram
    categories ||--o{ products : "contains"
    suppliers ||--o{ products : "supplies"
    suppliers ||--o{ intake_orders : "fulfills"
    products ||--|| inventory : "has stock"
    products ||--o{ intake_items : "listed in"
    products ||--o{ dispatch_items : "listed in"
    intake_orders ||--|{ intake_items : "contains"
    dispatch_orders ||--|{ dispatch_items : "contains"
```

## � Authentication

The API uses JWT (JSON Web Token) authentication for secure access to protected endpoints.

### Authentication Flow

1. **Register**: Create a new user account
2. **Login**: Obtain a JWT access token
3. **Access**: Include the token in the `Authorization` header for protected requests

### Login

```bash
POST /users/login
Content-Type: application/json

{
  "login_name": "your_username",
  "password": "your_password"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Using the Token

Include the token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Protected Endpoints

The following endpoints require authentication:

- `GET /users/me` - Get current user info
- `GET /users/` - List all users
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Token Expiration

- Access tokens expire after 30 minutes
- Use the login endpoint to get a new token when expired

## 🔄 API Versioning

The API supports versioning to ensure backward compatibility while allowing for future enhancements.

### Available Versions

- **Unversioned** (`/api/*`): Current stable endpoints (recommended for new integrations)
- **v1** (`/v1/api/*`): Version 1 endpoints with guaranteed stability

### Endpoint Examples

| Resource   | Unversioned   | Versioned (v1)   |
| ---------- | ------------- | ---------------- |
| Categories | `/categories` | `/v1/categories` |
| Suppliers  | `/suppliers`  | `/v1/suppliers`  |
| Products   | `/products`   | `/v1/products`   |
| Inventory  | `/inventory`  | `/v1/inventory`  |
| Users      | `/users`      | `/v1/users`      |
| Root       | `/`           | `/v1/`           |

### Backward Compatibility

- Unversioned endpoints are the current stable API
- Versioned endpoints (`/v1/*`) provide long-term stability guarantees
- Both endpoint types share the same functionality and authentication requirements

## 🛡️ Error Handling

The API implements centralized error handling with consistent error responses across all endpoints.

### Error Response Format

All errors return a standardized JSON response:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "status_code": 400,
    "details": {
      "field": "field_name",
      "additional_info": "value"
    }
  },
  "timestamp": "2025-12-26T10:30:00.000Z",
  "request_id": "uuid-string",
  "path": "/api/endpoint"
}
```

### Error Types

| Error Code               | Status Code | Description                         |
| ------------------------ | ----------- | ----------------------------------- |
| `VALIDATION_ERROR`       | 400         | Input validation failed             |
| `NOT_FOUND`              | 404         | Resource not found                  |
| `CONFLICT`               | 409         | Resource conflict (duplicate, etc.) |
| `AUTHENTICATION_ERROR`   | 401         | Invalid or missing credentials      |
| `AUTHORIZATION_ERROR`    | 403         | Insufficient permissions            |
| `BUSINESS_LOGIC_ERROR`   | 400         | Business rule violation             |
| `DATABASE_ERROR`         | 500         | Database operation failed           |
| `EXTERNAL_SERVICE_ERROR` | 502         | External service error              |
| `INTERNAL_SERVER_ERROR`  | 500         | Unexpected server error             |

### Examples

**Validation Error:**

```json
{
  "success": false,
  "error": {
    "message": "Stock quantity cannot be negative",
    "code": "VALIDATION_ERROR",
    "status_code": 400,
    "details": {
      "field": "stock_quantity",
      "provided_value": -5
    }
  },
  "timestamp": "2025-12-26T10:30:00.000Z",
  "request_id": "123e4567-e89b-12d3-a456-426614174000",
  "path": "/inventory/"
}
```

**Not Found Error:**

```json
{
  "success": false,
  "error": {
    "message": "Inventory not found with ID: 999",
    "code": "NOT_FOUND",
    "status_code": 404,
    "details": {
      "resource": "Inventory",
      "resource_id": 999
    }
  },
  "timestamp": "2025-12-26T10:30:00.000Z",
  "request_id": "123e4567-e89b-12d3-a456-426614174000",
  "path": "/inventory/999"
}
```

## 🧪 Testing

### Using Postman

1. Import the provided Postman collection: `postman_scripts.json`
2. Update the `base_url` variable to `http://127.0.0.1:8000`
3. The collection includes both unversioned and v1 endpoints for testing
4. Use the login endpoint to get a JWT token, which is automatically stored in the `jwt_token` variable

### Error Handling Testing

Run the error handling test script to verify centralized error handling:

```bash
python test_error_handling.py
```

This script tests:

- Not Found errors (404)
- Validation errors (400)
- Authentication errors (401)
- Both unversioned and v1 endpoints

### Manual Testing

Use the interactive Swagger UI at `/docs` or curl commands:

```bash
# Test error handling - Not Found
curl -X GET http://127.0.0.1:8000/inventory/999

# Test error handling - Validation Error
curl -X POST http://127.0.0.1:8000/inventory/ \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "stock_quantity": -5,
    "location": "Test"
  }'

# Register a new user (unversioned)
curl -X POST http://127.0.0.1:8000/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "login_name": "testuser",
    "email_address": "test@example.com",
    "display_name": "Test User",
    "password": "password123",
    "confirm_password": "password123",
    "accept_terms": true
  }'

# Register a new user (v1)
curl -X POST http://127.0.0.1:8000/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "login_name": "testuser",
    "email_address": "test@example.com",
    "display_name": "Test User",
    "password": "password123",
    "confirm_password": "password123",
    "accept_terms": true
  }'

# Login to get JWT token (unversioned)
curl -X POST http://127.0.0.1:8000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "login_name": "testuser",
    "password": "password123"
  }'

# Use the token for authenticated requests (v1)
curl -X GET http://127.0.0.1:8000/v1/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 📝 Development

### Adding New Features

1. Create ViewModel in `app/viewmodels/`
2. Add mapper in `app/mappers/`
3. Implement service in `app/services/`
4. Add data access in `app/dbAccess/`
5. Create router in `app/routers/`
6. Include router in `app/main.py`

### Code Style

- Follow PEP 8 conventions
- Use type hints
- Write docstrings for functions and classes
- Use async/await for database operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or issues, please open an issue on the GitHub repository.
