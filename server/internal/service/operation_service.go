package service

import (
	"context"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
)

type OperationService struct {
	client *ts.Client
}

func NewOperationService(client *ts.Client) *OperationService {
	return &OperationService{client: client}
}

func (s *OperationService) Snapshot(ctx context.Context, snapshotPath string) (*model.OperationResult, error) {
	success, err := s.client.Operations().Snapshot(ctx, snapshotPath)
	if err != nil {
		return nil, err
	}
	return &model.OperationResult{Success: success}, nil
}

func (s *OperationService) Vote(ctx context.Context) (*model.OperationResult, error) {
	success, err := s.client.Operations().Vote(ctx)
	if err != nil {
		return nil, err
	}
	return &model.OperationResult{Success: success}, nil
}
