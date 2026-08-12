import { useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { ErrorBanner } from '../../components/ui/feedback'
import { updateCollection } from '../../api/collections'
import type { Collection } from '../../api/collections'
import { ApiError } from '../../api/client'

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

export function SchemaTab({
  collection,
  onCollectionUpdated,
}: {
  collection: Collection | null
  onCollectionUpdated: () => void
}) {
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('string')
  const [newFacet, setNewFacet] = useState(false)
  const [newOptional, setNewOptional] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!collection) return null

  const handleAddField = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!newName.trim()) {
      setError('Field name is required')
      return
    }
    setIsSubmitting(true)
    try {
      await updateCollection(collection.name, {
        fields: [{ name: newName.trim(), type: newType, facet: newFacet || undefined, optional: newOptional || undefined }],
      })
      setNewName('')
      setNewType('string')
      setNewFacet(false)
      setNewOptional(false)
      onCollectionUpdated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add field')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Schema overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-slate-500">
            <span>
              Documents: <strong className="text-slate-900">{collection.num_documents.toLocaleString()}</strong>
            </span>
            {collection.default_sorting_field && (
              <span>
                Default sort: <strong className="text-slate-900">{collection.default_sorting_field}</strong>
              </span>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Facet</TableHead>
                <TableHead>Optional</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead>Index</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collection.fields.map((field) => (
                <TableRow key={field.name}>
                  <TableCell className="font-medium text-slate-900">{field.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{field.type}</Badge>
                  </TableCell>
                  <TableCell>{field.facet ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{field.optional ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{field.sort ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{field.index === false ? 'No' : 'Yes'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a field</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddField} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-field-name">Name</Label>
              <Input id="new-field-name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select value={newType} onValueChange={setNewType}>
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
            </div>
            <label className="flex items-center gap-1.5 pb-2 text-xs text-slate-600">
              <Checkbox checked={newFacet} onCheckedChange={(checked) => setNewFacet(checked === true)} />
              Facet
            </label>
            <label className="flex items-center gap-1.5 pb-2 text-xs text-slate-600">
              <Checkbox checked={newOptional} onCheckedChange={(checked) => setNewOptional(checked === true)} />
              Optional
            </label>
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="h-4 w-4" />
              {isSubmitting ? 'Adding…' : 'Add field'}
            </Button>
          </form>
          {error && <ErrorBanner className="mt-3">{error}</ErrorBanner>}
        </CardContent>
      </Card>
    </div>
  )
}
