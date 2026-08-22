import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Text } from "../_libs/react-email__text.mjs";
import { S as Section } from "../_libs/react-email__section.mjs";
import { B as Button } from "../_libs/react-email__button.mjs";
import { H as Html } from "../_libs/react-email__html.mjs";
import { H as Head } from "../_libs/react-email__head.mjs";
import { P as Preview } from "../_libs/react-email__preview.mjs";
import { B as Body } from "../_libs/react-email__body.mjs";
import { C as Container } from "../_libs/react-email__container.mjs";
import { H as Heading } from "../_libs/react-email__heading.mjs";
const main$1 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$1 = { padding: "24px", maxWidth: "560px", margin: "0 auto" };
const card$1 = {
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "16px 0",
  backgroundColor: "#f9fafb"
};
const label = { color: "#6b7280", fontSize: "12px", margin: "0 0 4px" };
const value = { color: "#111827", fontSize: "14px", margin: "0 0 12px", fontWeight: 500 };
function Shell({
  preview,
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Html, { lang: "en", dir: "ltr", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Head, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Preview, { children: preview }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Body, { style: main$1, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { style: container$1, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { style: { fontSize: "20px", color: "#111827", margin: "0 0 12px" }, children: title }),
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { style: { marginTop: "24px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: "12px", color: "#6b7280" }, children: "You are receiving this email because of a leave request in your organization." }) })
    ] }) })
  ] });
}
function DetailsCard({
  employeeName,
  leaveType,
  startDate,
  endDate,
  days,
  reason
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
    employeeName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Employee" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: employeeName })
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Leave type" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: leaveType ?? "—" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Dates" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: value, children: [
      startDate ?? "—",
      " → ",
      endDate ?? "—",
      " (",
      days ?? "—",
      " day",
      Number(days) === 1 ? "" : "s",
      ")"
    ] }),
    reason ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Reason" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { ...value, fontWeight: 400, whiteSpace: "pre-wrap" }, children: reason })
    ] }) : null
  ] });
}
const Email$n = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Shell,
  {
    preview: `${p.employeeName ?? "An employee"} requested time off`,
    title: "New leave request awaiting approval",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        p.employeeName ?? "An employee",
        " submitted a new leave request. Please review and approve or reject it in the dashboard."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailsCard, { ...p })
    ]
  }
);
const template$n = {
  component: Email$n,
  subject: (d) => `Leave request from ${d.employeeName ?? "an employee"}`,
  displayName: "Leave submitted (manager)",
  previewData: { employeeName: "Jane Doe", leaveType: "Annual Leave", startDate: "2026-07-01", endDate: "2026-07-05", days: 5, reason: "Family holiday" }
};
const Email$m = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Shell, { preview: "We received your leave request", title: "Leave request submitted", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: "Your leave request has been submitted and is pending approval. You'll receive another email once it's reviewed." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(DetailsCard, { ...p })
] });
const template$m = {
  component: Email$m,
  subject: "Your leave request was submitted",
  displayName: "Leave submitted (employee)",
  previewData: { leaveType: "Annual Leave", startDate: "2026-07-01", endDate: "2026-07-05", days: 5 }
};
const Email$l = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Shell, { preview: "Your leave request was approved", title: "Leave request approved ✅", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
    "Good news — your leave request has been approved",
    p.approverName ? ` by ${p.approverName}` : "",
    "."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(DetailsCard, { ...p })
] });
const template$l = {
  component: Email$l,
  subject: "Your leave request was approved",
  displayName: "Leave approved (employee)",
  previewData: { approverName: "Alex Manager", leaveType: "Annual Leave", startDate: "2026-07-01", endDate: "2026-07-05", days: 5 }
};
const Email$k = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Shell, { preview: "Your leave request was rejected", title: "Leave request rejected", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
    "Your leave request was not approved",
    p.approverName ? ` by ${p.approverName}` : "",
    "."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(DetailsCard, { ...p }),
  p.rejectionReason ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: { fontSize: "14px", color: "#374151" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Reason:" }),
    " ",
    p.rejectionReason
  ] }) : null,
  /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: "If you have questions, please follow up with your manager." })
] });
const template$k = {
  component: Email$k,
  subject: "Your leave request was rejected",
  displayName: "Leave rejected (employee)",
  previewData: { approverName: "Alex Manager", leaveType: "Annual Leave", startDate: "2026-07-01", endDate: "2026-07-05", days: 5, rejectionReason: "Team capacity that week." }
};
const Email$j = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Shell,
  {
    preview: `${p.employeeName ?? "An employee"} cancelled a leave request`,
    title: "Leave request cancelled",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        p.employeeName ?? "An employee",
        " cancelled the following leave request. No action is needed."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailsCard, { ...p })
    ]
  }
);
const template$j = {
  component: Email$j,
  subject: (d) => `Leave request cancelled by ${d.employeeName ?? "employee"}`,
  displayName: "Leave cancelled (manager)",
  previewData: { employeeName: "Jane Doe", leaveType: "Annual Leave", startDate: "2026-07-01", endDate: "2026-07-05", days: 5 }
};
const Email$i = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Shell,
  {
    preview: `Your payslip for ${p.periodStart ?? ""} – ${p.periodEnd ?? ""} is ready`,
    title: "Your payslip is ready",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        "Hi",
        p.employeeName ? ` ${p.employeeName}` : "",
        ", your payslip",
        p.tenantName ? ` from ${p.tenantName}` : "",
        " has been approved and is ready to download."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Pay period" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: value, children: [
          p.periodStart ?? "—",
          " → ",
          p.periodEnd ?? "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Pay date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.payDate ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Net pay" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: value, children: [
          p.netPay ?? "—",
          " ",
          p.currency ?? ""
        ] })
      ] }),
      p.downloadUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: { textAlign: "center", margin: "24px 0" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            href: p.downloadUrl,
            style: {
              backgroundColor: "#111827",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: 600
            },
            children: "Download payslip (PDF)"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: { fontSize: "12px", color: "#6b7280", marginTop: "12px" }, children: [
          "This secure link expires in ",
          p.expiresInHours ?? 72,
          " hours."
        ] })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: "13px", color: "#374151" }, children: "You can also view this payslip anytime by signing in to your account." })
    ]
  }
);
const template$i = {
  component: Email$i,
  subject: (d) => `Your payslip for ${d.periodStart ?? ""} – ${d.periodEnd ?? ""}`,
  displayName: "Payslip ready",
  previewData: {
    employeeName: "Jane Doe",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-30",
    payDate: "2026-07-05",
    netPay: "3,250.00",
    currency: "USD",
    downloadUrl: "https://example.com/signed-url",
    expiresInHours: 72,
    tenantName: "Acme Corp"
  }
};
const COPY$1 = {
  self: {
    preview: "Your self-review is pending",
    title: "Your self-review is pending",
    intro: "Take a few minutes to share your reflections — your manager needs your self-review to finalize this cycle.",
    cta: "Complete self-review",
    subject: "Reminder: complete your self-review"
  },
  manager: {
    preview: "A direct report is waiting on your review",
    title: "Manager review pending",
    intro: "Your team member has submitted their self-review. Please complete the manager review to keep the cycle on track.",
    cta: "Open manager review",
    subject: "Reminder: manager review pending"
  },
  acknowledgment: {
    preview: "Acknowledge your finalized review",
    title: "Please acknowledge your review",
    intro: "Your review has been finalized. Acknowledging it signs off this cycle for you.",
    cta: "Acknowledge review",
    subject: "Reminder: acknowledge your finalized review"
  },
  calibration: {
    preview: "Reviews are ready for calibration",
    title: "Reviews awaiting calibration",
    intro: "Manager reviews have been submitted in this cycle and are awaiting your calibration before finalizing.",
    cta: "Open calibration",
    subject: "Reminder: reviews ready for calibration"
  }
};
const Email$h = ({ kind = "self", recipientName, cycleName, employeeName, dueDate, appUrl }) => {
  const c = COPY$1[kind];
  const url = appUrl || "https://hrppl.io/performance";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Shell, { preview: c.preview, title: c.title, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: recipientName ? `Hi ${recipientName},` : "Hi there," }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: c.intro }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
      cycleName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Cycle" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: cycleName })
      ] }) : null,
      employeeName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Employee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: employeeName })
      ] }) : null,
      dueDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Period ends" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: dueDate })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        href: url,
        style: { background: "#111827", color: "#ffffff", padding: "10px 18px", borderRadius: "6px", fontSize: "14px" },
        children: c.cta
      }
    )
  ] });
};
const template$h = {
  component: Email$h,
  subject: (data) => COPY$1[data?.kind ?? "self"].subject,
  displayName: "Performance review reminder",
  previewData: { kind: "self", recipientName: "Jamie", cycleName: "H1 2026", dueDate: "2026-06-30" }
};
const Email$g = ({
  audience = "employee",
  recipientName,
  employeeName,
  checklistName,
  dueDate,
  daysOverdue,
  appUrl
}) => {
  const url = appUrl || "https://hrppl.io/onboarding";
  const isManager = audience === "manager";
  const title = isManager ? "Onboarding task is overdue" : "Your onboarding task is overdue";
  const intro = isManager ? `An onboarding checklist assigned to ${employeeName || "a team member"} is past its due date. Please check in and help them complete it.` : "One of your onboarding checklists is past its due date. Please complete the remaining items as soon as possible.";
  const cta = isManager ? "Review onboarding" : "Open onboarding";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Shell, { preview: title, title, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: recipientName ? `Hi ${recipientName},` : "Hi there," }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: intro }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
      checklistName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Checklist" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: checklistName })
      ] }) : null,
      isManager && employeeName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Employee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: employeeName })
      ] }) : null,
      dueDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Due date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: dueDate })
      ] }) : null,
      typeof daysOverdue === "number" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Days overdue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: daysOverdue })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        href: url,
        style: { background: "#111827", color: "#ffffff", padding: "10px 18px", borderRadius: "6px", fontSize: "14px" },
        children: cta
      }
    )
  ] });
};
const template$g = {
  component: Email$g,
  subject: (data) => data?.audience === "manager" ? `Onboarding overdue${data?.employeeName ? `: ${data.employeeName}` : ""}` : "Your onboarding task is overdue",
  displayName: "Onboarding overdue reminder",
  previewData: {
    audience: "employee",
    recipientName: "Jamie",
    checklistName: "New hire week 1",
    dueDate: "2026-05-20",
    daysOverdue: 5
  }
};
const Email$f = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Shell, { preview: `You're invited to join ${p.organizationName ?? "our team"}`, title: `Join ${p.organizationName ?? "our team"} on WorldPay HRMS`, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
    "Hi",
    p.firstName ? ` ${p.firstName}` : "",
    ", ",
    p.inviterName ? `${p.inviterName} has` : "you have been",
    " invited you to join ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.organizationName ?? "their organization" }),
    p.jobTitle ? ` as ${p.jobTitle}` : "",
    "."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Organization" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.organizationName ?? "—" }),
    p.jobTitle ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Role" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.jobTitle })
    ] }) : null
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { style: { textAlign: "center", margin: "24px 0" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      href: p.inviteUrl,
      style: {
        backgroundColor: "#3b82f6",
        color: "#ffffff",
        padding: "12px 24px",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: "14px"
      },
      children: "Accept invitation"
    }
  ) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: { fontSize: "12px", color: "#6b7280" }, children: [
    "Or copy this link into your browser:",
    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
    p.inviteUrl
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: "12px", color: "#6b7280" }, children: "This invitation expires in 14 days. After accepting, you'll be guided through a short onboarding form to provide your employment, tax, and banking details based on your country of residence." })
] });
const template$f = {
  component: Email$f,
  subject: (d) => `You're invited to join ${d.organizationName ?? "our team"}`,
  displayName: "Staff invitation",
  previewData: {
    organizationName: "Acme Inc",
    inviterName: "Jamie Admin",
    firstName: "Sam",
    jobTitle: "Software Engineer",
    inviteUrl: "https://hrppl.io/invite/example-token"
  }
};
const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "24px", maxWidth: "560px", margin: "0 auto" };
const card = {
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "16px 0",
  backgroundColor: "#f9fafb"
};
const labelStyle = { color: "#6b7280", fontSize: "12px", margin: "0 0 4px" };
const valueStyle = { color: "#111827", fontSize: "14px", margin: "0 0 12px", fontWeight: 500 };
const btn = {
  backgroundColor: "#111827",
  color: "#ffffff",
  padding: "10px 18px",
  borderRadius: "6px",
  fontSize: "14px",
  textDecoration: "none",
  display: "inline-block",
  fontWeight: 600
};
function DocShell({
  preview,
  title,
  children,
  footer = "You are receiving this email because of a document in your organization."
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Html, { lang: "en", dir: "ltr", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Head, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Preview, { children: preview }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Body, { style: main, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { style: container, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { style: { fontSize: "20px", color: "#111827", margin: "0 0 12px" }, children: title }),
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { style: { marginTop: "24px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: "12px", color: "#6b7280" }, children: footer }) })
    ] }) })
  ] });
}
function DocCard({
  subject,
  docType,
  dueDate,
  recipientName,
  status,
  signedAt,
  reason
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card, children: [
    subject ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: labelStyle, children: "Document" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: valueStyle, children: subject })
    ] }) : null,
    docType ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: labelStyle, children: "Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: valueStyle, children: docType.replace(/_/g, " ") })
    ] }) : null,
    recipientName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: labelStyle, children: "Recipient" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: valueStyle, children: recipientName })
    ] }) : null,
    status ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: labelStyle, children: "Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: valueStyle, children: status.replace(/_/g, " ") })
    ] }) : null,
    signedAt ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: labelStyle, children: "Signed at" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: valueStyle, children: signedAt })
    ] }) : null,
    dueDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: labelStyle, children: "Due" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: valueStyle, children: dueDate })
    ] }) : null,
    reason ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: labelStyle, children: "Reason" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { ...valueStyle, fontWeight: 400, whiteSpace: "pre-wrap" }, children: reason })
    ] }) : null
  ] });
}
function DocButton({ href, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { style: { margin: "20px 0" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { href, style: btn, children }) });
}
const Email$e = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DocShell, { preview: `Please sign: ${p.subject ?? "a document"}`, title: "A document is awaiting your signature", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
    "Hi ",
    p.recipientName ?? "there",
    ","
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
    p.senderName ?? "Your organisation",
    " has sent you a document to review and sign."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(DocCard, { subject: p.subject, docType: p.docType, dueDate: p.dueDate }),
  p.signUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(DocButton, { href: p.signUrl, children: "Review & sign" }) : null,
  /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: "12px", color: "#6b7280" }, children: "If you did not expect this, you can safely ignore the email." })
] });
const template$e = {
  component: Email$e,
  subject: (d) => `Please sign: ${d?.subject ?? "document"}`,
  displayName: "Document — sent to signer",
  previewData: {
    recipientName: "Sam Employee",
    subject: "Employment Contract",
    docType: "employment_contract",
    dueDate: "2026-06-20",
    signUrl: "https://hrppl.io/sign/abc",
    senderName: "Acme Corp"
  }
};
const Email$d = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  DocShell,
  {
    preview: `${p.signerName ?? "A signer"} signed ${p.subject ?? "a document"}`,
    title: "A signer has signed the document",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        "Hi ",
        p.recipientName ?? "there",
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        p.signerName ?? "A signer",
        " has signed ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.subject ?? "the document" }),
        p.signedAt ? ` on ${p.signedAt}` : "",
        ".",
        p.remainingSigners && p.remainingSigners > 0 ? ` ${p.remainingSigners} signer${p.remainingSigners === 1 ? "" : "s"} still to go.` : " All signers are complete."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DocCard, { subject: p.subject, docType: p.docType, signedAt: p.signedAt }),
      p.envelopeUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(DocButton, { href: p.envelopeUrl, children: "Open envelope" }) : null
    ]
  }
);
const template$d = {
  component: Email$d,
  subject: (d) => `${d?.signerName ?? "Signer"} signed: ${d?.subject ?? "document"}`,
  displayName: "Document — signer signed (admin)",
  previewData: {
    recipientName: "Admin",
    signerName: "Sam Employee",
    subject: "Employment Contract",
    docType: "employment_contract",
    signedAt: "2026-06-10 14:22",
    envelopeUrl: "https://hrppl.io/org/documents/envelope/abc",
    remainingSigners: 1
  }
};
const Email$c = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  DocShell,
  {
    preview: `${p.signerName ?? "A signer"} declined ${p.subject ?? "a document"}`,
    title: "A signer declined the document",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        "Hi ",
        p.recipientName ?? "there",
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        p.signerName ?? "A signer",
        " declined ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.subject ?? "the document" }),
        ". The envelope has been moved to ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "declined" }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DocCard, { subject: p.subject, docType: p.docType, reason: p.reason, status: "declined" }),
      p.envelopeUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(DocButton, { href: p.envelopeUrl, children: "Open envelope" }) : null
    ]
  }
);
const template$c = {
  component: Email$c,
  subject: (d) => `Declined: ${d?.subject ?? "document"}`,
  displayName: "Document — declined (admin)",
  previewData: {
    recipientName: "Admin",
    signerName: "Sam Employee",
    subject: "Employment Contract",
    docType: "employment_contract",
    reason: "Salary figure incorrect",
    envelopeUrl: "https://hrppl.io/org/documents/envelope/abc"
  }
};
const Email$b = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  DocShell,
  {
    preview: `${p.subject ?? "A document"} is fully signed`,
    title: "Document fully signed",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        "Hi ",
        p.recipientName ?? "there",
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        "All parties have signed ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.subject ?? "the document" }),
        ". A countersigned copy with an audit trail is attached below."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DocCard, { subject: p.subject, docType: p.docType, signedAt: p.completedAt, status: "completed" }),
      p.certificateUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(DocButton, { href: p.certificateUrl, children: "View signed copy" }) : null
    ]
  }
);
const template$b = {
  component: Email$b,
  subject: (d) => `Signed: ${d?.subject ?? "document"}`,
  displayName: "Document — completed (all parties)",
  previewData: {
    recipientName: "Sam Employee",
    subject: "Employment Contract",
    docType: "employment_contract",
    completedAt: "2026-06-12 09:00",
    certificateUrl: "https://hrppl.io/sign/abc/certificate"
  }
};
const Email$a = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  DocShell,
  {
    preview: `Reminder: please sign ${p.subject ?? "document"}`,
    title: "Reminder: a document is waiting on you",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        "Hi ",
        p.recipientName ?? "there",
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        "This is a friendly reminder that ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.subject ?? "the document" }),
        " is still awaiting your signature."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DocCard, { subject: p.subject, docType: p.docType, dueDate: p.dueDate }),
      p.signUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(DocButton, { href: p.signUrl, children: "Review & sign" }) : null
    ]
  }
);
const template$a = {
  component: Email$a,
  subject: (d) => `Reminder: please sign ${d?.subject ?? "document"}`,
  displayName: "Document — reminder",
  previewData: {
    recipientName: "Sam Employee",
    subject: "Employment Contract",
    docType: "employment_contract",
    dueDate: "2026-06-20",
    signUrl: "https://hrppl.io/sign/abc"
  }
};
const Email$9 = ({
  recipientName,
  scannerName,
  severity,
  title,
  description,
  internalId,
  scannedAt,
  findingsUrl,
  errorCount
}) => {
  const url = findingsUrl || "https://hrppl.io/admin/security";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Shell, { preview: `Security alert: ${title || "new ERROR finding"}`, title: "Security finding detected", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: recipientName ? `Hi ${recipientName},` : "Hi super admin," }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
      "A scheduled security scan flagged",
      " ",
      typeof errorCount === "number" && errorCount > 1 ? `${errorCount} ERROR-level findings` : "an ERROR-level finding",
      " ",
      "on the portal. Review and triage in the admin security console."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
      title ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Finding" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: title })
      ] }) : null,
      severity ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Severity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: severity })
      ] }) : null,
      scannerName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Scanner" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: scannerName })
      ] }) : null,
      internalId ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Internal ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: internalId })
      ] }) : null,
      scannedAt ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Detected at" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: scannedAt })
      ] }) : null,
      description ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: description.slice(0, 600) })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, children: "Open security findings →" }) })
  ] });
};
const template$9 = {
  component: Email$9,
  subject: (data) => `[Security] ${data?.severity?.toUpperCase?.() || "ERROR"}: ${data?.title || "New finding detected"}`,
  displayName: "Security finding alert",
  previewData: {
    recipientName: "Admin",
    scannerName: "lovable.security",
    severity: "error",
    title: "IDOR in signed-url endpoint",
    description: "A finding was detected during the weekly automated scan.",
    internalId: "sample-001",
    scannedAt: (/* @__PURE__ */ new Date()).toISOString(),
    errorCount: 1
  }
};
const Email$8 = ({ code, purpose, expiresInMinutes }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Shell,
  {
    preview: `Your hrppl verification code is ${code ?? "------"}`,
    title: "Your verification code",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: purpose === "enroll" ? "Use the code below to finish setting up email-based two-factor authentication." : "Use the code below to finish signing in to hrppl." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { ...value, fontSize: 24, letterSpacing: 4 }, children: code ?? "------" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Valid for" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: value, children: [
          expiresInMinutes ?? 10,
          " minutes"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: "If you didn't request this, you can safely ignore this email." })
    ]
  }
);
const template$8 = {
  component: Email$8,
  subject: (data) => `Your hrppl verification code: ${data?.code ?? ""}`.trim(),
  displayName: "MFA verification code",
  previewData: { code: "123456", purpose: "login", expiresInMinutes: 10 }
};
const Email$7 = ({ recipientName, courseTitle, dueDate, daysOverdue, appUrl }) => {
  const url = appUrl || "https://hrppl.io/me/training";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Shell, { preview: "Your training is overdue", title: "Training overdue", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: recipientName ? `Hi ${recipientName},` : "Hi there," }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: "Our records show your assigned training is past its due date. Please complete the remaining items as soon as possible to stay compliant." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
      courseTitle ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Course" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: courseTitle })
      ] }) : null,
      dueDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Due date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: dueDate })
      ] }) : null,
      typeof daysOverdue === "number" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Days overdue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: daysOverdue })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        href: url,
        style: { background: "#111827", color: "#ffffff", padding: "10px 18px", borderRadius: "6px", fontSize: "14px" },
        children: "Open training"
      }
    )
  ] });
};
const template$7 = {
  component: Email$7,
  subject: (data) => `Training overdue${data?.courseTitle ? `: ${data.courseTitle}` : ""}`,
  displayName: "Training overdue reminder",
  previewData: {
    recipientName: "Jamie",
    courseTitle: "Cyber security awareness",
    dueDate: "2026-05-20",
    daysOverdue: 7
  }
};
const Email$6 = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Shell,
  {
    preview: `Your ${p.trialDays ?? 30}-day HRPPL trial for ${p.organizationName ?? "your organization"} is ready`,
    title: `Welcome to HRPPL — start your ${p.trialDays ?? 30}-day trial`,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        "Hi",
        p.contactName ? ` ${p.contactName}` : "",
        ", you've been invited to start a free",
        " ",
        p.trialDays ?? 30,
        "-day trial of HRPPL for",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.organizationName ?? "your organization" }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Organization" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.organizationName ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Trial length" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: value, children: [
          p.trialDays ?? 30,
          " days"
        ] }),
        p.expiresAt ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Expires" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: new Date(p.expiresAt).toLocaleDateString() })
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { style: { textAlign: "center", margin: "24px 0" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          href: p.signupUrl,
          style: {
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "14px"
          },
          children: "Start your trial"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: { fontSize: "12px", color: "#6b7280" }, children: [
        "Or open this link in your browser:",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        p.signupUrl
      ] })
    ]
  }
);
const template$6 = {
  component: Email$6,
  subject: (d) => `Your HRPPL trial for ${d.organizationName ?? "your organization"} is ready`,
  displayName: "Org trial invitation",
  previewData: {
    organizationName: "Acme Inc",
    contactName: "Jamie",
    trialDays: 30,
    signupUrl: "https://hrppl.io/signup",
    expiresAt: new Date(Date.now() + 30 * 864e5).toISOString()
  }
};
const Email$5 = ({
  recipientName,
  tenantName,
  alertType,
  severity,
  title,
  message,
  failureReason,
  retryUrl,
  occurredAt,
  period
}) => {
  const url = retryUrl || "https://hrppl.io/admin/billing-ops";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Shell,
    {
      preview: `Billing alert: ${title || alertType || "failure detected"}`,
      title: "Billing operations alert",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: recipientName ? `Hi ${recipientName},` : "Hi super admin," }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
          "A ",
          severity || "failure",
          " was raised by the billing pipeline and needs review. Use the link below to inspect the alert and run a safe (idempotent) retry from the Billing Operations console."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
          title ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Alert" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: title })
          ] }) : null,
          alertType ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: alertType })
          ] }) : null,
          severity ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Severity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: severity })
          ] }) : null,
          tenantName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Tenant" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: tenantName })
          ] }) : null,
          period ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Period" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: period })
          ] }) : null,
          occurredAt ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Occurred at" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: occurredAt })
          ] }) : null,
          failureReason ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Failure reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: failureReason.slice(0, 800) })
          ] }) : null,
          message && !failureReason ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: message.slice(0, 800) })
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, children: "Open Billing Operations & Retry →" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: 12, color: "#6b7280", marginTop: 16 }, children: "Retries are idempotent — clicking Retry will never re-charge a tenant or duplicate a Stripe usage record that has already been accepted." })
      ]
    }
  );
};
const template$5 = {
  component: Email$5,
  subject: (data) => `[Billing] ${data?.severity?.toUpperCase?.() || "ALERT"}: ${data?.title || "Billing failure detected"}`,
  displayName: "Billing operations alert",
  previewData: {
    recipientName: "Admin",
    tenantName: "Acme Pty Ltd",
    alertType: "stripe_usage_report_failed",
    severity: "error",
    title: "Stripe usage report failed for 2026-05",
    failureReason: "StripeAPIError: rate_limited",
    period: "2026-05",
    occurredAt: (/* @__PURE__ */ new Date()).toISOString()
  }
};
const verb = (s) => {
  switch (s) {
    case "completed":
      return "completed";
    case "in_progress":
      return "started";
    case "blocked":
      return "blocked";
    case "skipped":
      return "skipped";
    case "created":
      return "created";
    default:
      return s ?? "updated";
  }
};
const Email$4 = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Shell,
  {
    preview: `Onboarding task ${verb(p.status)}: ${p.taskTitle ?? ""}`,
    title: `Onboarding task ${verb(p.status)}`,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        "Hi ",
        p.recipientName ?? "there",
        ", an onboarding task for",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.employeeName ?? "a new hire" }),
        " was ",
        verb(p.status),
        p.actorName ? ` by ${p.actorName}` : "",
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Task" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.taskTitle ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Lane" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.ownerRole ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.status ?? "—" }),
        p.dueDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.dueDate })
        ] }) : null,
        p.notes ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.notes })
        ] }) : null
      ] })
    ]
  }
);
const template$4 = {
  component: Email$4,
  subject: (d) => `Onboarding task ${verb(d.status)}: ${d.taskTitle ?? ""}`,
  displayName: "Onboarding task status changed",
  previewData: { employeeName: "Sam Smith", taskTitle: "Provision laptop", ownerRole: "it", status: "completed", actorName: "IT Bot" }
};
const Email$3 = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Shell,
  {
    preview: `Employment variation ${p.status ?? ""} for ${p.employeeName ?? ""}`,
    title: `Employment variation ${p.status ?? "updated"}`,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        "Hi ",
        p.recipientName ?? "there",
        ", an employment variation for",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.employeeName ?? "an employee" }),
        " was",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.status ?? "updated" }),
        p.actorName ? ` by ${p.actorName}` : "",
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: (p.variationType ?? "—").replace(/_/g, " ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Effective" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.effectiveDate ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.status ?? "—" }),
        p.reason ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.reason })
        ] }) : null
      ] })
    ]
  }
);
const template$3 = {
  component: Email$3,
  subject: (d) => `Employment variation ${d.status ?? "updated"}`,
  displayName: "Employment variation status",
  previewData: { employeeName: "Jane Doe", variationType: "pay_change", effectiveDate: "2026-07-01", status: "approved", actorName: "Pat HR" }
};
const Email$2 = (p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Shell,
  {
    preview: `Timesheet ${p.status ?? "updated"} for ${p.periodStart ?? ""} – ${p.periodEnd ?? ""}`,
    title: `Timesheet ${p.status ?? "updated"}`,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
        "Hi ",
        p.recipientName ?? "there",
        ", the timesheet for",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.employeeName ?? "an employee" }),
        " was",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.status ?? "updated" }),
        p.actorName ? ` by ${p.actorName}` : "",
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Period" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: value, children: [
          p.periodStart ?? "—",
          " → ",
          p.periodEnd ?? "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Total hours" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.totalHours ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.status ?? "—" }),
        p.reason ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.reason })
        ] }) : null
      ] })
    ]
  }
);
const template$2 = {
  component: Email$2,
  subject: (d) => `Timesheet ${d.status ?? "updated"} (${d.periodStart ?? ""} – ${d.periodEnd ?? ""})`,
  displayName: "Timesheet status",
  previewData: { employeeName: "Alex Person", periodStart: "2026-06-15", periodEnd: "2026-06-21", totalHours: 38, status: "submitted" }
};
const Email$1 = (p) => {
  const overdue = !!p.isOverdue;
  const headline = overdue ? `Overdue onboarding task: ${p.taskTitle ?? ""}` : `Onboarding task due ${(p.daysUntilDue ?? 0) <= 1 ? "tomorrow" : `in ${p.daysUntilDue} days`}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Shell, { preview: headline, title: headline, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
      "Hi ",
      p.recipientName ?? "there",
      ", this is a reminder about an onboarding task for ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.employeeName ?? "a new hire" }),
      "."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Task" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.taskTitle ?? "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Lane" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: p.ownerRole ?? "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Due" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: value, children: [
        p.dueDate ?? "—",
        overdue ? " (overdue)" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: 13, color: "#475569" }, children: "Open the Onboarding Control Room to mark this task complete or reassign it." })
  ] });
};
const template$1 = {
  component: Email$1,
  displayName: "Onboarding task reminder",
  subject: (d) => d?.isOverdue ? `Overdue: ${d?.taskTitle ?? "Onboarding task"}` : `Reminder: ${d?.taskTitle ?? "Onboarding task"} due ${(d?.daysUntilDue ?? 0) <= 1 ? "tomorrow" : `in ${d?.daysUntilDue} days`}`,
  previewData: {
    recipientName: "Alex",
    employeeName: "Jordan Lee",
    taskTitle: "Issue laptop",
    ownerRole: "it",
    dueDate: "2026-07-01",
    daysUntilDue: 2,
    isOverdue: false
  }
};
const COPY = {
  opened: {
    preview: "A KPI review cycle is now open",
    title: "KPI review cycle is open",
    intro: "A new performance review cycle has opened. Please submit your duty self-scores before it closes.",
    cta: "Submit my self-review",
    subject: "KPI review cycle is open — submit your self-scores"
  },
  closed: {
    preview: "A KPI review cycle has closed",
    title: "KPI review cycle closed",
    intro: "This review cycle is now closed. No further submissions can be made; your manager will share the outcome.",
    cta: "View my reviews",
    subject: "KPI review cycle has closed"
  },
  reminder: {
    preview: "Submit your duty self-review before the cycle closes",
    title: "Reminder: KPI self-review pending",
    intro: "The review cycle closes soon. Please complete your duty self-scores before the deadline.",
    cta: "Complete my self-review",
    subject: "Reminder: complete your KPI self-review"
  }
};
const Email = ({ kind = "opened", recipientName, cycleName, startsOn, endsOn, daysRemaining, appUrl }) => {
  const c = COPY[kind];
  const url = appUrl || "https://hrppl.io/me/duty-self-review";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Shell, { preview: c.preview, title: c.title, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: recipientName ? `Hi ${recipientName},` : "Hi there," }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: c.intro }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { style: card$1, children: [
      cycleName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Cycle" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: cycleName })
      ] }) : null,
      startsOn ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Starts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: startsOn })
      ] }) : null,
      endsOn ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Ends" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: endsOn })
      ] }) : null,
      typeof daysRemaining === "number" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: label, children: "Days remaining" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: value, children: daysRemaining })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        href: url,
        style: { background: "#111827", color: "#ffffff", padding: "10px 18px", borderRadius: "6px", fontSize: "14px" },
        children: c.cta
      }
    )
  ] });
};
const template = {
  component: Email,
  subject: (data) => COPY[data?.kind ?? "opened"].subject,
  displayName: "KPI review cycle status",
  previewData: { kind: "opened", recipientName: "Jamie", cycleName: "2026-Q1", startsOn: "2026-01-01", endsOn: "2026-03-31" }
};
const TEMPLATES = {
  "leave-submitted-manager": template$n,
  "leave-submitted-employee": template$m,
  "leave-approved": template$l,
  "leave-rejected": template$k,
  "leave-cancelled-manager": template$j,
  "payslip-ready": template$i,
  "review-reminder": template$h,
  "onboarding-overdue": template$g,
  "staff-invitation": template$f,
  "document-sent": template$e,
  "document-signed": template$d,
  "document-declined": template$c,
  "document-completed": template$b,
  "document-reminder": template$a,
  "security-finding-alert": template$9,
  "mfa-otp-code": template$8,
  "training-overdue": template$7,
  "org-trial-invitation": template$6,
  "billing-ops-alert": template$5,
  "onboarding-task-status": template$4,
  "employment-variation-status": template$3,
  "timesheet-status": template$2,
  "onboarding-task-reminder": template$1,
  "kpi-cycle-status": template
};
export {
  TEMPLATES
};
