import * as React from 'react'
import { render } from '@react-email/render'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'global-payroll-bliss'
const SENDER_DOMAIN = 'notify.hrppl.io'
const FROM_DOMAIN = 'hrppl.io'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export type PreferenceColumn =
  | 'notify_leave_submitted'
  | 'notify_leave_decision'
  | 'notify_leave_cancelled'
  | 'notify_review_self_pending'
  | 'notify_review_manager_pending'
  | 'notify_review_acknowledgment'
  | 'notify_review_calibration'
  | 'notify_onboarding_overdue'
  | 'notify_onboarding_task'
  | 'notify_timesheet'

export interface InternalSendInput {
  templateName: string
  recipientEmail: string
  templateData?: Record<string, any>
  idempotencyKey?: string
  /** If set, skip the send when the recipient (matched by email -> profile) has opted out. */
  preferenceKey?: PreferenceColumn
}

async function isOptedOut(email: string, key: PreferenceColumn): Promise<boolean> {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('id').eq('email', email).maybeSingle()
    if (!profile?.id) return false
    const { data: pref } = await supabaseAdmin
      .from('notification_preferences').select(key).eq('user_id', profile.id).maybeSingle()
    if (!pref) return false
    return (pref as any)[key] === false
  } catch {
    return false
  }
}

/**
 * Server-only helper for queuing a transactional email from inside a server function.
 * Handles suppression check, unsubscribe token, render, and enqueue.
 * Errors are logged but never thrown — email failures should not break business logic.
 */
export async function sendInternalEmail(input: InternalSendInput): Promise<void> {
  try {
    const template = TEMPLATES[input.templateName]
    if (!template) {
      console.error('[email.internal] Unknown template', input.templateName)
      return
    }
    const recipient = template.to || input.recipientEmail
    if (!recipient) return

    const normalized = recipient.toLowerCase()
    const messageId = crypto.randomUUID()
    const idempotencyKey = input.idempotencyKey || messageId
    const data = input.templateData || {}

    // Suppression check
    const { data: suppressed } = await supabaseAdmin
      .from('suppressed_emails').select('id').eq('email', normalized).maybeSingle()
    if (suppressed) {
      await supabaseAdmin.from('email_send_log').insert({
        message_id: messageId, template_name: input.templateName,
        recipient_email: recipient, status: 'suppressed',
      })
      return
    }

    // Per-user preference check
    if (input.preferenceKey && await isOptedOut(normalized, input.preferenceKey)) {
      await supabaseAdmin.from('email_send_log').insert({
        message_id: messageId, template_name: input.templateName,
        recipient_email: recipient, status: 'suppressed',
        error_message: `Opted out: ${input.preferenceKey}`,
      })
      return
    }

    // Unsubscribe token
    let unsubscribeToken: string | null = null
    const { data: existing } = await supabaseAdmin
      .from('email_unsubscribe_tokens')
      .select('token, used_at').eq('email', normalized).maybeSingle()
    if (existing && !existing.used_at) {
      unsubscribeToken = existing.token
    } else if (!existing) {
      unsubscribeToken = generateToken()
      await supabaseAdmin.from('email_unsubscribe_tokens').upsert(
        { token: unsubscribeToken, email: normalized },
        { onConflict: 'email', ignoreDuplicates: true },
      )
      const { data: stored } = await supabaseAdmin
        .from('email_unsubscribe_tokens').select('token').eq('email', normalized).maybeSingle()
      if (stored) unsubscribeToken = stored.token
    } else {
      return // already unsubscribed but missing from suppression list
    }

    const element = React.createElement(template.component, data)
    const html = await render(element)
    const plainText = await render(element, { plainText: true })
    const subject = typeof template.subject === 'function' ? template.subject(data) : template.subject

    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId, template_name: input.templateName,
      recipient_email: recipient, status: 'pending',
    })

    const { error: enqueueError } = await supabaseAdmin.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: recipient,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text: plainText,
        purpose: 'transactional',
        label: input.templateName,
        idempotency_key: idempotencyKey,
        unsubscribe_token: unsubscribeToken,
        queued_at: new Date().toISOString(),
      },
    })
    if (enqueueError) {
      console.error('[email.internal] enqueue failed', enqueueError)
      await supabaseAdmin.from('email_send_log').insert({
        message_id: messageId, template_name: input.templateName,
        recipient_email: recipient, status: 'failed',
        error_message: 'Failed to enqueue email',
      })
    }
  } catch (err) {
    console.error('[email.internal] unexpected error', err)
  }
}
