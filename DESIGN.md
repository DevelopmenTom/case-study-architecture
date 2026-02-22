# Architecture Design Document

## Table of Contents

1. [Architectural Structure](#architectural-structure)
2. [Testing Strategy](#testing-strategy)
3. [Security Considerations](#security-considerations)
4. [CI/CD Implementation](#cicd-implementation)

---

## Architectural Structure

### Overview

This application follows a **Clean Architecture** pattern with clear separation of concerns (code broken into controllers, services, repositories and middleware). The architecture is designed to be maintainable, testable, and scalable.

### Technology Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with inversify-express-utils
- **Database**: PostgreSQL with TypeORM
- **Dependency Injection**: Inversify
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI with SwaggerUI
- **Security**: Helmet, CORS, JWT, scrypt password hashing, rate limiting

### Layer Architecture

```
┌─────────────────────────────────────────┐
│         Controllers (HTTP Layer)         │
│   - Handle HTTP requests/responses       │
│   - Apply middleware (auth, validation)  │
│   - Route definitions                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Services (Business Logic)        │
│   - Core business rules                  │
│   - Orchestration between repositories   │
│   - Data transformation                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Repositories (Data Access Layer)    │
│   - Database operations                  │
│   - Query composition                    │
│   - Entity management                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        Entities (Domain Models)          │
│   - TypeORM entities                     │
│   - Database schema definitions          │
└─────────────────────────────────────────┘
```

### Dependency Injection

The application uses **Inversify** for dependency injection, providing:

- **Loose coupling**: Components depend on interfaces, not implementations
- **Testability**: Easy to mock dependencies in unit tests
- **Maintainability**: Clear dependency graphs
- **Flexibility**: Swap implementations without changing consumers

**DI Container Configuration** (`inversify.config.ts`):
```typescript
diContainer.bind<AuthService>(DISymbols.AuthService).to(AuthServiceImpl);
diContainer.bind<UserService>(DISymbols.UserService).to(UserServiceImpl);
diContainer.bind<PasswordManagerService>(DISymbols.PasswordManagerService).to(PasswordManagerServiceImpl);
diContainer.bind<UserRepository>(DISymbols.UserRepository).to(UserRepositoryImpl);
```

---

## Testing Strategy

### Test Pyramid Approach

The application follows a comprehensive testing strategy with clear separation between unit and integration tests:

```
        /\
       /  \          E2E Tests (Future)
      /────\
     /  🔼  \        Integration Tests (~40%)
    /────────\
   /    🔼    \      Unit Tests (~60%)
  /────────────\
```

### Unit Tests

**Location**: Files named `*.spec.ts`

**Configuration**: `jest.config.json`

**Purpose**: Test individual components in isolation with mocked dependencies

**Coverage Target**: 80% minimum

**Examples**:
- `password-manager-service.spec.ts`: Tests password hashing and comparison logic
- `user-service.spec.ts`: Tests business logic with mocked repositories
- `auth-service.spec.ts`: Tests JWT generation and verification
- `auth.middleware.spec.ts`: Tests authentication middleware logic

**Example Structure**:
```typescript
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordManager: jest.Mocked<PasswordManagerService>;

  beforeEach(() => {
    // Setup mocks
    mockUserRepository = createMockUserRepository();
    mockPasswordManager = createMockPasswordManager();
    userService = new UserServiceImpl(mockUserRepository, mockPasswordManager);
  });

  it('should register a new user', async () => {
    // Test implementation
  });
});
```

### Integration Tests

**Location**: Files named `*.int-spec.ts`

**Configuration**: `jest.int.config.json`

**Purpose**: Test multiple code units together, e.g a service along with a repository / 3rd part library

**Examples**:
- `user-controller.int-spec.ts`: End-to-end API testing
- `user-service.int-spec.ts`: Service integration with real database
- `user-repository.int-spec.ts`: Repository operations with PostgreSQL
- `auth-service.int-spec.ts`: Authentication flows

**Database Strategy**:
- Uses Docker Compose PostgreSQL instance
- **Current Limitation**: Tests run serially (`--runInBand`) due to migration race conditions

**Example Structure**:
```typescript
describe('UserController Integration Tests', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    await initializeDataSourceInContainer();
    dataSource = diContainer.get<DataSource>(DISymbols.DB);
  });

  it('should register a new user', async () => {
    const response = await request(baseUrl)
      .post('/users/register')
      .send(userData);

    expect(response.status).toBe(201);
  });
});
```

### Code Quality Tools

**Pre-commit Hooks** (Husky):
- ESLint for code quality
- Prettier for code formatting
- Lint-staged for changed files only

**Commit Message Validation**:
- Commitlint with conventional commits

---

## Security Considerations

### 1. Authentication & Authorization

**JWT-Based Authentication**:
- Tokens signed with HS256 (HMAC-SHA256)
- Configurable expiration (`JWT_EXPIRES_IN`)
- Bearer token format in Authorization header
- Token payload includes `userId` and `role`

**Future Enhancement**:
- Consider ECC (Elliptic Curve Cryptography) for production JWT signing
- Implement refresh token mechanism

**Authorization Middleware** (`auth.middleware.ts`):
- Role-based access control (RBAC)
- Admin users: Full access
- Regular users: Can only access their own resources
- Validates `userId` in request body matches token

### 2. Password Security

**Hashing Algorithm**: scrypt (Node.js crypto module)
- **Rationale**: Memory-hard algorithm resistant to hardware attacks
- **Salt**: 32-byte random salt per password
- **Hash Length**: 64 bytes
- **Format**: `{salt}.{hash}` (both hex-encoded)

### 3. Input Validation

**Validation Framework**: `class-validator` with `class-transformer`

**Validation Middleware** (`validate-request.middleware.ts`):
- Automatic DTO validation on all endpoints
- Returns 400 with detailed error messages
- Prevents invalid data from reaching business logic

**Example DTOs**:
- `RegisterUserDto`: Email format, password strength, name validation
- `LoginUserDto`: Required fields validation
- `UpdateProfileDto`: Optional field validation

**SQL Injection Prevention**:
- TypeORM parameterized queries (automatic)
- No raw SQL queries used
- Repository pattern abstracts query construction

### 4. Rate Limiting

**Implementation** (`rate-limit.middleware.ts`):
- **Window**: 2 minutes
- **Limit**: 20 requests per IP
- **Applied to**: Registration and login endpoints
- **Response**: 429 Too Many Requests with generic message

**Security Rationale**:
- Prevents brute force attacks
- Mitigates credential stuffing
- Reduces DDoS impact
- Headers disabled to avoid information leakage

### 5. HTTP Security Headers

**Helmet.js Integration**:
- Content Security Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security (HSTS)
- X-XSS-Protection
- Referrer-Policy

### 6. CORS Configuration

**Current Implementation**: Permissive (all origins)

**Production Recommendation**:
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

### 7. Error Handling

**Global Error Handler** (`error-handler.middleware.ts`):
- Catches all unhandled errors
- Prevents stack trace leakage in production
- Logs errors for monitoring

**Secure Error Messages**:
- Generic messages to clients ("Unauthorized", "Validation failed")
- No sensitive data in error responses

### 8. Environment Variables

**Sensitive Configuration** (`.env`):
- `JWT_SECRET`: Random, high-entropy secret
- `DATABASE_PASSWORD`: Strong database credentials
- Never committed to version control (`.gitignore`)

**CI/CD Secrets Management**:
- GitHub Actions secrets for CI pipeline
- Future: AWS Systems Manager Parameter Store for production

### 9. Known Limitations & Future Improvements

**Input Sanitization**:
- Current: Validation only, no additional sanitization
- Rationale: TypeORM parameterized queries prevent SQL injection

**Session Management**:
- Current: Stateless JWT (no revocation)
- Future: Implement refresh tokens with Redis-backed blacklist

**Audit Logging**:
- Future: Log authentication events, failed login attempts
- Implement monitoring and alerting for suspicious activity

---

## CI/CD Implementation

### GitHub Actions Pipeline

**Configuration**: `.github/workflows/ci.yml`

**Trigger Events**:
- All branch pushes
- All pull requests

**Pipeline Stages**:

#### 1. Setup Phase
```yaml
- Checkout code
- Setup Node.js 20 with Yarn cache
- Install dependencies (frozen lockfile)
```

#### 2. Infrastructure Phase
```yaml
- Start PostgreSQL via Docker Compose
- Wait for database health check
- Database accessible on localhost:5433
```

#### 3. Testing Phase
```yaml
- Run unit tests (yarn test:unit --runInBand)
- Run integration tests (yarn test:int --runInBand)
- Environment variables injected via CI
```

**Current Limitation** (from README):
- Tests run serially (`--runInBand`) to avoid migration race conditions
- Race condition: Multiple test processes trying to create User table simultaneously
- Impact: Slower CI execution (~2-3 minutes)

**Future Optimization**:
- Implement per-process test databases
- Use transaction rollback strategy
- Or: Run migrations once before parallel test execution

#### 4. Build Phase
```yaml
- TypeScript compilation (yarn build)
- Verify production build succeeds
- Generates dist/ directory
```

#### 5. Cleanup Phase
```yaml
- Stop Docker Compose services (always runs)
- Remove volumes to ensure clean state
```

### Docker Strategy

#### Development Docker Compose
**File**: `docker-compose.yml`

**Services**:
1. **app**: Node.js application
   - Hot reload with volume mounts
   - TypeScript watch mode
   - Port 9000 exposed
   - Depends on PostgreSQL

2. **postgres**: PostgreSQL 16 Alpine
   - Port 5433 (external) → 5432 (internal)
   - Health checks for dependency management
   - Persistent volume for data

### Code Quality Gates

**Pre-commit Validation** (Husky):
```bash
# .husky/pre-commit
yarn lint-staged
```

**Lint-staged Configuration**:
- ESLint with auto-fix
- Prettier formatting
- Only on staged TypeScript files

**Commit Message Validation**:
- Commitlint with conventional commits
- Enforces: `feat:`, `fix:`, `refactor:`, `test:`, etc.
- Example: `feat: add user profile endpoint`

### Deployment Readiness

**Current State**: CI pipeline validates:
- ✅ Code compiles successfully
- ✅ All tests pass (unit + integration)
- ✅ No linting errors
- ✅ Docker build succeeds

**Not Yet Implemented**:
- ❌ Deployment to staging/production
- ❌ Database migrations in production
- ❌ Health check monitoring
- ❌ Rollback strategy

### Future CI/CD Enhancements

#### Short-term Improvements
1. **Parallel Test Execution**
   - Resolve migration race conditions
   - Reduce CI time by 50%

2. **Coverage Thresholds**
   - Fail build if coverage < 80%

3. **Security Scanning**
   - Dependency vulnerability scanning (npm audit, Snyk)
   - Docker image scanning (Trivy)

#### Medium-term Improvements
1. **CD Pipeline**
   - Automatic deployment to staging on develop branch and to production on master branch
   - Manual approval for production deployment
   - Blue-green deployment strategy

2. **Database Migrations**
   - Separate migration job before deployment
   - Versioned migrations with TypeORM
   - Rollback capability


#### Long-term Improvements
1. **Advanced Testing**
   - E2E tests with Cypress/Playwright

2. **Multi-environment Strategy**
   - Development → Staging → Production
   - Feature branch deployments

---

## Conclusion

This architecture provides a solid foundation for a production-ready user authentication service with:

- **Clean, maintainable code** following SOLID principles
- **Comprehensive testing** with unit and integration tests
- **Strong security posture** with defense-in-depth approach
- **Functional CI pipeline** validating code quality and correctness

Please consult README.md for further info
