import React from 'react'
import { Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

interface Props {
  code?: string
  purpose?: 'enroll' | 'login'
  expiresInMinutes?: number
}

const Email = ({ code, purpose, expiresInMinutes }: Props) => (
  <Shell
    preview={`Your hrppl verification code is ${code ?? '------'}`}
    title="Your verification code"
  >
    <Text>
      {purpose === 'enroll'
        ? 'Use the code below to finish setting up email-based two-factor authentication.'
        : 'Use the code below to finish signing in to hrppl.'}
    </Text>
    <Section style={card}>
      <Text style={label}>Code</Text>
      <Text style={{ ...value, fontSize: 24, letterSpacing: 4 }}>{code ?? '------'}</Text>
      <Text style={label}>Valid for</Text>
      <Text style={value}>{expiresInMinutes ?? 10} minutes</Text>
    </Section>
    <Text>If you didn't request this, you can safely ignore this email.</Text>
  </Shell>
)

export const template: TemplateEntry = {
  component: Email,
  subject: (data) => `Your hrppl verification code: ${data?.code ?? ''}`.trim(),
  displayName: 'MFA verification code',
  previewData: { code: '123456', purpose: 'login', expiresInMinutes: 10 },
}
