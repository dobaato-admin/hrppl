import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, f as useSearch, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useForm } from "../_libs/react-hook-form.mjs";
import { a } from "../_libs/hookform__resolvers.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { l as lovable } from "./index-C7ZRg4Jn.mjs";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, B as Button } from "./router-CLxirH5A.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { C as Checkbox } from "./checkbox-Dj6wn8_T.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { b as buildGoogleRedirectUri, d as describeOAuthError } from "./oauth-config-B7YbiyVz.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { a as objectType, A as booleanType, z as stringType } from "../_libs/zod.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./createSsrRpc-CRedQJGY.mjs";
import "./server-BOi2EjMN.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-guard-CkYFJuQL.mjs";
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
import "../_libs/lucide-react.mjs";
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-presence.mjs";
const signupSchema = objectType({
  fullName: stringType().min(2, "Full name must be at least 2 characters").max(100, "Full name must be under 100 characters"),
  email: stringType().min(1, "Email is required").email("Please enter a valid email address"),
  password: stringType().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: stringType().min(1, "Please confirm your password"),
  agreeTerms: booleanType().refine((v) => v === true, {
    message: "You must agree to the Terms of Service and Privacy Policy"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
function SignupPage() {
  const navigate = useNavigate();
  const {
    redirect = "/org/setup"
  } = useSearch({
    from: "/signup"
  });
  const [loading, setLoading] = reactExports.useState(false);
  const {
    register,
    handleSubmit,
    formState: {
      errors
    },
    setValue,
    watch
  } = useForm({
    resolver: a(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false
    }
  });
  const agreeTermsValue = watch("agreeTerms");
  async function onSubmit(data) {
    setLoading(true);
    const {
      error
    } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}${redirect}`,
        data: {
          full_name: data.fullName,
          signup_intent: "create_organization"
        }
      }
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Check your email to confirm, then set up your organisation.");
    navigate({
      to: "/auth",
      search: {
        redirect
      }
    });
  }
  async function signInGoogle() {
    const {
      redirectUri,
      validation
    } = buildGoogleRedirectUri(redirect);
    if (!validation.ok) {
      toast.error("Sign-in misconfigured", {
        description: `This site's origin (${validation.origin}) isn't on the Google OAuth allowlist. Open the app from an approved URL, or ask your administrator to add it.`
      });
      return;
    }
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectUri,
        extraParams: {
          prompt: "select_account"
        }
      });
      if (result.redirected) return;
      setLoading(false);
      if (result.error) {
        const info = describeOAuthError(result.error);
        return toast.error(info.title, {
          description: info.message
        });
      }
      navigate({
        to: redirect
      });
    } catch (err) {
      setLoading(false);
      const info = describeOAuthError(err);
      toast.error(info.title, {
        description: info.message
      });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-sm font-bold", children: "h" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl", children: "Create your organisation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Set up a new hrppl workspace for your company. Employees join later by invitation — only organisation admins can sign up here." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "w-full", onClick: signInGoogle, disabled: loading, children: "Continue with Google" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-full border-t" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-card px-2 text-muted-foreground", children: "or sign up with email" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fullName", children: "Full name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "fullName", placeholder: "Jane Doe", ...register("fullName"), "aria-invalid": errors.fullName ? "true" : "false" }),
          errors.fullName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.8rem] font-medium text-destructive", children: errors.fullName.message })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Work email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", placeholder: "jane@company.com", ...register("email"), "aria-invalid": errors.email ? "true" : "false" }),
          errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.8rem] font-medium text-destructive", children: errors.email.message })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", placeholder: "••••••••", ...register("password"), "aria-invalid": errors.password ? "true" : "false" }),
          errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.8rem] font-medium text-destructive", children: errors.password.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.75rem] text-muted-foreground", children: "Must be at least 8 characters with uppercase, lowercase and a number." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirmPassword", children: "Confirm password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "confirmPassword", type: "password", placeholder: "••••••••", ...register("confirmPassword"), "aria-invalid": errors.confirmPassword ? "true" : "false" }),
          errors.confirmPassword && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.8rem] font-medium text-destructive", children: errors.confirmPassword.message })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "agreeTerms", checked: agreeTermsValue, onCheckedChange: (checked) => setValue("agreeTerms", checked === true, {
            shouldValidate: true
          }), "aria-invalid": errors.agreeTerms ? "true" : "false" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "agreeTerms", className: "cursor-pointer text-sm font-normal leading-tight", children: [
            "I agree to the",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "text-primary hover:underline", children: "Terms of Service" }),
            " ",
            "and",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "text-primary hover:underline", children: "Privacy Policy" }),
            "."
          ] })
        ] }),
        errors.agreeTerms && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.8rem] font-medium text-destructive", children: errors.agreeTerms.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Creating account…" : "Create Account" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-muted-foreground", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "font-medium text-primary hover:underline", children: "Sign in" })
      ] })
    ] })
  ] }) });
}
export {
  SignupPage as component
};
