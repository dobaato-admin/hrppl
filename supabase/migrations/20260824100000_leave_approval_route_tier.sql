-- leave_approval_routes (20260625021426) was authored — full CRUD, a setup
-- wizard UI — but never consumed: approveLeaveRequest/rejectLeaveRequest
-- accepted any manager or org_admin in the tenant regardless of any
-- configured multi-tier chain. current_tier tracks how far a request has
-- progressed through its tenant's chain; tier 1 by default so a tenant with
-- no routes configured (or none active for a given leave type) behaves
-- exactly as before this migration — enforcement in leave.functions.ts only
-- activates once a tenant has actually configured a route.
ALTER TABLE public.leave_requests
  ADD COLUMN IF NOT EXISTS current_tier int NOT NULL DEFAULT 1;
