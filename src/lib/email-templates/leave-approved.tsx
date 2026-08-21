import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { DetailsCard, Shell } from './_shared'

interface Props {
  approverName?: string
  leaveType?: string
  startDate?: string
  endDate?: string
  days?: number
}

const Email = (p: Props) => (
  <Shell preview="Your leave request was approved" title="Leave request approved ✅">
    <Text>Good news — your leave request has been approved{p.approverName ? ` by ${p.approverName}` : ''}.</Text>
    <DetailsCard {...p} />
  </Shell>
)

export const template = {
  component: Email,
  subject: 'Your leave request was approved',
  displayName: 'Leave approved (employee)',
  previewData: { approverName: 'Alex Manager', leaveType: 'Annual Leave', startDate: '2026-07-01', endDate: '2026-07-05', days: 5 },
} satisfies TemplateEntry
