import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Sparkles, Trash2, ExternalLink, BookOpen, BrainCircuit, Layers } from 'lucide-react'
import { PageShell } from '../components/page/PageShell.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { SectionHeader } from '../components/ui/SectionHeader.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { SkeletonPulse } from '../components/dashboard/SkeletonPulse.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { useFirestoreData } from '../hooks/useFirestoreData.js'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { uploadPDF } from '../services/pdfStorage.js'
import { streamOpenRouterChat } from '../services/openRouterChat.js'
import { generateQuizFromContent } from '../services/quizGeneration.js'
import { createQuiz } from '../services/firestoreQuizzes.js'
import { generateFlashcardsFromContent } from '../services/flashcardGeneration.js'

/**
 * DocumentsPage — Upload and manage educational PDF documents.
 */
export function DocumentsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { documents, loading, addDocument, deleteDocument, addNote, addFlashcard } = useFirestoreData()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingDoc, setGeneratingDoc] = useState(null)
  const abortRef = useRef(null)

  async function handleUpload() {
    if (!user?.uid || !selectedFile || isUploading) return

    setIsUploading(true)

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const fileUrl = await uploadPDF(selectedFile, user.uid, controller.signal)

      await addDocument({
        fileName: selectedFile.name,
        fileUrl,
      })

      showToast('Document uploaded successfully!')
      setUploadOpen(false)
      setSelectedFile(null)
    } catch (err) {
      if (err?.name === 'AbortError') return
      showToast(err?.message || 'Failed to upload document', 'error')
    } finally {
      setIsUploading(false)
      abortRef.current = null
    }
  }

  async function handleDeleteDocument(id) {
    try {
      await deleteDocument(id)
      showToast('Document deleted')
    } catch (err) {
      showToast(err?.message || 'Could not delete document.', 'error')
    }
  }

  async function handleGenerateSummary(document) {
    if (!user?.uid || isGenerating) return

    setIsGenerating(true)
    setGeneratingDoc(document.id)

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const prompt = `Generate a comprehensive summary of the educational content from the document: ${document.fileName}

The summary should:
- Cover the main topics and concepts
- Highlight key points and important details
- Be well-structured with clear sections
- Be suitable for studying and review

Generate the summary now:`

      let summaryText = ''
      await streamOpenRouterChat({
        messages: [{ role: 'user', content: prompt }],
        signal: controller.signal,
        onToken: (token) => {
          summaryText += token
        },
      })

      await addNote({
        title: `Summary: ${document.fileName}`,
        content: summaryText,
      })

      showToast('Summary saved as note!')
    } catch (err) {
      if (err?.name === 'AbortError') return
      showToast(err?.message || 'Failed to generate summary', 'error')
    } finally {
      setIsGenerating(false)
      setGeneratingDoc(null)
      abortRef.current = null
    }
  }

  async function handleGenerateQuiz(document) {
    if (!user?.uid || isGenerating) return

    setIsGenerating(true)
    setGeneratingDoc(document.id)

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const prompt = `Generate a quiz based on the educational content from the document: ${document.fileName}

The quiz should:
- Have 5-10 questions
- Include multiple choice options
- Test understanding of key concepts
- Be suitable for self-assessment

Generate the quiz now:`

      let quizText = ''
      await streamOpenRouterChat({
        messages: [{ role: 'user', content: prompt }],
        signal: controller.signal,
        onToken: (token) => {
          quizText += token
        },
      })

      const quizData = await generateQuizFromContent(quizText, controller.signal)

      await createQuiz(user.uid, null, quizData.title || `Quiz: ${document.fileName}`, quizData.questions, null, null)

      showToast('Quiz generated successfully!')
    } catch (err) {
      if (err?.name === 'AbortError') return
      showToast(err?.message || 'Failed to generate quiz', 'error')
    } finally {
      setIsGenerating(false)
      setGeneratingDoc(null)
      abortRef.current = null
    }
  }

  async function handleGenerateFlashcards(document) {
    if (!user?.uid || isGenerating) return

    setIsGenerating(true)
    setGeneratingDoc(document.id)

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const prompt = `Generate flashcards based on the educational content from the document: ${document.fileName}

The flashcards should:
- Have 10-15 cards
- Each card should have a front (question/prompt) and back (answer/explanation)
- Cover key concepts and important details
- Be suitable for studying and review

Generate the flashcards now:`

      let flashcardText = ''
      await streamOpenRouterChat({
        messages: [{ role: 'user', content: prompt }],
        signal: controller.signal,
        onToken: (token) => {
          flashcardText += token
        },
      })

      const flashcardData = await generateFlashcardsFromContent(flashcardText, controller.signal)

      await addFlashcard({
        title: flashcardData.title || `Flashcards from ${document.fileName}`,
        cards: flashcardData.cards,
        sourceType: 'document',
        sourceId: document.id,
        sourceTitle: document.fileName,
      })

      showToast('Flashcards generated successfully!')
    } catch (err) {
      if (err?.name === 'AbortError') return
      showToast(err?.message || 'Failed to generate flashcards', 'error')
    } finally {
      setIsGenerating(false)
      setGeneratingDoc(null)
      abortRef.current = null
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Only PDF files are allowed', 'error')
        return
      }
      setSelectedFile(file)
    }
  }

  function openUpload() {
    setUploadOpen(true)
    setSelectedFile(null)
  }

  return (
    <PageShell
      icon={FileText}
      title="Documents"
      description="Upload educational PDFs and generate summaries and quizzes from them."
      highlights={[]}
    >
      <div className="mb-6 flex justify-end">
        <Button type="button" onClick={openUpload}>
          <Plus className="h-4 w-4" aria-hidden />
          Upload PDF
        </Button>
      </div>

      <Card padding="p-0 overflow-hidden">
        <div className="border-b border-zinc-200/90 px-5 py-4 dark:border-white/10 md:px-6">
          <SectionHeader
            title="Your Documents"
            subtitle={loading ? 'Loading…' : `${documents.length} document${documents.length === 1 ? '' : 's'}`}
          />
        </div>
        {loading ? (
          <div className="space-y-3 p-5 md:p-6">
            <SkeletonPulse className="h-20 w-full rounded-xl" />
            <SkeletonPulse className="h-20 w-full rounded-xl" />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-5 md:p-6">
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Upload PDF documents to generate summaries and quizzes from them."
            />
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200/90 dark:divide-white/10">
            {documents.map((doc, i) => (
              <motion.li
                key={doc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.18) }}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden />
                    <h3 className="font-semibold text-zinc-900 dark:text-white">{doc.fileName}</h3>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {doc.uploadedAt ? `Uploaded ${new Date(doc.uploadedAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-white/20 dark:hover:bg-zinc-900"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => handleGenerateSummary(doc)}
                    disabled={isGenerating && generatingDoc === doc.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs text-zinc-600 transition hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-violet-400/20 dark:hover:bg-violet-500/10 disabled:opacity-50"
                  >
                    {isGenerating && generatingDoc === doc.id ? (
                      <Sparkles className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <BookOpen className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {isGenerating && generatingDoc === doc.id ? 'Generating...' : 'Summary'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateQuiz(doc)}
                    disabled={isGenerating && generatingDoc === doc.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs text-zinc-600 transition hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-violet-400/20 dark:hover:bg-violet-500/10 disabled:opacity-50"
                  >
                    {isGenerating && generatingDoc === doc.id ? (
                      <Sparkles className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <BrainCircuit className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {isGenerating && generatingDoc === doc.id ? 'Generating...' : 'Quiz'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateFlashcards(doc)}
                    disabled={isGenerating && generatingDoc === doc.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs text-zinc-600 transition hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-violet-400/20 dark:hover:bg-violet-500/10 disabled:opacity-50"
                  >
                    {isGenerating && generatingDoc === doc.id ? (
                      <Sparkles className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Layers className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {isGenerating && generatingDoc === doc.id ? 'Generating...' : 'Flashcards'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc.id)}
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

      {/* Upload Modal */}
      <Modal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload PDF"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" aria-hidden />
                  Uploading...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Upload
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="pdfFile" className="block text-sm font-medium text-zinc-900 dark:text-white">
              Select PDF File
            </label>
            <input
              id="pdfFile"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100 disabled:opacity-50"
            />
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 rounded-lg border border-violet-200/80 bg-violet-50 p-3 dark:border-violet-400/20 dark:bg-violet-500/10">
              <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedFile.name}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </PageShell>
  )
}
