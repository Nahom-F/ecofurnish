'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DISMISS_KEY = 'ecofurnish:install-banner-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari's non-standard flag for "launched from home screen"
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIos() {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

// Desktop Safari (macOS) also has no beforeinstallprompt event — Chrome/Edge
// on any platform, and Firefox, are the only browsers this banner needs to
// actively guide, since Firefox currently has no install UI at all to guide
// someone toward.
function isDesktopSafari() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  return !isIos() && /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|Edg|Android/.test(ua)
}

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [manualHint, setManualHint] = useState<'ios' | 'safari' | null>(null)
  const [dismissed, setDismissed] = useState(true) // default hidden until checks pass

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return

    setDismissed(false)

    if (isIos()) {
      setManualHint('ios')
      return
    }

    if (isDesktopSafari()) {
      setManualHint('safari')
      return
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDismissed(true)
    setDeferredPrompt(null)
  }

  if (dismissed || (!deferredPrompt && !manualHint)) return null

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-50 flex items-start gap-3 rounded-lg border border-border bg-background p-3 shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-80"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      role="dialog"
      aria-label="Install EcoFurnish"
    >
      <Image
        src="/icon-192.png"
        alt=""
        width={40}
        height={40}
        className="mt-0.5 size-10 shrink-0 rounded-lg"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Install EcoFurnish</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {manualHint === 'ios' &&
            'Tap the Share icon, then "Add to Home Screen" for quick access.'}
          {manualHint === 'safari' &&
            'Click the Share icon in the toolbar, then "Add to Dock" for quick access.'}
          {!manualHint && 'Add it to your home screen for a faster, full-screen experience.'}
        </p>
        {!manualHint && (
          <Button size="sm" className="mt-2" onClick={handleInstall}>
            Install
          </Button>
        )}
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
