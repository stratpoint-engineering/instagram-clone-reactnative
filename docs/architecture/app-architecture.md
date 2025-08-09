# App Architecture

Learn how to design scalable, maintainable React Native applications using proven architectural patterns.

## Architecture Principles

### 1. Separation of Concerns

- **Presentation Layer**: UI components and screens
- **Business Logic Layer**: Custom hooks and services
- **Data Layer**: State management and API calls
- **Infrastructure Layer**: Utilities, constants, and configuration

### 2. Dependency Inversion

- High-level modules should not depend on low-level modules
- Both should depend on abstractions
- Use dependency injection for better testability

### 3. Single Responsibility

- Each component/function should have one reason to change
- Keep components focused on a single task
- Extract complex logic into custom hooks

## Recommended Architecture Patterns

### 1. Feature-Based Architecture

```
src/
├── features/                           # Feature modules
│   ├── auth/                           # Authentication feature
│   │   ├── components/                 # Auth-specific components
│   │   ├── hooks/                      # Auth-specific hooks
│   │   ├── services/                   # Auth API services
│   │   ├── types/                      # Auth type definitions
│   │   └── index.ts                    # Feature exports
│   ├── profile/                        # User profile feature
│   ├── feed/                           # Social feed feature
│   └── chat/                           # Chat feature
├── shared/                             # Shared across features
│   ├── components/                     # Reusable UI components
│   ├── hooks/                          # Common hooks
│   ├── services/                       # Shared services
│   ├── utils/                          # Utility functions
│   └── types/                          # Global types
└── app/                                # App-level configuration
    ├── store/                          # Global state
    ├── navigation/                     # Navigation setup
    └── providers/                      # App providers
```

### 2. Clean Architecture Implementation

```typescript
// Domain Layer - Business entities and rules
interface User {
  id: string;
  email: string;
  name: string;
}

interface UserRepository {
  getUser(id: string): Promise<User>;
  updateUser(user: User): Promise<User>;
}

// Application Layer - Use cases
class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<User> {
    return this.userRepository.getUser(userId);
  }
}

// Infrastructure Layer - External concerns
class ApiUserRepository implements UserRepository {
  async getUser(id: string): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }

  async updateUser(user: User): Promise<User> {
    const response = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
    return response.json();
  }
}

// Presentation Layer - React components
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <View>
      <Text>{user?.name}</Text>
      <Text>{user?.email}</Text>
    </View>
  );
}
```

## Custom Hooks Pattern

### Business Logic Hooks

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      setUser(user);
      await secureStorage.setItem('token', user.token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await secureStorage.removeItem('token');
  };

  return { user, isLoading, login, logout };
}

// hooks/useApi.ts
export function useApi<T>(endpoint: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.request(endpoint, options);
      setData(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, error, isLoading, refetch: execute };
}
```

### Data Fetching Hooks

```typescript
// hooks/useUser.ts
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId),
    enabled: !!userId,
  });
}

// hooks/useUsers.ts
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
  });
}

// hooks/useUpdateUser.ts
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateUser,
    onSuccess: updatedUser => {
      queryClient.setQueryData(['user', updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

## Service Layer Pattern

### API Service Structure

```typescript
// services/api/client.ts
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options?.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(process.env.EXPO_PUBLIC_API_URL!);

// services/userService.ts
export const userService = {
  async getUser(id: string): Promise<User> {
    return apiClient.request(`/users/${id}`);
  },

  async updateUser(user: Partial<User>): Promise<User> {
    return apiClient.request(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  async getUsers(filters?: UserFilters): Promise<User[]> {
    const params = new URLSearchParams(filters as any);
    return apiClient.request(`/users?${params}`);
  },
};
```

## State Management Architecture

### Zustand Store Pattern

```typescript
// store/slices/authSlice.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,

      // Actions
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
        apiClient.setToken(token);
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        apiClient.setToken('');
      },

      updateUser: updates => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const useAuth = () =>
  useAuthStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    login: state.login,
    logout: state.logout,
  }));

export const useUser = () => useAuthStore(state => state.user);
```

## Component Architecture

### Container/Presenter Pattern

```typescript
// containers/UserProfileContainer.tsx
export function UserProfileContainer({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();

  const handleUpdateUser = (updates: Partial<User>) => {
    updateUser.mutate({ ...user, ...updates });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;

  return (
    <UserProfilePresenter
      user={user}
      onUpdateUser={handleUpdateUser}
      isUpdating={updateUser.isPending}
      />
    );
  }

// components/UserProfilePresenter.tsx
  interface UserProfilePresenterProps {
    user: User;
    onUpdateUser: (updates: Partial<User>) => void;
    isUpdating: boolean;
  }

  export function UserProfilePresenter({
    user,
    onUpdateUser,
    isUpdating
  }: UserProfilePresenterProps) {
    return (
      <View className="p-4">
        <Avatar source={{ uri: user.avatar }} />
        <Text className="text-xl font-bold">{user.name}</Text>
        <Text className="text-gray-600">{user.email}</Text>

        <Button
          onPress={() => onUpdateUser({ name: 'New Name' })}
          disabled={isUpdating}
          >
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </Button>
      </View>
    );
  }
```

### Compound Component Pattern

```typescript
// components/Card/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <View className={cn('bg-white rounded-lg shadow-sm', className)}>
      {children}
    </View>
  );
}

function CardHeader({ children, className }: CardProps) {
  return (
    <View className={cn('p-4 border-b border-gray-200', className)}>
      {children}
    </View>
  );
}

function CardContent({ children, className }: CardProps) {
  return (
    <View className={cn('p-4', className)}>
      {children}
    </View>
  );
}

function CardFooter({ children, className }: CardProps) {
  return (
    <View className={cn('p-4 border-t border-gray-200', className)}>
      {children}
    </View>
  );
}

// Compound component
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export { Card };

// Usage
<Card>
  <Card.Header>
    <Text className="text-lg font-semibold">User Profile</Text>
  </Card.Header>
  <Card.Content>
    <Text>User information goes here</Text>
  </Card.Content>
  <Card.Footer>
    <Button>Edit Profile</Button>
  </Card.Footer>
</Card>
```

## Dependency Injection

### Service Container Pattern

```typescript
// lib/container.ts
class Container {
  private services = new Map<string, any>();

  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  resolve<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service;
  }
}

export const container = new Container();

// Register services
container.register('userService', userService);
container.register('authService', authService);

// Use in hooks
export function useUserService() {
  return container.resolve<typeof userService>('userService');
}
```

## Best Practices

### 1. Keep Components Pure

```typescript
// ❌ Bad - Side effects in component
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(setUser);
  }, [userId]);

  return <Text>{user?.name}</Text>;
}

// ✅ Good - Use custom hooks for side effects
function UserProfile({ userId }: { userId: string }) {
  const { user } = useUser(userId);
  return <Text>{user?.name}</Text>;
}
```

### 2. Favor Composition over Inheritance

```typescript
// ❌ Bad - Inheritance
class BaseButton extends Component {
  render() {
    return <Pressable>{this.props.children}</Pressable>;
  }
}

class PrimaryButton extends BaseButton {
  render() {
    return (
      <Pressable style={{ backgroundColor: 'blue' }}>
        {this.props.children}
      </Pressable>
    );
  }
}

// ✅ Good - Composition
function Button({ variant = 'primary', children, ...props }) {
  return (
    <Pressable
      className={cn(
        'px-4 py-2 rounded',
        variant === 'primary' && 'bg-blue-500',
        variant === 'secondary' && 'bg-gray-500'
      )}
      {...props}
      >
      {children}
    </Pressable>
  );
}
```

### 3. Use TypeScript Effectively

```typescript
// Define strict types
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// Use generic constraints
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// Use discriminated unions
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: any }
  | { status: 'error'; error: string };
```

## Next Steps

1. **Choose your architecture pattern** based on app complexity
2. **Set up your service layer** for API communication
3. **Implement custom hooks** for business logic
4. **Create reusable components** following design patterns
5. **Add proper TypeScript types** for better developer experience

---

**Pro Tip**: Start simple and refactor as your app grows. Don't over-architect early, but plan for scalability from the beginning.
