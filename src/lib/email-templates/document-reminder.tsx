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
}

const Email = (p: Props) => (
  <DocShell preview={`Reminder: please sign ${p.subject ?? 'document'}`}
            title="Reminder: a document is waiting on you">
    <Text>Hi {p.recipientName ?? 'there'},</Text>
    <Text>This is a friendly reminder that <strong>{p.subject ?? 'the document'}</strong> is still awaiting your signature.</Text>
    <DocCard subject={p.subject} docType={p.docType} dueDate={p.dueDate} />
    {p.signUrl ? <DocButton href={p.signUrl}>Review &amp; sign</DocButton> : null}
  </DocShell>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Reminder: please sign ${d?.subject ?? 'document'}`,
  displayName: 'Document — reminder',
  previewData: {
    recipientName: 'Sam Employee', subject: 'Employment Contract',
    docType: 'employment_contract', dueDate: '2026-06-20',
    signUrl: 'https://hrppl.io/sign/abc',
  },
} satisfies TemplateEntry
