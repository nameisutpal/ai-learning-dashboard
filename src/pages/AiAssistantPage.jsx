import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { Bot, Menu, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button.jsx'
import { ChatThread } from '../components/assistant/ChatThread.jsx'
import { ConversationSidebar } from '../components/assistant/ConversationSidebar.jsx'
import { MessageComposer } from '../components/assistant/MessageComposer.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useFirestoreData } from '../hooks/useFirestoreData.js'
import { useToast } from '../hooks/useToast.js'
import {
  addChatMessage,
  createChat,
  deleteChatWithMessages,
  subscribeChats,
  subscribeMessages,
  titleFromPrompt,
  touchChat,
} from '../services/firestoreChats.js'
import { createQuiz, getQuizzesByChatId } from '../services/firestoreQuizzes.js'
import { generateQuizFromContent } from '../services/quizGeneration.js'
import { generateFlashcardsFromContent } from '../services/flashcardGeneration.js'
import {
  getOpenRouterUserMessage,
  OPENROUTER_MODEL_LABEL,
  streamOpenRouterChat,
} from '../services/openRouterChat.js'

export function AiAssistantPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { addNote, notes, addQuizAttempt, addFlashcard } = useFirestoreData()
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [chatsLoading, setChatsLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [chatError, setChatError] = useState('')
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [savedNoteIds, setSavedNoteIds] = useState(new Set())
  const [quizzes, setQuizzes] = useState([])
  const knownChatIdsRef = useRef(new Set())
  const abortRef = useRef(null)

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === selectedChatId) ?? null,
    [chats, selectedChatId],
  )

  useEffect(() => {
    if (!user?.uid) {
      startTransition(() => {
        setChats([])
        setSelectedChatId(null)
        setChatsLoading(false)
      })
      return undefined
    }

    startTransition(() => setChatsLoading(true))
    const unsubscribe = subscribeChats(
      user.uid,
      (rows) => {
        knownChatIdsRef.current = new Set(rows.map((row) => row.id))
        setChats(rows)
        setChatsLoading(false)
      },
      (err) => {
        console.error(err)
        setChatError(err.message || 'Could not load conversations.')
        setChatsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user?.uid])

  useEffect(() => {
    if (!selectedChatId) {
      startTransition(() => {
        setMessages([])
        setMessagesLoading(false)
        setQuizzes([])
      })
      return undefined
    }

    startTransition(() => setMessagesLoading(true))
    const unsubscribe = subscribeMessages(
      selectedChatId,
      (rows) => {
        setMessages(rows)
        setMessagesLoading(false)
      },
      (err) => {
        console.error(err)
        setChatError(err.message || 'Could not load messages.')
        setMessagesLoading(false)
      },
    )

    return () => unsubscribe()
  }, [selectedChatId])

  useEffect(() => {
    if (!selectedChatId || !user?.uid) {
      startTransition(() => setQuizzes([]))
      return undefined
    }

    const loadQuizzes = async () => {
      try {
        const quizData = await getQuizzesByChatId(user.uid, selectedChatId)
        startTransition(() => setQuizzes(quizData))
      } catch (err) {
        console.error('Failed to load quizzes:', err)
      }
    }

    loadQuizzes()
  }, [selectedChatId, user?.uid])

  useEffect(() => {
    if (selectedChatId || chats.length === 0) return
    startTransition(() => setSelectedChatId(chats[0].id))
  }, [chats, selectedChatId])

  useEffect(() => {
    if (!selectedChatId || chatsLoading || knownChatIdsRef.current.has(selectedChatId)) return
    startTransition(() => setSelectedChatId(chats[0]?.id ?? null))
  }, [chats, chatsLoading, selectedChatId])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  async function handleGenerateQuiz(content) {
    if (!user?.uid || !selectedChatId || isGeneratingQuiz) return

    setIsGeneratingQuiz(true)
    setChatError('')

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const quizData = await generateQuizFromContent(content, controller.signal)

      const quizId = await createQuiz(user.uid, selectedChatId, quizData.title || 'Quiz', quizData.questions, null, null)

      const newQuiz = {
        id: quizId,
        userId: user.uid,
        chatId: selectedChatId,
        title: quizData.title || 'Quiz',
        questions: quizData.questions,
        createdAt: new Date().toISOString(),
      }

      setQuizzes((prev) => [newQuiz, ...prev])

      showToast('Quiz generated successfully!')
    } catch (err) {
      if (err?.name === 'AbortError') return
      const message = err?.message || 'Failed to generate quiz'
      setChatError(message)
      showToast(message, 'error')
    } finally {
      setIsGeneratingQuiz(false)
      abortRef.current = null
    }
  }

  async function handleGenerateFlashcards(content) {
    if (!user?.uid || !selectedChatId || isGeneratingFlashcards) return

    setIsGeneratingFlashcards(true)
    setChatError('')

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const flashcardData = await generateFlashcardsFromContent(content, controller.signal)

      await addFlashcard({
        title: flashcardData.title || `Flashcards from ${selectedChat?.title || 'Chat'}`,
        cards: flashcardData.cards,
        sourceType: 'ai',
        sourceId: selectedChatId,
        sourceTitle: selectedChat?.title,
      })

      showToast('Flashcards generated successfully!')
    } catch (err) {
      if (err?.name === 'AbortError') return
      const message = err?.message || 'Failed to generate flashcards'
      setChatError(message)
      showToast(message, 'error')
    } finally {
      setIsGeneratingFlashcards(false)
      abortRef.current = null
    }
  }

  async function handleQuizComplete(quizResult) {
    if (!user?.uid) return
    try {
      await addQuizAttempt(quizResult)
    } catch (err) {
      console.error('Failed to save quiz attempt:', err)
    }
  }

  async function handleSaveAsNote(content, messageId, userPrompt) {
    if (!user?.uid || isSavingNote) return

    const trimmedContent = content.trim()
    if (!trimmedContent) {
      showToast('Cannot save empty response', 'error')
      return
    }

    // Check for duplicate notes
    const isDuplicate = notes.some((note) => note.content.trim() === trimmedContent)
    if (isDuplicate) {
      showToast('This note has already been saved')
      return
    }

    setIsSavingNote(true)

    try {
      // Generate title from user prompt (truncate if too long)
      const title = userPrompt
        ? (userPrompt.length > 50 ? userPrompt.slice(0, 50).trim() : userPrompt)
        : (trimmedContent.length > 50 ? trimmedContent.slice(0, 50).trim() : trimmedContent)

      const fallbackTitle = selectedChat?.title
        ? `AI Note from ${selectedChat.title}`
        : 'AI Note'

      await addNote({
        title: title || fallbackTitle,
        content: trimmedContent,
      })

      // Track that this message has been saved
      setSavedNoteIds((prev) => new Set([...prev, messageId]))

      showToast('Note saved successfully')
    } catch (err) {
      console.error('Failed to save note:', err)
      showToast('Failed to save note', 'error')
    } finally {
      setIsSavingNote(false)
    }
  }

  async function handleCreateChat() {
    if (!user?.uid) return
    try {
      const chatId = await createChat(user.uid)
      knownChatIdsRef.current.add(chatId)
      setSelectedChatId(chatId)
      setSidebarOpen(false)
      setChatError('')
    } catch (err) {
      showToast(err?.message || 'Could not create chat.', 'error')
    }
  }

  async function handleDeleteChat(chatId) {
    const chat = chats.find((row) => row.id === chatId)
    if (chat && !window.confirm(`Delete "${chat.title}"?`)) return

    try {
      await deleteChatWithMessages(chatId)
      knownChatIdsRef.current.delete(chatId)
      if (selectedChatId === chatId) {
        const next = chats.find((row) => row.id !== chatId)
        setSelectedChatId(next?.id ?? null)
      }
      showToast('Chat deleted')
    } catch (err) {
      showToast(err?.message || 'Could not delete chat.', 'error')
    }
  }

  async function handleSend(text) {
    if (!user?.uid || isStreaming) return

    const controller = new AbortController()
    abortRef.current = controller
    setIsStreaming(true)
    setStreamingContent('')
    setChatError('')

    try {
      let chatId = selectedChatId
      const generatedTitle = titleFromPrompt(text)
      const shouldRetitle = (selectedChat?.title ?? 'New chat') === 'New chat' && messages.length === 0

      if (!chatId) {
        chatId = await createChat(user.uid, generatedTitle)
        knownChatIdsRef.current.add(chatId)
        setSelectedChatId(chatId)
      } else if (shouldRetitle) {
        await touchChat(chatId, { title: generatedTitle })
      }

      const userMessage = { role: 'user', content: text }
      const requestMessages = [...messages, userMessage]
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .slice(-24)

      await addChatMessage(chatId, userMessage)

      let assistantText = ''
      const response = await streamOpenRouterChat({
        messages: requestMessages,
        signal: controller.signal,
        onToken: (token) => {
          assistantText += token
          setStreamingContent((prev) => prev + token)
        },
      })
      if (response.fallbackUsed) {
        showToast(`Primary model was unavailable, so ${response.model} answered instead.`)
      }

      const finalText = assistantText.trim()
      setStreamingContent('')
      if (finalText) {
        await addChatMessage(chatId, { role: 'assistant', content: finalText })
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
      const message = getOpenRouterUserMessage(err)
      setChatError(message)
      showToast(message, 'error')
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const streamingMessage = streamingContent
    ? { id: 'streaming-assistant-message', role: 'assistant', content: streamingContent }
    : null

  return (
    <section className="h-[calc(100vh-8.5rem)] min-h-[36rem] overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/60 shadow-xl shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-black/30">
      <div className="flex h-full">
        <ConversationSidebar
          chats={chats}
          selectedChatId={selectedChatId}
          loading={chatsLoading}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onCreate={handleCreateChat}
          onSelect={(chatId) => {
            setSelectedChatId(chatId)
            setSidebarOpen(false)
            setChatError('')
          }}
          onDelete={handleDeleteChat}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-zinc-200/90 bg-white/75 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/55 md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200/90 text-zinc-700 dark:border-white/10 dark:text-zinc-200 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open conversations"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-600/25">
                <Bot className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-zinc-900 dark:text-white">
                  {selectedChat?.title || 'AI Assistant'}
                </h1>
                <p className="truncate text-xs text-zinc-500">
                  Streaming with {OPENROUTER_MODEL_LABEL}
                </p>
              </div>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={handleCreateChat}>
              <Sparkles className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          </header>

          <ChatThread
            messages={messages}
            streamingMessage={streamingMessage}
            loading={messagesLoading}
            isTyping={isStreaming && !streamingContent}
            error={chatError}
            onGenerateQuiz={handleGenerateQuiz}
            quizzes={quizzes}
            isGeneratingQuiz={isGeneratingQuiz}
            onGenerateFlashcards={handleGenerateFlashcards}
            isGeneratingFlashcards={isGeneratingFlashcards}
            onSaveAsNote={handleSaveAsNote}
            isSavingNote={isSavingNote}
            savedNoteIds={savedNoteIds}
            onQuizComplete={handleQuizComplete}
          />

          <MessageComposer disabled={!user?.uid} isStreaming={isStreaming} onSend={handleSend} />
        </div>
      </div>
    </section>
  )
}
