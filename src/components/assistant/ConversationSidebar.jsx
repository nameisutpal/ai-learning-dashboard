import { MessageSquare, Plus, Trash2, X } from 'lucide-react'
import { Button } from '../ui/Button.jsx'

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ConversationSidebar({
  chats,
  selectedChatId,
  loading,
  open,
  onClose,
  onCreate,
  onSelect,
  onDelete,
}) {
  const panel = (
    <aside className="flex h-full w-full flex-col border-r border-zinc-200/90 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90 lg:w-80">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200/90 p-4 dark:border-white/10">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Conversations</p>
          <p className="text-xs text-zinc-500">{loading ? 'Syncing...' : `${chats.length} saved chat${chats.length === 1 ? '' : 's'}`}</p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/90 text-zinc-600 dark:border-white/10 dark:text-zinc-300 lg:hidden"
          onClick={onClose}
          aria-label="Close conversations"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="p-4">
        <Button type="button" className="w-full" onClick={onCreate}>
          <Plus className="h-4 w-4" aria-hidden />
          New Chat
        </Button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4" aria-label="Saved conversations">
        {chats.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-violet-300/50 p-4 text-sm text-zinc-600 dark:border-white/15 dark:text-zinc-400">
            No chats yet. Start a new conversation to save history here.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {chats.map((chat) => {
              const active = chat.id === selectedChatId
              return (
                <li key={chat.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(chat.id)}
                    className={`group flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                      active
                        ? 'border-violet-400/55 bg-violet-500/12 text-zinc-950 dark:border-violet-400/35 dark:bg-violet-500/15 dark:text-white'
                        : 'border-transparent text-zinc-700 hover:border-violet-300/50 hover:bg-violet-50/80 dark:text-zinc-300 dark:hover:border-white/10 dark:hover:bg-white/[0.045]'
                    }`}
                  >
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{chat.title}</span>
                      <span className="mt-1 block text-xs text-zinc-500">{formatDate(chat.updatedAt)}</span>
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(chat.id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          e.stopPropagation()
                          onDelete(chat.id)
                        }
                      }}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 opacity-100 transition hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-200 lg:opacity-0 lg:group-hover:opacity-100"
                      aria-label={`Delete ${chat.title}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </aside>
  )

  return (
    <>
      <div className="hidden lg:block">{panel}</div>
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`}>
        <button
          type="button"
          className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
          aria-label="Close conversations"
        />
        <div
          className={`relative h-full w-[min(22rem,88vw)] transition-transform duration-300 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {panel}
        </div>
      </div>
    </>
  )
}
