import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { DetailsCard, Shell } from './_shared'

interface Props {
  approverName?: string
  startDate?: string
  endDate?: string
  workAddress?: string
}

const Email = (p: Props) => (
  <Shell preview="Your work-from-home request was approved" title="Work-from-home approved ✅">
    <Text>Good news — your work-from-home request has been approved{p.approverName ? ` by ${p.approverName}` : ''}.</Text>
    <DetailsCard leaveType="Work from home" startDate={p.startDate} endDate={p.endDate} reason={p.workAddress ? `Working from: ${p.workAddress}` : undefined} />
    <Text>You can clock in remotely for these dates — the fenced work zones your organisation enforces will not apply.</Text>
  </Shell>
)

export const template = {
  component: Email,
  subject: 'Your work-from-home request was approved',
  displayName: 'WFH approved (employee)',
  previewData: { approverName: 'Alex Manager', startDate: '2026-07-01', endDate: '2026-07-02', workAddress: 'Home' },
} satisfies TemplateEntry
