import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { DetailsCard, Shell } from './_shared'

interface Props {
  leaveType?: string
  startDate?: string
  endDate?: string
  days?: number
  reason?: string
}

const Email = (p: Props) => (
  <Shell preview="We received your leave request" title="Leave request submitted">
    <Text>Your leave request has been submitted and is pending approval. You'll receive another email once it's reviewed.</Text>
    <DetailsCard {...p} />
  </Shell>
)

export const template = {
  component: Email,
  subject: 'Your leave request was submitted',
  displayName: 'Leave submitted (employee)',
  previewData: { leaveType: 'Annual Leave', startDate: '2026-07-01', endDate: '2026-07-05', days: 5 },
} satisfies TemplateEntry
