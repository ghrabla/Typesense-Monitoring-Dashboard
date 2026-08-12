import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Checkbox,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from 'flowbite-react'
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Collections</h1>
        <Button onClick={openCreateModal}>Create collection</Button>
      </div>

      {error && <Alert color="failure">{error}</Alert>}

      {isLoading ? (
        <Spinner />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Documents</TableHeadCell>
              <TableHeadCell>Fields</TableHeadCell>
              <TableHeadCell>
                <span className="sr-only">Actions</span>
              </TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {collections.map((collection) => (
              <TableRow key={collection.name} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <TableCell className="font-medium text-gray-900 dark:text-white">{collection.name}</TableCell>
                <TableCell>{collection.num_documents}</TableCell>
                <TableCell>{collection.num_fields}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="xs" onClick={() => navigate(`/collections/${encodeURIComponent(collection.name)}`)}>
                    Browse
                  </Button>
                  <Button size="xs" color="red" onClick={() => setDeleteTarget(collection.name)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {collections.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 dark:text-gray-400">
                  No collections yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader>Create collection</ModalHeader>
        <form onSubmit={handleCreate}>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="collection-name">Name</Label>
                </div>
                <TextInput id="collection-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="default-sorting-field">Default sorting field (optional)</Label>
                </div>
                <TextInput
                  id="default-sorting-field"
                  value={defaultSortingField}
                  onChange={(e) => setDefaultSortingField(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Label>Fields</Label>
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <TextInput
                      placeholder="Field name"
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      className="w-40"
                    />
                    <Select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value })}
                      className="w-32"
                    >
                      {FIELD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Select>
                    <label className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                      <Checkbox
                        checked={field.facet}
                        onChange={(e) => updateField(index, { facet: e.target.checked })}
                      />
                      Facet
                    </label>
                    <label className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                      <Checkbox
                        checked={field.optional}
                        onChange={(e) => updateField(index, { optional: e.target.checked })}
                      />
                      Optional
                    </label>
                    <label className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                      <Checkbox checked={field.sort} onChange={(e) => updateField(index, { sort: e.target.checked })} />
                      Sort
                    </label>
                    <Button
                      size="xs"
                      color="light"
                      type="button"
                      onClick={() => removeField(index)}
                      disabled={fields.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button size="xs" color="light" type="button" onClick={addField}>
                  Add field
                </Button>
              </div>

              {formError && <Alert color="failure">{formError}</Alert>}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create'}
            </Button>
            <Button color="light" type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal show={deleteTarget !== null} onClose={() => setDeleteTarget(null)} size="md">
        <ModalHeader>Delete collection</ModalHeader>
        <ModalBody>
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <strong>{deleteTarget}</strong>? This cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="red" onClick={() => void handleDelete()} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
          <Button color="light" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
