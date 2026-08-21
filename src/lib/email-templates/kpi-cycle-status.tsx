import React from 'react'
import { Button, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, card, label, value } from './_shared'

type Kind = 'opened' | 'closed' | 'reminder'

interface Props {
  kind?: Kind
  recipientName?: string
  cycleName?: string
  startsOn?: string
  endsOn?: string
  daysRemaining?: number
  appUrl?: string
}

const COPY: Record<Kind, { preview: string; title: string; intro: string; cta: string; subject: string }> = {
  opened: {
    preview: 'A KPI review cycle is now open',
    title: 'KPI review cycle is open',
    intro: 'A new performance review cycle has opened. Please submit your duty self-scores before it closes.',
    cta: 'Submit my self-review',
    subject: 'KPI review cycle is open — submit your self-scores',
  },
  closed: {
    preview: 'A KPI review cycle has closed',
    title: 'KPI review cycle closed',
    intro: 'This review cycle is now closed. No further submissions can be made; your manager will share the outcome.',
    cta: 'View my reviews',
    subject: 'KPI review cycle has closed',
  },
  reminder: {
    preview: 'Submit your duty self-review before the cycle closes',
    title: 'Reminder: KPI self-review pending',
    intro: 'The review cycle closes soon. Please complete your duty self-scores before the deadline.',
    cta: 'Complete my self-review',
    subject: 'Reminder: complete your KPI self-review',
  },
}

const Email = ({ kind = 'opened', recipientName, cycleName, startsOn, endsOn, daysRemaining, appUrl }: Props) => {
  const c = COPY[kind]
  const url = appUrl || 'https://hrppl.io/me/duty-self-review'
  return (
    <Shell preview={c.preview} title={c.title}>
      <Text>{recipientName ? `Hi ${recipientName},` : 'Hi there,'}</Text>
      <Text>{c.intro}</Text>
      <Section style={card}>
        {cycleName ? (<><Text style={label}>Cycle</Text><Text style={value}>{cycleName}</Text></>) : null}
        {startsOn ? (<><Text style={label}>Starts</Text><Text style={value}>{startsOn}</Text></>) : null}
        {endsOn ? (<><Text style={label}>Ends</Text><Text style={value}>{endsOn}</Text></>) : null}
        {typeof daysRemaining === 'number' ? (<><Text style={label}>Days remaining</Text><Text style={value}>{daysRemaining}</Text></>) : null}
      </Section>
      <Button
        href={url}
        style={{ background: '#111827', color: '#ffffff', padding: '10px 18px', borderRadius: '6px', fontSize: '14px' }}
      >
        {c.cta}
      </Button>
    </Shell>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => COPY[(data?.kind as Kind) ?? 'opened'].subject,
  displayName: 'KPI review cycle status',
  previewData: { kind: 'opened', recipientName: 'Jamie', cycleName: '2026-Q1', startsOn: '2026-01-01', endsOn: '2026-03-31' },
} satisfies TemplateEntry
