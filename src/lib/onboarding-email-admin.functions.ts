import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

/**
 * Renders the onboarding-overdue email template HTML server-side for admin preview.
 * Admin-only. Returns { html, subject } for the given audience and data.
 */
export const previewOnboardingOverdueEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      audience: z.enum(["employee", "manager"]).default("employee"),
      employeeId: z.string().uuid().optional(),
      checklistId: z.string().uuid().optional(),
      assignmentId: z.string().uuid().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Role gate
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = ((roleRows ?? []) as any[]).map((r) => r.role);
    if (!roles.includes("org_admin") && !roles.includes("super_admin")) {
      throw new Error("Forbidden");
    }

    // Resolve template data
    let employeeName: string | undefined;
    let recipientName: string | undefined;
    let checklistName: string | undefined;
    let dueDate: string | undefined;
    let daysOverdue: number | undefined;

    if (data.assignmentId) {
      const { data: a } = await supabase
        .from("onboarding_assignments")
        .select("employee_id,checklist_id,due_date")
        .eq("id", data.assignmentId)
        .maybeSingle();
      if (a) {
        data.employeeId = data.employeeId ?? (a as any).employee_id;
        data.checklistId = data.checklistId ?? (a as any).checklist_id;
        dueDate = (a as any).due_date ?? undefined;
      }
    }

    if (data.employeeId) {
      const { data: emp } = await supabase
        .from("employees")
        .select("first_name,last_name,user_id,manager_id")
        .eq("id", data.employeeId)
        .maybeSingle();
      if (emp) {
        employeeName = `${(emp as any).first_name ?? ""} ${(emp as any).last_name ?? ""}`.trim() || undefined;
        if (data.audience === "employee" && (emp as any).user_id) {
          const { data: p } = await supabase.from("profiles").select("full_name").eq("id", (emp as any).user_id).maybeSingle();
          recipientName = (p as any)?.full_name ?? employeeName;
        } else if (data.audience === "manager" && (emp as any).manager_id) {
          const { data: mgr } = await supabase.from("employees").select("first_name,last_name,user_id").eq("id", (emp as any).manager_id).maybeSingle();
          if (mgr) {
            if ((mgr as any).user_id) {
              const { data: p } = await supabase.from("profiles").select("full_name").eq("id", (mgr as any).user_id).maybeSingle();
              recipientName = (p as any)?.full_name ?? (`${(mgr as any).first_name ?? ""} ${(mgr as any).last_name ?? ""}`.trim() || undefined);
            } else {
              recipientName = `${(mgr as any).first_name ?? ""} ${(mgr as any).last_name ?? ""}`.trim() || undefined;
            }
          }
        }
      }
    }

    if (data.checklistId) {
      const { data: cl } = await supabase
        .from("onboarding_checklists")
        .select("name")
        .eq("id", data.checklistId)
        .maybeSingle();
      checklistName = (cl as any)?.name;
    }

    if (!dueDate) {
      const d = new Date();
      d.setDate(d.getDate() - 5);
      dueDate = d.toISOString().slice(0, 10);
    }
    daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(dueDate + "T00:00:00Z").getTime()) / 86400000));

    // Render server-side (dynamic imports keep client bundle slim)
    const React = (await import("react")).default;
    const { render } = await import("@react-email/render");
    const { TEMPLATES } = await import("@/lib/email-templates/registry");
    const entry = (TEMPLATES as any)["onboarding-overdue"];
    if (!entry) throw new Error("Template not found");

    const templateData = {
      audience: data.audience,
      recipientName,
      employeeName,
      checklistName,
      dueDate,
      daysOverdue,
      appUrl: data.audience === "manager" ? "https://hrppl.io/org/onboarding" : "https://hrppl.io/onboarding",
    };

    const html = await render(React.createElement(entry.component, templateData));
    const subject = typeof entry.subject === "function" ? entry.subject(templateData) : entry.subject;

    return { html, subject, templateData };
  });

/**
 * Sends a test onboarding-overdue email to either the resolved recipient or a custom email.
 * Admin-only. Bypasses the 3-day throttle (this does not touch onboarding_assignments).
 */
export const sendTestOnboardingOverdueEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      audience: z.enum(["employee", "manager"]).default("employee"),
      employeeId: z.string().uuid().optional(),
      checklistId: z.string().uuid().optional(),
      assignmentId: z.string().uuid().optional(),
      // Optional override; defaults to resolved recipient email
      overrideEmail: z.string().email().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roleRows } = await supabase
      .from("user_roles").select("role").eq("user_id", userId);
    const roles = ((roleRows ?? []) as any[]).map((r) => r.role);
    if (!roles.includes("org_admin") && !roles.includes("super_admin")) {
      throw new Error("Forbidden");
    }

    // Resolve names + recipient
    let employeeName: string | undefined;
    let recipientName: string | undefined;
    let recipientEmail: string | undefined = data.overrideEmail;
    let checklistName: string | undefined;
    let dueDate: string | undefined;

    if (data.assignmentId) {
      const { data: a } = await supabase
        .from("onboarding_assignments")
        .select("employee_id,checklist_id,due_date")
        .eq("id", data.assignmentId).maybeSingle();
      if (a) {
        data.employeeId = data.employeeId ?? (a as any).employee_id;
        data.checklistId = data.checklistId ?? (a as any).checklist_id;
        dueDate = (a as any).due_date ?? undefined;
      }
    }

    if (data.employeeId) {
      const { data: emp } = await supabase
        .from("employees")
        .select("first_name,last_name,user_id,manager_id,email")
        .eq("id", data.employeeId).maybeSingle();
      if (emp) {
        employeeName = `${(emp as any).first_name ?? ""} ${(emp as any).last_name ?? ""}`.trim() || undefined;
        if (data.audience === "employee") {
          if ((emp as any).user_id) {
            const { data: p } = await supabase
              .from("profiles").select("email,full_name").eq("id", (emp as any).user_id).maybeSingle();
            recipientEmail = recipientEmail ?? (p as any)?.email ?? (emp as any).email;
            recipientName = (p as any)?.full_name ?? employeeName;
          } else {
            recipientEmail = recipientEmail ?? (emp as any).email;
            recipientName = employeeName;
          }
        } else if (data.audience === "manager" && (emp as any).manager_id) {
          const { data: mgr } = await supabase
            .from("employees").select("first_name,last_name,user_id,email")
            .eq("id", (emp as any).manager_id).maybeSingle();
          if (mgr) {
            if ((mgr as any).user_id) {
              const { data: p } = await supabase
                .from("profiles").select("email,full_name").eq("id", (mgr as any).user_id).maybeSingle();
              recipientEmail = recipientEmail ?? (p as any)?.email ?? (mgr as any).email;
              recipientName = (p as any)?.full_name ?? `${(mgr as any).first_name ?? ""} ${(mgr as any).last_name ?? ""}`.trim();
            } else {
              recipientEmail = recipientEmail ?? (mgr as any).email;
              recipientName = `${(mgr as any).first_name ?? ""} ${(mgr as any).last_name ?? ""}`.trim();
            }
          }
        }
      }
    }

    if (data.checklistId) {
      const { data: cl } = await supabase
        .from("onboarding_checklists").select("name").eq("id", data.checklistId).maybeSingle();
      checklistName = (cl as any)?.name;
    }

    if (!recipientEmail) throw new Error("Could not resolve a recipient email");

    if (!dueDate) {
      const d = new Date();
      d.setDate(d.getDate() - 5);
      dueDate = d.toISOString().slice(0, 10);
    }
    const daysOverdue = Math.max(
      0,
      Math.floor((Date.now() - new Date(dueDate + "T00:00:00Z").getTime()) / 86400000),
    );

    const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
    await sendInternalEmail({
      templateName: "onboarding-overdue",
      recipientEmail,
      idempotencyKey: `onboarding-overdue-test-${data.assignmentId ?? data.employeeId ?? "manual"}-${Date.now()}`,
      // Intentionally omit preferenceKey so admin test sends are not silently suppressed
      templateData: {
        audience: data.audience,
        recipientName,
        employeeName,
        checklistName,
        dueDate,
        daysOverdue,
        appUrl: data.audience === "manager" ? "https://hrppl.io/org/onboarding" : "https://hrppl.io/onboarding",
      },
    });

    return { ok: true, recipientEmail };
  });
