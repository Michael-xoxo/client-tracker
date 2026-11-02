# SYSTEM RULES & OPERATING GUARDRAILS

RULE 1 — NO CODE WITHOUT A SPEC
Do not write or alter code until Goal, Acceptance Criteria, Constraints, and Stopping Conditions are supplied in the prompt or spec. If missing, ask.

RULE 2 — ONE TASK, ONE SESSION
Complete and verify one discrete task before moving to the next. Do not anticipate or scaffold ahead unprompted.

RULE 3 — STRICT SCOPE CONFINEMENT
Modify only the files and functions explicitly authorized in the current prompt. If a task requires changes outside the named files, halt and request authorization.

RULE 4 — ZERO TOLERANCE FOR WEAKENED CHECKS
Never bypass, comment out, delete, or rewrite failing tests, linter rules, or type checks to make an operation pass. Fix the underlying code.

RULE 5 — RED ZONE HALT
Stop immediately and present options before touching authentication logic, external payment webhooks, database connection strings, or database schemas.

RULE 6 — EVIDENCE-BASED COMPLETION
Never declare a task "complete" with a conversational summary. Output:
1. Files modified
2. Diff summary
3. Verification command run + raw output

RULE 7 — SESSION LESSONS LOG
At session wrap-up, append to session-notes.md:
- One architectural decision made
- One friction point / bug encountered