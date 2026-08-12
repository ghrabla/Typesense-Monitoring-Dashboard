import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Topbar } from '../components/Topbar'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Spinner, ErrorBanner } from '../components/ui/feedback'
import { getCollection } from '../api/collections'
import type { Collection } from '../api/collections'
import { ApiError } from '../api/client'
import { SchemaTab } from './collection-detail/SchemaTab'
import { DocumentsTab } from './collection-detail/DocumentsTab'
import { SearchTab } from './collection-detail/SearchTab'
import { ImportTab } from './collection-detail/ImportTab'
import { ExportTab } from './collection-detail/ExportTab'

export function CollectionDetailPage() {
  const { name = '' } = useParams<{ name: string }>()
  const navigate = useNavigate()

  const [collection, setCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCollection = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setCollection(await getCollection(name))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load collection')
    } finally {
      setIsLoading(false)
    }
  }, [name])

  useEffect(() => {
    void loadCollection()
  }, [loadCollection])

  return (
    <div className="flex flex-col">
      <Topbar
        title={name}
        description="Schema, documents, search, import & export"
        actions={
          <Button variant="outline" onClick={() => navigate('/collections')}>
            <ArrowLeft className="h-4 w-4" />
            Back
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
          <Tabs defaultValue="documents">
            <TabsList>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            <TabsContent value="schema">
              <SchemaTab collection={collection} onCollectionUpdated={() => void loadCollection()} />
            </TabsContent>
            <TabsContent value="documents">
              <DocumentsTab name={name} collection={collection} />
            </TabsContent>
            <TabsContent value="search">
              <SearchTab name={name} />
            </TabsContent>
            <TabsContent value="import">
              <ImportTab name={name} />
            </TabsContent>
            <TabsContent value="export">
              <ExportTab name={name} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
