package model

type Key struct {
	ID          int64    `json:"id"`
	Actions     []string `json:"actions"`
	Collections []string `json:"collections"`
	Description string   `json:"description"`
	ExpiresAt   int64    `json:"expires_at,omitempty"`
	Value       string   `json:"value,omitempty"`
	ValuePrefix string   `json:"value_prefix,omitempty"`
}

type CreateKeyRequest struct {
	Actions     []string `json:"actions"`
	Collections []string `json:"collections"`
	Description string   `json:"description"`
	ExpiresAt   *int64   `json:"expires_at,omitempty"`
}
