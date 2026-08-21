import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'

export const Route = createFileRoute('/unsubscribe')({
  validateSearch: z.object({ token: z.string().optional() }),
  component: UnsubscribePage,
})

function UnsubscribePage() {
  const { token } = Route.useSearch()
  const [state, setState] = useState<'loading' | 'confirm' | 'done' | 'used' | 'invalid'>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setState('invalid')
      return
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const j = await r.json().catch(() => ({}))
        if (j.status === 'valid') { setState('confirm'); setEmail(j.email ?? null) }
        else if (j.status === 'already_used') setState('used')
        else setState('invalid')
      })
      .catch(() => setState('invalid'))
  }, [token])

  const handleConfirm = async () => {
    if (!token) return
    setSubmitting(true)
    try {
      await fetch('/email/unsubscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      setState('done')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Unsubscribe</h1>
        {state === 'loading' && <p className="text-muted-foreground">Checking your link…</p>}
        {state === 'invalid' && <p className="text-muted-foreground">This link is invalid or expired.</p>}
        {state === 'used' && <p className="text-muted-foreground">You've already unsubscribed.</p>}
        {state === 'confirm' && (
          <>
            <p className="text-muted-foreground">
              Click below to unsubscribe {email ?? 'this email address'} from notifications.
            </p>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? 'Unsubscribing…' : 'Confirm unsubscribe'}
            </button>
          </>
        )}
        {state === 'done' && <p className="text-foreground">You've been unsubscribed. Sorry to see you go.</p>}
      </div>
    </div>
  )
}
