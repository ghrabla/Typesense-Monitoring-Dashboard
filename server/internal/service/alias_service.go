package service

import (
	"context"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
	"github.com/typesense/typesense-go/v2/typesense/api"
)

type AliasService struct {
	client *ts.Client
}

func NewAliasService(client *ts.Client) *AliasService {
	return &AliasService{client: client}
}

func (s *AliasService) List(ctx context.Context) ([]model.Alias, error) {
	aliases, err := s.client.Aliases().Retrieve(ctx)
	if err != nil {
		return nil, err
	}
	result := make([]model.Alias, 0, len(aliases))
	for _, a := range aliases {
		result = append(result, toModelAlias(a))
	}
	return result, nil
}

func (s *AliasService) Get(ctx context.Context, name string) (*model.Alias, error) {
	a, err := s.client.Alias(name).Retrieve(ctx)
	if err != nil {
		return nil, err
	}
	alias := toModelAlias(a)
	return &alias, nil
}

func (s *AliasService) Upsert(ctx context.Context, name string, req *model.UpsertAliasRequest) (*model.Alias, error) {
	a, err := s.client.Aliases().Upsert(ctx, name, &api.CollectionAliasSchema{CollectionName: req.CollectionName})
	if err != nil {
		return nil, err
	}
	alias := toModelAlias(a)
	return &alias, nil
}

func (s *AliasService) Delete(ctx context.Context, name string) error {
	_, err := s.client.Alias(name).Delete(ctx)
	return err
}

func toModelAlias(a *api.CollectionAlias) model.Alias {
	alias := model.Alias{CollectionName: a.CollectionName}
	if a.Name != nil {
		alias.Name = *a.Name
	}
	return alias
}
