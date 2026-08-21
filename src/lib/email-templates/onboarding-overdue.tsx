import React from 'react'
import { Button, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

type Audience = 'employee' | 'manager'

interface Props {
  audience?: Audience
  recipientName?: string
  employeeName?: string
  checklistName?: string
  dueDate?: string
  daysOverdue?: number
  appUrl?: string
}

const Email = ({
  audience = 'employee',
  recipientName,
  employeeName,
  checklistName,
  dueDate,
  daysOverdue,
  appUrl,
}: Props) => {
  const url = appUrl || 'https://hrppl.io/onboarding'
  const isManager = audience === 'manager'
  const title = isManager
    ? 'Onboarding task is overdue'
    : 'Your onboarding task is overdue'
  const intro = isManager
    ? `An onboarding checklist assigned to ${employeeName || 'a team member'} is past its due date. Please check in and help them complete it.`
    : 'One of your onboarding checklists is past its due date. Please complete the remaining items as soon as possible.'
  const cta = isManager ? 'Review onboarding' : 'Open onboarding'

  return (
    <Shell preview={title} title={title}>
      <Text>{recipientName ? `Hi ${recipientName},` : 'Hi there,'}</Text>
      <Text>{intro}</Text>
      <Section style={card}>
        {checklistName ? (<><Text style={label}>Checklist</Text><Text style={value}>{checklistName}</Text></>) : null}
        {isManager && employeeName ? (<><Text style={label}>Employee</Text><Text style={value}>{employeeName}</Text></>) : null}
        {dueDate ? (<><Text style={label}>Due date</Text><Text style={value}>{dueDate}</Text></>) : null}
        {typeof daysOverdue === 'number' ? (<><Text style={label}>Days overdue</Text><Text style={value}>{daysOverdue}</Text></>) : null}
      </Section>
      <Button
        href={url}
        style={{ background: '#111827', color: '#ffffff', padding: '10px 18px', borderRadius: '6px', fontSize: '14px' }}
      >
        {cta}
      </Button>
    </Shell>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    (data?.audience === 'manager'
      ? `Onboarding overdue${data?.employeeName ? `: ${data.employeeName}` : ''}`
      : 'Your onboarding task is overdue'),
  displayName: 'Onboarding overdue reminder',
  previewData: {
    audience: 'employee',
    recipientName: 'Jamie',
    checklistName: 'New hire week 1',
    dueDate: '2026-05-20',
    daysOverdue: 5,
  },
} satisfies TemplateEntry
