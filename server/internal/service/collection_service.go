package service

import (
	"context"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
)

type CollectionService struct {
	client *ts.Client
}

func NewCollectionService(client *ts.Client) *CollectionService {
	return &CollectionService{client: client}
}

func (s *CollectionService) ListCollections(ctx context.Context) ([]model.CollectionSummary, error) {
	collections, err := s.client.Collections().Retrieve(ctx)
	if err != nil {
		return nil, err
	}

	summaries := make([]model.CollectionSummary, 0, len(collections))
	for _, c := range collections {
		summary := model.CollectionSummary{
			Name:         c.Name,
			NumDocuments: *c.NumDocuments,
			NumFields:    len(c.Fields),
		}
		summaries = append(summaries, summary)
	}
	return summaries, nil
}

func (s *CollectionService) GetCollection(ctx context.Context, name string) (*model.Collection, error) {
	c, err := s.client.Collection(name).Retrieve(ctx)
	if err != nil {
		return nil, err
	}

	fields := make([]model.CollectionField, 0, len(c.Fields))
	for _, f := range c.Fields {
		field := model.CollectionField{
			Name: f.Name,
			Type: f.Type,
		}
		if f.Facet != nil {
			field.Facet = *f.Facet
		}
		if f.Optional != nil {
			field.Optional = *f.Optional
		}
		if f.Index != nil {
			field.Index = *f.Index
		}
		fields = append(fields, field)
	}

	collection := &model.Collection{
		Name:         c.Name,
		NumDocuments: *c.NumDocuments,
		Fields:       fields,
	}
	if c.DefaultSortingField != nil {
		collection.DefaultSortingField = *c.DefaultSortingField
	}
	if c.CreatedAt != nil {
		collection.CreatedAt = *c.CreatedAt
	}

	return collection, nil
}
