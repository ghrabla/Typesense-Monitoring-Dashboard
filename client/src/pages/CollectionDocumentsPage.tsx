import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Textarea,
  TextInput,
} from 'flowbite-react'
import { getCollection } from '../api/collections'
import type { Collection } from '../api/collections'
import { createDocument, deleteDocument, searchDocuments, updateDocument } from '../api/documents'
import type { DocumentRecord, SearchResponse } from '../api/documents'
import { ApiError } from '../api/client'

const PER_PAGE = 10

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function CollectionDocumentsPage() {
  const { name = '' } = useParams<{ name: string }>()
  const navigate = useNavigate()

  const [collection, setCollection] = useState<Collection | null>(null)
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState('*')
  const [filterBy, setFilterBy] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [page, setPage] = useState(1)

  const [showDocModal, setShowDocModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [docText, setDocText] = useState('{\n\n}')
  const [docError, setDocError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const queryBy = useMemo(() => {
    if (!collection) return ''
    return collection.fields
      .filter((field) => field.type === 'string' || field.type === 'string[]' || field.type === 'string*')
      .map((field) => field.name)
      .join(',')
  }, [collection])

  const runSearch = useCallback(
    async (targetPage: number) => {
      setIsLoading(true)
      setError(null)
      try {
        const trimmedQ = q.trim() || '*'
        const data = await searchDocuments(name, {
          q: trimmedQ,
          queryBy: trimmedQ !== '*' ? queryBy : undefined,
          filterBy: filterBy.trim() || undefined,
          sortBy: sortBy.trim() || undefined,
          page: targetPage,
          perPage: PER_PAGE,
        })
        setResult(data)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to search documents')
      } finally {
        setIsLoading(false)
      }
    },
    [name, q, queryBy, filterBy, sortBy],
  )

  useEffect(() => {
    let cancelled = false
    const loadCollection = async () => {
      try {
        const data = await getCollection(name)
        if (!cancelled) setCollection(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load collection')
      }
    }
    void loadCollection()
    return () => {
      cancelled = true
    }
  }, [name])

  useEffect(() => {
    setPage(1)
    void runSearch(1)
    // Only re-run automatically when the collection loads or the route changes; explicit searches go through handleSearchSubmit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, collection])

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault()
    setPage(1)
    void runSearch(1)
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    void runSearch(nextPage)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setDocText('{\n\n}')
    setDocError(null)
    setShowDocModal(true)
  }

  const openEditModal = (doc: DocumentRecord) => {
    setEditingId(String(doc.id))
    setDocText(JSON.stringify(doc, null, 2))
    setDocError(null)
    setShowDocModal(true)
  }

  const handleSaveDocument = async (event: FormEvent) => {
    event.preventDefault()
    setDocError(null)

    let parsed: DocumentRecord
    try {
      parsed = JSON.parse(docText)
    } catch {
      setDocError('Document must be valid JSON')
      return
    }

    setIsSaving(true)
    try {
      if (editingId) {
        await updateDocument(name, editingId, parsed)
      } else {
        await createDocument(name, parsed)
      }
      setShowDocModal(false)
      await runSearch(page)
    } catch (err) {
      setDocError(err instanceof ApiError ? err.message : 'Failed to save document')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteDocument(name, deleteTarget)
      setDeleteTarget(null)
      await runSearch(page)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete document')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.found / PER_PAGE)) : 1
  const columns = useMemo(() => {
    if (collection) return collection.fields.map((field) => field.name)
    const keys = new Set<string>()
    result?.hits.forEach((hit) => Object.keys(hit.document).forEach((key) => keys.add(key)))
    return Array.from(keys)
  }, [collection, result])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <Button color="light" size="xs" onClick={() => navigate('/collections')}>
            Back to collections
          </Button>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{name}</h1>
        </div>
        <Button onClick={openCreateModal}>Create document</Button>
      </div>

      {error && <Alert color="failure">{error}</Alert>}

      <form className="flex flex-wrap items-end gap-3" onSubmit={handleSearchSubmit}>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="search-q">Search</Label>
          </div>
          <TextInput id="search-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="*" />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="filter-by">Filter by</Label>
          </div>
          <TextInput
            id="filter-by"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            placeholder="field:value"
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="sort-by">Sort by</Label>
          </div>
          <TextInput id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} placeholder="field:asc" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableHeadCell key={column}>{column}</TableHeadCell>
                ))}
                <TableHeadCell>
                  <span className="sr-only">Actions</span>
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {result?.hits.map((hit) => (
                <TableRow key={String(hit.document.id)} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  {columns.map((column) => (
                    <TableCell key={column} className="max-w-xs truncate">
                      {formatValue(hit.document[column])}
                    </TableCell>
                  ))}
                  <TableCell className="flex gap-2">
                    <Button size="xs" onClick={() => openEditModal(hit.document)}>
                      Edit
                    </Button>
                    <Button size="xs" color="red" onClick={() => setDeleteTarget(String(hit.document.id))}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!result || result.hits.length === 0) && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center text-gray-500 dark:text-gray-400">
                    No documents found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {result && result.found > PER_PAGE && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </>
      )}

      <Modal show={showDocModal} onClose={() => setShowDocModal(false)}>
        <ModalHeader>{editingId ? `Edit document ${editingId}` : 'Create document'}</ModalHeader>
        <form onSubmit={handleSaveDocument}>
          <ModalBody>
            <div className="flex flex-col gap-2">
              <Label htmlFor="doc-json">Document JSON</Label>
              <Textarea
                id="doc-json"
                rows={12}
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                className="font-mono text-sm"
              />
              {docError && <Alert color="failure">{docError}</Alert>}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
            <Button color="light" type="button" onClick={() => setShowDocModal(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal show={deleteTarget !== null} onClose={() => setDeleteTarget(null)} size="md">
        <ModalHeader>Delete document</ModalHeader>
        <ModalBody>
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete document <strong>{deleteTarget}</strong>?
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
