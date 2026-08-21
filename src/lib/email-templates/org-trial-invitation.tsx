import React from "react";
import { Button, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, card, label, value } from "./_shared";

interface Props {
  organizationName?: string;
  contactName?: string | null;
  trialDays?: number;
  signupUrl: string;
  expiresAt?: string;
}

const Email = (p: Props) => (
  <Shell
    preview={`Your ${p.trialDays ?? 30}-day HRPPL trial for ${p.organizationName ?? "your organization"} is ready`}
    title={`Welcome to HRPPL — start your ${p.trialDays ?? 30}-day trial`}
  >
    <Text>
      Hi{p.contactName ? ` ${p.contactName}` : ""}, you've been invited to start a free{" "}
      {p.trialDays ?? 30}-day trial of HRPPL for{" "}
      <strong>{p.organizationName ?? "your organization"}</strong>.
    </Text>
    <Section style={card}>
      <Text style={label}>Organization</Text>
      <Text style={value}>{p.organizationName ?? "—"}</Text>
      <Text style={label}>Trial length</Text>
      <Text style={value}>{p.trialDays ?? 30} days</Text>
      {p.expiresAt ? (
        <>
          <Text style={label}>Expires</Text>
          <Text style={value}>{new Date(p.expiresAt).toLocaleDateString()}</Text>
        </>
      ) : null}
    </Section>
    <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
      <Button
        href={p.signupUrl}
        style={{
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "14px",
        }}
      >
        Start your trial
      </Button>
    </Section>
    <Text style={{ fontSize: "12px", color: "#6b7280" }}>
      Or open this link in your browser:<br />
      {p.signupUrl}
    </Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Your HRPPL trial for ${d.organizationName ?? "your organization"} is ready`,
  displayName: "Org trial invitation",
  previewData: {
    organizationName: "Acme Inc",
    contactName: "Jamie",
    trialDays: 30,
    signupUrl: "https://hrppl.io/signup",
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  },
} satisfies TemplateEntry;
