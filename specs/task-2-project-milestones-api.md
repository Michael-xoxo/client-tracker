# SPEC: Task 2.2 - Relational Project & Embedded Milestone API

## GOAL
Implement the Project data model with embedded Milestones, foreign key reference to User, and protected CRUD endpoints enforcing user ownership and atomic milestone state updates.

## ACCEPTANCE CRITERIA
1. Project Schema (`models/Project.js`):
   - `user`: ObjectId, ref 'User', required (Project owner)
   - `title`: String, required, trim
   - `clientName`: String, required, trim
   - `clientEmail`: String, required, trim, lowercase
   - `budget`: Number, optional
   - `status`: String, enum: ['planning', 'in_progress', 'review', 'completed'], default: 'planning'
   - `milestones`: Array of sub-documents:
     - `_id`: ObjectId (auto-generated)
     - `title`: String, required, trim
     - `completed`: Boolean, default: false
     - `dueDate`: Date, optional
   - `timestamps`: true
2. Project Controller (`controllers/projectController.js`):
   - `POST /api/projects`: Creates a project assigned to `req.user._id`. Returns 201.
   - `GET /api/projects`: Returns 200 with an array of all projects owned by `req.user._id`, sorted by `createdAt` descending.
   - `GET /api/projects/:id`: Returns 200 with project details if owned by `req.user._id` (or if public client token); returns 404 if not found or unauthorized.
   - `POST /api/projects/:id/milestones`: Appends a new milestone sub-document to the project's `milestones` array. Returns 201 with updated project.
   - `PATCH /api/projects/:id/milestones/:milestoneId`: Toggles or sets `completed` boolean for the targeted milestone sub-document. Returns 200 with updated project.
   - `DELETE /api/projects/:id`: Deletes project and embedded milestones if owned by `req.user._id`. Returns 200.
3. Routes (`routes/projectRoutes.js`):
   - All routes are protected by `authMiddleware.protect`.
   - Mounted in `server.js` at `/api/projects`.

## CONSTRAINTS
- Strict file scope: Create `models/Project.js`, `controllers/projectController.js`, `routes/projectRoutes.js`. Modify only `server.js` to mount the router.
- No frontend files.
- Users must only be able to view, mutate, or delete projects they own.

## STOPPING CONDITIONS
- Stop if unhandled CastError occurs on invalid ObjectIds.
- Stop if cross-user data leakage occurs (User B accessing User A's project).

## BLAST RADIUS
MEDIUM (Expands database schemas and mounts new protected API paths).

## ADVERSARIAL VERIFICATION STEPS
1. Log in as User A -> obtain Token A.
2. Log in/Register User B -> obtain Token B.
3. Create Project 1 using Token A -> verify 201.
4. Attempt to access Project 1 using Token B -> verify 404 / Unauthorized rejection.
5. Add Milestone "Design System" to Project 1 using Token A -> verify 201 and milestone presence.
6. Toggle Milestone "Design System" `completed: true` via PATCH using Token A -> verify 200 and completed status.
7. Delete Project 1 using Token A -> verify 200 and confirm subsequent GET returns empty.