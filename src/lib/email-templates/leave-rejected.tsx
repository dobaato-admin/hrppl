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
  rejectionReason?: string
}

const Email = (p: Props) => (
  <Shell preview="Your leave request was rejected" title="Leave request rejected">
    <Text>Your leave request was not approved{p.approverName ? ` by ${p.approverName}` : ''}.</Text>
    <DetailsCard {...p} />
    {p.rejectionReason ? (
      <Text style={{ fontSize: '14px', color: '#374151' }}>
        <strong>Reason:</strong> {p.rejectionReason}
      </Text>
    ) : null}
    <Text>If you have questions, please follow up with your manager.</Text>
  </Shell>
)

export const template = {
  component: Email,
  subject: 'Your leave request was rejected',
  displayName: 'Leave rejected (employee)',
  previewData: { approverName: 'Alex Manager', leaveType: 'Annual Leave', startDate: '2026-07-01', endDate: '2026-07-05', days: 5, rejectionReason: 'Team capacity that week.' },
} satisfies TemplateEntry
