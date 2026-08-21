import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { DocCard, DocShell, DocButton } from './_doc-shared'

interface Props {
  recipientName?: string
  signerName?: string
  subject?: string
  docType?: string
  signedAt?: string
  envelopeUrl?: string
  remainingSigners?: number
}

const Email = (p: Props) => (
  <DocShell preview={`${p.signerName ?? 'A signer'} signed ${p.subject ?? 'a document'}`}
            title="A signer has signed the document">
    <Text>Hi {p.recipientName ?? 'there'},</Text>
    <Text>
      {p.signerName ?? 'A signer'} has signed <strong>{p.subject ?? 'the document'}</strong>
      {p.signedAt ? ` on ${p.signedAt}` : ''}.
      {p.remainingSigners && p.remainingSigners > 0
        ? ` ${p.remainingSigners} signer${p.remainingSigners === 1 ? '' : 's'} still to go.`
        : ' All signers are complete.'}
    </Text>
    <DocCard subject={p.subject} docType={p.docType} signedAt={p.signedAt} />
    {p.envelopeUrl ? <DocButton href={p.envelopeUrl}>Open envelope</DocButton> : null}
  </DocShell>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `${d?.signerName ?? 'Signer'} signed: ${d?.subject ?? 'document'}`,
  displayName: 'Document — signer signed (admin)',
  previewData: {
    recipientName: 'Admin', signerName: 'Sam Employee',
    subject: 'Employment Contract', docType: 'employment_contract',
    signedAt: '2026-06-10 14:22', envelopeUrl: 'https://hrppl.io/org/documents/envelope/abc',
    remainingSigners: 1,
  },
} satisfies TemplateEntry
