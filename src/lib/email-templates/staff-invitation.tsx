import React from "react";
import { Button, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, card, label, value } from "./_shared";

interface Props {
  organizationName?: string;
  inviterName?: string;
  firstName?: string | null;
  jobTitle?: string | null;
  inviteUrl: string;
}

const Email = (p: Props) => (
  <Shell preview={`You're invited to join ${p.organizationName ?? "our team"}`} title={`Join ${p.organizationName ?? "our team"} on hrppl`}>
    <Text>
      Hi{p.firstName ? ` ${p.firstName}` : ""}, {p.inviterName ? `${p.inviterName} has` : "you have been"} invited
      you to join <strong>{p.organizationName ?? "their organization"}</strong>
      {p.jobTitle ? ` as ${p.jobTitle}` : ""}.
    </Text>
    <Section style={card}>
      <Text style={label}>Organization</Text>
      <Text style={value}>{p.organizationName ?? "—"}</Text>
      {p.jobTitle ? (
        <>
          <Text style={label}>Role</Text>
          <Text style={value}>{p.jobTitle}</Text>
        </>
      ) : null}
    </Section>
    <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
      <Button
        href={p.inviteUrl}
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
        Accept invitation
      </Button>
    </Section>
    <Text style={{ fontSize: "12px", color: "#6b7280" }}>
      Or copy this link into your browser:<br />
      {p.inviteUrl}
    </Text>
    <Text style={{ fontSize: "12px", color: "#6b7280" }}>
      This invitation expires in 14 days. After accepting, you'll be guided through a short onboarding form to provide
      your employment, tax, and banking details based on your country of residence.
    </Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `You're invited to join ${d.organizationName ?? "our team"}`,
  displayName: "Staff invitation",
  previewData: {
    organizationName: "Acme Inc",
    inviterName: "Jamie Admin",
    firstName: "Sam",
    jobTitle: "Software Engineer",
    inviteUrl: "https://hrppl.io/invite/example-token",
  },
} satisfies TemplateEntry;
