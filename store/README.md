# Redux Toolkit Setup

This project uses Redux Toolkit for state management with a well-organized structure for scalability and maintainability.

## 🏗️ **Project Structure**

```
store/
├── index.ts              # Main store configuration
├── hooks.ts              # Custom hooks and selectors
├── slices/               # Redux slices
│   ├── authSlice.ts      # Authentication state
│   ├── propertySlice.ts  # Property management
│   └── uiSlice.ts        # UI state management
└── README.md             # This file

services/
├── api.ts                # API configuration and interceptors
├── authService.ts        # Authentication API calls
└── propertyService.ts    # Property API calls
```

## 🚀 **Getting Started**

### 1. **Install Dependencies**
```bash
npm install @reduxjs/toolkit react-redux
```

### 2. **Wrap Your App**
Update your `app/layout.tsx` to include the Redux Provider:

```tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## 📦 **Store Configuration**

The main store is configured in `store/index.ts` with:

- **Auth Reducer**: User authentication and profile management
- **Property Reducer**: Property listings, search, and management
- **UI Reducer**: UI state, modals, notifications, and theme

## 🎯 **Available Slices**

### **Auth Slice** (`authSlice.ts`)
Manages user authentication state:

```tsx
import { useAuth, useUser, useIsAuthenticated } from '../store/hooks';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  
  // ... component logic
}
```

**Actions:**
- `loginUser(credentials)` - User login
- `registerUser(userData)` - User registration
- `logoutUser()` - User logout
- `updateUser(data)` - Update user profile

### **Property Slice** (`propertySlice.ts`)
Manages property-related state:

```tsx
import { useProperties, usePropertyFilters, usePropertyLoading } from '../store/hooks';

function PropertyList() {
  const properties = useProperties();
  const filters = usePropertyFilters();
  const isLoading = usePropertyLoading();
  
  // ... component logic
}
```

**Actions:**
- `fetchProperties(params)` - Get properties with pagination
- `searchProperties(filters)` - Search properties
- `setFilters(filters)` - Update search filters
- `clearFilters()` - Reset all filters

### **UI Slice** (`uiSlice.ts`)
Manages UI state and interactions:

```tsx
import { useUI, useSidebarOpen, useNotifications } from '../store/hooks';

function Layout() {
  const { sidebarOpen, notifications } = useUI();
  const isSidebarOpen = useSidebarOpen();
  
  // ... component logic
}
```

**Actions:**
- `toggleSidebar()` - Toggle sidebar visibility
- `addNotification(notification)` - Show notification
- `openModal(modal)` - Open modal
- `setTheme(theme)` - Change theme

## 🔧 **Custom Hooks**

Use the custom hooks from `store/hooks.ts` for easy state access:

```tsx
import { 
  useAuth, 
  useProperties, 
  useUI,
  usePropertyStats,
  useIsAnyLoading 
} from '../store/hooks';

function Dashboard() {
  const { user } = useAuth();
  const properties = useProperties();
  const { theme } = useUI();
  const stats = usePropertyStats();
  const isLoading = useIsAnyLoading();
  
  // ... component logic
}
```

## 🌐 **API Services**

### **Base API Service** (`services/api.ts`)
- Axios instance with interceptors
- Automatic token management
- Error handling and 401 redirects
- File upload support

### **Auth Service** (`services/authService.ts`)
- Login, register, logout
- Profile management
- Password reset
- Email verification

### **Property Service** (`services/propertyService.ts`)
- CRUD operations for properties
- Search and filtering
- Image uploads
- Favorites management

## 📱 **Usage Examples**

### **Authentication Flow**
```tsx
import { useAppDispatch } from '../store';
import { loginUser } from '../store/slices/authSlice';
import { useAuth, useAuthLoading, useAuthError } from '../store/hooks';

function LoginForm() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAuth();
  
  const handleLogin = async (credentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      // Redirect on success
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      {/* form fields */}
    </form>
  );
}
```

### **Property Search**
```tsx
import { useAppDispatch } from '../store';
import { searchProperties, setFilters } from '../store/slices/propertySlice';
import { usePropertyFilters, useFilteredProperties } from '../store/hooks';

function SearchForm() {
  const dispatch = useAppDispatch();
  const filters = usePropertyFilters();
  const properties = useFilteredProperties();
  
  const handleSearch = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(searchProperties(newFilters));
  };
  
  return (
    <div>
      {/* search form */}
      <PropertyList properties={properties} />
    </div>
  );
}
```

### **UI State Management**
```tsx
import { useAppDispatch } from '../store';
import { toggleSidebar, addNotification } from '../store/slices/uiSlice';
import { useSidebarOpen } from '../store/hooks';

function Header() {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useSidebarOpen();
  
  const handleMenuClick = () => {
    dispatch(toggleSidebar());
    dispatch(addNotification({
      type: 'info',
      message: 'Sidebar toggled',
      duration: 2000
    }));
  };
  
  return (
    <header>
      <button onClick={handleMenuClick}>
        Menu
      </button>
    </header>
  );
}
```

## 🔒 **Security Features**

- **Token Management**: Automatic token inclusion in requests
- **401 Handling**: Automatic logout on authentication failure
- **Local Storage**: Secure token storage
- **Error Handling**: Comprehensive error management

## 📊 **Performance Optimizations**

- **Selective Rendering**: Components only re-render when relevant state changes
- **Memoized Selectors**: Efficient state access with custom hooks
- **Async Thunks**: Optimized async operations
- **Batch Updates**: Redux Toolkit's built-in performance optimizations

## 🧪 **Testing**

The Redux setup is designed to be easily testable:

```tsx
import { renderWithProviders } from '../test-utils';
import { store } from '../store';

// Test with Redux store
const wrapper = ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

// Test specific slices
const mockStore = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    ui: uiReducer,
  },
  preloadedState: {
    // your test state
  },
});
```

## 🚀 **Next Steps**

1. **Install Dependencies**: Run `npm install @reduxjs/toolkit react-redux`
2. **Update Layout**: Wrap your app with the Redux Provider
3. **Start Using**: Begin using the custom hooks in your components
4. **Customize**: Modify slices and services based on your specific needs

## 📚 **Additional Resources**

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
- [Redux Toolkit Best Practices](https://redux-toolkit.js.org/usage/usage-guide)

---

**Happy State Managing! 🎉**
