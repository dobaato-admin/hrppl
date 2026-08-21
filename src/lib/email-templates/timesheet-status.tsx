import React from 'react'
import { Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

interface Props {
  recipientName?: string
  employeeName?: string
  periodStart?: string
  periodEnd?: string
  totalHours?: number
  status?: string
  actorName?: string
  reason?: string
}

const Email = (p: Props) => (
  <Shell
    preview={`Timesheet ${p.status ?? 'updated'} for ${p.periodStart ?? ''} – ${p.periodEnd ?? ''}`}
    title={`Timesheet ${p.status ?? 'updated'}`}
  >
    <Text>
      Hi {p.recipientName ?? 'there'}, the timesheet for{' '}
      <strong>{p.employeeName ?? 'an employee'}</strong> was{' '}
      <strong>{p.status ?? 'updated'}</strong>
      {p.actorName ? ` by ${p.actorName}` : ''}.
    </Text>
    <Section style={card}>
      <Text style={label}>Period</Text>
      <Text style={value}>{p.periodStart ?? '—'} → {p.periodEnd ?? '—'}</Text>
      <Text style={label}>Total hours</Text>
      <Text style={value}>{p.totalHours ?? '—'}</Text>
      <Text style={label}>Status</Text>
      <Text style={value}>{p.status ?? '—'}</Text>
      {p.reason ? (<><Text style={label}>Reason</Text><Text style={value}>{p.reason}</Text></>) : null}
    </Section>
  </Shell>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Timesheet ${d.status ?? 'updated'} (${d.periodStart ?? ''} – ${d.periodEnd ?? ''})`,
  displayName: 'Timesheet status',
  previewData: { employeeName: 'Alex Person', periodStart: '2026-06-15', periodEnd: '2026-06-21', totalHours: 38, status: 'submitted' },
} satisfies TemplateEntry
