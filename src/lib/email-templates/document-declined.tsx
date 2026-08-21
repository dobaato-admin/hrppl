import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { DocCard, DocShell, DocButton } from './_doc-shared'

interface Props {
  recipientName?: string
  signerName?: string
  subject?: string
  docType?: string
  reason?: string
  envelopeUrl?: string
}

const Email = (p: Props) => (
  <DocShell preview={`${p.signerName ?? 'A signer'} declined ${p.subject ?? 'a document'}`}
            title="A signer declined the document">
    <Text>Hi {p.recipientName ?? 'there'},</Text>
    <Text>
      {p.signerName ?? 'A signer'} declined <strong>{p.subject ?? 'the document'}</strong>.
      The envelope has been moved to <em>declined</em>.
    </Text>
    <DocCard subject={p.subject} docType={p.docType} reason={p.reason} status="declined" />
    {p.envelopeUrl ? <DocButton href={p.envelopeUrl}>Open envelope</DocButton> : null}
  </DocShell>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Declined: ${d?.subject ?? 'document'}`,
  displayName: 'Document — declined (admin)',
  previewData: {
    recipientName: 'Admin', signerName: 'Sam Employee',
    subject: 'Employment Contract', docType: 'employment_contract',
    reason: 'Salary figure incorrect', envelopeUrl: 'https://hrppl.io/org/documents/envelope/abc',
  },
} satisfies TemplateEntry
