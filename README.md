# 🚀 Senior Full Stack Engineer Case Study

## User Authentication Service

Welcome to the marta Senior Full Stack Engineer technical case study. This repository contains a boilerplate microservice architecture that you will use to implement a **User Authentication Service**.

---

## 📋 Overview

Your task is to build a fully functional user authentication service using the provided boilerplate. The service should handle user registration, authentication, and basic user management operations.

### Time Expectation
- **Estimated time:** 3-4 hours
- Focus on code quality over feature completeness

---

## 🎯 Requirements

### Core Features

#### 1. User Registration
- Create an endpoint to register new users
- Required fields: `email`, `password`, `firstName`, `lastName`
- Email must be unique and validated
- Password must meet security requirements (minimum 8 characters, at least one uppercase, one lowercase, and one number)

#### 2. User Authentication
- Implement a login endpoint that accepts `email` and `password`
- Return a JWT token upon successful authentication
- Implement proper error handling for invalid credentials

#### 3. User Profile
- Create an endpoint to retrieve the authenticated user's profile
- Create an endpoint to update the user's profile (firstName, lastName)
- Endpoints should be protected and require valid JWT token

#### 4. Password Management
- Implement the `PasswordManagerService` to securely hash passwords using scrypt
- Implement password comparison for authentication

---

## 🏗️ Architecture

The boilerplate follows a clean architecture pattern with:

```
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic layer
├── repositories/    # Data access layer
├── entities/        # TypeORM entities
├── lib/             # Shared utilities and types
└── events/          # Event handlers (optional)
```

### Tech Stack
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js with inversify-express-utils
- **Database:** PostgreSQL with TypeORM
- **DI Container:** Inversify
- **Testing:** Jest with Supertest

---

## 📝 Tasks Breakdown

### Task 1: User Entity
Complete the `User` entity in `src/entities/user.ts` with the following fields:
- `id` (UUID, auto-generated)
- `email` (string, unique)
- `password` (string, hashed)
- `firstName` (string)
- `lastName` (string)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Task 2: Password Manager Service
Implement the `PasswordManagerService` in `src/services/password-manager-service.ts`:
- `toHash(password: string)`: Hash a password with a random salt
- `compare(storedPassword: string, suppliedPassword: string)`: Compare a supplied password with a stored hash

### Task 3: User Repository
Implement the `UserRepository` in `src/repositories/user-repository.ts`:
- `findByEmail(email: string)`: Find a user by email
- `findById(id: string)`: Find a user by ID
- `create(userData: CreateUserDto)`: Create a new user
- `update(id: string, userData: UpdateUserDto)`: Update user data

### Task 4: User Service
Implement the `UserService` in `src/services/user-service.ts`:
- `register(userData: RegisterUserDto)`: Register a new user
- `authenticate(email: string, password: string)`: Authenticate user and return JWT
- `getProfile(userId: string)`: Get user profile
- `updateProfile(userId: string, data: UpdateProfileDto)`: Update user profile

### Task 5: User Controller
Implement the `UserController` in `src/controllers/user-controller.ts`:
- `POST /users/register` - Register a new user
- `POST /users/login` - Authenticate and get JWT token
- `GET /users/profile` - Get current user profile (protected)
- `PUT /users/profile` - Update current user profile (protected)

### Task 6: Authentication Middleware
Create a middleware to protect routes that require authentication:
- Validate JWT token from Authorization header
- Extract user information and attach to request

---

## 🔧 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Yarn package manager

### Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp env.example .env

# Start development server
yarn dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
PORT=9000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=case_study_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch
```

---

## ✅ Evaluation Criteria

Your submission will be evaluated based on:

### Code Quality (40%)
- Clean, readable, and maintainable code
- Proper TypeScript usage with appropriate types
- Consistent coding style (ESLint & Prettier)
- SOLID principles adherence

### Architecture (25%)
- Proper separation of concerns
- Correct use of dependency injection
- Repository pattern implementation
- Error handling strategy

### Security (20%)
- Secure password hashing implementation
- JWT token handling
- Input validation and sanitization
- Protection against common vulnerabilities

### Testing (15%)
- Unit tests for services
- Integration tests for API endpoints
- Edge case coverage

---

## 📦 Deliverables

1. Complete implementation of all required features
2. Unit tests for services (minimum 80% coverage)
3. Integration tests for API endpoints
4. Brief documentation of your design decisions (add to this README or create DESIGN.md)

---

## 🎁 Bonus Points

These are optional but will be considered favorably:

- [ ] Implement refresh token mechanism
- [ ] Add rate limiting for login attempts
- [ ] Implement password reset flow (endpoint structure only)
- [ ] Add request validation using class-validator
- [ ] Docker Compose setup for local development
- [ ] API documentation with Swagger/OpenAPI

---

## 📚 Helpful Resources

- [Inversify Documentation](https://inversify.io/)
- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Introduction](https://jwt.io/introduction)

---

## 🤝 Submission

1. Fork this repository
2. Create a new branch with your name: `feature/your-name`
3. Implement the required features
4. Push your changes and create a Pull Request
5. Include any notes or assumptions in your PR description

---

## ❓ Questions?

If you have any questions about the requirements or need clarification, please reach out to your hiring contact.

**Good luck! We're excited to see your solution.** 🎉

---

## 💭 Design Decisions and Known Issues

### Request Validation Strategy
I have implemented request payload validation using **Zod** after writing the internals of the app using TypeScript DTOs. This approach is functional but suboptimal.

**Decision postponed:** Choosing between Zod type inference throughout the stack vs. class-validator with DTOs. This decision depends on:
- **GraphQL adoption:** Makes the dilemma irrelevant if we use GraphQL
- **Client SDK implementation:** If we build an SDK, we'll want to use the same validation tool from client through controller layer

### CI/CD Implementation
I have scaffolded a basic CI pipeline using **GitHub Actions** (dockerizing the app in the process). The pipeline is functional but has room for improvement:

**Current limitations:**
1. **Test execution:** Database migrations need to run before tests, which currently forces tests to run serially (`--runInBand`). Running tests in parallel causes race conditions when creating the User table.
2. **Environment variables:** Secure environment variable configuration is needed for deployment flows. Not a priority yet since CI only verifies test coverage and builds (no secrets required).

### Input Sanitization
I did not implement additional input sanitization beyond validation. Since we're strictly using TypeORM repository methods, there's no SQL injection risk. This is a conscious decision, not an oversight.


---

## 💡 Future Enhancements

Beyond the bonus points listed above, here are additional improvements to consider:

1. **Advanced Query Layer**
   - Implement query files with filters, sorting, and pagination
   - Add ReadMappers and DataLoader for optimized data fetching

2. **Logging Infrastructure**
   - Introduce a proper logging service (requires knowledge of production environment and telemetry preferences)

3. **Enhanced JWT Security**
   - Implement ECC (Elliptic Curve Cryptography) for JWT signing in production environments

4. **Event-Driven Architecture**
   - Introduce an internal command-event bus to decompose services into smaller, more reusable components

5. **GraphQL Migration**
   - Evaluate GraphQL for API endpoints (decision depends on client requirements and schema complexity)
