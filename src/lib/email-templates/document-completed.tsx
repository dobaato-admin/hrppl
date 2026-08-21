import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { DocCard, DocShell, DocButton } from './_doc-shared'

interface Props {
  recipientName?: string
  subject?: string
  docType?: string
  completedAt?: string
  certificateUrl?: string
}

const Email = (p: Props) => (
  <DocShell preview={`${p.subject ?? 'A document'} is fully signed`}
            title="Document fully signed">
    <Text>Hi {p.recipientName ?? 'there'},</Text>
    <Text>All parties have signed <strong>{p.subject ?? 'the document'}</strong>. A countersigned copy with an audit trail is attached below.</Text>
    <DocCard subject={p.subject} docType={p.docType} signedAt={p.completedAt} status="completed" />
    {p.certificateUrl ? <DocButton href={p.certificateUrl}>View signed copy</DocButton> : null}
  </DocShell>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Signed: ${d?.subject ?? 'document'}`,
  displayName: 'Document — completed (all parties)',
  previewData: {
    recipientName: 'Sam Employee', subject: 'Employment Contract',
    docType: 'employment_contract', completedAt: '2026-06-12 09:00',
    certificateUrl: 'https://hrppl.io/sign/abc/certificate',
  },
} satisfies TemplateEntry
