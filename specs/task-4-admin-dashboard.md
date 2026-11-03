# SPEC: Task 2.4 - Contractor Project Dashboard & Milestone Task Board

## GOAL
Build the contractor-facing dashboard in React enabling project creation, listing, selection, embedded milestone additions, atomic milestone completion toggles, and dynamic progress bar calculations.

## ACCEPTANCE CRITERIA
1. Create `client/src/components/ProjectDashboard.jsx` (and companion styling `ProjectDashboard.css`), rendered in `client/src/App.jsx` when authenticated.
2. Project Creation Form:
   - Inputs: `title` (required), `clientName` (required), `clientEmail` (required), `budget` (optional).
   - Submits `POST /api/projects` with `Bearer <token>` header.
   - Appends newly created project to local project list on HTTP 201 without requiring page reload.
3. Project Overview List:
   - Fetches `GET /api/projects` on mount.
   - Displays project cards/table showing: Title, Client Name, Client Email, Budget ($ formatted or N/A), Status badge, and an active "View / Manage" selector.
   - Includes a "Delete" button per project calling `DELETE /api/projects/:id`.
4. Milestone Task Board (for selected project):
   - Shows active project title, client email, and overall progress percentage bar:
     - 0% if no milestones exist.
     - `(completedMilestones / totalMilestones) * 100` dynamically calculated.
   - Milestone Ingestion: Form with `title` input submitting `POST /api/projects/:id/milestones`.
   - Milestone Checklist:
     - Checkbox next to each milestone reflecting `milestone.completed`.
     - Toggling fires `PATCH /api/projects/:id/milestones/:milestoneId` with `{ completed: !currentStatus }`.
     - Updates milestone state and progress bar immediately upon HTTP 200.
5. Error and loading states handled cleanly with accessible alert banners.

## CONSTRAINTS
- Strict frontend boundary: Modify only files in `client/src/components/`, `client/src/App.jsx`, and client CSS.
- Zero changes to backend files (`server.js`, `controllers/`, `routes/`, `models/`, `middleware/`).
- Use standard React hooks (`useState`, `useEffect`, `useMemo`); no external state management or component libraries.

## STOPPING CONDITIONS
- Stop if project or milestone endpoints return 401 or unexpected payload shapes.
- Stop if third-party styling frameworks or routing libraries are introduced.

## BLAST RADIUS
LOW (Confined to client components and state integration).

## VERIFICATION STEPS
1. Verify `npm run build` succeeds inside `/client`.
2. In browser / headless test harness:
   - Create Project "Website Redesign" for client "Acme Corp" -> verify 201 and card renders.
   - Add Milestone "Wireframes" -> verify milestone renders and progress shows 0%.
   - Add Milestone "Development" -> verify milestone renders and progress remains 0%.
   - Check the checkbox for "Wireframes" -> verify progress updates to 50%.
   - Check the checkbox for "Development" -> verify progress updates to 100%.
   - Delete Project -> verify project and board are removed from the DOM.