import { useState } from 'react'
import type { FormEvent } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { ErrorBanner } from '../../components/ui/feedback'
import { importDocuments } from '../../api/documents'
import type { DocumentRecord, ImportSummary } from '../../api/documents'
import { ApiError } from '../../api/client'

export function ImportTab({ name }: { name: string }) {
  const [text, setText] = useState('')
  const [action, setAction] = useState<'create' | 'upsert' | 'update' | 'emplace'>('upsert')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<ImportSummary | null>(null)

  const parseDocuments = (raw: string): DocumentRecord[] => {
    const trimmed = raw.trim()
    if (!trimmed) return []
    // Support both NDJSON (one doc per line) and a JSON array.
    if (trimmed.startsWith('[')) {
      return JSON.parse(trimmed) as DocumentRecord[]
    }
    return trimmed
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as DocumentRecord)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSummary(null)

    let documents: DocumentRecord[]
    try {
      documents = parseDocuments(text)
    } catch {
      setError('Documents must be valid JSON — one object per line, or a JSON array')
      return
    }
    if (documents.length === 0) {
      setError('At least one document is required')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await importDocuments(name, { documents, action })
      setSummary(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to import documents')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Import documents</CardTitle>
          <CardDescription>Paste NDJSON (one document per line) or a JSON array of documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Textarea
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'{"id": "1", "title": "Example"}\n{"id": "2", "title": "Another"}'}
              className="font-mono text-xs"
            />
            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Action</Label>
                <Select value={action} onValueChange={(value) => setAction(value as typeof action)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create">create</SelectItem>
                    <SelectItem value="upsert">upsert</SelectItem>
                    <SelectItem value="update">update</SelectItem>
                    <SelectItem value="emplace">emplace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                <Upload className="h-4 w-4" />
                {isSubmitting ? 'Importing…' : 'Import'}
              </Button>
            </div>
          </form>
          {error && <ErrorBanner className="mt-3">{error}</ErrorBanner>}
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Import results</CardTitle>
            <div className="flex gap-2">
              <Badge variant="success">{summary.num_imported} imported</Badge>
              {summary.num_failed > 0 && <Badge variant="danger">{summary.num_failed} failed</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
              {JSON.stringify(summary.results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
