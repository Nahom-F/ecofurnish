'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Heart, ShoppingCart, User } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useSession } from '@/lib/auth-client'

interface Tab {
  href: string
  label: string
  icon: typeof Home
  isActive: (pathname: string) => boolean
  badge?: number
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { totalItems: cartCount } = useCart()
  const { totalItems: wishlistCount } = useWishlist()
  const { data: session } = useSession()

  // Same SSR-hydration-safe pattern as UserMenu: session/cart/wishlist state
  // only exists client-side, so the badge counts and account link must not
  // render their real values until after mount, or the server-rendered
  // pass (always "empty"/signed-out) won't match the client's first pass.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Home and Categories both live at "/" — only which section is actually
  // in view tells them apart. Tried tracking window.location.hash directly
  // first, but Next.js Link's same-page hash navigation doesn't reliably
  // fire a native hashchange event, so this watches the #all-products
  // section's real scroll position instead — also just a better match for
  // "which tab am I on" than the URL fragment alone.
  const [categoriesInView, setCategoriesInView] = useState(false)
  useEffect(() => {
    if (pathname !== '/') return
    const el = document.getElementById('all-products')
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setCategoriesInView(entry.isIntersecting),
      { rootMargin: '-40% 0px -40% 0px' } // "in view" once roughly centered on screen
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [pathname])

  const tabs: Tab[] = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      isActive: (p) => p === '/' && !categoriesInView,
    },
    {
      href: '/#all-products',
      label: 'Categories',
      icon: LayoutGrid,
      isActive: (p) => p === '/' && categoriesInView,
    },
    {
      href: '/wishlist',
      label: 'Wishlist',
      icon: Heart,
      isActive: (p) => p === '/wishlist',
      badge: mounted ? wishlistCount : 0,
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: ShoppingCart,
      isActive: (p) => p === '/cart',
      badge: mounted ? cartCount : 0,
    },
    {
      href: mounted && session?.user ? '/account' : '/sign-in',
      label: 'Account',
      icon: User,
      isActive: (p) => p === '/account' || p === '/sign-in',
    },
  ]

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex h-16 items-stretch justify-around">
        {tabs.map((tab) => {
          const active = tab.isActive(pathname)
          const Icon = tab.icon
          return (
            <li key={tab.label} className="flex-1">
              <Link
                href={tab.href}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                  active ? 'text-emerald-700' : 'text-muted-foreground'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  {!!tab.badge && tab.badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-700 px-1 text-[9px] font-semibold text-white">
                      {tab.badge}
                    </span>
                  )}
                </span>
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
