import { Database, Eye, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import type { CollectionSummary } from '../api/collections'

interface CollectionTableProps {
  collections: CollectionSummary[]
  onOpen: (name: string) => void
  onDelete?: (name: string) => void
  emptyLabel?: string
}

export function CollectionTable({ collections, onOpen, onDelete, emptyLabel }: CollectionTableProps) {
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-16 text-center">
        <Database className="h-6 w-6 text-slate-300" />
        <p className="text-sm text-slate-500">{emptyLabel ?? 'No collections yet.'}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Documents</TableHead>
          <TableHead>Fields</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collections.map((collection) => (
          <TableRow key={collection.name}>
            <TableCell>
              <button
                onClick={() => onOpen(collection.name)}
                className="flex items-center gap-2 font-medium text-slate-900 hover:underline"
              >
                <Database className="h-3.5 w-3.5 text-slate-400" />
                {collection.name}
              </button>
            </TableCell>
            <TableCell>
              <Badge variant="info">{collection.num_documents.toLocaleString()}</Badge>
            </TableCell>
            <TableCell className="text-slate-500">{collection.num_fields}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => onOpen(collection.name)} title="Open">
                  <Eye className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => onDelete(collection.name)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
