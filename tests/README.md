# RBAC integration tests

End-to-end tests that verify row-level security policies for **super admin**,
**regional admin**, **org admin**, and **tenant (employee)** roles across:

- `tax_brackets` (country-scoped)
- `public_holidays` (country-scoped)
- `overtime_penalty_rates` (country-scoped)
- `leave_types` (tenant-scoped)

Each test signs in as a real Supabase user with the assigned role/scope and
attempts CRUD against the live RLS policies — verifying allow/deny behaviour
end-to-end (not just the SQL).

## Running

Requires service-role access (the tests create disposable users + tenants).

```bash
export SUPABASE_URL="..."
export SUPABASE_SERVICE_ROLE_KEY="..."
export SUPABASE_PUBLISHABLE_KEY="..."

bun run test
```

The suite is self-cleaning: all users, tenants, and tagged rows are removed in
`afterAll`. Each run uses a unique tag (`rbac_<timestamp>_<rand>`) so parallel
or interrupted runs do not collide.

## Adding new role checks

1. Add a new user in `tests/helpers/rbac-setup.ts → setupRBAC()`.
2. Add `describe(...)` blocks in `tests/rbac.test.ts` using `expectAllowed` /
   `expectDenied` helpers.
