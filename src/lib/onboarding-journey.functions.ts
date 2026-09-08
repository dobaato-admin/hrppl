/**
 * Wave 7, Phase 2 — one link an employee can start from.
 *
 * ---------------------------------------------------------------------------
 * Why this exists
 * ---------------------------------------------------------------------------
 *
 * Everything a new starter has to do already existed, on four unconnected
 * pages, and nothing joined them:
 *
 *   /onboarding          checklists and document uploads
 *   /onboarding/profile  the personal-details form — **not linked from
 *                        /onboarding at all**, so an employee reached it only
 *                        if someone sent them the URL
 *   /me/policies         read and sign (new in W7)
 *   /me/training         mandatory courses (W6)
 *
 * The spec's Phase 2 asks that "a new employee can complete every section of
 * their own record from one link". This is that link's content: a single,
 * ordered view of what is outstanding, computed the same way the company setup
 * guide computes its segments — **from the data, never from a stored flag**.
 *
 * It deliberately adds no fifth page. `/onboarding` is already the nav
 * destination (and already hides itself once complete), so the sequence goes
 * there rather than beside it.
 */

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getMyEmployeeId } from "@/lib/tenant-scope";
import {
  PROFILE_SECTIONS,
  computeCompleteSections,
  type ProfileSectionKey,
} from "@/lib/onboarding-profile-sections";

export type JourneyStep = {
  key: "profile" | "documents" | "policies" | "training";
  title: string;
  description: string;
  done: number;
  total: number;
  complete: boolean;
  href: string;
  /** Named outstanding items, so the step says *what* is missing, not just how many. */
  outstanding: string[];
};

export const getMyOnboardingJourney = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const employeeId = await getMyEmployeeId(supabase, userId);
    // Platform accounts have no employee record. That is a normal state, not an
    // error, and the caller renders an explanation rather than an empty page.
    if (!employeeId) return { steps: [] as JourneyStep[], noEmployeeRecord: true as const };

    const [profileRes, assignmentsRes, policyRes, trainingRes] = await Promise.all([
      supabase
        .from("staff_onboarding_profiles")
        .select("*")
        .eq("employee_id", employeeId)
        .maybeSingle(),
      supabase
        .from("onboarding_assignments")
        .select("checklist_id")
        .eq("employee_id", employeeId)
        .neq("status", "cancelled"),
      supabase
        .from("policy_acknowledgements")
        .select("acknowledged_at, policy_documents(title)")
        .eq("employee_id", employeeId),
      supabase
        .from("training_enrollments")
        .select("status, training_courses(title,is_mandatory)")
        .eq("employee_id", employeeId),
    ]);

    // ---- Personal details -------------------------------------------------
    const profile = profileRes?.data ?? null;
    const completeSections = computeCompleteSections(profile);
    const allSections = Object.keys(PROFILE_SECTIONS) as ProfileSectionKey[];
    const missingSections = allSections.filter((k) => !completeSections.includes(k));

    // ---- Checklist items --------------------------------------------------
    const checklistIds = [...new Set((assignmentsRes?.data ?? []).map((a: any) => a.checklist_id))];
    let checklistDone = 0;
    let checklistTotal = 0;
    let checklistComplete = false;
    let awaitingReview = 0;
    const checklistOutstanding: string[] = [];
    if (checklistIds.length) {
      const [{ data: checklists }, { data: progress }] = await Promise.all([
        supabase.from("onboarding_checklists").select("id,items").in("id", checklistIds),
        supabase
          .from("onboarding_progress")
          .select("checklist_id,item_key,approval_status")
          .eq("employee_id", employeeId),
      ]);
      const { computeOnboardingCompletion } = await import("@/lib/onboarding-completion");
      const result = computeOnboardingCompletion(
        (checklists ?? []) as never,
        (progress ?? []) as never,
        // An item backed by a profile section is done because the data is
        // there, not because the write-side sync happened to run while this
        // checklist was already assigned. See onboarding-completion.ts.
        completeSections,
      );
      // Deliberately the helper's own numbers and its own verdict, not a
      // second opinion. `computeOnboardingCompletion` counts REQUIRED items
      // only, reopens anything HR bounced back, and treats "ticked but not yet
      // approved" as awaiting review rather than done. Recomputing any of that
      // here would give the employee a different answer from the one the
      // tracker gives HR about the same person.
      checklistDone = result.doneRequired;
      checklistTotal = result.totalRequired;
      checklistComplete = result.complete;
      awaitingReview = result.awaitingReview;
      // Name what is left where the shape allows it, capped so a 40-item
      // checklist does not turn the step into a wall of text.
      for (const cl of (checklists ?? []) as any[]) {
        for (const item of (cl.items ?? []) as any[]) {
          if (item.required === false) continue;
          const hit = (progress ?? []).find(
            (p: any) => p.checklist_id === cl.id && p.item_key === item.key,
          );
          if (!hit || hit.approval_status !== "approved") {
            if (checklistOutstanding.length < 5) {
              checklistOutstanding.push(item.label ?? item.title ?? item.key);
            }
          }
        }
      }
    }

    // ---- Policies ---------------------------------------------------------
    const policies = (policyRes?.data ?? []) as any[];
    const policyOutstanding = policies.filter((p) => !p.acknowledged_at);

    // ---- Mandatory training ----------------------------------------------
    const enrolments = (trainingRes?.data ?? []) as any[];
    const mandatory = enrolments.filter((e) => e.training_courses?.is_mandatory);
    const trainingOutstanding = mandatory.filter(
      (e) => e.status !== "completed" && e.status !== "waived",
    );

    const steps: JourneyStep[] = [
      {
        key: "profile",
        title: "Your details",
        description: "Identity, address, contact, emergency contact, banking and tax.",
        done: completeSections.length,
        total: allSections.length,
        complete: missingSections.length === 0,
        href: "/onboarding/profile",
        outstanding: missingSections.map((k) => PROFILE_SECTIONS[k].label),
      },
      {
        key: "documents",
        title: "Documents & checklist",
        description: "Right-to-work evidence, certificates and anything else HR has asked for.",
        done: checklistDone,
        total: checklistTotal,
        // The helper's verdict verbatim. Note it treats "nothing assigned yet"
        // as NOT complete on purpose — a brand new hire should not be told
        // they have finished onboarding before anyone has assigned them
        // anything. The UI says "nothing assigned yet" rather than "0 of 0".
        complete: checklistComplete,
        href: "/onboarding",
        outstanding: checklistOutstanding,
      },
      {
        key: "policies",
        title: "Policies to sign",
        description: "Read each one and confirm you have understood it.",
        done: policies.length - policyOutstanding.length,
        total: policies.length,
        complete: policyOutstanding.length === 0,
        href: "/me/policies",
        outstanding: policyOutstanding
          .slice(0, 5)
          .map((p) => p.policy_documents?.title ?? "Policy"),
      },
      {
        key: "training",
        title: "Mandatory training",
        description: "Compliance courses you need to finish, with their due dates.",
        done: mandatory.length - trainingOutstanding.length,
        total: mandatory.length,
        complete: trainingOutstanding.length === 0,
        href: "/me/training",
        outstanding: trainingOutstanding
          .slice(0, 5)
          .map((e) => e.training_courses?.title ?? "Course"),
      },
    ];

    return {
      steps,
      noEmployeeRecord: false as const,
      complete: steps.every((s) => s.complete),
      submittedAt: (profile as any)?.submitted_at ?? null,
      awaitingReview,
      nothingAssigned: checklistIds.length === 0,
    };
  });
