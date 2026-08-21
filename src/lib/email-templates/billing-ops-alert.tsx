import React from 'react'
import { Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

interface Props {
  recipientName?: string
  tenantName?: string
  alertType?: string
  severity?: string
  title?: string
  message?: string
  failureReason?: string
  retryUrl?: string
  occurredAt?: string
  period?: string
}

const Email = ({
  recipientName,
  tenantName,
  alertType,
  severity,
  title,
  message,
  failureReason,
  retryUrl,
  occurredAt,
  period,
}: Props) => {
  const url = retryUrl || 'https://hrppl.io/admin/billing-ops'
  return (
    <Shell
      preview={`Billing alert: ${title || alertType || 'failure detected'}`}
      title="Billing operations alert"
    >
      <Text>{recipientName ? `Hi ${recipientName},` : 'Hi super admin,'}</Text>
      <Text>
        A {severity || 'failure'} was raised by the billing pipeline and needs review.
        Use the link below to inspect the alert and run a safe (idempotent) retry from
        the Billing Operations console.
      </Text>
      <Section style={card}>
        {title ? (<><Text style={label}>Alert</Text><Text style={value}>{title}</Text></>) : null}
        {alertType ? (<><Text style={label}>Type</Text><Text style={value}>{alertType}</Text></>) : null}
        {severity ? (<><Text style={label}>Severity</Text><Text style={value}>{severity}</Text></>) : null}
        {tenantName ? (<><Text style={label}>Tenant</Text><Text style={value}>{tenantName}</Text></>) : null}
        {period ? (<><Text style={label}>Period</Text><Text style={value}>{period}</Text></>) : null}
        {occurredAt ? (<><Text style={label}>Occurred at</Text><Text style={value}>{occurredAt}</Text></>) : null}
        {failureReason ? (<><Text style={label}>Failure reason</Text><Text style={value}>{failureReason.slice(0, 800)}</Text></>) : null}
        {message && !failureReason ? (<><Text style={label}>Details</Text><Text style={value}>{message.slice(0, 800)}</Text></>) : null}
      </Section>
      <Text>
        <a href={url}>Open Billing Operations & Retry →</a>
      </Text>
      <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 16 }}>
        Retries are idempotent — clicking Retry will never re-charge a tenant or duplicate
        a Stripe usage record that has already been accepted.
      </Text>
    </Shell>
  )
}

export const template: TemplateEntry = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `[Billing] ${data?.severity?.toUpperCase?.() || 'ALERT'}: ${data?.title || 'Billing failure detected'}`,
  displayName: 'Billing operations alert',
  previewData: {
    recipientName: 'Admin',
    tenantName: 'Acme Pty Ltd',
    alertType: 'stripe_usage_report_failed',
    severity: 'error',
    title: 'Stripe usage report failed for 2026-05',
    failureReason: 'StripeAPIError: rate_limited',
    period: '2026-05',
    occurredAt: new Date().toISOString(),
  },
}
