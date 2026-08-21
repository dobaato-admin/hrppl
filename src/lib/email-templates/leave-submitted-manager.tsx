import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { DetailsCard, Shell } from './_shared'

interface Props {
  employeeName?: string
  leaveType?: string
  startDate?: string
  endDate?: string
  days?: number
  reason?: string
}

const Email = (p: Props) => (
  <Shell
    preview={`${p.employeeName ?? 'An employee'} requested time off`}
    title="New leave request awaiting approval"
  >
    <Text>{p.employeeName ?? 'An employee'} submitted a new leave request. Please review and approve or reject it in the dashboard.</Text>
    <DetailsCard {...p} />
  </Shell>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Leave request from ${d.employeeName ?? 'an employee'}`,
  displayName: 'Leave submitted (manager)',
  previewData: { employeeName: 'Jane Doe', leaveType: 'Annual Leave', startDate: '2026-07-01', endDate: '2026-07-05', days: 5, reason: 'Family holiday' },
} satisfies TemplateEntry
