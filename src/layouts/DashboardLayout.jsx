import { Suspense, useState } from 'react'
import { Sidebar } from '../components/layout/Sidebar.jsx'
import { Navbar } from '../components/layout/Navbar.jsx'
import { MobileBottomNav } from '../components/layout/MobileBottomNav.jsx'
import { PageTransition } from '../components/layout/PageTransition.jsx'
import { SkipLink } from '../components/layout/SkipLink.jsx'
import { PageLoader } from '../components/ui/PageLoader.jsx'
import { navItems } from '../data/navItems.js'
import { usePreferences } from '../hooks/usePreferences.js'

/**
 * Shell layout: sidebar + navbar + routed page content.
 *
 * `React.Suspense` wraps the animated `<Outlet />` so lazy-loaded route chunks
 * show `PageLoader` instead of a blank flash (see `App.jsx` lazy imports).
 */
export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { preferences } = usePreferences()
  const vertical = preferences.compactMode ? 'py-4 md:py-5' : 'py-6 md:py-8'

  return (
    <div className="flex min-h-screen">
      <SkipLink />
      <Sidebar items={navItems} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenSidebar={() => setMobileOpen(true)} />
        <main
          id="main-content"
          tabIndex={-1}
          className={`flex-1 overflow-x-hidden px-4 ${vertical} pb-28 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 md:px-6 lg:px-8 lg:pb-8`}
        >
          <Suspense fallback={<PageLoader />}>
            <PageTransition />
          </Suspense>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}
