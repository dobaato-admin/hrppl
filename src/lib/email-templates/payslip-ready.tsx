import React from 'react'
import { Button, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

interface Props {
  employeeName?: string
  periodStart?: string
  periodEnd?: string
  payDate?: string
  netPay?: string
  currency?: string
  downloadUrl?: string
  expiresInHours?: number
  tenantName?: string
}

const Email = (p: Props) => (
  <Shell
    preview={`Your payslip for ${p.periodStart ?? ''} – ${p.periodEnd ?? ''} is ready`}
    title="Your payslip is ready"
  >
    <Text>
      Hi{p.employeeName ? ` ${p.employeeName}` : ''}, your payslip
      {p.tenantName ? ` from ${p.tenantName}` : ''} has been approved and is ready to download.
    </Text>
    <Section style={card}>
      <Text style={label}>Pay period</Text>
      <Text style={value}>{p.periodStart ?? '—'} → {p.periodEnd ?? '—'}</Text>
      <Text style={label}>Pay date</Text>
      <Text style={value}>{p.payDate ?? '—'}</Text>
      <Text style={label}>Net pay</Text>
      <Text style={value}>{p.netPay ?? '—'} {p.currency ?? ''}</Text>
    </Section>
    {p.downloadUrl ? (
      <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <Button
          href={p.downloadUrl}
          style={{
            backgroundColor: '#111827',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Download payslip (PDF)
        </Button>
        <Text style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
          This secure link expires in {p.expiresInHours ?? 72} hours.
        </Text>
      </Section>
    ) : null}
    <Text style={{ fontSize: '13px', color: '#374151' }}>
      You can also view this payslip anytime by signing in to your account.
    </Text>
  </Shell>
)

export const template = {
  component: Email,
  subject: (d) => `Your payslip for ${d.periodStart ?? ''} – ${d.periodEnd ?? ''}`,
  displayName: 'Payslip ready',
  previewData: {
    employeeName: 'Jane Doe',
    periodStart: '2026-06-01',
    periodEnd: '2026-06-30',
    payDate: '2026-07-05',
    netPay: '3,250.00',
    currency: 'USD',
    downloadUrl: 'https://example.com/signed-url',
    expiresInHours: 72,
    tenantName: 'Acme Corp',
  },
} satisfies TemplateEntry
