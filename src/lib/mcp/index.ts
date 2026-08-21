import { auth, defineMcp } from "@lovable.dev/mcp-js";

import listEmployeesTool from "./tools/list-employees";
import listPendingExpensesTool from "./tools/list-pending-expenses";
import listPendingLeaveTool from "./tools/list-pending-leave";
import whoamiTool from "./tools/whoami";

// The OAuth issuer MUST be the direct Supabase host — the published
// `.lovable.cloud` proxy form is rejected by mcp-js (RFC 8414 issuer mismatch).
// VITE_SUPABASE_PROJECT_ID is inlined by Vite at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "hrppl-mcp",
  title: "hrppl",
  version: "0.1.0",
  instructions:
    "Tools for hrppl (HRMS & Payroll). Callers act as the signed-in hrppl user; all data access is scoped by the user's organisation via row-level security. Use `whoami` to verify connectivity, then `list_employees`, `list_pending_leave_requests`, or `list_pending_expense_claims`.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoamiTool, listEmployeesTool, listPendingLeaveTool, listPendingExpensesTool],
});
