# FastAPI Inventory Frontend

A modern **Next.js 14** frontend application for the FastAPI Inventory Management System, built with React, TypeScript, Tailwind CSS, and Redux Toolkit for state management.

## 🚀 Features

- **Next.js 14**: Latest Next.js with App Router for modern React development
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: High-quality, accessible UI components built with Radix UI
- **Redux Toolkit**: Powerful state management with Redux
- **Axios**: HTTP client for API communication
- **Dark Mode**: Theme support with next-themes
- **Responsive Design**: Mobile-first, fully responsive UI

## 📁 Project Structure

```
frontend/
├── 📄 package.json                  # Dependencies and scripts
├── 📄 next.config.js                # Next.js configuration
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 tailwind.config.cjs           # Tailwind CSS configuration
├── 📄 postcss.config.cjs            # PostCSS configuration
├── 📄 components.json               # shadcn/ui configuration
├── 📄 next-env.d.ts                 # Next.js TypeScript definitions
├── 📄 README.md                     # This file
├── 📄 ENVIRONMENT_SETUP.md          # Environment setup guide
│
└── 📁 src/                          # Source code directory
    ├── 📁 app/                      # Next.js App Router
    │   ├── 📄 layout.tsx            # Root layout
    │   ├── 📄 page.tsx              # Home page
    │   ├── 📄 globals.css           # Global styles
    │   └── 📁 [routes]/             # Application routes
    │
    ├── 📁 components/               # React components
    │   ├── 📁 ui/                   # shadcn/ui components
    │   │   ├── 📄 badge.tsx
    │   │   ├── 📄 button.tsx
    │   │   ├── 📄 dialog.tsx
    │   │   ├── 📄 input.tsx
    │   │   ├── 📄 label.tsx
    │   │   ├── 📄 select.tsx
    │   │   ├── 📄 toast.tsx
    │   │   └── ...
    │   └── 📁 [feature]/            # Feature-specific components
    │
    ├── 📁 config/                   # Configuration files
    │   └── 📄 api.ts                # API configuration
    │
    ├── 📁 hooks/                    # Custom React hooks
    │   └── 📄 use-*.ts              # Custom hooks
    │
    ├── 📁 lib/                      # Utility functions
    │   └── 📄 utils.ts              # Helper utilities
    │
    ├── 📁 providers/                # React Context Providers
    │   └── 📄 theme-provider.tsx    # Theme provider
    │
    └── 📁 store/                    # Redux state management
        ├── 📄 store.ts              # Redux store configuration
        └── 📁 slices/               # Redux slices
            └── 📄 *.slice.ts        # Feature slices
```

## 🛠️ Technologies & Dependencies

### Core Framework
- **Next.js 14.0.0**: React framework with App Router
- **React 18.2.0**: UI library
- **TypeScript 5.2.2**: Type-safe JavaScript

### UI & Styling
- **Tailwind CSS 3.4.13**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Unstyled, accessible components
- **Lucide React**: Beautiful icon library
- **class-variance-authority**: Component variants
- **tailwind-merge**: Merge Tailwind classes
- **tailwindcss-animate**: Animation utilities

### State Management
- **Redux Toolkit 2.11.2**: State management
- **React Redux 9.2.0**: React bindings for Redux

### HTTP Client
- **Axios 1.4.0**: Promise-based HTTP client

### Theming
- **next-themes 0.4.6**: Theme switching support

### Development Tools
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 📦 Installation & Setup

### Prerequisites
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **Backend API**: FastAPI backend running on `http://localhost:8000`

### Setup Steps

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed)
   
   The frontend defaults to `http://localhost:8000` for the API. If your backend runs on a different URL, update the configuration in [src/config/api.ts](src/config/api.ts).

4. **Verify backend is running**
   
   Ensure the FastAPI backend is running before starting the frontend:
   ```bash
   # In the backend directory
   uvicorn main:app --reload
   ```

## 🚀 Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at:
- **URL**: `http://localhost:3000`
- **Hot Reload**: Enabled (changes reflect immediately)

### Production Mode

Build and run the optimized production version:

```bash
# Build for production
npm run build

# Start production server
npm run start
```

Production server runs at `http://localhost:3000`

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build optimized production bundle |
| `npm run start` | Start production server (requires build) |
| `npm run lint` | Run ESLint for code quality checks |

## 🌐 API Integration

The frontend communicates with the FastAPI backend through Axios:

- **Base URL**: `http://localhost:8000` (configurable)
- **API Endpoints**: RESTful API with versioning support
- **Authentication**: JWT token-based authentication
- **Error Handling**: Centralized error handling

### Example API Configuration

```typescript
// src/config/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 🎨 UI Components

The application uses **shadcn/ui** components built on Radix UI:

- **Accessible**: WCAG compliant components
- **Customizable**: Full control over styling
- **Composable**: Build complex UIs from simple components
- **Type-safe**: Full TypeScript support

### Adding New Components

To add a new shadcn/ui component:

```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
```

## 🔐 Authentication Flow

1. User logs in via the backend `/users/login` endpoint
2. Backend returns JWT token
3. Frontend stores token in localStorage or Redux
4. Token is included in subsequent API requests
5. Protected routes verify token validity

## 🌙 Dark Mode

The application supports dark mode via `next-themes`:

```typescript
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

## 📱 Responsive Design

The UI is built mobile-first with Tailwind CSS breakpoints:

- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

## 🧪 Development Tips

### Hot Reload
- Save files to see changes instantly
- Component updates reflect in real-time
- No need to restart the server

### TypeScript Benefits
- Catch errors at compile time
- IntelliSense support in VS Code
- Better refactoring capabilities

### Tailwind CSS
- Use utility classes for rapid development
- Customize theme in `tailwind.config.cjs`
- Leverage component variants with CVA

## 🔗 Related Documentation

- **Backend API**: See root [README.md](../README.md) for API documentation
- **Environment Setup**: See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed setup
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **shadcn/ui**: [https://ui.shadcn.com](https://ui.shadcn.com)

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow Tailwind CSS conventions
4. Write clean, maintainable code
5. Test thoroughly before submitting

## 📄 License

This project is part of the FastAPI Inventory Management System and follows the same license as the backend application.
