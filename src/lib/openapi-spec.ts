/**
 * OpenAPI 3.1 specification for WorldPay HRMS Public API v1.
 *
 * Single source of truth for the public surface. Served at:
 *   GET /api/v1/openapi.json   (the spec)
 *   GET /api/v1/docs           (Swagger UI rendering this spec)
 */

const tagDescriptions: Record<string, string> = {
  Meta: "Health, identity, and discovery endpoints.",
  Auth: "OAuth 2.0, token introspection, and session endpoints.",
  Tenants: "Regional/Super Admin tenant lifecycle and subscription confirmation.",
  Config: "Per-tenant configuration: tax rules, holidays, leave types, OT, penalties, pay components.",
  Employees: "Employee master data.",
  Attendance: "Clock in/out, timesheets, and bulk device pushes.",
  Leave: "Leave requests, approvals, and balances.",
  Payroll: "Payroll runs, payslips, and bank-file generation.",
  Performance: "Goals, reviews, and appraisal cycles.",
  Expenses: "Expense claims and approvals.",
  Files: "Upload and download of binary attachments.",
  Jobs: "Async job status (bulk imports, payroll runs).",
  Webhooks: "Outbound event subscriptions and delivery logs.",
  SCIM: "SCIM 2.0 user/group provisioning for IdPs (Okta, Azure AD, Google).",
} as const;

const tags = Object.entries(tagDescriptions).map(([name, description]) => ({
  name,
  description,
}));

// ---------- Reusable components ----------

const securitySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "OAuth 2.0 access token or Personal Access Token (PAT).",
  },
  oauth2: {
    type: "oauth2",
    description: "OAuth 2.0 with Authorization Code + PKCE and Client Credentials grants.",
    flows: {
      authorizationCode: {
        authorizationUrl: "https://api.worldpayhrms.com/oauth/authorize",
        tokenUrl: "https://api.worldpayhrms.com/oauth/token",
        refreshUrl: "https://api.worldpayhrms.com/oauth/token",
        scopes: {
          "employees:read": "Read employee records",
          "employees:write": "Create/update employees",
          "attendance:read": "Read attendance",
          "attendance:write": "Record attendance",
          "leave:read": "Read leave",
          "leave:write": "Create leave requests",
          "leave:approve": "Approve/reject leave",
          "payroll:read": "Read payroll runs and payslips",
          "payroll:write": "Create/process payroll",
          "payroll:finalize": "Finalize payroll runs",
          "performance:read": "Read goals and reviews",
          "performance:write": "Create/update goals and reviews",
          "expenses:read": "Read expenses",
          "expenses:write": "Submit expenses",
          "files:read": "Download files",
          "files:write": "Upload files",
          "admin:config": "Manage tenant configuration",
          "admin:webhooks": "Manage outbound webhooks",
          "regional_admin": "Regional/Country Admin operations",
          "super_admin": "Platform-wide operations",
        },
      },
      clientCredentials: {
        tokenUrl: "https://api.worldpayhrms.com/oauth/token",
        scopes: {
          "employees:read": "Read employee records",
          "employees:write": "Create/update employees",
          "payroll:read": "Read payroll",
          "payroll:write": "Process payroll",
          "admin:config": "Manage tenant configuration",
          "admin:webhooks": "Manage outbound webhooks",
        },
      },
    },
  },
  apiKey: {
    type: "apiKey",
    in: "header",
    name: "X-Api-Key",
    description: "Tenant-scoped API key. Prefer OAuth where possible.",
  },
} as const;

// ---- shared parameters ----
const parameters = {
  Cursor: {
    name: "cursor",
    in: "query",
    schema: { type: "string" },
    description: "Opaque cursor returned by a previous page.",
  },
  Limit: {
    name: "limit",
    in: "query",
    schema: { type: "integer", minimum: 1, maximum: 200, default: 50 },
    description: "Maximum number of items to return.",
  },
  Fields: {
    name: "fields",
    in: "query",
    schema: { type: "string" },
    description: "Comma-separated list of fields to include (sparse fieldsets).",
  },
  Include: {
    name: "include",
    in: "query",
    schema: { type: "string" },
    description: "Comma-separated list of related resources to expand.",
  },
  IdempotencyKey: {
    name: "Idempotency-Key",
    in: "header",
    schema: { type: "string", format: "uuid" },
    description: "Client-generated UUID for safe retry of POST/PUT.",
  },
  IfMatch: {
    name: "If-Match",
    in: "header",
    schema: { type: "string" },
    description: "ETag of the resource version the client expects (optimistic concurrency).",
  },
  TenantId: {
    name: "X-Tenant-Id",
    in: "header",
    schema: { type: "string" },
    description: "Override tenant when the token is scoped to multiple tenants (Regional/Super admin).",
  },
} as const;

// ---- shared schemas ----
const schemas = {
  Error: {
    type: "object",
    required: ["code", "message"],
    properties: {
      code: { type: "string", example: "validation_error" },
      message: { type: "string" },
      details: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string" },
            issue: { type: "string" },
          },
        },
      },
      request_id: { type: "string", format: "uuid" },
    },
  },
  Page: {
    type: "object",
    required: ["data"],
    properties: {
      data: { type: "array", items: {} },
      next_cursor: { type: "string", nullable: true },
      has_more: { type: "boolean" },
    },
  },
  Money: {
    type: "object",
    required: ["amount", "currency"],
    properties: {
      amount: { type: "number", description: "Decimal amount (not minor units)." },
      currency: { type: "string", minLength: 3, maxLength: 3, example: "AED" },
    },
  },
  Country: {
    type: "object",
    required: ["code", "name", "currency"],
    properties: {
      code: { type: "string", minLength: 2, maxLength: 2, example: "AE" },
      name: { type: "string", example: "United Arab Emirates" },
      currency: { type: "string", minLength: 3, maxLength: 3, example: "AED" },
      region: { type: "string", nullable: true, example: "MENA" },
    },
  },
  Tenant: {
    type: "object",
    required: ["id", "name", "country_code", "status"],
    properties: {
      id: { type: "string", example: "ten_01HZX..." },
      name: { type: "string" },
      legal_name: { type: "string", nullable: true },
      country_code: { type: "string", minLength: 2, maxLength: 2 },
      base_currency: { type: "string", minLength: 3, maxLength: 3 },
      status: { type: "string", enum: ["pending", "active", "suspended", "cancelled"] },
      plan_id: { type: "string", nullable: true },
      billing_cycle: { type: "string", enum: ["monthly", "annual"], nullable: true },
      activated_at: { type: "string", format: "date-time", nullable: true },
      expires_at: { type: "string", format: "date-time", nullable: true },
      created_at: { type: "string", format: "date-time" },
    },
  },
  TenantCreate: {
    type: "object",
    required: ["name", "country_code"],
    properties: {
      name: { type: "string" },
      legal_name: { type: "string" },
      country_code: { type: "string", minLength: 2, maxLength: 2 },
      base_currency: { type: "string", minLength: 3, maxLength: 3 },
      org_admin_email: { type: "string", format: "email" },
    },
  },
  SubscriptionConfirmation: {
    type: "object",
    required: ["amount", "currency", "reference", "paid_on", "plan_id", "period_start", "period_end"],
    properties: {
      amount: { type: "number" },
      currency: { type: "string", minLength: 3, maxLength: 3 },
      reference: { type: "string", description: "Bank reference / invoice number." },
      paid_on: { type: "string", format: "date" },
      plan_id: { type: "string" },
      period_start: { type: "string", format: "date" },
      period_end: { type: "string", format: "date" },
      note: { type: "string" },
    },
  },
  Employee: {
    type: "object",
    required: ["id", "tenant_id", "first_name", "last_name", "email", "country_code", "status"],
    properties: {
      id: { type: "string" },
      tenant_id: { type: "string" },
      external_id: { type: "string", nullable: true },
      first_name: { type: "string" },
      last_name: { type: "string" },
      email: { type: "string", format: "email" },
      phone: { type: "string", nullable: true },
      country_code: { type: "string", minLength: 2, maxLength: 2 },
      department: { type: "string", nullable: true },
      job_title: { type: "string", nullable: true },
      manager_id: { type: "string", nullable: true },
      hire_date: { type: "string", format: "date", nullable: true },
      termination_date: { type: "string", format: "date", nullable: true },
      employment_type: {
        type: "string",
        enum: ["full_time", "part_time", "contract", "intern"],
        nullable: true,
      },
      base_salary: { $ref: "#/components/schemas/Money", nullable: true },
      status: { type: "string", enum: ["active", "on_leave", "terminated"] },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  },
  EmployeeCreate: {
    type: "object",
    required: ["first_name", "last_name", "email", "country_code"],
    properties: {
      external_id: { type: "string" },
      first_name: { type: "string" },
      last_name: { type: "string" },
      email: { type: "string", format: "email" },
      phone: { type: "string" },
      country_code: { type: "string", minLength: 2, maxLength: 2 },
      department: { type: "string" },
      job_title: { type: "string" },
      manager_id: { type: "string" },
      hire_date: { type: "string", format: "date" },
      employment_type: { type: "string", enum: ["full_time", "part_time", "contract", "intern"] },
      base_salary: { $ref: "#/components/schemas/Money" },
    },
  },
  AttendancePunch: {
    type: "object",
    required: ["employee_id", "type", "occurred_at"],
    properties: {
      employee_id: { type: "string" },
      type: { type: "string", enum: ["clock_in", "clock_out", "break_start", "break_end"] },
      occurred_at: { type: "string", format: "date-time" },
      source: { type: "string", enum: ["web", "mobile", "device", "api"], default: "api" },
      device_id: { type: "string", nullable: true },
      geo: {
        type: "object",
        properties: { lat: { type: "number" }, lng: { type: "number" } },
      },
    },
  },
  LeaveRequest: {
    type: "object",
    required: ["id", "employee_id", "leave_type_id", "start_date", "end_date", "status"],
    properties: {
      id: { type: "string" },
      employee_id: { type: "string" },
      leave_type_id: { type: "string" },
      start_date: { type: "string", format: "date" },
      end_date: { type: "string", format: "date" },
      days: { type: "number" },
      reason: { type: "string", nullable: true },
      status: { type: "string", enum: ["pending", "approved", "rejected", "cancelled"] },
      approver_id: { type: "string", nullable: true },
      decided_at: { type: "string", format: "date-time", nullable: true },
      created_at: { type: "string", format: "date-time" },
    },
  },
  LeaveBalance: {
    type: "object",
    properties: {
      employee_id: { type: "string" },
      leave_type_id: { type: "string" },
      entitlement: { type: "number" },
      taken: { type: "number" },
      pending: { type: "number" },
      remaining: { type: "number" },
      as_of: { type: "string", format: "date" },
    },
  },
  PayrollRun: {
    type: "object",
    required: ["id", "tenant_id", "period", "currency", "status"],
    properties: {
      id: { type: "string" },
      tenant_id: { type: "string" },
      period: { type: "string", example: "2026-05", description: "YYYY-MM." },
      country_code: { type: "string" },
      currency: { type: "string", minLength: 3, maxLength: 3 },
      status: {
        type: "string",
        enum: ["draft", "calculating", "calculated", "finalized", "paid", "failed"],
      },
      employee_count: { type: "integer" },
      gross_total: { type: "number" },
      net_total: { type: "number" },
      created_at: { type: "string", format: "date-time" },
      finalized_at: { type: "string", format: "date-time", nullable: true },
    },
  },
  Payslip: {
    type: "object",
    properties: {
      id: { type: "string" },
      payroll_run_id: { type: "string" },
      employee_id: { type: "string" },
      currency: { type: "string" },
      gross: { type: "number" },
      net: { type: "number" },
      tax: { type: "number" },
      deductions: { type: "number" },
      overtime: { type: "number" },
      penalties: { type: "number" },
      lines: {
        type: "array",
        items: {
          type: "object",
          properties: {
            component_code: { type: "string" },
            description: { type: "string" },
            amount: { type: "number" },
            kind: { type: "string", enum: ["earning", "deduction", "tax", "contribution"] },
          },
        },
      },
      pdf_url: { type: "string", format: "uri", nullable: true },
    },
  },
  TaxRule: {
    type: "object",
    properties: {
      id: { type: "string" },
      country_code: { type: "string" },
      name: { type: "string" },
      effective_from: { type: "string", format: "date" },
      effective_to: { type: "string", format: "date", nullable: true },
      brackets: {
        type: "array",
        items: {
          type: "object",
          properties: {
            from: { type: "number" },
            to: { type: "number", nullable: true },
            rate: { type: "number", description: "0–1 decimal (e.g. 0.15 = 15%)." },
            fixed: { type: "number", nullable: true },
          },
        },
      },
    },
  },
  Holiday: {
    type: "object",
    properties: {
      id: { type: "string" },
      country_code: { type: "string" },
      date: { type: "string", format: "date" },
      name: { type: "string" },
      paid: { type: "boolean" },
    },
  },
  LeaveType: {
    type: "object",
    properties: {
      id: { type: "string" },
      code: { type: "string", example: "ANNUAL" },
      name: { type: "string" },
      country_code: { type: "string" },
      accrual_per_year: { type: "number" },
      paid: { type: "boolean" },
      requires_attachment: { type: "boolean" },
      gender_restriction: { type: "string", enum: ["any", "male", "female"], default: "any" },
    },
  },
  OvertimeRate: {
    type: "object",
    properties: {
      id: { type: "string" },
      country_code: { type: "string" },
      kind: { type: "string", enum: ["weekday", "weekend", "holiday", "night"] },
      multiplier: { type: "number", example: 1.5 },
      min_minutes: { type: "integer", default: 0 },
      cap_minutes_per_day: { type: "integer", nullable: true },
    },
  },
  PenaltyRule: {
    type: "object",
    properties: {
      id: { type: "string" },
      country_code: { type: "string" },
      kind: { type: "string", enum: ["late", "absence", "early_out"] },
      amount: { type: "number", nullable: true },
      percent_of_daily: { type: "number", nullable: true },
      grace_minutes: { type: "integer", default: 0 },
    },
  },
  PayComponent: {
    type: "object",
    properties: {
      id: { type: "string" },
      code: { type: "string" },
      name: { type: "string" },
      kind: { type: "string", enum: ["earning", "deduction", "tax", "contribution"] },
      formula: { type: "string", description: "Expression evaluated per employee per run." },
      taxable: { type: "boolean" },
      country_code: { type: "string", nullable: true },
    },
  },
  Review: {
    type: "object",
    properties: {
      id: { type: "string" },
      employee_id: { type: "string" },
      cycle_id: { type: "string" },
      reviewer_id: { type: "string" },
      status: { type: "string", enum: ["draft", "submitted", "acknowledged"] },
      overall_rating: { type: "number", nullable: true },
      submitted_at: { type: "string", format: "date-time", nullable: true },
    },
  },
  Goal: {
    type: "object",
    properties: {
      id: { type: "string" },
      employee_id: { type: "string" },
      title: { type: "string" },
      description: { type: "string", nullable: true },
      weight: { type: "number" },
      target_date: { type: "string", format: "date", nullable: true },
      progress: { type: "number", minimum: 0, maximum: 100 },
      status: { type: "string", enum: ["active", "achieved", "missed", "cancelled"] },
    },
  },
  Expense: {
    type: "object",
    properties: {
      id: { type: "string" },
      employee_id: { type: "string" },
      category: { type: "string" },
      amount: { $ref: "#/components/schemas/Money" },
      incurred_on: { type: "string", format: "date" },
      receipt_file_id: { type: "string", nullable: true },
      status: { type: "string", enum: ["draft", "submitted", "approved", "rejected", "reimbursed"] },
    },
  },
  Job: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { type: "string", example: "employees.bulk_import" },
      status: { type: "string", enum: ["queued", "running", "succeeded", "failed"] },
      progress: { type: "number", minimum: 0, maximum: 100 },
      result_url: { type: "string", format: "uri", nullable: true },
      error: { type: "string", nullable: true },
      created_at: { type: "string", format: "date-time" },
      finished_at: { type: "string", format: "date-time", nullable: true },
    },
  },
  Webhook: {
    type: "object",
    required: ["url", "events"],
    properties: {
      id: { type: "string" },
      url: { type: "string", format: "uri" },
      events: { type: "array", items: { type: "string" }, example: ["payroll.run.completed", "payslip.published"] },
      active: { type: "boolean", default: true },
      secret: { type: "string", description: "Shown once on creation; used to compute HMAC signature." },
      created_at: { type: "string", format: "date-time" },
    },
  },
  WebhookDelivery: {
    type: "object",
    properties: {
      id: { type: "string" },
      webhook_id: { type: "string" },
      event: { type: "string" },
      status_code: { type: "integer", nullable: true },
      attempt: { type: "integer" },
      delivered: { type: "boolean" },
      next_retry_at: { type: "string", format: "date-time", nullable: true },
      created_at: { type: "string", format: "date-time" },
    },
  },
} as const;

// ---- shared responses ----
const responses = {
  Unauthorized: {
    description: "Missing or invalid credentials.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
  Forbidden: {
    description: "Token does not have the required scope.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
  NotFound: {
    description: "Resource not found.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
  ValidationError: {
    description: "Request validation failed.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
  RateLimited: {
    description: "Rate limit exceeded.",
    headers: {
      "X-RateLimit-Limit": { schema: { type: "integer" } },
      "X-RateLimit-Remaining": { schema: { type: "integer" } },
      "X-RateLimit-Reset": { schema: { type: "integer" }, description: "Unix epoch seconds." },
      "Retry-After": { schema: { type: "integer" } },
    },
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
} as const;

// ---------- Helpers to build paths ----------

type Op = Record<string, unknown>;
type Path = Record<string, Op>;

const json = (schemaRef: string) => ({
  "application/json": { schema: { $ref: `#/components/schemas/${schemaRef}` } },
});

const pageOf = (schemaRef: string) => ({
  "application/json": {
    schema: {
      allOf: [
        { $ref: "#/components/schemas/Page" },
        {
          type: "object",
          properties: {
            data: { type: "array", items: { $ref: `#/components/schemas/${schemaRef}` } },
          },
        },
      ],
    },
  },
});

const commonErrors = {
  "400": { $ref: "#/components/responses/ValidationError" },
  "401": { $ref: "#/components/responses/Unauthorized" },
  "403": { $ref: "#/components/responses/Forbidden" },
  "404": { $ref: "#/components/responses/NotFound" },
  "429": { $ref: "#/components/responses/RateLimited" },
};

const listParams = [
  { $ref: "#/components/parameters/Cursor" },
  { $ref: "#/components/parameters/Limit" },
  { $ref: "#/components/parameters/Fields" },
  { $ref: "#/components/parameters/Include" },
];

const writeParams = [
  { $ref: "#/components/parameters/IdempotencyKey" },
  { $ref: "#/components/parameters/TenantId" },
];

// ---------- Paths ----------

const paths: Path = {
  "/health": {
    get: {
      tags: ["Meta"],
      summary: "Service health",
      security: [],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "ok" },
                  version: { type: "string", example: "v1" },
                  time: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
    },
  },
  "/me": {
    get: {
      tags: ["Meta"],
      summary: "Current principal",
      responses: {
        "200": {
          description: "Token introspection.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  tenant_id: { type: "string", nullable: true },
                  user_id: { type: "string", nullable: true },
                  scopes: { type: "array", items: { type: "string" } },
                  country_scope: { type: "array", items: { type: "string" } },
                  role: { type: "string" },
                },
              },
            },
          },
        },
        ...commonErrors,
      },
    },
  },

  // ---- Tenants (Regional / Super admin) ----
  "/tenants": {
    get: {
      tags: ["Tenants"],
      summary: "List tenants in scope",
      parameters: [
        ...listParams,
        { name: "status", in: "query", schema: { type: "string", enum: ["pending", "active", "suspended", "cancelled"] } },
        { name: "country_code", in: "query", schema: { type: "string" } },
      ],
      security: [{ bearerAuth: ["regional_admin"] }, { bearerAuth: ["super_admin"] }],
      responses: { "200": { description: "OK", content: pageOf("Tenant") }, ...commonErrors },
    },
    post: {
      tags: ["Tenants"],
      summary: "Create a tenant (pending)",
      parameters: writeParams,
      security: [{ bearerAuth: ["regional_admin"] }, { bearerAuth: ["super_admin"] }],
      requestBody: { required: true, content: json("TenantCreate") },
      responses: { "201": { description: "Created", content: json("Tenant") }, ...commonErrors },
    },
  },
  "/tenants/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: {
      tags: ["Tenants"],
      summary: "Get tenant",
      responses: { "200": { description: "OK", content: json("Tenant") }, ...commonErrors },
    },
    patch: {
      tags: ["Tenants"],
      summary: "Update tenant status / plan",
      parameters: writeParams,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["pending", "active", "suspended", "cancelled"] },
                plan_id: { type: "string" },
                billing_cycle: { type: "string", enum: ["monthly", "annual"] },
                expires_at: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      responses: { "200": { description: "OK", content: json("Tenant") }, ...commonErrors },
    },
  },
  "/tenants/{id}/subscription-confirmations": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    post: {
      tags: ["Tenants"],
      summary: "Record an offline subscription payment (manual confirmation)",
      description:
        "Used by Regional Admins to confirm a tenant's subscription after receiving payment via bank transfer / cheque. Flips tenant to active and sets the billing period.",
      parameters: writeParams,
      security: [{ bearerAuth: ["regional_admin"] }, { bearerAuth: ["super_admin"] }],
      requestBody: { required: true, content: json("SubscriptionConfirmation") },
      responses: { "201": { description: "Recorded", content: json("Tenant") }, ...commonErrors },
    },
  },

  // ---- Config ----
  "/config/tax-rules": {
    get: { tags: ["Config"], summary: "List tax rules", parameters: listParams, responses: { "200": { description: "OK", content: pageOf("TaxRule") }, ...commonErrors } },
    post: { tags: ["Config"], summary: "Create tax rule", parameters: writeParams, security: [{ bearerAuth: ["admin:config"] }], requestBody: { required: true, content: json("TaxRule") }, responses: { "201": { description: "Created", content: json("TaxRule") }, ...commonErrors } },
  },
  "/config/holidays": {
    get: { tags: ["Config"], summary: "List public holidays", parameters: [...listParams, { name: "country_code", in: "query", schema: { type: "string" } }, { name: "year", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK", content: pageOf("Holiday") }, ...commonErrors } },
    post: { tags: ["Config"], summary: "Add holiday", parameters: writeParams, security: [{ bearerAuth: ["admin:config"] }], requestBody: { required: true, content: json("Holiday") }, responses: { "201": { description: "Created", content: json("Holiday") }, ...commonErrors } },
  },
  "/config/leave-types": {
    get: { tags: ["Config"], summary: "List leave types", parameters: listParams, responses: { "200": { description: "OK", content: pageOf("LeaveType") }, ...commonErrors } },
    post: { tags: ["Config"], summary: "Create leave type", parameters: writeParams, security: [{ bearerAuth: ["admin:config"] }], requestBody: { required: true, content: json("LeaveType") }, responses: { "201": { description: "Created", content: json("LeaveType") }, ...commonErrors } },
  },
  "/config/overtime-rates": {
    get: { tags: ["Config"], summary: "List overtime rate matrix", parameters: listParams, responses: { "200": { description: "OK", content: pageOf("OvertimeRate") }, ...commonErrors } },
    put: { tags: ["Config"], summary: "Replace overtime rate matrix for a country", parameters: writeParams, security: [{ bearerAuth: ["admin:config"] }], requestBody: { required: true, content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/OvertimeRate" } } } } }, responses: { "200": { description: "OK" }, ...commonErrors } },
  },
  "/config/penalties": {
    get: { tags: ["Config"], summary: "List penalty rules", parameters: listParams, responses: { "200": { description: "OK", content: pageOf("PenaltyRule") }, ...commonErrors } },
    put: { tags: ["Config"], summary: "Replace penalty rules for a country", parameters: writeParams, security: [{ bearerAuth: ["admin:config"] }], requestBody: { required: true, content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/PenaltyRule" } } } } }, responses: { "200": { description: "OK" }, ...commonErrors } },
  },
  "/config/pay-components": {
    get: { tags: ["Config"], summary: "List pay components", parameters: listParams, responses: { "200": { description: "OK", content: pageOf("PayComponent") }, ...commonErrors } },
    post: { tags: ["Config"], summary: "Create pay component", parameters: writeParams, security: [{ bearerAuth: ["admin:config"] }], requestBody: { required: true, content: json("PayComponent") }, responses: { "201": { description: "Created", content: json("PayComponent") }, ...commonErrors } },
  },

  // ---- Employees ----
  "/employees": {
    get: {
      tags: ["Employees"],
      summary: "List employees",
      parameters: [
        ...listParams,
        { name: "filter[status]", in: "query", schema: { type: "string" } },
        { name: "filter[department]", in: "query", schema: { type: "string" } },
        { name: "filter[country_code]", in: "query", schema: { type: "string" } },
      ],
      security: [{ bearerAuth: ["employees:read"] }],
      responses: { "200": { description: "OK", content: pageOf("Employee") }, ...commonErrors },
    },
    post: {
      tags: ["Employees"],
      summary: "Create employee",
      parameters: writeParams,
      security: [{ bearerAuth: ["employees:write"] }],
      requestBody: { required: true, content: json("EmployeeCreate") },
      responses: { "201": { description: "Created", content: json("Employee") }, ...commonErrors },
    },
  },
  "/employees/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: { tags: ["Employees"], summary: "Get employee", security: [{ bearerAuth: ["employees:read"] }], responses: { "200": { description: "OK", content: json("Employee") }, ...commonErrors } },
    patch: {
      tags: ["Employees"],
      summary: "Update employee",
      parameters: [...writeParams, { $ref: "#/components/parameters/IfMatch" }],
      security: [{ bearerAuth: ["employees:write"] }],
      requestBody: { required: true, content: json("EmployeeCreate") },
      responses: { "200": { description: "OK", content: json("Employee") }, ...commonErrors },
    },
    delete: { tags: ["Employees"], summary: "Terminate employee", parameters: writeParams, security: [{ bearerAuth: ["employees:write"] }], responses: { "204": { description: "Terminated" }, ...commonErrors } },
  },
  "/employees/bulk": {
    post: {
      tags: ["Employees"],
      summary: "Bulk import employees (async)",
      parameters: writeParams,
      security: [{ bearerAuth: ["employees:write"] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: { type: "string", format: "binary", description: "CSV file." },
                upsert_key: { type: "string", default: "external_id" },
              },
            },
          },
        },
      },
      responses: { "202": { description: "Job accepted", content: json("Job") }, ...commonErrors },
    },
  },

  // ---- Attendance ----
  "/attendance": {
    get: {
      tags: ["Attendance"],
      summary: "List attendance records",
      parameters: [...listParams, { name: "employee_id", in: "query", schema: { type: "string" } }, { name: "from", in: "query", schema: { type: "string", format: "date" } }, { name: "to", in: "query", schema: { type: "string", format: "date" } }],
      security: [{ bearerAuth: ["attendance:read"] }],
      responses: { "200": { description: "OK", content: pageOf("AttendancePunch") }, ...commonErrors },
    },
  },
  "/attendance/clock": {
    post: {
      tags: ["Attendance"],
      summary: "Record a single punch",
      parameters: writeParams,
      security: [{ bearerAuth: ["attendance:write"] }],
      requestBody: { required: true, content: json("AttendancePunch") },
      responses: { "201": { description: "Recorded", content: json("AttendancePunch") }, ...commonErrors },
    },
  },
  "/attendance/bulk": {
    post: {
      tags: ["Attendance"],
      summary: "Bulk push punches (biometric devices)",
      parameters: writeParams,
      security: [{ bearerAuth: ["attendance:write"] }, { apiKey: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/AttendancePunch" } } } } },
      responses: { "202": { description: "Accepted", content: json("Job") }, ...commonErrors },
    },
  },

  // ---- Leave ----
  "/leave-requests": {
    get: { tags: ["Leave"], summary: "List leave requests", parameters: [...listParams, { name: "employee_id", in: "query", schema: { type: "string" } }, { name: "status", in: "query", schema: { type: "string" } }], security: [{ bearerAuth: ["leave:read"] }], responses: { "200": { description: "OK", content: pageOf("LeaveRequest") }, ...commonErrors } },
    post: { tags: ["Leave"], summary: "Create leave request", parameters: writeParams, security: [{ bearerAuth: ["leave:write"] }], requestBody: { required: true, content: json("LeaveRequest") }, responses: { "201": { description: "Created", content: json("LeaveRequest") }, ...commonErrors } },
  },
  "/leave-requests/{id}/approve": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    post: { tags: ["Leave"], summary: "Approve leave request", parameters: writeParams, security: [{ bearerAuth: ["leave:approve"] }], responses: { "200": { description: "Approved", content: json("LeaveRequest") }, ...commonErrors } },
  },
  "/leave-requests/{id}/reject": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    post: {
      tags: ["Leave"], summary: "Reject leave request",
      parameters: writeParams, security: [{ bearerAuth: ["leave:approve"] }],
      requestBody: { content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string" } } } } } },
      responses: { "200": { description: "Rejected", content: json("LeaveRequest") }, ...commonErrors },
    },
  },
  "/leave-balances/{employee_id}": {
    parameters: [{ name: "employee_id", in: "path", required: true, schema: { type: "string" } }],
    get: { tags: ["Leave"], summary: "Get leave balances", security: [{ bearerAuth: ["leave:read"] }], responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/LeaveBalance" } } } } }, ...commonErrors } },
  },

  // ---- Payroll ----
  "/payroll-runs": {
    get: { tags: ["Payroll"], summary: "List payroll runs", parameters: listParams, security: [{ bearerAuth: ["payroll:read"] }], responses: { "200": { description: "OK", content: pageOf("PayrollRun") }, ...commonErrors } },
    post: {
      tags: ["Payroll"], summary: "Start a payroll run",
      parameters: writeParams, security: [{ bearerAuth: ["payroll:write"] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["period", "country_code"],
              properties: {
                period: { type: "string", example: "2026-05" },
                country_code: { type: "string" },
                employee_ids: { type: "array", items: { type: "string" }, description: "Omit to include all eligible employees." },
              },
            },
          },
        },
      },
      responses: { "202": { description: "Accepted", content: json("PayrollRun") }, ...commonErrors },
    },
  },
  "/payroll-runs/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: { tags: ["Payroll"], summary: "Get payroll run", security: [{ bearerAuth: ["payroll:read"] }], responses: { "200": { description: "OK", content: json("PayrollRun") }, ...commonErrors } },
  },
  "/payroll-runs/{id}/finalize": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    post: { tags: ["Payroll"], summary: "Finalize and publish payslips", parameters: writeParams, security: [{ bearerAuth: ["payroll:finalize"] }], responses: { "200": { description: "Finalized", content: json("PayrollRun") }, ...commonErrors } },
  },
  "/payroll-runs/{id}/bank-file": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: {
      tags: ["Payroll"], summary: "Generate bank payment file (SEPA/ACH/WPS/SWIFT)",
      parameters: [{ name: "format", in: "query", required: true, schema: { type: "string", enum: ["sepa", "ach", "wps", "swift"] } }],
      security: [{ bearerAuth: ["payroll:finalize"] }],
      responses: { "200": { description: "Signed download URL", content: { "application/json": { schema: { type: "object", properties: { url: { type: "string", format: "uri" }, expires_at: { type: "string", format: "date-time" } } } } } }, ...commonErrors },
    },
  },
  "/payslips/{employee_id}": {
    parameters: [{ name: "employee_id", in: "path", required: true, schema: { type: "string" } }],
    get: {
      tags: ["Payroll"], summary: "List payslips for an employee",
      parameters: [...listParams, { name: "period", in: "query", schema: { type: "string" } }],
      security: [{ bearerAuth: ["payroll:read"] }],
      responses: { "200": { description: "OK", content: pageOf("Payslip") }, ...commonErrors },
    },
  },

  // ---- Performance ----
  "/goals": {
    get: { tags: ["Performance"], summary: "List goals", parameters: [...listParams, { name: "employee_id", in: "query", schema: { type: "string" } }], security: [{ bearerAuth: ["performance:read"] }], responses: { "200": { description: "OK", content: pageOf("Goal") }, ...commonErrors } },
    post: { tags: ["Performance"], summary: "Create goal", parameters: writeParams, security: [{ bearerAuth: ["performance:write"] }], requestBody: { required: true, content: json("Goal") }, responses: { "201": { description: "Created", content: json("Goal") }, ...commonErrors } },
  },
  "/reviews": {
    get: { tags: ["Performance"], summary: "List reviews", parameters: listParams, security: [{ bearerAuth: ["performance:read"] }], responses: { "200": { description: "OK", content: pageOf("Review") }, ...commonErrors } },
    post: { tags: ["Performance"], summary: "Create review", parameters: writeParams, security: [{ bearerAuth: ["performance:write"] }], requestBody: { required: true, content: json("Review") }, responses: { "201": { description: "Created", content: json("Review") }, ...commonErrors } },
  },
  "/reviews/{id}/submit": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    post: { tags: ["Performance"], summary: "Submit a review", parameters: writeParams, security: [{ bearerAuth: ["performance:write"] }], responses: { "200": { description: "Submitted", content: json("Review") }, ...commonErrors } },
  },

  // ---- Expenses ----
  "/expenses": {
    get: { tags: ["Expenses"], summary: "List expenses", parameters: [...listParams, { name: "employee_id", in: "query", schema: { type: "string" } }, { name: "status", in: "query", schema: { type: "string" } }], security: [{ bearerAuth: ["expenses:read"] }], responses: { "200": { description: "OK", content: pageOf("Expense") }, ...commonErrors } },
    post: { tags: ["Expenses"], summary: "Submit expense", parameters: writeParams, security: [{ bearerAuth: ["expenses:write"] }], requestBody: { required: true, content: json("Expense") }, responses: { "201": { description: "Created", content: json("Expense") }, ...commonErrors } },
  },

  // ---- Files ----
  "/files": {
    post: {
      tags: ["Files"], summary: "Upload a file",
      parameters: writeParams, security: [{ bearerAuth: ["files:write"] }],
      requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { file: { type: "string", format: "binary" }, purpose: { type: "string", example: "receipt" } } } } } },
      responses: { "201": { description: "Uploaded", content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" }, url: { type: "string", format: "uri" } } } } } }, ...commonErrors },
    },
  },
  "/files/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: { tags: ["Files"], summary: "Download file (signed redirect)", security: [{ bearerAuth: ["files:read"] }], responses: { "302": { description: "Redirect to signed URL" }, ...commonErrors } },
  },

  // ---- Jobs ----
  "/jobs/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: { tags: ["Jobs"], summary: "Get async job status", responses: { "200": { description: "OK", content: json("Job") }, ...commonErrors } },
  },

  // ---- Webhooks ----
  "/webhooks": {
    get: { tags: ["Webhooks"], summary: "List webhook subscriptions", parameters: listParams, security: [{ bearerAuth: ["admin:webhooks"] }], responses: { "200": { description: "OK", content: pageOf("Webhook") }, ...commonErrors } },
    post: { tags: ["Webhooks"], summary: "Create webhook subscription", parameters: writeParams, security: [{ bearerAuth: ["admin:webhooks"] }], requestBody: { required: true, content: json("Webhook") }, responses: { "201": { description: "Created (secret returned once)", content: json("Webhook") }, ...commonErrors } },
  },
  "/webhooks/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    delete: { tags: ["Webhooks"], summary: "Delete subscription", security: [{ bearerAuth: ["admin:webhooks"] }], responses: { "204": { description: "Deleted" }, ...commonErrors } },
  },
  "/webhooks/{id}/test": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    post: { tags: ["Webhooks"], summary: "Send a test event", security: [{ bearerAuth: ["admin:webhooks"] }], responses: { "200": { description: "Delivered", content: json("WebhookDelivery") }, ...commonErrors } },
  },
  "/webhooks/{id}/deliveries": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: { tags: ["Webhooks"], summary: "List recent deliveries", parameters: listParams, security: [{ bearerAuth: ["admin:webhooks"] }], responses: { "200": { description: "OK", content: pageOf("WebhookDelivery") }, ...commonErrors } },
  },

  // ---- SCIM 2.0 ----
  "/scim/v2/Users": {
    get: { tags: ["SCIM"], summary: "SCIM list users", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" }, ...commonErrors } },
    post: { tags: ["SCIM"], summary: "SCIM create user", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/scim+json": { schema: { type: "object" } } } }, responses: { "201": { description: "Created" }, ...commonErrors } },
  },
};

// ---------- Webhook event catalog (OpenAPI 3.1 webhooks) ----------

const webhookEvent = (eventName: string, dataRef: string) => ({
  post: {
    summary: eventName,
    description: `Fired when \`${eventName}\` occurs. Signed with HMAC-SHA256 over the request body using the per-subscription secret. Verify the \`X-WorldPay-Signature\` header.`,
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["id", "type", "tenant_id", "data", "created_at"],
            properties: {
              id: { type: "string", example: "evt_01HZX..." },
              type: { type: "string", example: eventName },
              tenant_id: { type: "string" },
              created_at: { type: "string", format: "date-time" },
              data: { $ref: `#/components/schemas/${dataRef}` },
            },
          },
        },
      },
    },
    responses: {
      "2XX": { description: "Return any 2xx to acknowledge. Non-2xx triggers retries with exponential backoff." },
    },
  },
});

const webhooks = {
  "employee.created": webhookEvent("employee.created", "Employee"),
  "employee.updated": webhookEvent("employee.updated", "Employee"),
  "employee.terminated": webhookEvent("employee.terminated", "Employee"),
  "attendance.recorded": webhookEvent("attendance.recorded", "AttendancePunch"),
  "leave.requested": webhookEvent("leave.requested", "LeaveRequest"),
  "leave.approved": webhookEvent("leave.approved", "LeaveRequest"),
  "leave.rejected": webhookEvent("leave.rejected", "LeaveRequest"),
  "payroll.run.started": webhookEvent("payroll.run.started", "PayrollRun"),
  "payroll.run.completed": webhookEvent("payroll.run.completed", "PayrollRun"),
  "payroll.run.failed": webhookEvent("payroll.run.failed", "PayrollRun"),
  "payslip.published": webhookEvent("payslip.published", "Payslip"),
  "review.submitted": webhookEvent("review.submitted", "Review"),
  "tenant.activated": webhookEvent("tenant.activated", "Tenant"),
  "tenant.suspended": webhookEvent("tenant.suspended", "Tenant"),
  "subscription.confirmed": webhookEvent("subscription.confirmed", "Tenant"),
};

// ---------- Top-level document ----------

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "WorldPay HRMS API",
    version: "1.0.0",
    summary: "Global HRMS & Payroll Suite — Public API v1",
    description:
      "Plug-and-play REST + Webhooks API for the WorldPay HRMS suite. Every UI action has a corresponding API endpoint. All requests are scoped to a tenant derived from the bearer token. Idempotent writes (`Idempotency-Key`), cursor pagination, sparse fieldsets (`?fields=`), filtering (`?filter[...]=`) and resource expansion (`?include=`) are supported across all list endpoints.",
    contact: { name: "WorldPay HRMS API", url: "https://docs.worldpayhrms.com", email: "api@worldpayhrms.com" },
    license: { name: "Proprietary" },
  },
  servers: [
    { url: "https://api.worldpayhrms.com/api/v1", description: "Production" },
    { url: "https://sandbox.worldpayhrms.com/api/v1", description: "Sandbox" },
    { url: "/api/v1", description: "Current host" },
  ],
  tags,
  security: [{ bearerAuth: [] }, { oauth2: [] }, { apiKey: [] }],
  paths,
  webhooks,
  components: {
    securitySchemes,
    parameters,
    schemas,
    responses,
  },
} as const;

export type OpenApiSpec = typeof openApiSpec;
