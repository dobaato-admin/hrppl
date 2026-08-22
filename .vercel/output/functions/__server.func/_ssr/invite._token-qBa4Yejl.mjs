import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { P as Route$1F, u as useAuth, a as useServerFn, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, B as Button, f as Badge } from "./router-CLxirH5A.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { l as lovable } from "./index-C7ZRg4Jn.mjs";
import { b as buildGoogleRedirectUri, d as describeOAuthError } from "./oauth-config-B7YbiyVz.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Separator } from "./separator-D6YV3GQ2.mjs";
import { g as getInvitationByToken, a as acceptInvitation } from "./staff-invitations.functions-CbtTdlva.mjs";
import { validateInvitationDetails } from "./payroll-validation-DSkr7Vxa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import { L as LoaderCircle, B as Building2, an as Mail, h as ShieldCheck } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-separator.mjs";
const EMPTY_DETAILS = {
  contact_number: "",
  bank_name: "",
  bank_bsb: "",
  bank_account_number: "",
  bank_account_name: "",
  tfn: "",
  super_fund_name: "",
  super_member_number: "",
  next_of_kin_name: "",
  next_of_kin_relationship: "",
  next_of_kin_phone: ""
};
function AcceptInvitePage() {
  const {
    token
  } = Route$1F.useParams();
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const lookupFn = useServerFn(getInvitationByToken);
  const acceptFn = useServerFn(acceptInvitation);
  const [busy, setBusy] = reactExports.useState(false);
  const [mode, setMode] = reactExports.useState("signup");
  const [password, setPassword] = reactExports.useState("");
  const [fullName, setFullName] = reactExports.useState("");
  const [details, setDetails] = reactExports.useState(EMPTY_DETAILS);
  const [fieldErrors, setFieldErrors] = reactExports.useState({});
  const [emailSent, setEmailSent] = reactExports.useState(false);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => lookupFn({
      data: {
        token
      }
    })
  });
  const invitation = data?.invitation;
  const organization = data?.organization;
  const countryCode = (organization?.country_code || invitation?.country_code || "AU").toUpperCase();
  const isAU = countryCode === "AU";
  const isNP = countryCode === "NP";
  function update(k, v) {
    setDetails((p) => ({
      ...p,
      [k]: v
    }));
    if (fieldErrors[k]) {
      setFieldErrors((e) => ({
        ...e,
        [k]: void 0
      }));
    }
  }
  async function submitAuth(e) {
    e.preventDefault();
    if (!invitation) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const {
          error
        } = await supabase.auth.signUp({
          email: invitation.email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/invite/${token}`,
            data: {
              full_name: fullName
            }
          }
        });
        if (error) {
          if (/already|registered|exists/i.test(error.message)) {
            toast.error("This email already has an account", {
              description: "Use “I have an account” to sign in, or continue with Google if you signed up that way."
            });
            setMode("signin");
            return;
          }
          throw error;
        }
        setEmailSent(true);
        toast.success("Account created. Check your email to verify, then return to this link.");
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email: invitation.email,
          password
        });
        if (error) {
          if (/invalid login credentials/i.test(error.message)) {
            toast.error("Couldn't sign in", {
              description: "If you originally signed up with Google, use the “Continue with Google” button above."
            });
            return;
          }
          throw error;
        }
      }
    } catch (err) {
      toast.error(err?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function signInWithGoogle() {
    if (!invitation) return;
    const {
      redirectUri,
      validation
    } = buildGoogleRedirectUri(`/invite/${token}`);
    if (!validation.ok) {
      toast.error("Sign-in misconfigured", {
        description: `This site's origin (${validation.origin}) isn't on the Google OAuth allowlist. Ask your administrator to add it.`
      });
      return;
    }
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectUri,
        extraParams: {
          prompt: "select_account",
          login_hint: invitation.email
        }
      });
      if (result.redirected) return;
      setBusy(false);
      if (result.error) {
        const info = describeOAuthError(result.error);
        toast.error(info.title, {
          description: info.message
        });
      }
    } catch (err) {
      setBusy(false);
      const info = describeOAuthError(err);
      toast.error(info.title, {
        description: info.message
      });
    }
  }
  async function submitDetails(e) {
    e.preventDefault();
    if (!invitation) return;
    const {
      errors,
      normalized
    } = validateInvitationDetails(details, {
      isAU,
      countryCode
    });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please correct the highlighted fields");
      return;
    }
    setFieldErrors({});
    setBusy(true);
    try {
      await acceptFn({
        data: {
          token,
          details: normalized
        }
      });
      toast.success("Welcome aboard!");
      navigate({
        to: "/onboarding/profile"
      });
    } catch (err) {
      toast.error(err?.message ?? "Could not complete onboarding");
    } finally {
      setBusy(false);
    }
  }
  if (isLoading || loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) });
  }
  if (!invitation) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "max-w-md w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Invitation not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "This link is invalid or has been revoked." })
    ] }) }) });
  }
  if (invitation.status !== "pending") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "max-w-md w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
        "Invitation ",
        invitation.status
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "This invitation is no longer active. Please contact your organization administrator." })
    ] }) }) });
  }
  if (user && user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "max-w-md w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Wrong account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          "This invitation was sent to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: invitation.email }),
          ", but you're signed in as ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: user.email }),
          ". Sign out and try again."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: async () => {
        await supabase.auth.signOut();
        navigate({
          to: `/invite/${token}`
        });
      }, children: "Sign out & continue" }) })
    ] }) });
  }
  const header = /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-primary/10 p-2 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: organization?.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { className: "flex flex-wrap items-center gap-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5" }),
        " ",
        invitation.email,
        invitation.job_title && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: invitation.job_title })
      ] })
    ] })
  ] }) }) });
  if (user && user.email?.toLowerCase() === invitation.email.toLowerCase()) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen bg-muted/20 px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl space-y-6", children: [
      header,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Your details (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
            "You're signed in as ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: user.email }),
            ". Add payroll and next-of-kin details now, or skip and complete them later from your profile. This information is private and only visible to you and your HR admin."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitDetails, className: "space-y-6", noValidate: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium", children: "Contact" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.contact_number, onChange: (e) => update("contact_number", e.target.value), placeholder: "+61 4xx xxx xxx", "aria-invalid": !!fieldErrors.contact_number }),
              fieldErrors.contact_number && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: fieldErrors.contact_number })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium", children: "Next of kin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.next_of_kin_name, onChange: (e) => update("next_of_kin_name", e.target.value), "aria-invalid": !!fieldErrors.next_of_kin_name }),
                fieldErrors.next_of_kin_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: fieldErrors.next_of_kin_name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Relationship" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.next_of_kin_relationship, onChange: (e) => update("next_of_kin_relationship", e.target.value), placeholder: "Spouse, parent…" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.next_of_kin_phone, onChange: (e) => update("next_of_kin_phone", e.target.value), "aria-invalid": !!fieldErrors.next_of_kin_phone }),
                fieldErrors.next_of_kin_phone && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: fieldErrors.next_of_kin_phone })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-medium", children: [
              "Bank account ",
              isAU ? "(Australia)" : isNP ? "(Nepal)" : `(${countryCode})`
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.bank_account_name, onChange: (e) => update("bank_account_name", e.target.value), "aria-invalid": !!fieldErrors.bank_account_name, placeholder: "Name on the account" }),
                fieldErrors.bank_account_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: fieldErrors.bank_account_name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bank name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.bank_name, onChange: (e) => update("bank_name", e.target.value), placeholder: isNP ? "e.g. Nabil Bank, NIC Asia, Global IME…" : "Your bank" })
              ] }),
              isAU && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "BSB" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.bank_bsb, onChange: (e) => update("bank_bsb", e.target.value), placeholder: "000-000", inputMode: "numeric", "aria-invalid": !!fieldErrors.bank_bsb }),
                fieldErrors.bank_bsb && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: fieldErrors.bank_bsb })
              ] }),
              !isAU && !isNP && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  "Branch / sort code ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "(optional)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.bank_bsb, onChange: (e) => update("bank_bsb", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-2 ${isAU ? "" : "sm:col-span-2"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.bank_account_number, onChange: (e) => update("bank_account_number", e.target.value), inputMode: "numeric", "aria-invalid": !!fieldErrors.bank_account_number }),
                fieldErrors.bank_account_number && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: fieldErrors.bank_account_number })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium", children: isAU ? "Tax & superannuation" : "Tax & pension" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: isAU ? "Tax File Number (TFN)" : "Tax ID" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.tfn, onChange: (e) => update("tfn", e.target.value), placeholder: isAU ? "8 or 9 digits" : "", inputMode: isAU ? "numeric" : "text", "aria-invalid": !!fieldErrors.tfn }),
                fieldErrors.tfn && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: fieldErrors.tfn })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: isAU ? "Super fund name" : "Pension fund name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.super_fund_name, onChange: (e) => update("super_fund_name", e.target.value), "aria-invalid": !!fieldErrors.super_fund_name }),
                fieldErrors.super_fund_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: fieldErrors.super_fund_name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: isAU ? "Super member number" : "Pension member number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: details.super_member_number, onChange: (e) => update("super_member_number", e.target.value), "aria-invalid": !!fieldErrors.super_member_number }),
                fieldErrors.super_member_number && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: fieldErrors.super_member_number })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mt-0.5 h-4 w-4 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Your tax and bank details are stored securely and used only for payroll. All fields are optional — you can complete them later from your profile." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "flex-1", disabled: busy, children: busy ? "Saving…" : "Save & continue" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "flex-1", disabled: busy, onClick: async () => {
              setBusy(true);
              try {
                await acceptFn({
                  data: {
                    token,
                    details: EMPTY_DETAILS
                  }
                });
                toast.success("Welcome aboard! You can add payroll details later from your profile.");
                navigate({
                  to: "/onboarding/profile"
                });
              } catch (err) {
                toast.error(err?.message ?? "Could not complete onboarding");
              } finally {
                setBusy(false);
              }
            }, children: "Skip & finish later" })
          ] })
        ] }) })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen bg-muted/20 px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-md space-y-6", children: [
    header,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "You've been invited to join ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: organization?.name }),
      ". Create an account or sign in to continue."
    ] }) }) }),
    emailSent && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-status-info/40 bg-status-info/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-start gap-3 pt-6 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "mt-0.5 h-5 w-5 text-status-info" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-foreground", children: "Check your inbox to verify your email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          "We sent a confirmation link to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: invitation.email }),
          ". Click it, then come back to this invitation page to finish setting up your account. The link expires in 24 hours."
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "w-full", disabled: busy, onClick: signInWithGoogle, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "mr-2 h-4 w-4", viewBox: "0 0 24 24", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#FBBC05", d: "M5.84 14.1A6.998 6.998 0 0 1 5.46 12c0-.73.13-1.44.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" })
        ] }),
        "Continue with Google"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground", children: "or with a password" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: mode === "signup" ? "default" : "outline", onClick: () => setMode("signup"), children: "Create account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: mode === "signin" ? "default" : "outline", onClick: () => setMode("signin"), children: "I have an account" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitAuth, className: "space-y-3", children: [
        mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullName, onChange: (e) => setFullName(e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: invitation.email, disabled: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: busy || !password, children: busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in & continue" })
      ] })
    ] }) })
  ] }) });
}
export {
  AcceptInvitePage as component
};
