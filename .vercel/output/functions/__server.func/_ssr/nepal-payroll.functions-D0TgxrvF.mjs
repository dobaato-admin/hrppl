import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, B as enumType, C as numberType, z as stringType, A as booleanType } from "../_libs/zod.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
const NP_SLABS_SINGLE = [{
  min: 0,
  max: 5e5,
  rate: 1,
  label: "Social Security Tax"
}, {
  min: 5e5,
  max: 7e5,
  rate: 10,
  label: "Slab 2"
}, {
  min: 7e5,
  max: 1e6,
  rate: 20,
  label: "Slab 3"
}, {
  min: 1e6,
  max: 2e6,
  rate: 30,
  label: "Slab 4"
}, {
  min: 2e6,
  max: 5e6,
  rate: 36,
  label: "Slab 5 (30% + 20% surcharge)"
}, {
  min: 5e6,
  max: null,
  rate: 39,
  label: "Slab 6 (30% + 30% surcharge)"
}];
const NP_SLABS_COUPLE = [{
  min: 0,
  max: 6e5,
  rate: 1,
  label: "Social Security Tax"
}, {
  min: 6e5,
  max: 8e5,
  rate: 10,
  label: "Slab 2"
}, {
  min: 8e5,
  max: 11e5,
  rate: 20,
  label: "Slab 3"
}, {
  min: 11e5,
  max: 2e6,
  rate: 30,
  label: "Slab 4"
}, {
  min: 2e6,
  max: 5e6,
  rate: 36,
  label: "Slab 5"
}, {
  min: 5e6,
  max: null,
  rate: 39,
  label: "Slab 6"
}];
const previewNepalSeed_createServerFn_handler = createServerRpc({
  id: "b052719e9ba11dde024d6d9130f4cb530f4a0ce8f5403bf3c485faebe1b074e0",
  name: "previewNepalSeed",
  filename: "src/lib/nepal-payroll.functions.ts"
}, (opts) => previewNepalSeed.__executeServer(opts));
const previewNepalSeed = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(previewNepalSeed_createServerFn_handler, async () => ({
  fiscalYear: "2081/82 BS (2024/25 AD)",
  slabsSingle: NP_SLABS_SINGLE,
  slabsCouple: NP_SLABS_COUPLE,
  ssf: {
    employee_percent: 11,
    employer_percent: 20
  },
  citDefault: 33.333,
  festivalDefault: "Ashwin"
}));
const runNepalPayrollWizard_createServerFn_handler = createServerRpc({
  id: "74088d011b9ea2e7447de1196e3efb9d38c89e3da4dc428780947c9e925570f6",
  name: "runNepalPayrollWizard",
  filename: "src/lib/nepal-payroll.functions.ts"
}, (opts) => runNepalPayrollWizard.__executeServer(opts));
const runNepalPayrollWizard = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  marital_default: enumType(["single", "couple"]),
  ssf_enrolled: booleanType(),
  cit_percent: numberType().min(0).max(100),
  festival_month: stringType().min(2).max(20),
  remittance_percent: numberType().min(0).max(100),
  pf_election: enumType(["optional", "mandatory", "off"])
}).parse(d)).handler(runNepalPayrollWizard_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No tenant");
  const {
    data: isAdmin
  } = await supabase.rpc("is_org_admin", {
    _user_id: userId,
    _tenant_id: prof.tenant_id
  });
  if (!isAdmin) throw new Error("Forbidden: org admin required");
  await supabase.from("np_payroll_wizard_runs").insert({
    tenant_id: prof.tenant_id,
    fiscal_year: "2081/82",
    marital_default: data.marital_default,
    ssf_enrolled: data.ssf_enrolled,
    cit_percent: data.cit_percent,
    festival_month: data.festival_month,
    remittance_percent: data.remittance_percent,
    pf_election: data.pf_election,
    inputs: data,
    run_by: userId
  });
  try {
    await supabase.rpc("seed_nepal_payroll", {
      _tenant: prof.tenant_id
    });
  } catch {
  }
  return {
    ok: true,
    seeded: {
      slabs: data.marital_default,
      ssf: data.ssf_enrolled,
      cit: data.cit_percent
    }
  };
});
export {
  previewNepalSeed_createServerFn_handler,
  runNepalPayrollWizard_createServerFn_handler
};
