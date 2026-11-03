# SPEC: Task 2.3 - Client Scaffold, AuthContext & Session Management

## GOAL
Scaffold a minimal Vite React frontend in `/client`, configure a development proxy to `http://localhost:5000`, implement an `AuthContext` managing JWT persistence in `localStorage`, and build Login/Registration views.

## ACCEPTANCE CRITERIA
1. React application initialized in `/client` using Vite (`react` template, pure JavaScript).
2. `client/vite.config.js` configures dev proxy forwarding `/api` to `http://localhost:5000`.
3. `client/src/context/AuthContext.jsx`:
   - Exposes `user`, `token`, `login(email, password)`, `register(name, email, password)`, `logout()`, and `isAuthenticated`.
   - On initial load, reads `token` and `user` from `localStorage` to preserve sessions.
   - Saves `token` and `user` to `localStorage` on successful login/registration.
   - Purges `localStorage` on logout or when receiving a 401 response.
4. `client/src/components/AuthForm.jsx`:
   - Provides a toggle between "Login" and "Register".
   - Register fields: `name`, `email`, `password`.
   - Login fields: `email`, `password`.
   - Displays inline server error messages on failed attempts without clearing user input.
   - Shows loading state ("Authenticating...") on the submit button while the request is in flight.
5. `client/src/App.jsx`:
   - If not authenticated: renders `AuthForm`.
   - If authenticated: renders a welcome header displaying user's name, email, role, a "Logout" button, and confirmation of active session via `GET /api/auth/me`.

## CONSTRAINTS
- Strict file scope: All modifications confined to `/client` directory and root `.gitignore`.
- Zero changes to backend files (`server.js`, `controllers/`, `routes/`, `models/`, `middleware/`).
- No external styling libraries or router dependencies; use standard React hooks and semantic CSS.

## STOPPING CONDITIONS
- Stop if port collision prevents Vite dev server from starting on 5173.
- Stop if requests to `/api/auth/*` fail due to proxy misconfiguration.

## BLAST RADIUS
LOW (Confined to frontend scaffolding in `/client`).

## VERIFICATION STEPS
1. Verify `npm run build` succeeds inside `/client`.
2. Register a new user through the `AuthForm` UI:
   - Confirm token is stored in `localStorage`.
   - Confirm view switches to authenticated dashboard showing user details.
3. Reload browser page:
   - Confirm session persists without requiring re-login.
4. Click "Logout":
   - Confirm `localStorage` is cleared and view returns to `AuthForm`.
5. Log back in with the registered credentials:
   - Confirm successful login and return to authenticated state.