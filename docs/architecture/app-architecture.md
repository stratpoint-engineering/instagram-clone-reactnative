# App Architecture

Learn how to design scalable, maintainable React Native applications using proven architectural patterns that work with any project structure.

> **Related Reading**: See [Project Structure](../setup/project-structure.md) for guidance on organizing your files and folders.

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

### 4. Progressive Enhancement

- Start with simple patterns and evolve as needed
- Refactor when complexity increases, not before
- Maintain consistency within each architectural layer

## Architecture Patterns by Project Phase

### **Phase 1: Flat Architecture** (Small Projects)

**Structure**: All code at root level (`components/`, `hooks/`, `lib/`)

**Patterns**:
- **Container/Presenter** for complex screens
- **Custom Hooks** for business logic
- **Service Layer** for API calls
- **Simple State Management** (Context or Zustand)

### **Phase 2: Domain Architecture** (Medium Projects)

**Structure**: Feature grouping (`features/auth/`, `features/profile/`)

**Patterns**:
- **Feature Modules** with clear boundaries
- **Shared Components** in dedicated folder
- **Domain Services** per feature
- **Centralized State** with feature slices

### **Phase 3: Feature-Based Architecture** (Large Projects)

**Structure**: Full feature isolation (`src/features/`, `src/shared/`)

**Patterns**:
- **Clean Architecture** principles
- **Feature Independence** with minimal coupling
- **Dependency Injection** for services
- **Advanced State Management** with normalized data

## Clean Architecture Implementation

### Domain Layer - Business Entities

```typescript
// Domain entities (business rules)
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  likes: number;
}

// Domain repositories (contracts)
interface UserRepository {
  getUser(id: string): Promise<User>;
  updateUser(user: User): Promise<User>;
  getUserPosts(userId: string): Promise<Post[]>;
}
```

### Application Layer - Use Cases

```typescript
// Use cases (application business rules)
class GetUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<{user: User; posts: Post[]}> {
    const [user, posts] = await Promise.all([
      this.userRepository.getUser(userId),
      this.userRepository.getUserPosts(userId)
    ]);

    return { user, posts };
  }
}

class UpdateUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, updates: Partial<User>): Promise<User> {
    const currentUser = await this.userRepository.getUser(userId);
    const updatedUser = { ...currentUser, ...updates };
    return this.userRepository.updateUser(updatedUser);
  }
}
```

### Infrastructure Layer - External Concerns

```typescript
// Infrastructure (external services)
class ApiUserRepository implements UserRepository {
  constructor(private apiClient: ApiClient) {}

  async getUser(id: string): Promise<User> {
    return this.apiClient.get(`/users/${id}`);
  }

  async updateUser(user: User): Promise<User> {
    return this.apiClient.put(`/users/${user.id}`, user);
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return this.apiClient.get(`/users/${userId}/posts`);
  }
}
```

### Presentation Layer - React Components

```typescript
// Presentation (UI components)
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useUserProfile(userId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <NotFound />;

  return (
    <View>
      <UserHeader user={data.user} />
      <PostList posts={data.posts} />
    </View>
  );
}

// Custom hook (application layer interface)
function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfileUseCase.execute(userId),
  });
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

## Architecture Evolution Strategy

### **Start Simple → Scale Smart**

```typescript
// Phase 1: Simple Hook (Flat Structure)
function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const user = await response.json();
    setUser(user);
  };

  return { user, login };
}

// Phase 2: Service Layer (Domain Structure)
function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUser(user);
  };

  return { user, login };
}

// Phase 3: Use Cases (Feature-Based Structure)
function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const user = await loginUseCase.execute(email, password);
    setUser(user);
  };

  return { user, login };
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

// Use discriminated unions for state
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: any }
  | { status: 'error'; error: string };
```

### 4. Progressive Refactoring

```typescript
// Start simple, refactor when needed
// Phase 1: Direct API calls
const user = await fetch('/api/user').then(r => r.json());

// Phase 2: Service layer
const user = await userService.getUser();

// Phase 3: Use cases with dependency injection
const user = await container.resolve('getUserUseCase').execute();
```

## Next Steps

1. **Assess your current project phase** using the [Project Structure guide](../setup/project-structure.md)
2. **Choose appropriate patterns** for your project size and complexity
3. **Implement progressive architecture** starting simple
4. **Plan for evolution** as your app grows
5. **Maintain consistency** within each architectural layer

---

**Pro Tip**: Architecture should serve your team and project, not the other way around. Start with what works and evolve when complexity demands it.
