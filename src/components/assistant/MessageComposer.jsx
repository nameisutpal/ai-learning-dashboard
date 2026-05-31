import { useRef, useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import { Button } from '../ui/Button.jsx'

export function MessageComposer({ disabled, isStreaming, onSend }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  async function submit() {
    const text = value.trim()
    if (!text || disabled || isStreaming) return
    setValue('')
    await onSend(text)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-zinc-200/90 bg-white/80 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/75 md:p-4">
      <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-zinc-200/90 bg-white/90 p-2 shadow-lg shadow-violet-500/10 dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/25">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          placeholder="Ask your AI learning assistant..."
          className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 disabled:opacity-60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          aria-label="Message"
        />
        <Button
          type="button"
          size="lg"
          className="min-w-[44px] px-3"
          onClick={submit}
          loading={isStreaming}
          loadingLabel="..."
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          <SendHorizontal className="h-5 w-5" aria-hidden />
        </Button>
      </div>
      <p className="mx-auto mt-2 max-w-4xl px-2 text-xs text-zinc-500 dark:text-zinc-600">
        Enter sends. Shift+Enter adds a new line.
      </p>
    </div>
  )
}
