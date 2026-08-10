package model

type SearchParams struct {
	Q               string
	QueryBy         string
	FilterBy        string
	SortBy          string
	FacetBy         string
	GroupBy         string
	GroupLimit      int
	Page            int
	PerPage         int
	Limit           int
	Offset          int
	Prefix          string
	NumTypos        string
	IncludeFields   string
	ExcludeFields   string
	HighlightFields string
	UseCache        bool
}

type SearchHit struct {
	Document  map[string]interface{} `json:"document"`
	Highlight map[string]interface{} `json:"highlight,omitempty"`
}

type SearchResponse struct {
	Found        int                      `json:"found"`
	OutOf        int                      `json:"out_of"`
	Page         int                      `json:"page,omitempty"`
	SearchTimeMs int                      `json:"search_time_ms"`
	Hits         []SearchHit              `json:"hits"`
	FacetCounts  []map[string]interface{} `json:"facet_counts,omitempty"`
}

type ImportRequest struct {
	Documents []map[string]interface{} `json:"documents"`
	Action    string                   `json:"action,omitempty"`
	BatchSize int                      `json:"batch_size,omitempty"`
}

type ImportResult struct {
	Success  bool   `json:"success"`
	Error    string `json:"error,omitempty"`
	Document string `json:"document,omitempty"`
}

type ImportSummary struct {
	NumImported int            `json:"num_imported"`
	NumFailed   int            `json:"num_failed"`
	Results     []ImportResult `json:"results"`
}

type BulkDeleteResult struct {
	NumDeleted int `json:"num_deleted"`
}

type BulkUpdateResult struct {
	NumUpdated int `json:"num_updated"`
}
