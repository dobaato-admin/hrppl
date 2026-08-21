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
}

const Email = (p: Props) => (
  <Shell
    preview={`${p.employeeName ?? 'An employee'} cancelled a leave request`}
    title="Leave request cancelled"
  >
    <Text>{p.employeeName ?? 'An employee'} cancelled the following leave request. No action is needed.</Text>
    <DetailsCard {...p} />
  </Shell>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Leave request cancelled by ${d.employeeName ?? 'employee'}`,
  displayName: 'Leave cancelled (manager)',
  previewData: { employeeName: 'Jane Doe', leaveType: 'Annual Leave', startDate: '2026-07-01', endDate: '2026-07-05', days: 5 },
} satisfies TemplateEntry
