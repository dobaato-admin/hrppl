import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { r as renderPayslipPdfBytes } from "./payslip-pdf-CVFDB09H.mjs";
import { sendInternalEmail } from "./send-internal.server-9cG3k97B.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/jspdf.mjs";
import "../_libs/jspdf-autotable.mjs";
import "../_libs/react.mjs";
import "../_libs/seroval.mjs";
import { a as objectType, z as stringType } from "../_libs/zod.mjs";
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
import "node:stream";
import "./client.server-D5ro3rAQ.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
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
import "../_libs/fflate.mjs";
import "../_libs/fast-png.mjs";
import "../_libs/iobuffer.mjs";
import "../_libs/pako.mjs";
import "fs";
import "path";
import "../_libs/html2canvas.mjs";
import "../_libs/dompurify.mjs";
import "../_libs/canvg.mjs";
import "../_libs/core-js.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/raf.mjs";
import "../_libs/performance-now.mjs";
import "../_libs/rgbcolor.mjs";
import "../_libs/svg-pathdata.mjs";
import "../_libs/stackblur-canvas.mjs";
const SIGNED_URL_TTL_SECONDS = 72 * 3600;
const SIGNED_URL_EXPIRES_HOURS = 72;
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function assertOrgAdminForTenant(ctxSupabase, userId, tenantId) {
  const {
    data: roles
  } = await ctxSupabase.from("user_roles").select("role").eq("user_id", userId);
  const rs = (roles ?? []).map((r) => r.role);
  if (rs.includes("super_admin")) return;
  if (!rs.includes("org_admin")) throw new Error("Forbidden: org admin role required");
  const {
    data: profile
  } = await ctxSupabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile || profile.tenant_id !== tenantId) throw new Error("Forbidden: tenant mismatch");
}
function formatMoney(n, currency) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(n) || 0);
  } catch {
    return String(n);
  }
}
const emailRunPayslips_createServerFn_handler = createServerRpc({
  id: "ee9ec807205c1a0834fe032d11c62c917da5a3edbec1643023faf7ae5a716243",
  name: "emailRunPayslips",
  filename: "src/lib/payroll-emails.functions.ts"
}, (opts) => emailRunPayslips.__executeServer(opts));
const emailRunPayslips = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  runId: stringType().uuid()
}).parse(d)).handler(emailRunPayslips_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: run,
    error: rerr
  } = await supabase.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
  if (rerr || !run) throw new Error("Payroll run not found");
  if (run.status !== "approved") {
    throw new Error("Only approved runs can be emailed");
  }
  await assertOrgAdminForTenant(supabase, userId, run.tenant_id);
  const admin = await loadAdmin();
  const {
    data: tenant
  } = await admin.from("tenants").select("name,country_code").eq("id", run.tenant_id).maybeSingle();
  if (!tenant) throw new Error("Tenant not found");
  const {
    data: payslips,
    error: perr
  } = await admin.from("payroll_payslips").select("*").eq("run_id", run.id);
  if (perr) throw new Error("Failed to load payslips");
  if (!payslips || payslips.length === 0) {
    return {
      sent: 0,
      skipped: 0,
      failed: 0,
      total: 0,
      errors: []
    };
  }
  const empIds = Array.from(new Set(payslips.map((p) => p.employee_id)));
  const {
    data: employees
  } = await admin.from("employees").select("id,first_name,last_name,employee_number,email,job_title").in("id", empIds);
  const empMap = {};
  (employees ?? []).forEach((e) => {
    empMap[e.id] = e;
  });
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];
  for (const p of payslips) {
    const e = empMap[p.employee_id];
    if (!e) {
      skipped++;
      errors.push(`Missing employee for payslip ${p.id}`);
      continue;
    }
    if (!e.email) {
      skipped++;
      errors.push(`No email on file for employee ${e.employee_number ?? e.id}`);
      continue;
    }
    try {
      const {
        bytes
      } = renderPayslipPdfBytes({
        payslip: {
          id: p.id,
          currency_code: p.currency_code,
          gross: Number(p.gross),
          income_tax: Number(p.income_tax),
          employee_contributions: Number(p.employee_contributions),
          employer_contributions: Number(p.employer_contributions),
          allowances: Number(p.allowances ?? 0),
          deductions: Number(p.deductions ?? 0),
          net_pay: Number(p.net_pay),
          lines: p.lines ?? []
        },
        run: {
          period_start: run.period_start,
          period_end: run.period_end,
          pay_date: run.pay_date
        },
        employee: {
          first_name: e.first_name,
          last_name: e.last_name,
          employee_number: e.employee_number,
          email: e.email,
          job_title: e.job_title
        },
        tenant: {
          name: tenant.name,
          country_code: tenant.country_code
        }
      });
      const storagePath = `${run.tenant_id}/${run.id}/${p.id}.pdf`;
      const {
        error: upErr
      } = await admin.storage.from("payslips").upload(storagePath, bytes, {
        contentType: "application/pdf",
        upsert: true
      });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
      const {
        data: signed,
        error: signErr
      } = await admin.storage.from("payslips").createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
      if (signErr || !signed?.signedUrl) throw new Error(`Signed URL failed: ${signErr?.message ?? "unknown"}`);
      await sendInternalEmail({
        templateName: "payslip-ready",
        recipientEmail: e.email,
        idempotencyKey: `payslip-ready-${p.id}`,
        templateData: {
          employeeName: `${e.first_name} ${e.last_name}`,
          periodStart: run.period_start,
          periodEnd: run.period_end,
          payDate: run.pay_date,
          netPay: formatMoney(Number(p.net_pay), p.currency_code),
          currency: p.currency_code,
          downloadUrl: signed.signedUrl,
          expiresInHours: SIGNED_URL_EXPIRES_HOURS,
          tenantName: tenant.name
        }
      });
      await admin.from("audit_log").insert({
        entity_type: "payslip",
        entity_id: p.id,
        action: "payslip_emailed",
        actor_id: userId,
        metadata: {
          run_id: run.id,
          tenant_id: run.tenant_id,
          employee_id: e.id,
          recipient_email: e.email,
          storage_path: storagePath
        }
      });
      sent++;
    } catch (err) {
      failed++;
      errors.push(`Payslip ${p.id}: ${err?.message ?? "unknown error"}`);
    }
  }
  return {
    sent,
    skipped,
    failed,
    total: payslips.length,
    errors
  };
});
const resendPayslipEmail_createServerFn_handler = createServerRpc({
  id: "c4080e9ea788e657df3c1e0002ac4576fb6bab0047b3ee1be02527b84d6c4f46",
  name: "resendPayslipEmail",
  filename: "src/lib/payroll-emails.functions.ts"
}, (opts) => resendPayslipEmail.__executeServer(opts));
const resendPayslipEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  runId: stringType().uuid(),
  payslipId: stringType().uuid()
}).parse(d)).handler(resendPayslipEmail_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: run,
    error: rerr
  } = await supabase.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
  if (rerr || !run) throw new Error("Payroll run not found");
  if (run.status !== "approved") {
    throw new Error("Only approved runs can be emailed");
  }
  await assertOrgAdminForTenant(supabase, userId, run.tenant_id);
  const admin = await loadAdmin();
  const {
    data: payslip,
    error: perr
  } = await admin.from("payroll_payslips").select("*").eq("id", data.payslipId).eq("run_id", run.id).maybeSingle();
  if (perr || !payslip) throw new Error("Payslip not found");
  const {
    data: employee
  } = await admin.from("employees").select("id,first_name,last_name,employee_number,email,job_title").eq("id", payslip.employee_id).maybeSingle();
  if (!employee || !employee.email) throw new Error("Employee email not found");
  const {
    data: tenant
  } = await admin.from("tenants").select("name,country_code").eq("id", run.tenant_id).maybeSingle();
  if (!tenant) throw new Error("Tenant not found");
  const {
    bytes
  } = renderPayslipPdfBytes({
    payslip: {
      id: payslip.id,
      currency_code: payslip.currency_code,
      gross: Number(payslip.gross),
      income_tax: Number(payslip.income_tax),
      employee_contributions: Number(payslip.employee_contributions),
      employer_contributions: Number(payslip.employer_contributions),
      allowances: Number(payslip.allowances ?? 0),
      deductions: Number(payslip.deductions ?? 0),
      net_pay: Number(payslip.net_pay),
      lines: payslip.lines ?? []
    },
    run: {
      period_start: run.period_start,
      period_end: run.period_end,
      pay_date: run.pay_date
    },
    employee: {
      first_name: employee.first_name,
      last_name: employee.last_name,
      employee_number: employee.employee_number,
      email: employee.email,
      job_title: employee.job_title
    },
    tenant: {
      name: tenant.name,
      country_code: tenant.country_code
    }
  });
  const storagePath = `${run.tenant_id}/${run.id}/${payslip.id}.pdf`;
  const {
    error: upErr
  } = await admin.storage.from("payslips").upload(storagePath, bytes, {
    contentType: "application/pdf",
    upsert: true
  });
  if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
  const {
    data: signed,
    error: signErr
  } = await admin.storage.from("payslips").createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
  if (signErr || !signed?.signedUrl) throw new Error(`Signed URL failed: ${signErr?.message ?? "unknown"}`);
  await sendInternalEmail({
    templateName: "payslip-ready",
    recipientEmail: employee.email,
    idempotencyKey: `payslip-resent-${payslip.id}-${Date.now()}`,
    templateData: {
      employeeName: `${employee.first_name} ${employee.last_name}`,
      periodStart: run.period_start,
      periodEnd: run.period_end,
      payDate: run.pay_date,
      netPay: formatMoney(Number(payslip.net_pay), payslip.currency_code),
      currency: payslip.currency_code,
      downloadUrl: signed.signedUrl,
      expiresInHours: SIGNED_URL_EXPIRES_HOURS,
      tenantName: tenant.name
    }
  });
  await admin.from("audit_log").insert({
    entity_type: "payslip",
    entity_id: payslip.id,
    action: "payslip_email_resent",
    actor_id: userId,
    metadata: {
      run_id: run.id,
      tenant_id: run.tenant_id,
      employee_id: employee.id,
      recipient_email: employee.email,
      storage_path: storagePath
    }
  });
  return {
    ok: true
  };
});
const bulkResendPayslipsInRange_createServerFn_handler = createServerRpc({
  id: "954fe7ec30e573869760d4bbe3081779223d3a4bcd9ca7c025886bb47daddd4e",
  name: "bulkResendPayslipsInRange",
  filename: "src/lib/payroll-emails.functions.ts"
}, (opts) => bulkResendPayslipsInRange.__executeServer(opts));
const bulkResendPayslipsInRange = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  from: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  tenantId: stringType().uuid().optional()
}).parse(d)).handler(bulkResendPayslipsInRange_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const rs = (roles ?? []).map((r) => r.role);
  const isSuper = rs.includes("super_admin");
  if (!isSuper && !rs.includes("org_admin")) throw new Error("Forbidden: org admin role required");
  let tenantId = data.tenantId ?? null;
  if (!tenantId) {
    const {
      data: profile
    } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    tenantId = profile?.tenant_id ?? null;
  }
  if (!tenantId) throw new Error("Tenant not resolved");
  if (!isSuper) {
    const {
      data: profile
    } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!profile || profile.tenant_id !== tenantId) throw new Error("Forbidden: tenant mismatch");
  }
  if (data.from > data.to) throw new Error("Invalid date range");
  const admin = await loadAdmin();
  const {
    data: runs,
    error: runsErr
  } = await admin.from("payroll_runs").select("*").eq("tenant_id", tenantId).eq("status", "approved").gte("pay_date", data.from).lte("pay_date", data.to).order("pay_date", {
    ascending: true
  });
  if (runsErr) throw new Error(`Failed to load runs: ${runsErr.message}`);
  if (!runs || runs.length === 0) {
    return {
      runs: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      total: 0,
      errors: []
    };
  }
  const {
    data: tenant
  } = await admin.from("tenants").select("name,country_code").eq("id", tenantId).maybeSingle();
  if (!tenant) throw new Error("Tenant not found");
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  let total = 0;
  const errors = [];
  for (const run of runs) {
    const {
      data: payslips,
      error: perr
    } = await admin.from("payroll_payslips").select("*").eq("run_id", run.id);
    if (perr) {
      errors.push(`Run ${run.id}: ${perr.message}`);
      continue;
    }
    if (!payslips || payslips.length === 0) continue;
    total += payslips.length;
    const empIds = Array.from(new Set(payslips.map((p) => p.employee_id)));
    const {
      data: employees
    } = await admin.from("employees").select("id,first_name,last_name,employee_number,email,job_title").in("id", empIds);
    const empMap = {};
    (employees ?? []).forEach((e) => {
      empMap[e.id] = e;
    });
    for (const p of payslips) {
      const e = empMap[p.employee_id];
      if (!e) {
        skipped++;
        errors.push(`Run ${run.id}: missing employee for payslip ${p.id}`);
        continue;
      }
      if (!e.email) {
        skipped++;
        errors.push(`Run ${run.id}: no email for ${e.employee_number ?? e.id}`);
        continue;
      }
      try {
        const {
          bytes
        } = renderPayslipPdfBytes({
          payslip: {
            id: p.id,
            currency_code: p.currency_code,
            gross: Number(p.gross),
            income_tax: Number(p.income_tax),
            employee_contributions: Number(p.employee_contributions),
            employer_contributions: Number(p.employer_contributions),
            allowances: Number(p.allowances ?? 0),
            deductions: Number(p.deductions ?? 0),
            net_pay: Number(p.net_pay),
            lines: p.lines ?? []
          },
          run: {
            period_start: run.period_start,
            period_end: run.period_end,
            pay_date: run.pay_date
          },
          employee: {
            first_name: e.first_name,
            last_name: e.last_name,
            employee_number: e.employee_number,
            email: e.email,
            job_title: e.job_title
          },
          tenant: {
            name: tenant.name,
            country_code: tenant.country_code
          }
        });
        const storagePath = `${run.tenant_id}/${run.id}/${p.id}.pdf`;
        const {
          error: upErr
        } = await admin.storage.from("payslips").upload(storagePath, bytes, {
          contentType: "application/pdf",
          upsert: true
        });
        if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
        const {
          data: signed,
          error: signErr
        } = await admin.storage.from("payslips").createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
        if (signErr || !signed?.signedUrl) throw new Error(`Signed URL failed: ${signErr?.message ?? "unknown"}`);
        await sendInternalEmail({
          templateName: "payslip-ready",
          recipientEmail: e.email,
          idempotencyKey: `payslip-bulk-resent-${p.id}-${Date.now()}`,
          templateData: {
            employeeName: `${e.first_name} ${e.last_name}`,
            periodStart: run.period_start,
            periodEnd: run.period_end,
            payDate: run.pay_date,
            netPay: formatMoney(Number(p.net_pay), p.currency_code),
            currency: p.currency_code,
            downloadUrl: signed.signedUrl,
            expiresInHours: SIGNED_URL_EXPIRES_HOURS,
            tenantName: tenant.name
          }
        });
        await admin.from("audit_log").insert({
          entity_type: "payslip",
          entity_id: p.id,
          action: "payslip_email_resent",
          actor_id: userId,
          metadata: {
            run_id: run.id,
            tenant_id: run.tenant_id,
            employee_id: e.id,
            recipient_email: e.email,
            storage_path: storagePath,
            bulk: true,
            range_from: data.from,
            range_to: data.to
          }
        });
        sent++;
      } catch (err) {
        failed++;
        errors.push(`Run ${run.id} / payslip ${p.id}: ${err?.message ?? "unknown error"}`);
      }
    }
  }
  return {
    runs: runs.length,
    sent,
    skipped,
    failed,
    total,
    errors
  };
});
export {
  bulkResendPayslipsInRange_createServerFn_handler,
  emailRunPayslips_createServerFn_handler,
  resendPayslipEmail_createServerFn_handler
};
