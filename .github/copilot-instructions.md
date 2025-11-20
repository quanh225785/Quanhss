# GitHub Copilot Instructions for Quanhss

## Project Overview
This is a full-stack application with a **Spring Boot (Java 21)** backend and a **React (Vite)** frontend.
- **Backend**: `backend/` - Spring Boot 3.2.2, MySQL, JPA, Spring Security.
- **Frontend**: `frontend/` - React 19, Vite, Axios, React Router.

## Backend (Spring Boot)

### Architecture & Patterns
- **Layered Architecture**: `Controller` -> `Service` -> `Repository`.
- **Response Format**: All APIs must return `ApiResponse<T>` wrapper.
  ```java
  @GetMapping
  ApiResponse<UserResponse> getUser() {
      return ApiResponse.<UserResponse>builder()
              .result(userService.getUser())
              .build();
  }
  ```
- **Dependency Injection**: Use Constructor Injection via Lombok.
  ```java
  @RequiredArgsConstructor
  @FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
  public class UserController {
      UserService userService; // Injected automatically
  }
  ```
- **DTOs**: Use `dto/request` and `dto/response` packages. Never expose Entities directly in Controllers.
- **Mapping**: Use **MapStruct** for Entity-DTO conversion.
- **Exception Handling**: Throw `AppException(ErrorCode.XYZ)`. `GlobalExceptionHandler` catches these and formats the `ApiResponse`.

### Key Libraries
- **Lombok**: Used extensively (`@Data`, `@Builder`, `@Slf4j`, `@FieldDefaults`).
- **Spring Security**: OAuth2 Resource Server for JWT validation.
- **Validation**: `jakarta.validation` annotations (`@Valid` in controllers).

### Database
- **MySQL**: Primary database.
- **JPA/Hibernate**: ORM. `ddl-auto: update` is enabled in dev.

## Frontend (React + Vite)

### Architecture & Patterns
- **Component Structure**: Functional components with Hooks.
- **Routing**: `react-router-dom` v7. Define routes in `App.jsx`.
- **API Calls**: Use the shared `api` axios instance in `frontend/src/utils/api.js`.
  - Base URL: Use `import.meta.env.VITE_API_BASE_URL` or the `apiBaseUrl` exported by `src/utils/api.js`.
  - Auth: Store JWT in `localStorage` key `'token'`. Use `setAuthToken(token)` from `src/utils/api.js` to attach the `Authorization` header to `api`.
  - Example: `api.post('/api/auth/token', {...})` or `api.get('/api/users/my-info')`.
- **Styling**: **Strictly follow shadcn/ui design principles**.
  - **Aesthetic**: Clean, monochrome (Zinc/Slate palette), minimal borders, no gradients, high whitespace.
  - **Components**: Use solid black/white buttons, simple inputs with focus rings, and rounded corners (`radius: 0.5rem`).
  - **Font**: Use `Inter` font.

### Key Libraries
- **Axios**: For HTTP requests.
- **React Icons**: Use `react-icons` (specifically `fi` (Feather) or `lu` (Lucide)) to match the clean shadcn aesthetic. **Do not use emojis**.

## Development Workflow

### Backend
- **Run**: `mvn spring-boot:run` or run `IdentityServiceApplication.java` in IDE.
- **Build**: `mvn clean install`.
- **Tests**: `mvn test`. Uses H2 and Testcontainers.

### Frontend
- **Run**: `npm run dev` (starts Vite server).
- **Build**: `npm run build`.
- **Lint**: `npm run lint`.

## Common Tasks
- **New API Endpoint**:
  1. Define `Request/Response` DTOs.
  2. Add method to `Service` interface and implementation.
  3. Add endpoint to `Controller` returning `ApiResponse`.
  4. Add `ErrorCode` if specific error handling is needed.
- **New Page**:
  1. Create component in `frontend/src/pages/`.
  2. Add route in `frontend/src/App.jsx`.
  3. Implement API calls using `axios`.
  - Prefer `import { api, setAuthToken } from '../utils/api'` and call `api.<method>(...)`.
  - If you need to include Authorization header after login, call `setAuthToken(token)`.
