import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
export const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
export const card = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '16px 0',
  backgroundColor: '#f9fafb',
}
export const label = { color: '#6b7280', fontSize: '12px', margin: '0 0 4px' }
export const value = { color: '#111827', fontSize: '14px', margin: '0 0 12px', fontWeight: 500 as const }

export function Shell({
  preview,
  title,
  children,
}: {
  preview: string
  title: string
  children: React.ReactNode
}) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ fontSize: '20px', color: '#111827', margin: '0 0 12px' }}>{title}</Heading>
          {children}
          <Section style={{ marginTop: '24px' }}>
            <Text style={{ fontSize: '12px', color: '#6b7280' }}>
              You are receiving this email because of a leave request in your organization.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function DetailsCard({
  employeeName,
  leaveType,
  startDate,
  endDate,
  days,
  reason,
}: {
  employeeName?: string
  leaveType?: string
  startDate?: string
  endDate?: string
  days?: number | string
  reason?: string
}) {
  return (
    <Section style={card}>
      {employeeName ? (
        <>
          <Text style={label}>Employee</Text>
          <Text style={value}>{employeeName}</Text>
        </>
      ) : null}
      <Text style={label}>Leave type</Text>
      <Text style={value}>{leaveType ?? '—'}</Text>
      <Text style={label}>Dates</Text>
      <Text style={value}>
        {startDate ?? '—'} → {endDate ?? '—'} ({days ?? '—'} day{Number(days) === 1 ? '' : 's'})
      </Text>
      {reason ? (
        <>
          <Text style={label}>Reason</Text>
          <Text style={{ ...value, fontWeight: 400, whiteSpace: 'pre-wrap' as const }}>{reason}</Text>
        </>
      ) : null}
    </Section>
  )
}
