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
		fields = append(fields, toModelField(f))
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
		fields = append(fields, toAPIField(f))
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

func (s *CollectionService) UpdateCollection(ctx context.Context, name string, req *model.UpdateCollectionRequest) (*model.Collection, error) {
	fields := make([]api.Field, 0, len(req.Fields))
	for _, f := range req.Fields {
		fields = append(fields, toAPIField(f))
	}

	_, err := s.client.Collection(name).Update(ctx, &api.CollectionUpdateSchema{Fields: fields})
	if err != nil {
		return nil, err
	}

	return s.GetCollection(ctx, name)
}

func (s *CollectionService) DeleteCollection(ctx context.Context, name string) error {
	_, err := s.client.Collection(name).Delete(ctx)
	return err
}

func toModelField(f api.Field) model.CollectionField {
	field := model.CollectionField{Name: f.Name, Type: f.Type}
	if f.Facet != nil {
		field.Facet = *f.Facet
	}
	if f.Optional != nil {
		field.Optional = *f.Optional
	}
	if f.Index != nil {
		field.Index = *f.Index
	}
	if f.Sort != nil {
		field.Sort = *f.Sort
	}
	if f.Infix != nil {
		field.Infix = *f.Infix
	}
	if f.Locale != nil {
		field.Locale = *f.Locale
	}
	if f.NumDim != nil {
		field.NumDim = *f.NumDim
	}
	return field
}

func toAPIField(f model.CollectionField) api.Field {
	field := api.Field{Name: f.Name, Type: f.Type}
	if f.Facet {
		field.Facet = &f.Facet
	}
	if f.Optional {
		field.Optional = &f.Optional
	}
	if f.Index {
		field.Index = &f.Index
	}
	if f.Sort {
		field.Sort = &f.Sort
	}
	if f.Infix {
		field.Infix = &f.Infix
	}
	if f.Locale != "" {
		field.Locale = &f.Locale
	}
	if f.NumDim != 0 {
		field.NumDim = &f.NumDim
	}
	return field
}
