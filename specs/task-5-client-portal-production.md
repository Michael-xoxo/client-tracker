# SPEC: Task 2.5 - Public Client Portal View & Production Hardening

## GOAL
Implement a public, read-only endpoint for clients, a clean view-only Client Portal interface in React accessible via shareable link/parameter, and production-harden the app with static asset serving and unified build scripts.

## ACCEPTANCE CRITERIA
1. Backend Public Route (`controllers/projectController.js` & `routes/projectRoutes.js`):
   - `GET /api/projects/portal/:id`: Unprotected public endpoint.
   - Validates `id` format using `mongoose.Types.ObjectId.isValid` (returns 404 on invalid).
   - Returns 200 with sanitized project data: `{ _id, title, clientName, status, milestones: [{ _id, title, completed, dueDate }] }`.
   - Never exposes owner user ID or internal sensitive fields.
2. Frontend Shareable Client Portal View (`client/src/components/ClientPortal.jsx`):
   - Accessible when visiting `?portal=<id>` or via a "Share Portal Link" button on the Contractor Dashboard that copies the URL.
   - Fetches `GET /api/projects/portal/:id` without `Authorization` header.
   - Renders a clean client-facing status card:
     - Project title, client name, and status badge.
     - Dynamic progress bar showing calculated completion percentage.
     - Milestone checklist with disabled checkboxes (read-only) showing completed vs. pending tasks.
   - Shows a clean "Back to Login" or home button.
3. Production Hardening (`server.js` & `package.json`):
   - In `NODE_ENV === 'production'`, `server.js` serves static files from `path.join(__dirname, 'client/dist')`.
   - Wildcard route `app.get('/{*splat}', ...)` returns `client/dist/index.html` for client-side routing.
   - Root `package.json` contains:
     - `"build": "npm install && cd client && npm install --include=dev && npm run build"`
     - `"start": "node server.js"`
4. Linter/Type checks pass with 0 errors.

## CONSTRAINTS
- Strict file scope: Update `server.js`, `routes/projectRoutes.js`, `controllers/projectController.js`, add `client/src/components/ClientPortal.jsx` and styling, update `client/src/App.jsx`.
- Public portal endpoint must remain read-only; no mutation operations allowed.

## STOPPING CONDITIONS
- Stop if production build script fails to generate `client/dist`.
- Stop if public portal endpoint leaks owner credentials.

## BLAST RADIUS
MEDIUM (Touches production server configuration and mounts an unauthenticated read route).

## VERIFICATION STEPS
1. Verify `GET /api/projects/portal/:validId` returns 200 with sanitized payload.
2. Verify `GET /api/projects/portal/:invalidId` returns 404 without crashing.
3. In browser / headless test harness:
   - Contractor clicks "Copy Portal Link" for a project.
   - Unauthenticated browser navigates to the portal URL (`?portal=<id>`).
   - Portal renders project title, progress bar, and read-only milestone checklist without requiring login.
4. Run root `npm run build` and verify `client/dist` is compiled successfully.