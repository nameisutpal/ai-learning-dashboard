import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Eye, Pencil, Search, Sparkles, StickyNote, Trash2, Layers } from 'lucide-react'
import { PageShell } from '../components/page/PageShell.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { SectionHeader } from '../components/ui/SectionHeader.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { SkeletonPulse } from '../components/dashboard/SkeletonPulse.jsx'
import { MarkdownMessage } from '../components/assistant/MarkdownMessage.jsx'
import { QuizCard } from '../components/assistant/QuizCard.jsx'
import { useFirestoreData } from '../hooks/useFirestoreData.js'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'
import { createQuiz } from '../services/firestoreQuizzes.js'
import { generateQuizFromContent } from '../services/quizGeneration.js'
import { generateFlashcardsFromContent } from '../services/flashcardGeneration.js'

/**
 * NotesPage — CRUD backed by Firestore `notes` collection.
 */
export function NotesPage() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const { notes, loading, error, addNote, updateNote, deleteNote, addQuizAttempt, addFlashcard } = useFirestoreData()

  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editError, setEditError] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const [viewOpen, setViewOpen] = useState(false)
  const [viewNote, setViewNote] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [generatedQuiz, setGeneratedQuiz] = useState(null)
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false)
  const abortRef = useRef(null)

  // Determine if note is AI-generated (heuristic: title starts with "AI Note from" or content > 200 chars)
  const isAINote = (note) => {
    return note.title?.startsWith('AI Note from') || (note.content?.length > 200 && note.title?.length < 60)
  }

  // Analytics
  const analytics = useMemo(() => {
    const aiNotes = notes.filter(isAINote)
    const manualNotes = notes.filter((note) => !isAINote(note))
    const lastUpdated = notes.length > 0 ? notes.reduce((latest, note) => {
      return (note.updatedAt && (!latest.updatedAt || new Date(note.updatedAt) > new Date(latest.updatedAt))) ? note : latest
    }, notes[0]) : null

    return {
      total: notes.length,
      ai: aiNotes.length,
      manual: manualNotes.length,
      lastUpdated: lastUpdated?.title || 'No notes yet',
    }
  }, [notes])

  // Filter and sort notes
  const filteredAndSorted = useMemo(() => {
    let filtered = notes

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((note) =>
        note.title?.toLowerCase().includes(query) || note.content?.toLowerCase().includes(query)
      )
    }

    // Sort
    const sorted = [...filtered]
    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        break
      case 'oldest':
        sorted.sort((a, b) => (a.updatedAt > b.updatedAt ? 1 : -1))
        break
      case 'title':
        sorted.sort((a, b) => (a.title?.localeCompare(b.title || '') || 0))
        break
      default:
        sorted.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    }

    return sorted
  }, [notes, searchQuery, sortBy])

  async function createNote(e) {
    e.preventDefault()
    if (!newTitle.trim()) {
      setFieldErrors({ title: 'Title is required so you can find this note later.' })
      return
    }
    if (!newBody.trim()) {
      setFieldErrors({ body: 'Add a sentence or two in the body — even a stub helps.' })
      return
    }
    setFieldErrors({})
    setSaving(true)
    try {
      await addNote({ title: newTitle.trim(), content: newBody.trim() })
      showToast('Note saved')
      setNewTitle('')
      setNewBody('')
    } catch (err) {
      showToast(err?.message || 'Could not save note.', 'error')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(note) {
    setEditId(note.id)
    setEditTitle(note.title)
    setEditBody(note.content)
    setEditError('')
    setEditOpen(true)
  }

  async function saveEdit() {
    if (!editTitle.trim() || !editBody.trim()) {
      setEditError('Title and content cannot be empty.')
      return
    }
    setEditSaving(true)
    try {
      await updateNote(editId, { title: editTitle.trim(), content: editBody.trim() })
      showToast('Note updated')
      setEditOpen(false)
    } catch (err) {
      showToast(err?.message || 'Could not update note.', 'error')
    } finally {
      setEditSaving(false)
    }
  }

  function confirmDelete(id) {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  function openView(note) {
    setViewNote(note)
    setViewOpen(true)
  }

  async function performDelete() {
    try {
      await deleteNote(deleteId)
      showToast('Note deleted')
      setDeleteOpen(false)
      setDeleteId(null)
    } catch (err) {
      showToast(err?.message || 'Could not delete note.', 'error')
    }
  }

  async function handleGenerateQuiz(note) {
    if (!user?.uid || isGeneratingQuiz) return

    setIsGeneratingQuiz(true)
    setGeneratedQuiz(null)

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const quizData = await generateQuizFromContent(note.content, controller.signal)

      const quizId = await createQuiz(user.uid, null, quizData.title || `Quiz: ${note.title}`, quizData.questions, note.id, note.title)

      const newQuiz = {
        id: quizId,
        userId: user.uid,
        noteId: note.id,
        noteTitle: note.title,
        title: quizData.title || `Quiz: ${note.title}`,
        questions: quizData.questions,
        createdAt: new Date().toISOString(),
      }

      setGeneratedQuiz(newQuiz)
      showToast('Quiz generated successfully!')
    } catch (err) {
      if (err?.name === 'AbortError') return
      showToast(err?.message || 'Failed to generate quiz', 'error')
    } finally {
      setIsGeneratingQuiz(false)
      abortRef.current = null
    }
  }

  async function handleGenerateFlashcards(note) {
    if (!user?.uid || isGeneratingFlashcards) return

    setIsGeneratingFlashcards(true)

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const flashcardData = await generateFlashcardsFromContent(note.content, controller.signal)

      await addFlashcard({
        title: flashcardData.title || `Flashcards from ${note.title}`,
        cards: flashcardData.cards,
        sourceType: 'note',
        sourceId: note.id,
        sourceTitle: note.title,
      })

      showToast('Flashcards generated successfully!')
    } catch (err) {
      if (err?.name === 'AbortError') return
      showToast(err?.message || 'Failed to generate flashcards', 'error')
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

  return (
    <PageShell
      icon={StickyNote}
      title="Notes"
      description="Your study notes and AI-generated insights in one place."
      highlights={[]}
    >
      {error ? (
        <Card className="mb-6 border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-900 dark:text-rose-100" padding="">
          <p className="font-medium">Firestore</p>
          <p className="mt-1 text-rose-800/90 dark:text-rose-200/90">{error}</p>
        </Card>
      ) : null}

      {/* Analytics Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
              <StickyNote className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Total Notes</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{analytics.total}</p>
            </div>
          </div>
        </Card>
        <Card padding="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              <Bot className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">AI Notes</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{analytics.ai}</p>
            </div>
          </div>
        </Card>
        <Card padding="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
              <Pencil className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Manual Notes</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{analytics.manual}</p>
            </div>
          </div>
        </Card>
        <Card padding="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              <StickyNote className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Last Updated</p>
              <p className="truncate text-lg font-semibold text-zinc-900 dark:text-white">{analytics.lastUpdated}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="New note" subtitle="Create a new note to capture your thoughts." />
          <form className="mt-5 space-y-4" onSubmit={createNote}>
            <Input
              label="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              error={fieldErrors.title}
            />
            <Input
              label="Content"
              multiline
              rows={6}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Key ideas, links, or next steps…"
              error={fieldErrors.body}
            />
            <Button type="submit" className="w-full" loading={saving} disabled={loading}>
              Save note
            </Button>
          </form>
        </Card>

        <Card padding="p-0 overflow-hidden">
          <div className="border-b border-zinc-200/90 px-5 py-4 dark:border-white/10 md:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <SectionHeader
                title="Library"
                subtitle={loading ? 'Loading…' : `${filteredAndSorted.length} note${filteredAndSorted.length === 1 ? '' : 's'}`}
              />
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200/90 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-violet-400 dark:focus:ring-violet-400/20"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 rounded-lg border border-zinc-200/90 bg-white px-3 text-sm text-zinc-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-400/20"
                >
                  <option value="recent">Recently Updated</option>
                  <option value="oldest">Oldest</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="space-y-3 p-5 md:p-6">
              <SkeletonPulse className="h-20 w-full rounded-xl" />
              <SkeletonPulse className="h-20 w-full rounded-xl" />
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="p-5 md:p-6">
              <EmptyState
                icon={StickyNote}
                title={searchQuery ? 'No notes found' : 'No notes created'}
                description={searchQuery ? 'Try a different search term.' : 'Your first note can be a tiny win — Firestore will store it under your user id.'}
              />
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200/90 dark:divide-white/10">
              {filteredAndSorted.map((note, i) => (
                <motion.li
                  key={note.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.18) }}
                  className="group flex flex-col gap-3 p-4 transition hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] sm:flex-row sm:items-start sm:justify-between md:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {isAINote(note) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                          <Bot className="h-2.5 w-2.5" aria-hidden />
                          AI Assistant
                        </span>
                      )}
                      {!isAINote(note) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                          <Pencil className="h-2.5 w-2.5" aria-hidden />
                          Manual
                        </span>
                      )}
                      <h3 className="font-semibold text-zinc-900 dark:text-white">{note.title}</h3>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{note.content}</p>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-600">
                      {note.updatedAt ? `Updated ${new Date(note.updatedAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2 opacity-100 transition-opacity group-hover:opacity-100 sm:opacity-0">
                    <button
                      type="button"
                      onClick={() => handleGenerateQuiz(note)}
                      disabled={isGeneratingQuiz}
                      className="inline-flex items-center gap-1 rounded-lg border border-violet-200/80 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:border-violet-400/40 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <Sparkles className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" aria-hidden />
                          Generate Quiz
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateFlashcards(note)}
                      disabled={isGeneratingFlashcards}
                      className="inline-flex items-center gap-1 rounded-lg border border-violet-200/80 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:border-violet-400/40 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
                    >
                      {isGeneratingFlashcards ? (
                        <>
                          <Sparkles className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Layers className="h-3.5 w-3.5" aria-hidden />
                          Flashcards
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openView(note)}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs text-zinc-700 transition hover:border-violet-400/40 hover:bg-violet-50 hover:text-violet-800 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-violet-400/20 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(note)}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs text-zinc-700 transition hover:border-violet-400/40 hover:bg-violet-50 hover:text-violet-800 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-violet-400/20 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(note.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs text-zinc-600 transition hover:border-rose-400/40 hover:bg-rose-50 hover:text-rose-700 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-rose-400/20 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Delete
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title={viewNote?.title || 'Note'}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => handleGenerateQuiz(viewNote)}
              disabled={isGeneratingQuiz}
              className="inline-flex items-center gap-2 rounded-lg border border-violet-200/80 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 transition hover:border-violet-400/40 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
            >
              {isGeneratingQuiz ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" aria-hidden />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Generate Quiz
                </>
              )}
            </button>
            <Button type="button" variant="secondary" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {viewNote && (
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
              {viewNote.updatedAt ? `Updated ${new Date(viewNote.updatedAt).toLocaleString()}` : ''}
            </div>
            <MarkdownMessage content={viewNote.content} />
            {generatedQuiz && generatedQuiz.noteId === viewNote.id && (
              <div className="mt-6">
                <QuizCard quiz={generatedQuiz} onQuizComplete={handleQuizComplete} />
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit note"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveEdit} loading={editSaving}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <Input label="Content" multiline rows={6} value={editBody} onChange={(e) => setEditBody(e.target.value)} />
          {editError ? (
            <p className="text-xs text-rose-300" role="alert">
              {editError}
            </p>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete note?"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={performDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">This removes the note from Firestore.</p>
      </Modal>
    </PageShell>
  )
}
