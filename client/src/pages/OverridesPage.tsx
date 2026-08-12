import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Topbar } from '../components/Topbar'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Spinner, ErrorBanner } from '../components/ui/feedback'
import { deleteOverride, listOverrides, upsertOverride } from '../api/overrides'
import type { Override } from '../api/overrides'
import { listCollections } from '../api/collections'
import type { CollectionSummary } from '../api/collections'
import { ApiError } from '../api/client'

export function OverridesPage() {
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [selectedCollection, setSelectedCollection] = useState('')
  const [overrides, setOverrides] = useState<Override[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [id, setId] = useState('')
  const [query, setQuery] = useState('')
  const [match, setMatch] = useState<'exact' | 'contains'>('exact')
  const [includesText, setIncludesText] = useState('')
  const [filterBy, setFilterBy] = useState('')
  const [removeMatchedTokens, setRemoveMatchedTokens] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const res = await listCollections()
        setCollections(res)
        if (res.length > 0) setSelectedCollection(res[0].name)
        else setIsLoading(false)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load collections')
        setIsLoading(false)
      }
    })()
  }, [])

  const loadOverrides = async (collection: string) => {
    if (!collection) return
    setIsLoading(true)
    setError(null)
    try {
      setOverrides(await listOverrides(collection))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load overrides')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedCollection) void loadOverrides(selectedCollection)
  }, [selectedCollection])

  const openCreateModal = () => {
    setId('')
    setQuery('')
    setMatch('exact')
    setIncludesText('')
    setFilterBy('')
    setRemoveMatchedTokens(false)
    setFormError(null)
    setShowModal(true)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!id.trim() || !query.trim()) {
      setFormError('Override ID and query are required')
      return
    }
    const includes = includesText
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry, index) => ({ id: entry, position: index + 1 }))

    setIsSubmitting(true)
    try {
      await upsertOverride(selectedCollection, id.trim(), {
        rule: { query: query.trim(), match },
        includes: includes.length > 0 ? includes : undefined,
        filter_by: filterBy.trim() || undefined,
        remove_matched_tokens: removeMatchedTokens || undefined,
      })
      setShowModal(false)
      await loadOverrides(selectedCollection)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save override')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteOverride(selectedCollection, deleteTarget)
      setDeleteTarget(null)
      await loadOverrides(selectedCollection)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete override')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Topbar
        title="Overrides"
        description="Pin or boost specific documents for given search queries"
        actions={
          <Button onClick={openCreateModal} disabled={!selectedCollection}>
            <Plus className="h-4 w-4" />
            Create override
          </Button>
        }
      />

      <div className="flex flex-col gap-4 p-8">
        <div className="flex flex-col gap-1.5 sm:w-64">
          <Label>Collection</Label>
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger>
              <SelectValue placeholder="Select a collection" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="h-6 w-6" />
          </div>
        ) : overrides.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-16 text-center">
            <p className="text-sm text-slate-500">No overrides for this collection yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Query</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Includes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overrides.map((override) => (
                <TableRow key={override.id}>
                  <TableCell className="font-medium text-slate-900">{override.id}</TableCell>
                  <TableCell>{override.rule.query}</TableCell>
                  <TableCell>{override.rule.match}</TableCell>
                  <TableCell>{override.includes?.map((i) => i.id).join(', ') || '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => setDeleteTarget(override.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create override</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="override-id">Override ID</Label>
              <Input id="override-id" value={id} onChange={(e) => setId(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="override-query">Query</Label>
                <Input id="override-query" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Match</Label>
                <Select value={match} onValueChange={(value) => setMatch(value as typeof match)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">exact</SelectItem>
                    <SelectItem value="contains">contains</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="override-includes">Pinned document IDs (comma-separated)</Label>
              <Input
                id="override-includes"
                value={includesText}
                onChange={(e) => setIncludesText(e.target.value)}
                placeholder="doc-1, doc-2"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="override-filter-by">Filter by (optional)</Label>
              <Input id="override-filter-by" value={filterBy} onChange={(e) => setFilterBy(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <Checkbox
                checked={removeMatchedTokens}
                onCheckedChange={(checked) => setRemoveMatchedTokens(checked === true)}
              />
              Remove matched tokens
            </label>
            {formError && <ErrorBanner>{formError}</ErrorBanner>}
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete override</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete override <strong>{deleteTarget}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
