import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, g as getMyOrgStatus, n as createOrganization, o as markSetupStep, s as seedOrgDefaults, r as resetMyOrgSetup, q as updateOrganizationProfile, B as Button, h as cn, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, T as Textarea, t as requestRoleRefresh, v as requestOrgStatusRefresh } from "./router-CLxirH5A.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { P as Progress } from "./progress-0PXrlkmq.mjs";
import { g as getMyTrialInvitation, b as redeemMyTrialInvitation } from "./super-invitations.functions-Di58ork5.mjs";
import { i as inviteStaff } from "./staff-invitations.functions-CbtTdlva.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { L as LoaderCircle, ak as CircleCheck, a6 as Circle, as as ArrowRight } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./createSsrRpc-CRedQJGY.mjs";
import "./server-BOi2EjMN.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-guard-CkYFJuQL.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/lovable.dev__webhooks-js.mjs";
import "../_libs/react-email__render.mjs";
import "../_libs/prettier.mjs";
import "../_libs/html-to-text.mjs";
import "../_libs/selderee__plugin-htmlparser2.mjs";
import "../_libs/selderee.mjs";
import "../_libs/parseley.mjs";
import "../_libs/leac.mjs";
import "../_libs/peberminta.mjs";
import "../_libs/domhandler.mjs";
import "../_libs/domelementtype.mjs";
import "../_libs/htmlparser2.mjs";
import "../_libs/entities.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/dom-serializer.mjs";
import "./registry-Y5CZHtkF.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__button.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__heading.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "./send-internal.server-9cG3k97B.mjs";
import "./client.server-D5ro3rAQ.mjs";
import "./geofences.functions-C8KvPefL.mjs";
import "../_libs/zod.mjs";
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-progress.mjs";
const STEPS = [{
  key: "details",
  title: "Organization details",
  subtitle: "Name, country, contact"
}, {
  key: "branding",
  title: "Address & branding",
  subtitle: "Where you operate"
}, {
  key: "departments",
  title: "Departments",
  subtitle: "Starter org structure"
}, {
  key: "defaults",
  title: "Leave & payroll",
  subtitle: "Country-aware defaults"
}, {
  key: "invites",
  title: "Invite your team",
  subtitle: "Optional — do it later"
}];
function OrgSetupPage() {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const statusFn = useServerFn(getMyOrgStatus);
  const createFn = useServerFn(createOrganization);
  const markFn = useServerFn(markSetupStep);
  const seedFn = useServerFn(seedOrgDefaults);
  const inviteFn = useServerFn(inviteStaff);
  const resetFn = useServerFn(resetMyOrgSetup);
  const updateProfileFn = useServerFn(updateOrganizationProfile);
  const trialInviteFn = useServerFn(getMyTrialInvitation);
  const redeemTrialFn = useServerFn(redeemMyTrialInvitation);
  const [stepIdx, setStepIdx] = reactExports.useState(0);
  const [stepInitialized, setStepInitialized] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const [countries, setCountries] = reactExports.useState([]);
  const [stepError, setStepError] = reactExports.useState(null);
  const [deptOptions, setDeptOptions] = reactExports.useState([]);
  const newInviteRow = () => ({
    email: "",
    first_name: "",
    last_name: "",
    job_title: "",
    role: "employee",
    status: "idle"
  });
  const [invites, setInvites] = reactExports.useState([newInviteRow()]);
  reactExports.useEffect(() => {
    if (!authLoading && !user) navigate({
      to: "/auth"
    });
  }, [user, authLoading, navigate]);
  reactExports.useEffect(() => {
    supabase.from("countries").select("code,name,currency_code").order("name").then(({
      data
    }) => setCountries(data ?? []));
  }, []);
  const {
    data: status,
    isLoading
  } = useQuery({
    queryKey: ["my-org-status"],
    queryFn: () => statusFn({}),
    enabled: !!user
  });
  const {
    data: trialData
  } = useQuery({
    queryKey: ["my-trial-invitation"],
    queryFn: () => trialInviteFn({}),
    enabled: !!user,
    staleTime: 6e4
  });
  const trialInvitation = trialData?.invitation ?? null;
  async function refreshOrgStatus() {
    await qc.invalidateQueries({
      queryKey: ["my-org-status"]
    });
    requestOrgStatusRefresh();
  }
  const completedSteps = reactExports.useMemo(() => {
    const sp = status?.setupProgress;
    if (!sp) return 0;
    return STEPS.filter((s) => sp[`${s.key}_done`]).length;
  }, [status]);
  reactExports.useEffect(() => {
    if (stepInitialized) return;
    const sp = status?.setupProgress;
    if (!sp) return;
    const firstIncomplete = STEPS.findIndex((s) => !sp[`${s.key}_done`]);
    setStepIdx(firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete);
    setStepInitialized(true);
  }, [status, stepInitialized]);
  const [details, setDetails] = reactExports.useState({
    name: "",
    legal_name: "",
    primary_contact_name: "",
    owner_job_title: "",
    country_code: "",
    contact_email: "",
    contact_phone: "",
    registration_number: "",
    tax_id_number: ""
  });
  const [branding, setBranding] = reactExports.useState({
    address_line1: "",
    address_line2: "",
    city: "",
    region: "",
    postal_code: "",
    website: "",
    tagline: ""
  });
  const [departments, setDepartments] = reactExports.useState(["Operations", "Engineering", "People"]);
  const [defaults, setDefaults] = reactExports.useState({
    withLeaveTypes: true
  });
  reactExports.useEffect(() => {
    if (status?.tenantId && status?.setupProgress?.departments_done) {
      supabase.from("departments").select("name").eq("tenant_id", status.tenantId).order("name").then(({
        data
      }) => {
        const names = (data ?? []).map((row) => row.name).filter(Boolean);
        if (names.length) setDepartments(names);
      });
    }
  }, [status?.tenantId, status?.setupProgress?.departments_done]);
  reactExports.useEffect(() => {
    if (!status?.tenantId) return;
    supabase.from("departments").select("id,name").eq("tenant_id", status.tenantId).order("name").then(({
      data
    }) => setDeptOptions(data ?? []));
  }, [status?.tenantId, status?.setupProgress]);
  reactExports.useEffect(() => {
    if (status?.tenant && !details.name) {
      setDetails((d) => ({
        ...d,
        name: status.tenant.name ?? "",
        legal_name: status.tenant.legal_name ?? "",
        primary_contact_name: status.tenant.primary_contact_name ?? "",
        contact_phone: status.tenant.contact_phone ?? "",
        country_code: status.tenant.country_code ?? "",
        contact_email: status.tenant.contact_email ?? user?.email ?? "",
        registration_number: status.tenant.registration_number ?? "",
        tax_id_number: status.tenant.tax_id_number ?? ""
      }));
      setBranding((current) => ({
        ...current,
        address_line1: status.tenant.address_line1 ?? current.address_line1,
        address_line2: status.tenant.address_line2 ?? current.address_line2,
        city: status.tenant.city ?? current.city,
        region: status.tenant.region ?? current.region,
        postal_code: status.tenant.postal_code ?? current.postal_code,
        website: status.tenant.website ?? current.website,
        tagline: status.tenant.tagline ?? current.tagline
      }));
    }
    if (!status?.tenant && user?.email && !details.contact_email) {
      setDetails((d) => ({
        ...d,
        contact_email: user.email
      }));
    }
  }, [status, user, details.name, details.contact_email]);
  reactExports.useEffect(() => {
    if (!trialInvitation || status?.tenantId) return;
    setDetails((d) => ({
      ...d,
      name: d.name || trialInvitation.org_name || "",
      legal_name: d.legal_name || trialInvitation.org_name || "",
      country_code: d.country_code || (trialInvitation.country_code ?? "").toUpperCase() || "",
      contact_email: d.contact_email || trialInvitation.email || user?.email || "",
      primary_contact_name: d.primary_contact_name || trialInvitation.contact_name || ""
    }));
  }, [trialInvitation, status?.tenantId, user?.email]);
  const hasTenant = !!status?.tenantId;
  async function saveDetails() {
    const name = details.name.trim();
    const country = details.country_code.trim().toUpperCase();
    const email = details.contact_email.trim();
    const phone = details.contact_phone.trim();
    const reg = details.registration_number.trim();
    const hasTrialInvitation = !!trialInvitation;
    if (!name || name.length < 2) return toast.error("Organization name must be at least 2 characters.");
    if (country.length !== 2) return toast.error("Please choose a country.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Please enter a valid contact email.");
    if (!hasTrialInvitation && phone.replace(/\D+/g, "").length < 6) return toast.error("Contact phone is required.");
    let normalizedRegistrationNumber = reg;
    if (reg) {
      const {
        validateBusinessRegistrationNumber
      } = await import("./payroll-validation-DSkr7Vxa.mjs");
      const regCheck = validateBusinessRegistrationNumber(reg, country);
      if (!regCheck.ok) return toast.error(regCheck.error);
      normalizedRegistrationNumber = regCheck.value;
    } else if (!hasTrialInvitation) {
      return toast.error(country === "AU" ? "ABN is required." : "Business registration number is required.");
    }
    setBusy(true);
    setStepError(null);
    try {
      if (!hasTenant) {
        const res = await createFn({
          data: {
            name,
            legal_name: details.legal_name.trim(),
            primary_contact_name: details.primary_contact_name.trim(),
            owner_job_title: details.owner_job_title.trim(),
            country_code: country,
            contact_email: email,
            contact_phone: phone,
            registration_number: normalizedRegistrationNumber,
            tax_id_number: details.tax_id_number.trim(),
            address_line1: branding.address_line1.trim(),
            address_line2: branding.address_line2.trim(),
            city: branding.city.trim(),
            region: branding.region.trim(),
            postal_code: branding.postal_code.trim(),
            website: branding.website.trim(),
            tagline: branding.tagline.trim()
          }
        });
        console.info("[org-setup] organization created", res);
        requestRoleRefresh();
        try {
          if (res?.tenantId) {
            const redeem = await redeemTrialFn({
              data: {
                tenant_id: res.tenantId
              }
            });
            if (redeem?.ok) {
              toast.success("Trial activated — 30-day free trial is now live");
              await qc.invalidateQueries({
                queryKey: ["my-trial-invitation"]
              });
            }
          }
        } catch (err) {
          console.warn("[org-setup] trial redemption skipped", err);
        }
      } else {
        await updateProfileFn({
          data: {
            legal_name: details.legal_name.trim(),
            primary_contact_name: details.primary_contact_name.trim(),
            contact_phone: phone,
            registration_number: normalizedRegistrationNumber,
            tax_id_number: details.tax_id_number.trim()
          }
        });
      }
      await markFn({
        data: {
          step: "details"
        }
      });
      await refreshOrgStatus();
      setStepIdx(1);
      toast.success("Organization details saved");
    } catch (e) {
      const msg = e?.message ?? (typeof e === "string" ? e : "Could not save organization");
      console.error("[org-setup] createOrganization failed", e);
      setStepError(msg);
      toast.error(msg, {
        duration: 8e3
      });
    } finally {
      setBusy(false);
    }
  }
  async function startOver() {
    if (!confirm("Reset the organization setup? This deletes the current org if it has no employees.")) return;
    setBusy(true);
    try {
      const res = await resetFn({});
      await refreshOrgStatus();
      setStepIdx(0);
      requestRoleRefresh();
      setDetails({
        name: "",
        legal_name: "",
        primary_contact_name: "",
        owner_job_title: "",
        country_code: "",
        contact_email: user?.email ?? "",
        contact_phone: "",
        registration_number: "",
        tax_id_number: ""
      });
      setBranding({
        address_line1: "",
        address_line2: "",
        city: "",
        region: "",
        postal_code: "",
        website: "",
        tagline: ""
      });
      toast.success(res.reset ? "Setup reset — you can start over." : "Nothing to reset.");
    } catch (e) {
      toast.error(e?.message ?? "Could not reset setup");
    } finally {
      setBusy(false);
    }
  }
  async function saveBranding() {
    setBusy(true);
    setStepError(null);
    try {
      await updateProfileFn({
        data: {
          legal_name: details.legal_name.trim(),
          primary_contact_name: details.primary_contact_name.trim(),
          contact_phone: details.contact_phone.trim(),
          address_line1: branding.address_line1.trim(),
          address_line2: branding.address_line2.trim(),
          city: branding.city.trim(),
          region: branding.region.trim(),
          postal_code: branding.postal_code.trim(),
          website: branding.website.trim(),
          tagline: branding.tagline.trim(),
          registration_number: details.registration_number.trim(),
          tax_id_number: details.tax_id_number.trim()
        }
      });
      await markFn({
        data: {
          step: "branding"
        }
      });
      await refreshOrgStatus();
      setStepIdx(2);
      toast.success("Address saved");
    } catch (e) {
      const msg = e?.message ?? "Could not save address";
      setStepError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }
  async function saveDepartments() {
    setBusy(true);
    setStepError(null);
    try {
      const names = departments.map((s) => s.trim()).filter(Boolean);
      if (names.length) {
        await seedFn({
          data: {
            departments: names,
            withLeaveTypes: false
          }
        });
      }
      await markFn({
        data: {
          step: "departments"
        }
      });
      await refreshOrgStatus();
      if (status?.tenantId) {
        const {
          data
        } = await supabase.from("departments").select("id,name").eq("tenant_id", status.tenantId).order("name");
        setDeptOptions(data ?? []);
      }
      setStepIdx(3);
      toast.success("Departments created");
    } catch (e) {
      const msg = e?.message ?? "Could not save departments";
      setStepError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }
  async function saveDefaults() {
    setBusy(true);
    setStepError(null);
    try {
      await seedFn({
        data: {
          departments: [],
          withLeaveTypes: defaults.withLeaveTypes
        }
      });
      await markFn({
        data: {
          step: "defaults"
        }
      });
      await refreshOrgStatus();
      setStepIdx(4);
      toast.success("Defaults configured");
    } catch (e) {
      const msg = e?.message ?? "Could not save defaults";
      setStepError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }
  function updateInvite(idx, patch) {
    setInvites((rows) => rows.map((r, i) => i === idx ? {
      ...r,
      ...patch
    } : r));
  }
  async function sendOneInvite(idx) {
    const row = invites[idx];
    const email = row.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      updateInvite(idx, {
        status: "failed",
        error: "Enter a valid email"
      });
      return false;
    }
    updateInvite(idx, {
      status: "sending",
      error: void 0
    });
    try {
      await inviteFn({
        data: {
          email,
          first_name: row.first_name.trim(),
          last_name: row.last_name.trim(),
          job_title: row.job_title.trim(),
          role: row.role,
          department_id: row.department_id || null
        }
      });
      updateInvite(idx, {
        status: "sent",
        error: void 0
      });
      return true;
    } catch (e) {
      updateInvite(idx, {
        status: "failed",
        error: e?.message ?? "Send failed"
      });
      return false;
    }
  }
  async function sendAllAndFinish(skip = false) {
    setBusy(true);
    try {
      if (!skip) {
        const pending = invites.map((r, i) => ({
          r,
          i
        })).filter(({
          r
        }) => r.email.trim() && r.status !== "sent");
        let okCount = 0;
        for (const {
          i
        } of pending) {
          const ok = await sendOneInvite(i);
          if (ok) okCount++;
        }
        if (pending.length > 0) {
          if (okCount === pending.length) toast.success(`${okCount} invitation${okCount === 1 ? "" : "s"} sent`);
          else if (okCount === 0) {
            toast.error("Could not send invitations — review the errors and retry.");
            setBusy(false);
            return;
          } else toast.warning(`Sent ${okCount} of ${pending.length}. Retry the failed ones or skip.`);
        }
      }
      await markFn({
        data: {
          step: "invites"
        }
      });
      await refreshOrgStatus();
      navigate({
        to: "/dashboard"
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed to finish setup");
    } finally {
      setBusy(false);
    }
  }
  if (authLoading || isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) });
  }
  const stepDone = (k) => !!status?.setupProgress?.[`${k}_done`];
  const pct = Math.round(completedSteps / STEPS.length * 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen bg-muted/20 px-4 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-6xl gap-8 md:grid-cols-[260px_1fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Set up your organization" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Quick guided setup — under 5 minutes." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", className: "w-full justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", children: "Back to dashboard" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: pct }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          completedSteps,
          "/",
          STEPS.length,
          " steps complete"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-1", children: STEPS.map((s, i) => {
        const done = stepDone(s.key);
        const current = i === stepIdx;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setStepError(null);
          setStepIdx(i);
        }, className: cn("flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors", current ? "bg-background shadow-sm ring-1 ring-border" : "hover:bg-background/60"), children: [
          done ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mt-0.5 h-5 w-5 text-status-done" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: cn("mt-0.5 h-5 w-5", current ? "text-primary" : "text-muted-foreground") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: s.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.subtitle })
          ] })
        ] }) }, s.key);
      }) }),
      hasTenant && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-destructive hover:text-destructive", onClick: startOver, disabled: busy, children: "Start over (delete this org)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Only works if no employees have been added yet." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
      stepError && stepIdx < 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "We couldn't save this step" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "opacity-90", children: stepError })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: busy, onClick: () => {
          if (stepIdx === 0) void saveDetails();
          else if (stepIdx === 1) void saveBranding();
          else if (stepIdx === 2) void saveDepartments();
          else if (stepIdx === 3) void saveDefaults();
        }, children: "Retry" })
      ] }),
      stepIdx === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Organization details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "The legal, contact, and tax details used for payroll, invites, and HR records." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organization name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.name, onChange: (e) => setDetails({
              ...details,
              name: e.target.value
            }), disabled: hasTenant })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Legal business name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.legal_name, onChange: (e) => setDetails({
              ...details,
              legal_name: e.target.value
            }), placeholder: "Optional if same as organization name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Primary contact name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.primary_contact_name, onChange: (e) => setDetails({
              ...details,
              primary_contact_name: e.target.value
            }), placeholder: "Owner or HR lead" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Country ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: details.country_code, onValueChange: (v) => setDetails({
              ...details,
              country_code: v
            }), disabled: hasTenant, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select country" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: countries.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.code, children: [
                c.name,
                " (",
                c.currency_code,
                ")"
              ] }, c.code)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Contact phone ",
              trialInvitation ? null : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.contact_phone, onChange: (e) => setDetails({
              ...details,
              contact_phone: e.target.value
            }), placeholder: "+61 4xx xxx xxx" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Your title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.owner_job_title, onChange: (e) => setDetails({
              ...details,
              owner_job_title: e.target.value
            }), placeholder: "Managing Director, HR Lead…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Contact email ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: details.contact_email, onChange: (e) => setDetails({
              ...details,
              contact_email: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              details.country_code.toUpperCase() === "AU" ? "ABN" : "Business registration number",
              " ",
              trialInvitation ? null : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.registration_number, onChange: (e) => setDetails({
              ...details,
              registration_number: e.target.value
            }), placeholder: details.country_code.toUpperCase() === "AU" ? "11 digits" : "", inputMode: details.country_code.toUpperCase() === "AU" ? "numeric" : "text" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tax ID / TFN / EIN" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.tax_id_number, onChange: (e) => setDetails({
              ...details,
              tax_id_number: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: saveDetails, disabled: busy, children: [
            busy ? "Saving…" : "Save & continue",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
          ] }) })
        ] })
      ] }),
      stepIdx === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Address & branding" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Business address and public-facing details shown on HR documents." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Street address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: branding.address_line1, onChange: (e) => setBranding({
              ...branding,
              address_line1: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address line 2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: branding.address_line2, onChange: (e) => setBranding({
              ...branding,
              address_line2: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "City" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: branding.city, onChange: (e) => setBranding({
              ...branding,
              city: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "State / region" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: branding.region, onChange: (e) => setBranding({
              ...branding,
              region: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Postal code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: branding.postal_code, onChange: (e) => setBranding({
              ...branding,
              postal_code: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Website" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: branding.website, onChange: (e) => setBranding({
              ...branding,
              website: e.target.value
            }), placeholder: "https://" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Short tagline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: branding.tagline, onChange: (e) => setBranding({
              ...branding,
              tagline: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2 flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setStepIdx(0), children: "Back" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: saveBranding, disabled: busy, children: [
              busy ? "Saving…" : "Save & continue",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
            ] })
          ] })
        ] })
      ] }),
      stepIdx === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Departments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Starter org structure — you can edit later." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 6, value: departments.join("\n"), onChange: (e) => setDepartments(e.target.value.split("\n")), placeholder: "One per line" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setStepIdx(1), children: "Back" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: saveDepartments, disabled: busy, children: [
              busy ? "Creating…" : "Create & continue",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
            ] })
          ] })
        ] })
      ] }),
      stepIdx === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Leave & payroll defaults" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "We'll seed Annual, Sick, and Unpaid leave for you. Payroll runs use your country's settings." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: defaults.withLeaveTypes, onChange: (e) => setDefaults({
              withLeaveTypes: e.target.checked
            }) }),
            "Create the three default leave types"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setStepIdx(2), children: "Back" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: saveDefaults, disabled: busy, children: [
              busy ? "Saving…" : "Save & continue",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
            ] })
          ] })
        ] })
      ] }),
      stepIdx === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Invite your team" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Add employees, managers, or co-admins. Managers can be linked to a department so they can later view and manage their team. You can also do this later from the Employees page." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
          invites.map((row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 space-y-3 bg-background", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium", children: [
                "Invitee ",
                idx + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                row.status === "sent" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-status-done flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
                  " Sent"
                ] }),
                row.status === "sending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                  " Sending…"
                ] }),
                row.status === "failed" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-destructive", children: "Failed" }),
                invites.length > 1 && row.status !== "sent" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setInvites((rows) => rows.filter((_, i) => i !== idx)), disabled: busy, children: "Remove" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Work email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: row.email, disabled: row.status === "sent" || busy, onChange: (e) => updateInvite(idx, {
                  email: e.target.value
                }), placeholder: "teammate@yourco.com" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "First name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.first_name, disabled: row.status === "sent" || busy, onChange: (e) => updateInvite(idx, {
                  first_name: e.target.value
                }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.last_name, disabled: row.status === "sent" || busy, onChange: (e) => updateInvite(idx, {
                  last_name: e.target.value
                }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Job title" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.job_title, disabled: row.status === "sent" || busy, onChange: (e) => updateInvite(idx, {
                  job_title: e.target.value
                }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Role" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: row.role, disabled: row.status === "sent" || busy, onValueChange: (v) => updateInvite(idx, {
                  role: v
                }), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "employee", children: "Employee" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Manager (can lead a team)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "org_admin", children: "Organization admin" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  "Team / department ",
                  row.role === "manager" ? "(team they will manage)" : "(optional)"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: row.department_id ?? "__none", disabled: row.status === "sent" || busy || deptOptions.length === 0, onValueChange: (v) => updateInvite(idx, {
                  department_id: v === "__none" ? void 0 : v
                }), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: deptOptions.length === 0 ? "No departments yet — go back to step 3" : "Select a team" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none", children: "No team" }),
                    deptOptions.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d.id, children: d.name }, d.id))
                  ] })
                ] })
              ] })
            ] }),
            row.status === "failed" && row.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: row.error }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => sendOneInvite(idx), disabled: busy, children: "Retry" })
            ] })
          ] }, idx)),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setInvites((rows) => [...rows, newInviteRow()]), disabled: busy, children: "+ Add another invite" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between gap-2 pt-2 border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setStepIdx(3), disabled: busy, children: "Back" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => sendAllAndFinish(true), disabled: busy, children: "Skip & finish" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => sendAllAndFinish(false), disabled: busy || !invites.some((r) => r.email.trim() && r.status !== "sent"), children: busy ? "Sending…" : "Send invites & finish" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  OrgSetupPage as component
};
