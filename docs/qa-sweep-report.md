# QA sweep report

Generated 2026-09-07T09:18:45.017Z against `http://localhost:8080`.

Produced by `scripts/qa-sweep.mjs`. Each row is one navigation as a signed-in
role. **chrome** is whether the sidebar rendered — a page without it has no
navigation at all. **landed** is filled in only when the gate redirected
elsewhere, which is expected for routes a role may not see.

## employee — `ella.acme@demo.hrppl.test`

122 routes visited · **2** without chrome · **1** with console errors · **0** non-2xx.

| route | status | chrome | heading | console errors |
|---|---|---|---|---|
| `/admin/feedback-templates` | 200 | **NO** | Home | 0 |
| `/org/roles` | 200 | **NO** | Home | 0 |
| `/settings/billing` | 200 | yes | Home | 2 |

<details><summary>Server fns called more than once per page load (122 loads)</summary>

| server fn | calls | per load |
|---|---|---|
| `getMyGateStatus` | 250 | 2.0 |
| `listNotifications` | 124 | 1.0 |
| `getMyMfaStatus` | 124 | 1.0 |
| `getMyOnboardingCompletion` | 124 | 1.0 |
| `listActingTenantOptions` | 124 | 1.0 |
| `getClockStatus` | 124 | 1.0 |

</details>

## org_admin — `alice.acme@demo.hrppl.test`

122 routes visited · **3** without chrome · **1** with console errors · **0** non-2xx.

| route | status | chrome | heading | console errors |
|---|---|---|---|---|
| `/admin/onboarding-packs` | 200 | **NO** | Onboarding & offboarding packs | 0 |
| `/org/invitations` | 200 | **NO** | Staff invitations | 0 |
| `/platform/tenants` | 200 | **NO** | Home | 0 |
| `/settings/billing` | 200 | yes | Billing & subscription | 2 |

<details><summary>Server fns called more than once per page load (122 loads)</summary>

| server fn | calls | per load |
|---|---|---|
| `getMyGateStatus` | 246 | 2.0 |

</details>

## super_admin — `sam.platform@demo.hrppl.test`

122 routes visited · **6** without chrome · **2** with console errors · **0** non-2xx.

| route | status | chrome | heading | console errors |
|---|---|---|---|---|
| `/admin/overtime-rates` | 200 | **NO** | Overtime & Penalty Rates | 2 |
| `/attendance` | 200 | **NO** | — | 0 |
| `/leave` | 200 | **NO** | — | 0 |
| `/onboarding` | 200 | **NO** | — | 0 |
| `/org/setup-guide` | 200 | **NO** | Setup guide | 0 |
| `/performance` | 200 | **NO** | — | 0 |
| `/settings/billing` | 200 | yes | Billing & subscription | 2 |

<details><summary>Server fns called more than once per page load (122 loads)</summary>

| server fn | calls | per load |
|---|---|---|
| `getMyGateStatus` | 248 | 2.0 |

</details>

## manager — `mia.acme@demo.hrppl.test`

122 routes visited · **1** without chrome · **4** with console errors · **0** non-2xx.

| route | status | chrome | heading | console errors |
|---|---|---|---|---|
| `/admin/overtime-rates` | 200 | **NO** | Home | 0 |
| `/org/documents` | 200 | yes | Documents & e-signature | 1 |
| `/org/documents/expiring` | 200 | yes | Documents & e-signature | 1 |
| `/org/documents/templates` | 200 | yes | Documents & e-signature | 1 |
| `/settings/billing` | 200 | yes | Home | 2 |

<details><summary>Server fns called more than once per page load (122 loads)</summary>

| server fn | calls | per load |
|---|---|---|
| `getMyGateStatus` | 246 | 2.0 |
| `listMyQuickAccess` | 124 | 1.0 |

</details>
