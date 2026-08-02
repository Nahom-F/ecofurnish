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

  // Home and Categories both live at "/" — only the hash tells them apart,
  // and usePathname() doesn't include it, so it's tracked separately here.
  const [hash, setHash] = useState('')
  useEffect(() => {
    setHash(window.location.hash)
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const tabs: Tab[] = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      isActive: (p) => p === '/' && hash !== '#all-products',
    },
    {
      href: '/#all-products',
      label: 'Categories',
      icon: LayoutGrid,
      isActive: (p) => p === '/' && hash === '#all-products',
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
