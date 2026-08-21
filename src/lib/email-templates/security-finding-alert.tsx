import React from 'react'
import { Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

interface Props {
  recipientName?: string
  scannerName?: string
  severity?: string
  title?: string
  description?: string
  internalId?: string
  scannedAt?: string
  findingsUrl?: string
  errorCount?: number
}

const Email = ({
  recipientName,
  scannerName,
  severity,
  title,
  description,
  internalId,
  scannedAt,
  findingsUrl,
  errorCount,
}: Props) => {
  const url = findingsUrl || 'https://hrppl.io/admin/security'
  return (
    <Shell preview={`Security alert: ${title || 'new ERROR finding'}`} title="Security finding detected">
      <Text>{recipientName ? `Hi ${recipientName},` : 'Hi super admin,'}</Text>
      <Text>
        A scheduled security scan flagged{' '}
        {typeof errorCount === 'number' && errorCount > 1 ? `${errorCount} ERROR-level findings` : 'an ERROR-level finding'}
        {' '}on the portal. Review and triage in the admin security console.
      </Text>
      <Section style={card}>
        {title ? (<><Text style={label}>Finding</Text><Text style={value}>{title}</Text></>) : null}
        {severity ? (<><Text style={label}>Severity</Text><Text style={value}>{severity}</Text></>) : null}
        {scannerName ? (<><Text style={label}>Scanner</Text><Text style={value}>{scannerName}</Text></>) : null}
        {internalId ? (<><Text style={label}>Internal ID</Text><Text style={value}>{internalId}</Text></>) : null}
        {scannedAt ? (<><Text style={label}>Detected at</Text><Text style={value}>{scannedAt}</Text></>) : null}
        {description ? (<><Text style={label}>Details</Text><Text style={value}>{description.slice(0, 600)}</Text></>) : null}
      </Section>
      <Text>
        <a href={url}>Open security findings →</a>
      </Text>
    </Shell>
  )
}

export const template: TemplateEntry = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `[Security] ${data?.severity?.toUpperCase?.() || 'ERROR'}: ${data?.title || 'New finding detected'}`,
  displayName: 'Security finding alert',
  previewData: {
    recipientName: 'Admin',
    scannerName: 'lovable.security',
    severity: 'error',
    title: 'IDOR in signed-url endpoint',
    description: 'A finding was detected during the weekly automated scan.',
    internalId: 'sample-001',
    scannedAt: new Date().toISOString(),
    errorCount: 1,
  },
}
