package model

type OverrideInclude struct {
	ID       string `json:"id"`
	Position int    `json:"position"`
}

type OverrideExclude struct {
	ID string `json:"id"`
}

type OverrideRule struct {
	Query string   `json:"query"`
	Match string   `json:"match"`
	Tags  []string `json:"tags,omitempty"`
}

type Override struct {
	ID                  string            `json:"id"`
	Rule                OverrideRule      `json:"rule"`
	Includes            []OverrideInclude `json:"includes,omitempty"`
	Excludes            []OverrideExclude `json:"excludes,omitempty"`
	FilterBy            string            `json:"filter_by,omitempty"`
	RemoveMatchedTokens bool              `json:"remove_matched_tokens,omitempty"`
}

type UpsertOverrideRequest struct {
	Rule                OverrideRule      `json:"rule"`
	Includes            []OverrideInclude `json:"includes,omitempty"`
	Excludes            []OverrideExclude `json:"excludes,omitempty"`
	FilterBy            string            `json:"filter_by,omitempty"`
	RemoveMatchedTokens bool              `json:"remove_matched_tokens,omitempty"`
}
