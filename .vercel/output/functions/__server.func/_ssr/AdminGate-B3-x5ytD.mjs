import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth } from "./router-CLxirH5A.mjs";
import { A as ADMIN_LAYOUT_ROLES } from "./rbac-BWg_Nf1T.mjs";
const ADMIN_ROLES = ADMIN_LAYOUT_ROLES;
function AdminGate({ children, allow = ADMIN_ROLES }) {
  const { user, roles, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const allowed = rolesLoaded && roles.some((r) => allow.has(r));
  reactExports.useEffect(() => {
    if (!rolesLoaded) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (!allowed) navigate({ to: "/dashboard" });
  }, [rolesLoaded, user, allowed, navigate]);
  if (!rolesLoaded) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: "Loading…" });
  if (!user || !allowed) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
export {
  AdminGate as A
};
