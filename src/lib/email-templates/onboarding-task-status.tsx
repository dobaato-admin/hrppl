import React from 'react'
import { Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

interface Props {
  recipientName?: string
  employeeName?: string
  taskTitle?: string
  ownerRole?: string
  status?: string
  actorName?: string
  dueDate?: string
  notes?: string
}

const verb = (s?: string) => {
  switch (s) {
    case 'completed': return 'completed'
    case 'in_progress': return 'started'
    case 'blocked': return 'blocked'
    case 'skipped': return 'skipped'
    case 'created': return 'created'
    default: return s ?? 'updated'
  }
}

const Email = (p: Props) => (
  <Shell
    preview={`Onboarding task ${verb(p.status)}: ${p.taskTitle ?? ''}`}
    title={`Onboarding task ${verb(p.status)}`}
  >
    <Text>
      Hi {p.recipientName ?? 'there'}, an onboarding task for{' '}
      <strong>{p.employeeName ?? 'a new hire'}</strong> was {verb(p.status)}
      {p.actorName ? ` by ${p.actorName}` : ''}.
    </Text>
    <Section style={card}>
      <Text style={label}>Task</Text>
      <Text style={value}>{p.taskTitle ?? '—'}</Text>
      <Text style={label}>Lane</Text>
      <Text style={value}>{p.ownerRole ?? '—'}</Text>
      <Text style={label}>Status</Text>
      <Text style={value}>{p.status ?? '—'}</Text>
      {p.dueDate ? (<><Text style={label}>Due</Text><Text style={value}>{p.dueDate}</Text></>) : null}
      {p.notes ? (<><Text style={label}>Notes</Text><Text style={value}>{p.notes}</Text></>) : null}
    </Section>
  </Shell>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Onboarding task ${verb(d.status)}: ${d.taskTitle ?? ''}`,
  displayName: 'Onboarding task status changed',
  previewData: { employeeName: 'Sam Smith', taskTitle: 'Provision laptop', ownerRole: 'it', status: 'completed', actorName: 'IT Bot' },
} satisfies TemplateEntry
