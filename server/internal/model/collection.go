package model

type CollectionField struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Facet    bool   `json:"facet,omitempty"`
	Optional bool   `json:"optional,omitempty"`
	Index    bool   `json:"index,omitempty"`
	Sort     bool   `json:"sort,omitempty"`
	Infix    bool   `json:"infix,omitempty"`
	Locale   string `json:"locale,omitempty"`
	NumDim   int    `json:"num_dim,omitempty"`
}

type Collection struct {
	Name                string            `json:"name"`
	NumDocuments        int64             `json:"num_documents"`
	Fields              []CollectionField `json:"fields"`
	DefaultSortingField string            `json:"default_sorting_field,omitempty"`
	CreatedAt           int64             `json:"created_at,omitempty"`
}

type CollectionSummary struct {
	Name         string `json:"name"`
	NumDocuments int64  `json:"num_documents"`
	NumFields    int    `json:"num_fields"`
}

type CreateCollectionRequest struct {
	Name                string            `json:"name"`
	Fields              []CollectionField `json:"fields"`
	DefaultSortingField string            `json:"default_sorting_field,omitempty"`
}

type UpdateCollectionRequest struct {
	Fields []CollectionField `json:"fields"`
}
