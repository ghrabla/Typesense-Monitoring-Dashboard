import { useState } from 'react'
import type { FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Spinner, ErrorBanner } from '../../components/ui/feedback'
import { searchDocuments } from '../../api/documents'
import type { SearchResponse } from '../../api/documents'
import { ApiError } from '../../api/client'

export function SearchTab({ name }: { name: string }) {
  const [q, setQ] = useState('*')
  const [queryBy, setQueryBy] = useState('')
  const [filterBy, setFilterBy] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const data = await searchDocuments(name, {
        q: q.trim() || '*',
        queryBy: queryBy.trim() || undefined,
        filterBy: filterBy.trim() || undefined,
        sortBy: sortBy.trim() || undefined,
        page: 1,
        perPage: 20,
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Document search playground</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="playground-q">Query</Label>
              <Input id="playground-q" value={q} onChange={(e) => setQ(e.target.value)} className="w-48" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="playground-query-by">Query by</Label>
              <Input
                id="playground-query-by"
                value={queryBy}
                onChange={(e) => setQueryBy(e.target.value)}
                placeholder="title,description"
                className="w-56"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="playground-filter-by">Filter by</Label>
              <Input
                id="playground-filter-by"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-48"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="playground-sort-by">Sort by</Label>
              <Input
                id="playground-sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-40"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              <Search className="h-4 w-4" />
              {isLoading ? 'Searching…' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        result && (
          <Card>
            <CardHeader>
              <CardTitle>
                {result.found.toLocaleString()} results in {result.search_time_ms}ms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[28rem] overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}
