/**
 * PageContainer — max width + horizontal padding used across dashboard routes.
 * Keeps spacing consistent when you add more pages later.
 */
export function PageContainer({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-5 md:px-6 lg:px-8 ${className}`.trim()}>{children}</div>
}
