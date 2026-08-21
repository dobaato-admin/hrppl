import React from 'react'
import { Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

interface Props {
  recipientName?: string
  employeeName?: string
  taskTitle?: string
  ownerRole?: string
  dueDate?: string
  daysUntilDue?: number
  isOverdue?: boolean
  appUrl?: string
}

const Email = (p: Props) => {
  const overdue = !!p.isOverdue
  const headline = overdue
    ? `Overdue onboarding task: ${p.taskTitle ?? ''}`
    : `Onboarding task due ${(p.daysUntilDue ?? 0) <= 1 ? 'tomorrow' : `in ${p.daysUntilDue} days`}`
  return (
    <Shell preview={headline} title={headline}>
      <Text>
        Hi {p.recipientName ?? 'there'}, this is a reminder about an onboarding task
        for <strong>{p.employeeName ?? 'a new hire'}</strong>.
      </Text>
      <Section style={card}>
        <Text style={label}>Task</Text>
        <Text style={value}>{p.taskTitle ?? '—'}</Text>
        <Text style={label}>Lane</Text>
        <Text style={value}>{p.ownerRole ?? '—'}</Text>
        <Text style={label}>Due</Text>
        <Text style={value}>{p.dueDate ?? '—'}{overdue ? ' (overdue)' : ''}</Text>
      </Section>
      <Text style={{ fontSize: 13, color: '#475569' }}>
        Open the Onboarding Control Room to mark this task complete or reassign it.
      </Text>
    </Shell>
  )
}

export const template: TemplateEntry = {
  component: Email,
  displayName: 'Onboarding task reminder',
  subject: (d) =>
    d?.isOverdue
      ? `Overdue: ${d?.taskTitle ?? 'Onboarding task'}`
      : `Reminder: ${d?.taskTitle ?? 'Onboarding task'} due ${
          (d?.daysUntilDue ?? 0) <= 1 ? 'tomorrow' : `in ${d?.daysUntilDue} days`
        }`,
  previewData: {
    recipientName: 'Alex',
    employeeName: 'Jordan Lee',
    taskTitle: 'Issue laptop',
    ownerRole: 'it',
    dueDate: '2026-07-01',
    daysUntilDue: 2,
    isOverdue: false,
  },
}
