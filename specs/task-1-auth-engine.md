# SPEC: Task 2.1 - User Entity, Password Hashing & JWT Authentication Guard

## GOAL
Implement the foundational user authentication engine, including User schema with bcrypt password hashing, registration and login endpoints returning JWTs, and an auth middleware guard for protected routes.

## ACCEPTANCE CRITERIA
1. Server boots via `server.js` listening on port 5000, connects to MongoDB via `process.env.MONGO_URI`, and includes CORS and JSON parsing.
2. User Schema (`models/User.js`):
   - `name`: String, required, trim
   - `email`: String, required, unique, trim, lowercase
   - `password`: String, required, minlength 6
   - `role`: String, enum: ['admin', 'client'], default: 'client'
   - `timestamps`: true
3. Pre-save Mongoose hook hashes password with `bcryptjs` (salt rounds: 10) only if modified.
4. Instance method `matchPassword(enteredPassword)` on User schema validates password with `bcrypt.compare`.
5. Auth Controller (`controllers/authController.js`):
   - `POST /api/auth/register`: Rejects existing email with 400; creates user, returns 201 with `{ _id, name, email, role, token }`.
   - `POST /api/auth/login`: Validates credentials; returns 200 with `{ _id, name, email, role, token }`, or 401 on invalid credentials.
6. Auth Middleware (`middleware/authMiddleware.js`):
   - Protects private routes by extracting `Bearer <token>` from `Authorization` header.
   - Decodes token, finds user by ID (excluding password field), and assigns to `req.user`.
   - Returns 401 if token is missing, invalid, or expired.
7. Verification route `GET /api/auth/me` protected by `authMiddleware` returns current user profile (status 200).
8. `package.json` contains `"dev": "nodemon server.js"` and `"start": "node server.js"`.

## CONSTRAINTS
- Strict file scope: Create only `server.js`, `models/User.js`, `controllers/authController.js`, `routes/authRoutes.js`, `middleware/authMiddleware.js`, and `.gitignore`.
- No frontend files.
- Return no plaintext passwords in JSON responses under any circumstance.

## STOPPING CONDITIONS
- Stop if database connection fails.
- Stop if JWT signing fails due to missing `JWT_SECRET`.
- Stop if Red Zone Rule 5 triggers without user clearance (Authentication logic and schemas).

## BLAST RADIUS
HIGH (Establishes application authentication boundary and core security infrastructure).

## ADVERSARIAL VERIFICATION STEPS
1. Register user via curl `POST /api/auth/register` -> verify 201 and token presence.
2. Attempt duplicate registration with same email -> verify 400 rejection.
3. Login via curl with correct credentials -> verify 200 and valid token.
4. Login via curl with wrong password -> verify 401 Unauthorized.
5. Access `GET /api/auth/me` with valid token header -> verify 200 and user payload (password field absent).
6. Access `GET /api/auth/me` with tampered/invalid token -> verify 401 Unauthorized.