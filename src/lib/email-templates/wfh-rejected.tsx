import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { DetailsCard, Shell } from './_shared'

interface Props {
  approverName?: string
  startDate?: string
  endDate?: string
  rejectionReason?: string
}

const Email = (p: Props) => (
  <Shell preview="Your work-from-home request was declined" title="Work-from-home request declined">
    <Text>Your work-from-home request was not approved{p.approverName ? ` by ${p.approverName}` : ''}.</Text>
    <DetailsCard leaveType="Work from home" startDate={p.startDate} endDate={p.endDate} />
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
  subject: 'Your work-from-home request was declined',
  displayName: 'WFH rejected (employee)',
  previewData: { approverName: 'Alex Manager', startDate: '2026-07-01', endDate: '2026-07-02', rejectionReason: 'Need coverage on site that week.' },
} satisfies TemplateEntry
