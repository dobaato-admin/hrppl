import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { DocCard, DocShell, DocButton } from './_doc-shared'

interface Props {
  recipientName?: string
  subject?: string
  docType?: string
  dueDate?: string
  signUrl?: string
  senderName?: string
}

const Email = (p: Props) => (
  <DocShell preview={`Please sign: ${p.subject ?? 'a document'}`} title="A document is awaiting your signature">
    <Text>Hi {p.recipientName ?? 'there'},</Text>
    <Text>{p.senderName ?? 'Your organisation'} has sent you a document to review and sign.</Text>
    <DocCard subject={p.subject} docType={p.docType} dueDate={p.dueDate} />
    {p.signUrl ? <DocButton href={p.signUrl}>Review &amp; sign</DocButton> : null}
    <Text style={{ fontSize: '12px', color: '#6b7280' }}>If you did not expect this, you can safely ignore the email.</Text>
  </DocShell>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Please sign: ${d?.subject ?? 'document'}`,
  displayName: 'Document — sent to signer',
  previewData: {
    recipientName: 'Sam Employee', subject: 'Employment Contract',
    docType: 'employment_contract', dueDate: '2026-06-20',
    signUrl: 'https://hrppl.io/sign/abc', senderName: 'Acme Corp',
  },
} satisfies TemplateEntry
