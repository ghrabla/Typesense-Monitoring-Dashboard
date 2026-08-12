import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Spinner, ErrorBanner } from '../../components/ui/feedback'
import type { Collection } from '../../api/collections'
import { createDocument, deleteDocument, searchDocuments, updateDocument } from '../../api/documents'
import type { DocumentRecord, SearchResponse } from '../../api/documents'
import { ApiError } from '../../api/client'

const PER_PAGE = 10

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function DocumentsTab({ name, collection }: { name: string; collection: Collection | null }) {
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
    setPage(1)
    void runSearch(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, collection])

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault()
    setPage(1)
    void runSearch(1)
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
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleSearchSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="search-q">Search</Label>
            <Input id="search-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="*" className="w-40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-by">Filter by</Label>
            <Input
              id="filter-by"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              placeholder="field:value"
              className="w-44"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sort-by">Sort by</Label>
            <Input
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              placeholder="field:asc"
              className="w-36"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Create document
        </Button>
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result?.hits.map((hit) => (
                <TableRow key={String(hit.document.id)}>
                  {columns.map((column) => (
                    <TableCell key={column} className="max-w-xs truncate">
                      {formatValue(hit.document[column])}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(hit.document)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => setDeleteTarget(String(hit.document.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!result || result.hits.length === 0) && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="py-10 text-center text-slate-400">
                    No documents found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {result && result.found > PER_PAGE && (
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Page {page} of {totalPages} · {result.found.toLocaleString()} documents
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => {
                    const next = page - 1
                    setPage(next)
                    void runSearch(next)
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => {
                    const next = page + 1
                    setPage(next)
                    void runSearch(next)
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={showDocModal} onOpenChange={setShowDocModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? `Edit document ${editingId}` : 'Create document'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveDocument} className="flex flex-col gap-3">
            <Label htmlFor="doc-json">Document JSON</Label>
            <Textarea
              id="doc-json"
              rows={12}
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              className="font-mono text-xs"
            />
            {docError && <ErrorBanner>{docError}</ErrorBanner>}
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowDocModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete document</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete document <strong>{deleteTarget}</strong>?
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
