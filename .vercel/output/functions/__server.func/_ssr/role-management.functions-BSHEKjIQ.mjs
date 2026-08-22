import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, B as enumType, D as arrayType } from "../_libs/zod.mjs";
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
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
const MANAGEABLE_ROLES = ["org_admin", "branch_admin", "hr", "finance", "manager", "employee"];
async function revokeSessionsForRoleChange(admin, targetUserId) {
  try {
    const {
      data
    } = await admin.rpc("revoke_user_sessions", {
      _user_id: targetUserId
    });
    return Number(data ?? 0);
  } catch {
    return 0;
  }
}
async function assertOrgAdmin(supabase, userId) {
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No organization");
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const has = (roles ?? []).some((r) => r.role === "org_admin" || r.role === "super_admin");
  if (!has) throw new Error("Not authorized — Org Admin required");
  return profile.tenant_id;
}
const listTenantMembers_createServerFn_handler = createServerRpc({
  id: "71f61232156b706f6a2749a4a767f5e5738919c2cbaa8365e943a64dc8cb1a18",
  name: "listTenantMembers",
  filename: "src/lib/role-management.functions.ts"
}, (opts) => listTenantMembers.__executeServer(opts));
const listTenantMembers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listTenantMembers_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await assertOrgAdmin(supabase, userId);
  const admin = await loadAdmin();
  const {
    data: emps
  } = await admin.from("employees").select("id,user_id,first_name,last_name,email,job_title,branch_id,status").eq("tenant_id", tenantId).order("first_name", {
    ascending: true
  });
  const userIds = (emps ?? []).map((e) => e.user_id).filter(Boolean);
  let rolesByUser = {};
  let scopeByUser = {};
  if (userIds.length > 0) {
    const {
      data: rls
    } = await admin.from("user_roles").select("user_id,role").in("user_id", userIds);
    (rls ?? []).forEach((r) => {
      (rolesByUser[r.user_id] ||= []).push(r.role);
    });
    const {
      data: scs
    } = await admin.from("role_scope").select("user_id,branch_id,country_code").in("user_id", userIds);
    (scs ?? []).forEach((s) => {
      (scopeByUser[s.user_id] ||= []).push({
        branch_id: s.branch_id,
        country_code: s.country_code
      });
    });
  }
  const {
    data: branches
  } = await admin.from("tenant_branches").select("id,name,code").eq("tenant_id", tenantId).order("name");
  return {
    members: (emps ?? []).map((e) => ({
      ...e,
      roles: e.user_id ? rolesByUser[e.user_id] ?? [] : [],
      scopes: e.user_id ? scopeByUser[e.user_id] ?? [] : []
    })),
    branches: branches ?? []
  };
});
const grantSchema = objectType({
  user_id: stringType().uuid(),
  role: enumType(MANAGEABLE_ROLES),
  branch_id: stringType().uuid().optional().nullable()
});
const grantRole_createServerFn_handler = createServerRpc({
  id: "9f77007c354294e7938955a054e3c391090cc3e1bdf312ff31b8341e18edd06a",
  name: "grantRole",
  filename: "src/lib/role-management.functions.ts"
}, (opts) => grantRole.__executeServer(opts));
const grantRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => grantSchema.parse(d)).handler(grantRole_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await assertOrgAdmin(supabase, userId);
  const admin = await loadAdmin();
  const {
    data: targetProfile
  } = await admin.from("profiles").select("tenant_id").eq("id", data.user_id).maybeSingle();
  if (!targetProfile || targetProfile.tenant_id !== tenantId) {
    throw new Error("User is not a member of your organization");
  }
  if (data.branch_id) {
    const {
      data: br
    } = await admin.from("tenant_branches").select("id,tenant_id").eq("id", data.branch_id).maybeSingle();
    if (!br || br.tenant_id !== tenantId) throw new Error("Branch not in your organization");
  }
  const {
    error: rErr
  } = await admin.from("user_roles").upsert({
    user_id: data.user_id,
    role: data.role,
    tenant_id: tenantId
  }, {
    onConflict: "user_id,role,tenant_id"
  });
  if (rErr) throw new Error(rErr.message);
  const scopedRoles = /* @__PURE__ */ new Set(["branch_admin", "hr", "finance", "manager"]);
  if (scopedRoles.has(data.role) && data.branch_id) {
    const {
      error: sErr
    } = await admin.from("role_scope").insert({
      user_id: data.user_id,
      tenant_id: tenantId,
      branch_id: data.branch_id
    });
    if (sErr && !sErr.message.includes("duplicate")) throw new Error(sErr.message);
  }
  const sessionsRevoked = await revokeSessionsForRoleChange(admin, data.user_id);
  return {
    ok: true,
    sessionsRevoked
  };
});
const revokeSchema = objectType({
  user_id: stringType().uuid(),
  role: enumType(MANAGEABLE_ROLES)
});
const revokeRole_createServerFn_handler = createServerRpc({
  id: "3f6b9b7bb13dc62b0bc0ef5e7709e8178d54fb985686229978eca3b2cb4d02e7",
  name: "revokeRole",
  filename: "src/lib/role-management.functions.ts"
}, (opts) => revokeRole.__executeServer(opts));
const revokeRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => revokeSchema.parse(d)).handler(revokeRole_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await assertOrgAdmin(supabase, userId);
  const admin = await loadAdmin();
  const {
    data: targetProfile
  } = await admin.from("profiles").select("tenant_id").eq("id", data.user_id).maybeSingle();
  if (!targetProfile || targetProfile.tenant_id !== tenantId) {
    throw new Error("User is not a member of your organization");
  }
  if (data.user_id === userId && data.role === "org_admin") {
    throw new Error("You cannot remove your own Org Admin role");
  }
  const {
    error
  } = await admin.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
  if (error) throw new Error(error.message);
  const sessionsRevoked = await revokeSessionsForRoleChange(admin, data.user_id);
  return {
    ok: true,
    sessionsRevoked
  };
});
const scopeSchema = objectType({
  user_id: stringType().uuid(),
  role: enumType(["branch_admin", "hr", "finance", "manager"]),
  branch_ids: arrayType(stringType().uuid()).max(50)
});
const setBranchScope_createServerFn_handler = createServerRpc({
  id: "cf973901b6711ff3340f683aed87dae58a28557a1cdbbf8e2a52a5e865e7d94a",
  name: "setBranchScope",
  filename: "src/lib/role-management.functions.ts"
}, (opts) => setBranchScope.__executeServer(opts));
const setBranchScope = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => scopeSchema.parse(d)).handler(setBranchScope_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await assertOrgAdmin(supabase, userId);
  const admin = await loadAdmin();
  await admin.from("role_scope").delete().eq("user_id", data.user_id).eq("tenant_id", tenantId).not("branch_id", "is", null);
  if (data.branch_ids.length > 0) {
    const {
      data: brs
    } = await admin.from("tenant_branches").select("id,tenant_id").in("id", data.branch_ids);
    const allValid = (brs ?? []).every((b) => b.tenant_id === tenantId);
    if (!allValid) throw new Error("One or more branches are not in your organization");
    const rows = data.branch_ids.map((bid) => ({
      user_id: data.user_id,
      tenant_id: tenantId,
      branch_id: bid
    }));
    const {
      error
    } = await admin.from("role_scope").insert(rows);
    if (error) throw new Error(error.message);
  }
  const sessionsRevoked = await revokeSessionsForRoleChange(admin, data.user_id);
  return {
    ok: true,
    sessionsRevoked
  };
});
export {
  grantRole_createServerFn_handler,
  listTenantMembers_createServerFn_handler,
  revokeRole_createServerFn_handler,
  setBranchScope_createServerFn_handler
};
