import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Topbar } from '../components/Topbar'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog'
import { Spinner, ErrorBanner } from '../components/ui/feedback'
import { createKey, deleteKey, listKeys } from '../api/keys'
import type { Key } from '../api/keys'
import { ApiError } from '../api/client'

export function ApiKeysPage() {
  const [keys, setKeys] = useState<Key[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [description, setDescription] = useState('')
  const [actionsText, setActionsText] = useState('documents:*')
  const [collectionsText, setCollectionsText] = useState('*')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdKeyValue, setCreatedKeyValue] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      setKeys(await listKeys())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load API keys')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const openCreateModal = () => {
    setDescription('')
    setActionsText('documents:*')
    setCollectionsText('*')
    setFormError(null)
    setCreatedKeyValue(null)
    setShowModal(true)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    const actions = actionsText.split(',').map((a) => a.trim()).filter(Boolean)
    const collections = collectionsText.split(',').map((c) => c.trim()).filter(Boolean)
    if (!description.trim()) {
      setFormError('Description is required')
      return
    }
    if (actions.length === 0 || collections.length === 0) {
      setFormError('At least one action and one collection are required')
      return
    }
    setIsSubmitting(true)
    try {
      const created = await createKey({ description: description.trim(), actions, collections })
      setCreatedKeyValue(created.value ?? null)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create key')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (deleteTarget === null) return
    setIsDeleting(true)
    try {
      await deleteKey(deleteTarget)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete key')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Topbar
        title="API Keys"
        description="Manage scoped API keys for client and server access"
        actions={
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Create key
          </Button>
        }
      />

      <div className="flex flex-col gap-4 p-8">
        {error && <ErrorBanner>{error}</ErrorBanner>}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="h-6 w-6" />
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-16 text-center">
            <p className="text-sm text-slate-500">No API keys yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Collections</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>{key.id}</TableCell>
                  <TableCell className="font-medium text-slate-900">{key.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{key.value_prefix ?? '—'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {key.actions.map((a) => (
                        <Badge key={a} variant="info">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {key.collections.map((c) => (
                        <Badge key={c} variant="outline">
                          {c}
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
                        onClick={() => setDeleteTarget(key.id)}
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
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              The generated key value is only shown once — copy it before closing this dialog.
            </DialogDescription>
          </DialogHeader>

          {createdKeyValue ? (
            <div className="flex flex-col gap-3">
              <Label>Key value</Label>
              <code className="break-all rounded-lg bg-slate-900 p-3 text-xs text-emerald-300">
                {createdKeyValue}
              </code>
              <DialogFooter>
                <Button onClick={() => setShowModal(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="key-description">Description</Label>
                <Input id="key-description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="key-actions">Actions (comma-separated)</Label>
                <Input id="key-actions" value={actionsText} onChange={(e) => setActionsText(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="key-collections">Collections (comma-separated, * for all)</Label>
                <Input
                  id="key-collections"
                  value={collectionsText}
                  onChange={(e) => setCollectionsText(e.target.value)}
                />
              </div>
              {formError && <ErrorBanner>{formError}</ErrorBanner>}
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating…' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API key</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete key <strong>{deleteTarget}</strong>?
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
