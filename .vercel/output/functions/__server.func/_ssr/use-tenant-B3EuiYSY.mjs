import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { u as useAuth } from "./router-CLxirH5A.mjs";
function useMyTenantId() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-tenant-id", user?.id],
    enabled: !!user,
    staleTime: Infinity,
    queryFn: async () => {
      const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
      return profile?.tenant_id ?? null;
    }
  });
  return { tenantId: user ? data : null, isLoading: isLoading && !!user };
}
export {
  useMyTenantId as u
};
