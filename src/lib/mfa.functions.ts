import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from "@/lib/auth-guard"

export interface MfaStatus {
  method: 'totp' | 'email' | null
  enrolledAt: string | null
  email: string | null
}

export const getMfaStatus = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MfaStatus> => {
    const { supabase, userId } = context
    const { data } = await supabase
      .from('profiles')
      .select('mfa_method, mfa_enrolled_at, email')
      .eq('id', userId)
      .maybeSingle()
    return {
      method: (data?.mfa_method as 'totp' | 'email' | null) ?? null,
      enrolledAt: data?.mfa_enrolled_at ?? null,
      email: data?.email ?? null,
    }
  })

export const startEmailMfa = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ purpose: z.enum(['enroll', 'login']) }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { hashCode } = await import('@/lib/mfa.server')

    // Get user email
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('email').eq('id', userId).maybeSingle()
    const email = profile?.email
    if (!email) throw new Error('No email on profile')

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const codeHash = await hashCode(code)
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString()

    // Invalidate any unconsumed challenges for the same purpose
    await supabaseAdmin
      .from('mfa_email_challenges')
      .update({ consumed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('purpose', data.purpose)
      .is('consumed_at', null)

    const { error } = await supabaseAdmin
      .from('mfa_email_challenges')
      .insert({ user_id: userId, code_hash: codeHash, purpose: data.purpose, expires_at: expiresAt })
    if (error) throw error

    // Send email
    const { sendInternalEmail } = await import('@/lib/email/send-internal.server')
    await sendInternalEmail({
      templateName: 'mfa-otp-code',
      recipientEmail: email,
      templateData: { code, purpose: data.purpose, expiresInMinutes: 10 },
      idempotencyKey: `mfa-${userId}-${Date.now()}`,
    })

    return { ok: true, sentTo: email.replace(/(.).+(@.+)/, '$1***$2') }
  })

export const verifyEmailMfa = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      purpose: z.enum(['enroll', 'login']),
      code: z.string().regex(/^\d{6}$/),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { hashCode } = await import('@/lib/mfa.server')

    const codeHash = await hashCode(data.code)
    const { data: challenge } = await supabaseAdmin
      .from('mfa_email_challenges')
      .select('id, code_hash, expires_at, consumed_at, attempts')
      .eq('user_id', userId)
      .eq('purpose', data.purpose)
      .is('consumed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!challenge) throw new Error('No active code. Request a new one.')
    if (new Date(challenge.expires_at) < new Date()) throw new Error('Code expired')
    if (challenge.attempts >= 5) {
      await supabaseAdmin.from('mfa_email_challenges')
        .update({ consumed_at: new Date().toISOString() }).eq('id', challenge.id)
      throw new Error('Too many attempts. Request a new code.')
    }
    if (challenge.code_hash !== codeHash) {
      await supabaseAdmin.from('mfa_email_challenges')
        .update({ attempts: challenge.attempts + 1 }).eq('id', challenge.id)
      throw new Error('Incorrect code')
    }

    await supabaseAdmin.from('mfa_email_challenges')
      .update({ consumed_at: new Date().toISOString() }).eq('id', challenge.id)

    if (data.purpose === 'enroll') {
      await supabaseAdmin.from('profiles')
        .update({ mfa_method: 'email', mfa_enrolled_at: new Date().toISOString() })
        .eq('id', userId)
    }

    return { ok: true }
  })

export const setTotpEnrolled = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context
    // Deliberately the caller's own client, NOT supabaseAdmin.
    //
    // This writes two columns on one row the caller already owns. RLS permits
    // it ('users update own profile', 20260603191709), and mfa_method is not
    // among the columns prevent_profile_privileged_changes guards (id,
    // tenant_id, and the suspension quartet). Service-role bought no security
    // here: the handler takes no input and verifies no factor either way, so a
    // caller could always assert 'totp' regardless of which client wrote it.
    //
    // What it did buy was a hard dependency on SUPABASE_SERVICE_ROLE_KEY, whose
    // client throws on construction when the key is absent. That made TOTP
    // enrollment — the one MFA method that is otherwise entirely client-side —
    // impossible in any environment without the key, which in turn made the
    // mandatory MFA gate in AuthRouteGate unpassable there.
    const { error } = await supabase
      .from('profiles')
      .update({ mfa_method: 'totp', mfa_enrolled_at: new Date().toISOString() })
      .eq('id', userId)
    // The original swallowed this. A silent failure returns ok:true, the client
    // calls setMfaSessionVerified() and navigates, and the next full page load
    // reads mfa_method: null and bounces straight back here — the redirect loop
    // with no error anywhere.
    if (error) throw new Error(`Could not record TOTP enrollment: ${error.message}`)
    return { ok: true }
  })
