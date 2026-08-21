import React from 'react'
import { Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

interface Props {
  recipientName?: string
  employeeName?: string
  variationType?: string
  effectiveDate?: string
  status?: string
  actorName?: string
  reason?: string
}

const Email = (p: Props) => (
  <Shell
    preview={`Employment variation ${p.status ?? ''} for ${p.employeeName ?? ''}`}
    title={`Employment variation ${p.status ?? 'updated'}`}
  >
    <Text>
      Hi {p.recipientName ?? 'there'}, an employment variation for{' '}
      <strong>{p.employeeName ?? 'an employee'}</strong> was{' '}
      <strong>{p.status ?? 'updated'}</strong>
      {p.actorName ? ` by ${p.actorName}` : ''}.
    </Text>
    <Section style={card}>
      <Text style={label}>Type</Text>
      <Text style={value}>{(p.variationType ?? '—').replace(/_/g, ' ')}</Text>
      <Text style={label}>Effective</Text>
      <Text style={value}>{p.effectiveDate ?? '—'}</Text>
      <Text style={label}>Status</Text>
      <Text style={value}>{p.status ?? '—'}</Text>
      {p.reason ? (<><Text style={label}>Reason</Text><Text style={value}>{p.reason}</Text></>) : null}
    </Section>
  </Shell>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Employment variation ${d.status ?? 'updated'}`,
  displayName: 'Employment variation status',
  previewData: { employeeName: 'Jane Doe', variationType: 'pay_change', effectiveDate: '2026-07-01', status: 'approved', actorName: 'Pat HR' },
} satisfies TemplateEntry
