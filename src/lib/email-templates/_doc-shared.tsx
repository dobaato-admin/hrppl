import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const card = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '16px 0',
  backgroundColor: '#f9fafb',
}
const labelStyle = { color: '#6b7280', fontSize: '12px', margin: '0 0 4px' }
const valueStyle = { color: '#111827', fontSize: '14px', margin: '0 0 12px', fontWeight: 500 as const }
const btn = {
  backgroundColor: '#111827',
  color: '#ffffff',
  padding: '10px 18px',
  borderRadius: '6px',
  fontSize: '14px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: 600 as const,
}

export function DocShell({
  preview,
  title,
  children,
  footer = 'You are receiving this email because of a document in your organization.',
}: {
  preview: string
  title: string
  children: React.ReactNode
  footer?: string
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
            <Text style={{ fontSize: '12px', color: '#6b7280' }}>{footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function DocCard({
  subject,
  docType,
  dueDate,
  recipientName,
  status,
  signedAt,
  reason,
}: {
  subject?: string
  docType?: string
  dueDate?: string
  recipientName?: string
  status?: string
  signedAt?: string
  reason?: string
}) {
  return (
    <Section style={card}>
      {subject ? (<><Text style={labelStyle}>Document</Text><Text style={valueStyle}>{subject}</Text></>) : null}
      {docType ? (<><Text style={labelStyle}>Type</Text><Text style={valueStyle}>{docType.replace(/_/g, ' ')}</Text></>) : null}
      {recipientName ? (<><Text style={labelStyle}>Recipient</Text><Text style={valueStyle}>{recipientName}</Text></>) : null}
      {status ? (<><Text style={labelStyle}>Status</Text><Text style={valueStyle}>{status.replace(/_/g, ' ')}</Text></>) : null}
      {signedAt ? (<><Text style={labelStyle}>Signed at</Text><Text style={valueStyle}>{signedAt}</Text></>) : null}
      {dueDate ? (<><Text style={labelStyle}>Due</Text><Text style={valueStyle}>{dueDate}</Text></>) : null}
      {reason ? (<><Text style={labelStyle}>Reason</Text><Text style={{ ...valueStyle, fontWeight: 400, whiteSpace: 'pre-wrap' as const }}>{reason}</Text></>) : null}
    </Section>
  )
}

export function DocButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Section style={{ margin: '20px 0' }}>
      <Button href={href} style={btn}>{children}</Button>
    </Section>
  )
}
