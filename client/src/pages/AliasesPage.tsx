import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Topbar } from '../components/Topbar'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
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
import { deleteAlias, listAliases, upsertAlias } from '../api/aliases'
import type { Alias } from '../api/aliases'
import { listCollections } from '../api/collections'
import type { CollectionSummary } from '../api/collections'
import { ApiError } from '../api/client'

export function AliasesPage() {
  const [aliases, setAliases] = useState<Alias[]>([])
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [collectionName, setCollectionName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [aliasesRes, collectionsRes] = await Promise.all([listAliases(), listCollections()])
      setAliases(aliasesRes)
      setCollections(collectionsRes)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load aliases')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const openCreateModal = () => {
    setName('')
    setCollectionName(collections[0]?.name ?? '')
    setFormError(null)
    setShowModal(true)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!name.trim() || !collectionName.trim()) {
      setFormError('Alias name and target collection are required')
      return
    }
    setIsSubmitting(true)
    try {
      await upsertAlias(name.trim(), { collection_name: collectionName })
      setShowModal(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save alias')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteAlias(deleteTarget)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete alias')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Topbar
        title="Aliases"
        description="Point stable alias names at underlying collections"
        actions={
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Create alias
          </Button>
        }
      />

      <div className="flex flex-col gap-4 p-8">
        {error && <ErrorBanner>{error}</ErrorBanner>}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="h-6 w-6" />
          </div>
        ) : aliases.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-16 text-center">
            <p className="text-sm text-slate-500">No aliases yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alias</TableHead>
                <TableHead>Target collection</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aliases.map((alias) => (
                <TableRow key={alias.name}>
                  <TableCell className="font-medium text-slate-900">{alias.name}</TableCell>
                  <TableCell>{alias.collection_name}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => setDeleteTarget(alias.name)}
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
            <DialogTitle>Create alias</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="alias-name">Alias name</Label>
              <Input id="alias-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Target collection</Label>
              <Select value={collectionName} onValueChange={setCollectionName}>
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
            <DialogTitle>Delete alias</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete alias <strong>{deleteTarget}</strong>?
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
