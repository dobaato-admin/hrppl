import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { describeOAuthError } from "@/lib/oauth-errors";
import { buildGoogleRedirectUri } from "@/lib/oauth-config";

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be under 100 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeTerms: z.boolean().refine((v) => v === true, {
      message: "You must agree to the Terms of Service and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

function sanitizeRedirect(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  if (!raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — hrppl" },
      { name: "description", content: "Create an hrppl account to run global HR, payroll and practice management from one platform." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Sign up — hrppl" },
      { property: "og:description", content: "Create your hrppl account." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://hrppl.io/signup" },
    ],
    links: [{ rel: "canonical", href: "https://hrppl.io/signup" }],
  }),
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const r = sanitizeRedirect(search.redirect);
    return r ? { redirect: r } : {};
  },
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { redirect = "/org/setup" } = useSearch({ from: "/signup" });
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const agreeTermsValue = watch("agreeTerms");

  async function onSubmit(data: SignupForm) {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}${redirect}`,
        data: {
          full_name: data.fullName,
          signup_intent: "create_organization",
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Check your email to confirm, then set up your organisation.");
    navigate({ to: "/auth", search: { redirect } });
  }

  async function signInGoogle() {
    const { redirectUri, validation } = buildGoogleRedirectUri(redirect);
    if (!validation.ok) {
      toast.error("Sign-in misconfigured", {
        description:
          `This site's origin (${validation.origin}) isn't on the Google OAuth allowlist. ` +
          `Open the app from an approved URL, or ask your administrator to add it.`,
      });
      return;
    }

    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectUri,
        extraParams: { prompt: "select_account" },
      });
      if (result.redirected) return;
      setLoading(false);
      if (result.error) {
        const info = describeOAuthError(result.error);
        return toast.error(info.title, { description: info.message });
      }
      navigate({ to: redirect });
    } catch (err) {
      setLoading(false);
      const info = describeOAuthError(err);
      toast.error(info.title, { description: info.message });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <span className="font-display text-sm font-bold">h</span>
          </div>
          <CardTitle className="text-xl">Create your organisation</CardTitle>
          <CardDescription>
            Set up a new hrppl workspace for your company. Employees join later by invitation —
            only organisation admins can sign up here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={signInGoogle}
            disabled={loading}
          >
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                or sign up with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                placeholder="Jane Doe"
                {...register("fullName")}
                aria-invalid={errors.fullName ? "true" : "false"}
              />
              {errors.fullName && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
              <p className="text-[0.75rem] text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase and a number.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
              />
              {errors.confirmPassword && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="agreeTerms"
                checked={agreeTermsValue}
                onCheckedChange={(checked) =>
                  setValue("agreeTerms", checked === true, { shouldValidate: true })
                }
                aria-invalid={errors.agreeTerms ? "true" : "false"}
              />
              <Label htmlFor="agreeTerms" className="cursor-pointer text-sm font-normal leading-tight">
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                .
              </Label>
            </div>
            {errors.agreeTerms && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.agreeTerms.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
