import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PageShell } from '../components/page/PageShell.jsx'
import { GlassCard } from '../components/dashboard/GlassCard.jsx'
import { Button } from '../components/ui/Button.jsx'
import { useLms } from '../hooks/useLms.js'
import { BookOpen } from 'lucide-react'

const difficulties = ['beginner', 'intermediate', 'advanced']

function defaultThumb(title) {
  return `https://picsum.photos/seed/${encodeURIComponent(title || 'course')}/800/500`
}

/**
 * Isolated form — remounted when `location.pathname` changes so fields reset without effects.
 * (Avoids eslint `react-hooks/set-state-in-effect` and matches React’s “reset via key” pattern.)
 */
function CourseFormFields({
  isNew,
  isEdit,
  existing,
  navigate,
  createCourse,
  updateCourse,
  deleteCourse,
}) {
  const [title, setTitle] = useState(() => (isNew ? '' : existing?.title ?? ''))
  const [description, setDescription] = useState(() => (isNew ? '' : existing?.description ?? ''))
  const [thumbnailUrl, setThumbnailUrl] = useState(() => (isNew ? '' : existing?.thumbnailUrl ?? ''))
  const [category, setCategory] = useState(() => (isNew ? 'General' : existing?.category ?? 'General'))
  const [difficulty, setDifficulty] = useState(() => (isNew ? 'beginner' : existing?.difficulty ?? 'beginner'))
  const [tags, setTags] = useState(() => (isNew ? '' : existing?.tags?.join(', ') ?? ''))
  const [estimatedDurationHours, setEstimatedDurationHours] = useState(() =>
    isNew ? 10 : existing?.estimatedDurationHours ?? 10,
  )

  function onPickThumbFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setThumbnailUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  function onSubmit(e) {
    e.preventDefault()
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const thumb = thumbnailUrl.trim() || defaultThumb(title)

    if (isEdit && existing) {
      updateCourse(existing.id, {
        title: title.trim(),
        description: description.trim(),
        thumbnailUrl: thumb,
        category: category.trim() || 'General',
        difficulty,
        tags: tagList,
        estimatedDurationHours: Math.max(0.5, Number(estimatedDurationHours) || 0.5),
      })
      navigate(`/courses/${existing.id}/overview`, { replace: true })
      return
    }

    const c = createCourse({
      title: title.trim() || 'Untitled course',
      description: description.trim(),
      thumbnailUrl: thumb,
      category: category.trim() || 'General',
      difficulty,
      tags: tagList,
      estimatedDurationHours: Math.max(0.5, Number(estimatedDurationHours) || 0.5),
    })
    navigate(`/courses/${c.id}/overview`)
  }

  const backTo = existing ? `/courses/${existing.id}/overview` : '/courses'

  return (
    <>
      <div className="mb-4">
        <Link to={backTo}>
          <Button variant="ghost" size="sm" type="button">
            ← Back
          </Button>
        </Link>
      </div>

      <GlassCard hover={false} className="p-5 md:p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-1.5 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm text-zinc-900 shadow-inner shadow-zinc-200/40 outline-none ring-violet-500/0 transition focus:ring-2 dark:border-white/10 dark:bg-zinc-950/80 dark:text-white dark:shadow-black/30"
              placeholder="e.g. Distributed systems in practice"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Description</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm text-zinc-900 shadow-inner shadow-zinc-200/40 outline-none focus:ring-2 dark:border-white/10 dark:bg-zinc-950/80 dark:text-white dark:shadow-black/30"
              placeholder="What will learners ship or prove?"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block space-y-1.5 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Category</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Difficulty</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Est. hours</span>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={estimatedDurationHours}
                onChange={(e) => setEstimatedDurationHours(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Tags (comma separated)</span>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
              placeholder="react, performance, a11y"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Thumbnail URL</span>
            <input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
              placeholder="https://… or leave blank for generated art"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Thumbnail file (optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPickThumbFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-violet-800 dark:text-zinc-400 dark:file:bg-violet-500/20 dark:file:text-violet-100"
            />
          </label>

          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="max-h-56 w-full max-w-lg rounded-2xl border border-zinc-200/80 object-cover dark:border-white/10"
            />
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isEdit && existing ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  if (window.confirm(`Delete “${existing.title}”?`)) {
                    deleteCourse(existing.id)
                    navigate('/courses')
                  }
                }}
              >
                Delete course
              </Button>
            ) : null}
            <div className="flex-1" />
            <Button type="submit">{isEdit ? 'Save changes' : 'Create'}</Button>
          </div>
        </form>
      </GlassCard>
    </>
  )
}

export function CourseFormPage() {
  const location = useLocation()
  const isNew = location.pathname === '/courses/new'
  const { courseId } = useParams()
  const isEdit = !isNew && Boolean(courseId)
  const navigate = useNavigate()
  const { getCourse, createCourse, updateCourse, deleteCourse } = useLms()

  const existing = useMemo(
    () => (!isNew && courseId ? getCourse(courseId) : undefined),
    [isNew, courseId, getCourse],
  )

  useEffect(() => {
    if (isEdit && courseId && !existing) navigate('/courses', { replace: true })
  }, [isEdit, courseId, existing, navigate])

  if (isEdit && courseId && !existing) {
    return null
  }

  return (
    <PageShell
      icon={BookOpen}
      title={isEdit ? 'Edit course' : 'Create course'}
      description="Thumbnails accept HTTPS URLs or local images (stored as data URLs in this browser — swap to object storage when you add a backend)."
    >
      <CourseFormFields
        key={location.pathname}
        isNew={isNew}
        isEdit={isEdit}
        existing={existing}
        navigate={navigate}
        createCourse={createCourse}
        updateCourse={updateCourse}
        deleteCourse={deleteCourse}
      />
    </PageShell>
  )
}
