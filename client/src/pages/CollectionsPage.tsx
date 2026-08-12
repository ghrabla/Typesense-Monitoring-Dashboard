import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, X } from 'lucide-react'
import { Topbar } from '../components/Topbar'
import { CollectionTable } from '../components/CollectionTable'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Spinner, ErrorBanner } from '../components/ui/feedback'
import { createCollection, deleteCollection, listCollections } from '../api/collections'
import type { CollectionField, CollectionSummary } from '../api/collections'
import { ApiError } from '../api/client'

const FIELD_TYPES = [
  'string',
  'string[]',
  'int32',
  'int32[]',
  'int64',
  'int64[]',
  'float',
  'float[]',
  'bool',
  'bool[]',
  'geopoint',
  'geopoint[]',
  'object',
  'object[]',
  'auto',
  'string*',
]

interface FieldDraft {
  name: string
  type: string
  facet: boolean
  optional: boolean
  index: boolean
  sort: boolean
}

function emptyField(): FieldDraft {
  return { name: '', type: 'string', facet: false, optional: false, index: true, sort: false }
}

export function CollectionsPage() {
  const navigate = useNavigate()

  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [name, setName] = useState('')
  const [defaultSortingField, setDefaultSortingField] = useState('')
  const [fields, setFields] = useState<FieldDraft[]>([emptyField()])
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadCollections = async () => {
    setIsLoading(true)
    setError(null)
    try {
      setCollections(await listCollections())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load collections')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCollections()
  }, [])

  const openCreateModal = () => {
    setName('')
    setDefaultSortingField('')
    setFields([emptyField()])
    setFormError(null)
    setShowCreateModal(true)
  }

  const updateField = (index: number, patch: Partial<FieldDraft>) => {
    setFields((prev) => prev.map((field, i) => (i === index ? { ...field, ...patch } : field)))
  }

  const addField = () => setFields((prev) => [...prev, emptyField()])
  const removeField = (index: number) => setFields((prev) => prev.filter((_, i) => i !== index))

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError('Collection name is required')
      return
    }

    const cleanFields: CollectionField[] = fields
      .filter((field) => field.name.trim())
      .map((field) => ({
        name: field.name.trim(),
        type: field.type,
        facet: field.facet || undefined,
        optional: field.optional || undefined,
        index: field.index || undefined,
        sort: field.sort || undefined,
      }))
    if (cleanFields.length === 0) {
      setFormError('At least one field is required')
      return
    }

    setIsSubmitting(true)
    try {
      await createCollection({
        name: name.trim(),
        fields: cleanFields,
        default_sorting_field: defaultSortingField.trim() || undefined,
      })
      setShowCreateModal(false)
      await loadCollections()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create collection')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteCollection(deleteTarget)
      setDeleteTarget(null)
      await loadCollections()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete collection')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Topbar
        title="Collections"
        description="Manage your Typesense collections and schemas"
        actions={
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Create collection
          </Button>
        }
      />

      <div className="flex flex-col gap-4 p-8">
        {error && <ErrorBanner>{error}</ErrorBanner>}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <CollectionTable
            collections={collections}
            onOpen={(name) => navigate(`/collections/${encodeURIComponent(name)}`)}
            onDelete={(name) => setDeleteTarget(name)}
          />
        )}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create collection</DialogTitle>
            <DialogDescription>Define a name, schema fields, and optional default sort field.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="collection-name">Name</Label>
                <Input id="collection-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="default-sorting-field">Default sorting field (optional)</Label>
                <Input
                  id="default-sorting-field"
                  value={defaultSortingField}
                  onChange={(e) => setDefaultSortingField(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Fields</Label>
              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3"
                  >
                    <Input
                      placeholder="Field name"
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      className="w-36"
                    />
                    <Select value={field.type} onValueChange={(value) => updateField(index, { type: value })}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Checkbox
                        checked={field.facet}
                        onCheckedChange={(checked) => updateField(index, { facet: checked === true })}
                      />
                      Facet
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Checkbox
                        checked={field.optional}
                        onCheckedChange={(checked) => updateField(index, { optional: checked === true })}
                      />
                      Optional
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Checkbox
                        checked={field.sort}
                        onCheckedChange={(checked) => updateField(index, { sort: checked === true })}
                      />
                      Sort
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeField(index)}
                      disabled={fields.length === 1}
                      className="ml-auto text-slate-400 hover:text-rose-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" type="button" onClick={addField} className="self-start">
                <Plus className="h-3.5 w-3.5" />
                Add field
              </Button>
            </div>

            {formError && <ErrorBanner>{formError}</ErrorBanner>}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
