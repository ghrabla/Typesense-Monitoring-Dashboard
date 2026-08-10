package model

type Synonym struct {
	ID       string   `json:"id"`
	Root     string   `json:"root,omitempty"`
	Synonyms []string `json:"synonyms"`
}

type UpsertSynonymRequest struct {
	Root     string   `json:"root,omitempty"`
	Synonyms []string `json:"synonyms"`
}
