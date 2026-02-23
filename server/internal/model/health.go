package model

type HealthResponse struct {
	OK bool `json:"ok"`
}

type StatsResponse map[string]interface{}

type MetricsResponse map[string]interface{}
