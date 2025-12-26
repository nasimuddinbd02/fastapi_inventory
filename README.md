# Cosmetics Inventory API

A modern, asynchronous FastAPI application for managing cosmetics inventory with clean n-tier architecture and ViewModel pattern.

## 🚀 Features

- **Asynchronous API**: Built with FastAPI for high-performance async operations
- **Clean Architecture**: N-tier design with separation of concerns
- **ViewModel Pattern**: Business validation and user input/output separation
- **Dependency Injection**: Clean service layer with injectable dependencies
- **Database**: SQLite with SQLAlchemy async ORM and aiosqlite
- **Authentication**: Password hashing with bcrypt and user authentication
- **Interactive Documentation**: Auto-generated Swagger UI at `/docs`
- **Logging**: Comprehensive logging configuration
- **Auto-migration**: Database tables created automatically on startup

## 🛠️ Technologies Used

- **Framework**: FastAPI (async web framework)
- **ORM**: SQLAlchemy 2.0+ with async support
- **Database**: SQLite with aiosqlite driver
- **Validation**: Pydantic for data models and validation
- **Authentication**: Passlib with bcrypt for password hashing
- **JWT**: Python-Jose for JSON Web Tokens
- **Server**: Uvicorn ASGI server
- **HTTP Client**: HTTPX for async HTTP requests
- **Migration**: Alembic for database migrations

## 📁 Project Structure

```
fastapi_inventory/
├── main.py                          # Application entry point
├── requirements.txt                 # Python dependencies
├── README.md                        # Project documentation
├── inventory.db                     # SQLite database (auto-generated)
├── app/                             # Main application package
│   ├── __init__.py
│   ├── main.py                      # FastAPI app instance and routes
│   ├── database.py                  # Database configuration and engine
│   ├── dependencies.py              # Dependency injection setup
│   ├── logging_config.py            # Logging configuration
│   ├── dbAccess/                    # Data Access Layer
│   │   ├── category.py
│   │   ├── supplier.py
│   │   ├── product.py
│   │   ├── inventory.py
│   │   └── user.py
│   ├── models/                      # SQLAlchemy ORM models
│   │   ├── category.py
│   │   ├── supplier.py
│   │   ├── product.py
│   │   ├── inventory.py
│   │   └── user.py
│   ├── mappers/                     # ViewModel to DTO mappers
│   │   ├── category_mapper.py
│   │   ├── supplier_mapper.py
│   │   ├── product_mapper.py
│   │   ├── inventory_mapper.py
│   │   └── user_mapper.py
│   ├── routers/                     # API route handlers
│   │   ├── categories.py
│   │   ├── suppliers.py
│   │   ├── products.py
│   │   ├── inventory.py
│   │   └── users.py
│   ├── schemas/                     # Pydantic DTOs (for data operations)
│   │   ├── category.py
│   │   ├── supplier.py
│   │   ├── product.py
│   │   ├── inventory.py
│   │   └── user.py
│   ├── services/                    # Business logic layer
│   │   ├── category_service.py
│   │   ├── supplier_service.py
│   │   ├── product_service.py
│   │   ├── inventory_service.py
│   │   └── user_service.py
│   └── viewmodels/                  # Pydantic ViewModels (API I/O)
│       ├── category.py
│       ├── supplier.py
│       ├── product.py
│       ├── inventory.py
│       └── user.py
└── .venv/                          # Virtual environment (not in repo)
```

## 🏗️ Architecture

This application follows a clean n-tier architecture with the ViewModel pattern:

- **ViewModels**: Pydantic models for API input/output with business validation
- **Mappers**: Convert between ViewModels and internal DTOs
- **Services**: Business logic operating on ViewModels
- **Routers**: API endpoints accepting ViewModels
- **dbAccess**: Data access layer with async database operations
- **Models**: SQLAlchemy ORM entities
- **Schemas**: Internal DTOs for database operations

## 📦 Installation

### Prerequisites
- Python 3.13+
- Virtual environment (recommended)

### Setup Steps

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
     ```bash
     .venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source .venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## 🚀 Running the Application

1. **Activate virtual environment** (if not already activated)
   ```bash
   .venv\Scripts\activate  # Windows
   ```

2. **Run the server**
   ```bash
   uvicorn main:app --reload
   ```

3. **Access the application**
   - API Base URL: `http://127.0.0.1:8000`
   - Interactive Docs: `http://127.0.0.1:8000/docs`
   - Alternative Docs: `http://127.0.0.1:8000/redoc`

## 📡 API Endpoints

### Categories
- `POST /categories` - Create a category
- `GET /categories` - List categories (with pagination)
- `GET /categories/{id}` - Get category by ID
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

### Suppliers
- `POST /suppliers` - Create a supplier
- `GET /suppliers` - List suppliers (with pagination)
- `GET /suppliers/{id}` - Get supplier by ID
- `PUT /suppliers/{id}` - Update supplier
- `DELETE /suppliers/{id}` - Delete supplier

### Products
- `POST /products` - Create a product
- `GET /products` - List products (with pagination)
- `GET /products/{id}` - Get product by ID
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Inventory
- `POST /inventory` - Create inventory entry
- `GET /inventory` - List inventory entries (with pagination)
- `GET /inventory/{id}` - Get inventory entry by ID
- `PUT /inventory/{id}` - Update inventory entry
- `DELETE /inventory/{id}` - Delete inventory entry

### Users
- `POST /users` - Create a user
- `GET /users` - List users (with pagination)
- `GET /users/{id}` - Get user by ID
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user
- `POST /users/login` - Authenticate user

### Root
- `GET /` - API information

## 📊 Database

- **Type**: SQLite
- **File**: `inventory.db` (auto-created in project root)
- **Driver**: aiosqlite for async operations
- **Migration**: Tables created automatically on startup using SQLAlchemy metadata

## 🔧 Configuration

### Environment Variables
The application uses the following configuration:
- Database URL: `sqlite+aiosqlite:///./inventory.db`

### Logging
- Configured in `app/logging_config.py`
- Logs to console and file (`app.log`)
- Log levels: DEBUG, INFO, WARNING, ERROR

## 🧪 Testing

### Using Postman
1. Import the provided Postman collection: `Cosmetics_Inventory_API.postman_collection.json`
2. Update the `base_url` variable to `http://127.0.0.1:8000`
3. Test the endpoints

### Manual Testing
Use the interactive Swagger UI at `/docs` or curl commands:

```bash
# Get all categories
curl http://127.0.0.1:8000/categories

# Create a category
curl -X POST http://127.0.0.1:8000/categories \
  -H "Content-Type: application/json" \
  -d '{"category_name": "Makeup", "category_description": "Cosmetic products"}'
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
