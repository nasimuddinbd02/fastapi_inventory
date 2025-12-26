# Cosmetics Inventory API

A state-of-the-art n-tier FastAPI application for managing cosmetics inventory.

## Architecture

This application follows a clean n-tier architecture with ViewModel pattern:

- **Models**: SQLAlchemy ORM models for database entities
- **Schemas**: Pydantic DTOs for database operations
- **ViewModels**: Pydantic models for user input/output with business validation
- **Mappers**: Functions to convert between ViewModels and DTOs
- **DataAccess**: Data access layer with async database operations
- **Services**: Business logic layer operating on ViewModels
- **Routers**: API endpoints accepting ViewModels

## Features

- Async API endpoints
- Dependency injection for services
- ViewModel pattern for user input separation
- Automatic mapping between ViewModels and database models
- Business logic validation on ViewModels
- Password hashing and authentication
- Interactive API documentation

## Installation

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

Run the server with:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

## API Endpoints

### Categories
- `POST /categories` - Create a category
- `GET /categories` - List categories
- `GET /categories/{id}` - Get category by ID
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

### Suppliers
- `POST /suppliers` - Create a supplier
- `GET /suppliers` - List suppliers
- `GET /suppliers/{id}` - Get supplier by ID
- `PUT /suppliers/{id}` - Update supplier
- `DELETE /suppliers/{id}` - Delete supplier

### Products
- `POST /products` - Create a product
- `GET /products` - List products
- `GET /products/{id}` - Get product by ID
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Users
- `POST /users` - Create a user (accepts UserCreateViewModel)
- `GET /users` - List users (returns UserViewModel[])
- `GET /users/{id}` - Get user by ID (returns UserViewModel)
- `PUT /users/{id}` - Update user (accepts UserUpdateViewModel)
- `DELETE /users/{id}` - Delete user
- `POST /users/login` - Authenticate user (accepts UserLoginViewModel)

## Documentation

Once running, visit `http://127.0.0.1:8000/docs` for interactive API documentation.

## Database

The application uses SQLite (`inventory.db`) and creates tables automatically on startup.
