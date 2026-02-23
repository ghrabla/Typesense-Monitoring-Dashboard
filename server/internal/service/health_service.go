package service

import (
	"context"
	"time"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
)

type HealthService struct {
	client *ts.Client
}

func NewHealthService(client *ts.Client) *HealthService {
	return &HealthService{client: client}
}

func (s *HealthService) CheckHealth(ctx context.Context) (*model.HealthResponse, error) {
	ok, err := s.client.Health(ctx, 5*time.Second)
	if err != nil {
		return &model.HealthResponse{OK: false}, err
	}
	return &model.HealthResponse{OK: ok}, nil
}

func (s *HealthService) GetStats(ctx context.Context) (model.StatsResponse, error) {
	return s.client.GetStats(ctx)
}

func (s *HealthService) GetMetrics(ctx context.Context) (model.MetricsResponse, error) {
	return s.client.GetMetrics(ctx)
}
