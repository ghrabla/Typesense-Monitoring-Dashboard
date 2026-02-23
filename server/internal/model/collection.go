package model

type CollectionField struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Facet    bool   `json:"facet,omitempty"`
	Optional bool   `json:"optional,omitempty"`
	Index    bool   `json:"index,omitempty"`
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
