class NoTenantScopeError extends Error {
  code = "NO_TENANT_SCOPE";
  constructor(message = "Your account is not attached to an organization.") {
    super(message);
    this.name = "NoTenantScopeError";
  }
}
function isNoTenantScope(e) {
  return e instanceof NoTenantScopeError || typeof e === "object" && e !== null && e.code === "NO_TENANT_SCOPE";
}
async function getTenantId(supabase, userId) {
  const { data } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  return data?.tenant_id ?? null;
}
async function requireTenantId(supabase, userId) {
  const tenantId = await getTenantId(supabase, userId);
  if (!tenantId) throw new NoTenantScopeError();
  return tenantId;
}
async function getMyEmployeeId(supabase, userId) {
  const { data } = await supabase.from("employees").select("id").eq("user_id", userId).maybeSingle();
  return data?.id ?? null;
}
export {
  getTenantId as a,
  getMyEmployeeId as g,
  isNoTenantScope as i,
  requireTenantId as r
};
