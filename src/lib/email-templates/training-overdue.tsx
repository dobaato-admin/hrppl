import React from 'react'
import { Button, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

interface Props {
  recipientName?: string
  courseTitle?: string
  dueDate?: string
  daysOverdue?: number
  appUrl?: string
}

const Email = ({ recipientName, courseTitle, dueDate, daysOverdue, appUrl }: Props) => {
  const url = appUrl || 'https://hrppl.io/me/training'
  return (
    <Shell preview="Your training is overdue" title="Training overdue">
      <Text>{recipientName ? `Hi ${recipientName},` : 'Hi there,'}</Text>
      <Text>
        Our records show your assigned training is past its due date. Please complete the
        remaining items as soon as possible to stay compliant.
      </Text>
      <Section style={card}>
        {courseTitle ? (<><Text style={label}>Course</Text><Text style={value}>{courseTitle}</Text></>) : null}
        {dueDate ? (<><Text style={label}>Due date</Text><Text style={value}>{dueDate}</Text></>) : null}
        {typeof daysOverdue === 'number' ? (<><Text style={label}>Days overdue</Text><Text style={value}>{daysOverdue}</Text></>) : null}
      </Section>
      <Button
        href={url}
        style={{ background: '#111827', color: '#ffffff', padding: '10px 18px', borderRadius: '6px', fontSize: '14px' }}
      >
        Open training
      </Button>
    </Shell>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => `Training overdue${data?.courseTitle ? `: ${data.courseTitle}` : ''}`,
  displayName: 'Training overdue reminder',
  previewData: {
    recipientName: 'Jamie',
    courseTitle: 'Cyber security awareness',
    dueDate: '2026-05-20',
    daysOverdue: 7,
  },
} satisfies TemplateEntry
