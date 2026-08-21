import React from 'react'
import { Button, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

type ReminderKind = 'self' | 'manager' | 'acknowledgment' | 'calibration'

interface Props {
  kind?: ReminderKind
  recipientName?: string
  cycleName?: string
  employeeName?: string
  dueDate?: string
  appUrl?: string
}

const COPY: Record<ReminderKind, { preview: string; title: string; intro: string; cta: string; subject: string }> = {
  self: {
    preview: 'Your self-review is pending',
    title: 'Your self-review is pending',
    intro: 'Take a few minutes to share your reflections — your manager needs your self-review to finalize this cycle.',
    cta: 'Complete self-review',
    subject: 'Reminder: complete your self-review',
  },
  manager: {
    preview: 'A direct report is waiting on your review',
    title: 'Manager review pending',
    intro: 'Your team member has submitted their self-review. Please complete the manager review to keep the cycle on track.',
    cta: 'Open manager review',
    subject: 'Reminder: manager review pending',
  },
  acknowledgment: {
    preview: 'Acknowledge your finalized review',
    title: 'Please acknowledge your review',
    intro: 'Your review has been finalized. Acknowledging it signs off this cycle for you.',
    cta: 'Acknowledge review',
    subject: 'Reminder: acknowledge your finalized review',
  },
  calibration: {
    preview: 'Reviews are ready for calibration',
    title: 'Reviews awaiting calibration',
    intro: 'Manager reviews have been submitted in this cycle and are awaiting your calibration before finalizing.',
    cta: 'Open calibration',
    subject: 'Reminder: reviews ready for calibration',
  },
}

const Email = ({ kind = 'self', recipientName, cycleName, employeeName, dueDate, appUrl }: Props) => {
  const c = COPY[kind]
  const url = appUrl || 'https://hrppl.io/performance'
  return (
    <Shell preview={c.preview} title={c.title}>
      <Text>{recipientName ? `Hi ${recipientName},` : 'Hi there,'}</Text>
      <Text>{c.intro}</Text>
      <Section style={card}>
        {cycleName ? (<><Text style={label}>Cycle</Text><Text style={value}>{cycleName}</Text></>) : null}
        {employeeName ? (<><Text style={label}>Employee</Text><Text style={value}>{employeeName}</Text></>) : null}
        {dueDate ? (<><Text style={label}>Period ends</Text><Text style={value}>{dueDate}</Text></>) : null}
      </Section>
      <Button
        href={url}
        style={{ background: '#111827', color: '#ffffff', padding: '10px 18px', borderRadius: '6px', fontSize: '14px' }}
      >
        {c.cta}
      </Button>
    </Shell>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => COPY[(data?.kind as ReminderKind) ?? 'self'].subject,
  displayName: 'Performance review reminder',
  previewData: { kind: 'self', recipientName: 'Jamie', cycleName: 'H1 2026', dueDate: '2026-06-30' },
} satisfies TemplateEntry
