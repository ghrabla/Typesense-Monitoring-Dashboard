package service

import (
	"context"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
	"github.com/typesense/typesense-go/v2/typesense/api"
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

func (s *CollectionService) CreateCollection(ctx context.Context, req *model.CreateCollectionRequest) (*model.Collection, error) {
	fields := make([]api.Field, 0, len(req.Fields))
	for _, f := range req.Fields {
		field := api.Field{
			Name: f.Name,
			Type: f.Type,
		}
		if f.Facet {
			facet := f.Facet
			field.Facet = &facet
		}
		if f.Optional {
			optional := f.Optional
			field.Optional = &optional
		}
		if f.Index {
			index := f.Index
			field.Index = &index
		}
		fields = append(fields, field)
	}

	schema := &api.CollectionSchema{
		Name:   req.Name,
		Fields: fields,
	}
	if req.DefaultSortingField != "" {
		schema.DefaultSortingField = &req.DefaultSortingField
	}

	_, err := s.client.Collections().Create(ctx, schema)
	if err != nil {
		return nil, err
	}

	return s.GetCollection(ctx, req.Name)
}

func (s *CollectionService) DeleteCollection(ctx context.Context, name string) error {
	_, err := s.client.Collection(name).Delete(ctx)
	return err
}
