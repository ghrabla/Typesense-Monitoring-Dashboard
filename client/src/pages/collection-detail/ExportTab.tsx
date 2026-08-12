import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { ErrorBanner } from '../../components/ui/feedback'
import { exportDocuments } from '../../api/documents'
import { ApiError } from '../../api/client'

export function ExportTab({ name }: { name: string }) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)
    try {
      const blob = await exportDocuments(name)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${name}.jsonl`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to export documents')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export documents</CardTitle>
        <CardDescription>Download every document in this collection as an NDJSON (.jsonl) file.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={() => void handleExport()} disabled={isExporting} className="self-start">
          <Download className="h-4 w-4" />
          {isExporting ? 'Preparing export…' : 'Download export'}
        </Button>
        {error && <ErrorBanner>{error}</ErrorBanner>}
      </CardContent>
    </Card>
  )
}
