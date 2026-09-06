> ⚠ **STALE — do not read this as the current state.**
>
> Generated 2026-08-24, before Wave 5. Everything it says predates the gating
> convergence, the nav extraction, the AU compliance pages and the security
> audit. It also predates the discovery that the sweep script was parsing the
> nav from a file it had moved out of, so a run between the W5 merge and
> 2026-09-03 would have covered one route and reported cleanly on it.
>
> Regenerate with `node scripts/qa-sweep.mjs` (needs a dev server and the
> seeded demo accounts; takes the better part of an hour).

# QA sweep report

Generated 2026-08-22T19:10:42.725Z against `http://localhost:8080`.

Produced by `scripts/qa-sweep.mjs`. Each row is one navigation as a signed-in
role. **chrome** is whether the sidebar rendered — a page without it has no
navigation at all. **landed** is filled in only when the gate redirected
elsewhere, which is expected for routes a role may not see.

## employee — `ella.acme@demo.hrppl.test`

102 routes visited · **3** without chrome · **4** with console errors · **0** non-2xx.

| route | status | chrome | heading | console errors |
|---|---|---|---|---|
| `/admin/holidays` | 200 | **NO** | Home | 0 |
| `/admin/requests` | 200 | **NO** | Home | 0 |
| `/settings/notifications` | 200 | **NO** | Notification settings | 0 |
| `/admin/kpi-kra` | 200 | yes | Home | 2 |
| `/help` | 200 | yes | Knowledge hub | 2 |
| `/me/signatures` | 200 | yes | Me | 3 |
| `/org/documents` | 200 | yes | Documents & e-signature | 2 |

<details><summary>Server fns called more than once per page load (102 loads)</summary>

| server fn | calls | per load |
|---|---|---|
| `getMyGateStatus` | 184 | 1.8 |

</details>

## org_admin — `alice.acme@demo.hrppl.test`

102 routes visited · **1** without chrome · **1** with console errors · **0** non-2xx.

| route | status | chrome | heading | console errors |
|---|---|---|---|---|
| `/admin/holidays` | 200 | **NO** | Public Holidays | 0 |
| `/admin/departments` | 200 | yes | Departments | 2 |

<details><summary>Server fns called more than once per page load (102 loads)</summary>

| server fn | calls | per load |
|---|---|---|
| `getMyGateStatus` | 174 | 1.7 |

</details>

## super_admin — `sam.platform@demo.hrppl.test`

102 routes visited · **6** without chrome · **2** with console errors · **0** non-2xx.

| route | status | chrome | heading | console errors |
|---|---|---|---|---|
| `/admin/overtime-rates` | 200 | **NO** | Overtime & Penalty Rates | 0 |
| `/attendance` | 200 | **NO** | — | 0 |
| `/leave` | 200 | **NO** | — | 0 |
| `/onboarding` | 200 | **NO** | — | 0 |
| `/org/timesheets` | 200 | **NO** | Timesheets | 0 |
| `/performance` | 200 | **NO** | — | 0 |
| `/org/documents` | 200 | yes | Documents & e-signature | 2 |
| `/settings/billing` | 200 | yes | Billing & subscription | 1 |

<details><summary>Server fns called more than once per page load (102 loads)</summary>

| server fn | calls | per load |
|---|---|---|
| `getMyGateStatus` | 194 | 1.9 |

</details>

---

**Totals:** 10 route/role combinations without chrome, 7 with console errors.
