import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Topbar } from '../components/Topbar'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
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
import { deleteSynonym, listSynonyms, upsertSynonym } from '../api/synonyms'
import type { Synonym } from '../api/synonyms'
import { listCollections } from '../api/collections'
import type { CollectionSummary } from '../api/collections'
import { ApiError } from '../api/client'

export function SynonymsPage() {
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [selectedCollection, setSelectedCollection] = useState('')
  const [synonyms, setSynonyms] = useState<Synonym[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [id, setId] = useState('')
  const [root, setRoot] = useState('')
  const [synonymsText, setSynonymsText] = useState('')
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

  const loadSynonyms = async (collection: string) => {
    if (!collection) return
    setIsLoading(true)
    setError(null)
    try {
      setSynonyms(await listSynonyms(collection))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load synonyms')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedCollection) void loadSynonyms(selectedCollection)
  }, [selectedCollection])

  const openCreateModal = () => {
    setId('')
    setRoot('')
    setSynonymsText('')
    setFormError(null)
    setShowModal(true)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    const synonymList = synonymsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (!id.trim()) {
      setFormError('Synonym set ID is required')
      return
    }
    if (synonymList.length < 2) {
      setFormError('Provide at least two comma-separated synonyms')
      return
    }
    setIsSubmitting(true)
    try {
      await upsertSynonym(selectedCollection, id.trim(), {
        root: root.trim() || undefined,
        synonyms: synonymList,
      })
      setShowModal(false)
      await loadSynonyms(selectedCollection)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save synonym')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteSynonym(selectedCollection, deleteTarget)
      setDeleteTarget(null)
      await loadSynonyms(selectedCollection)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete synonym')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Topbar
        title="Synonyms"
        description="Define equivalent search terms per collection"
        actions={
          <Button onClick={openCreateModal} disabled={!selectedCollection}>
            <Plus className="h-4 w-4" />
            Create synonym set
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
        ) : synonyms.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-16 text-center">
            <p className="text-sm text-slate-500">No synonym sets for this collection yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Root</TableHead>
                <TableHead>Synonyms</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {synonyms.map((synonym) => (
                <TableRow key={synonym.id}>
                  <TableCell className="font-medium text-slate-900">{synonym.id}</TableCell>
                  <TableCell>{synonym.root || '—'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {synonym.synonyms.map((s) => (
                        <Badge key={s} variant="outline">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => setDeleteTarget(synonym.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create synonym set</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="synonym-id">Set ID</Label>
              <Input id="synonym-id" value={id} onChange={(e) => setId(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="synonym-root">Root (optional, for one-way synonyms)</Label>
              <Input id="synonym-root" value={root} onChange={(e) => setRoot(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="synonym-list">Synonyms (comma-separated)</Label>
              <Input
                id="synonym-list"
                value={synonymsText}
                onChange={(e) => setSynonymsText(e.target.value)}
                placeholder="couch, sofa, settee"
              />
            </div>
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
            <DialogTitle>Delete synonym set</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete synonym set <strong>{deleteTarget}</strong>?
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
