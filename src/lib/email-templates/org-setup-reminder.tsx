import React from 'react'
import { Section, Text, Button } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

interface Props {
  recipientName?: string
  organizationName?: string
  outstandingSteps?: string[]
  daysSinceCreated?: number
  sequence?: number
  resumeUrl?: string
}

/**
 * T22 · "Where you left off" — not "you haven't finished".
 *
 * The reminder names the steps that are outstanding and links straight back
 * into the wizard, which resumes at the first incomplete step. A nudge that
 * only says setup is unfinished makes the reader go and find out what is
 * missing, which is the work they already stalled on.
 */
const Email = (p: Props) => {
  const steps = p.outstandingSteps ?? []
  const last = (p.sequence ?? 1) >= 3
  return (
    <Shell
      preview={`Finish setting up ${p.organizationName ?? 'your organisation'}`}
      title={`Pick up where you left off`}
    >
      <Text>
        Hi {p.recipientName ?? 'there'} — {p.organizationName ?? 'your organisation'} was created{' '}
        {(p.daysSinceCreated ?? 0) <= 1 ? 'yesterday' : `${p.daysSinceCreated} days ago`} and a few
        setup steps are still open. Your progress is saved; the link below opens the step you
        stopped at.
      </Text>
      <Section style={card}>
        <Text style={label}>Still to do</Text>
        {steps.length === 0 ? (
          <Text style={value}>Reviewing your setup</Text>
        ) : (
          steps.map((s) => (
            <Text key={s} style={value}>
              {s}
            </Text>
          ))
        )}
      </Section>
      {p.resumeUrl && (
        <Button
          href={p.resumeUrl}
          style={{
            background: '#2563eb',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: 6,
            fontSize: 14,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Continue setup
        </Button>
      )}
      <Text style={{ fontSize: 13, color: '#475569', marginTop: 16 }}>
        {last
          ? "This is the last reminder we'll send about setup — you can finish it any time."
          : 'You can finish setup whenever suits; nothing expires.'}
      </Text>
    </Shell>
  )
}

export const template: TemplateEntry = {
  component: Email,
  displayName: 'Organisation setup reminder',
  subject: (d) =>
    `Finish setting up ${d?.organizationName ?? 'your organisation'}`,
  previewData: {
    recipientName: 'Gina',
    organizationName: 'Globex Nepal',
    outstandingSteps: ['Leave defaults', 'Invite your team'],
    daysSinceCreated: 3,
    sequence: 2,
    resumeUrl: 'https://hrppl.io/org/setup',
  },
}
