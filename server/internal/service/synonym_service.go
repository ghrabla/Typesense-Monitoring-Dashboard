package service

import (
	"context"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
	"github.com/typesense/typesense-go/v2/typesense/api"
)

type SynonymService struct {
	client *ts.Client
}

func NewSynonymService(client *ts.Client) *SynonymService {
	return &SynonymService{client: client}
}

func (s *SynonymService) List(ctx context.Context, collection string) ([]model.Synonym, error) {
	synonyms, err := s.client.Collection(collection).Synonyms().Retrieve(ctx)
	if err != nil {
		return nil, err
	}
	result := make([]model.Synonym, 0, len(synonyms))
	for _, syn := range synonyms {
		result = append(result, toModelSynonym(syn))
	}
	return result, nil
}

func (s *SynonymService) Get(ctx context.Context, collection, id string) (*model.Synonym, error) {
	syn, err := s.client.Collection(collection).Synonym(id).Retrieve(ctx)
	if err != nil {
		return nil, err
	}
	synonym := toModelSynonym(syn)
	return &synonym, nil
}

func (s *SynonymService) Upsert(ctx context.Context, collection, id string, req *model.UpsertSynonymRequest) (*model.Synonym, error) {
	schema := &api.SearchSynonymSchema{Synonyms: req.Synonyms}
	if req.Root != "" {
		schema.Root = &req.Root
	}

	syn, err := s.client.Collection(collection).Synonyms().Upsert(ctx, id, schema)
	if err != nil {
		return nil, err
	}
	synonym := toModelSynonym(syn)
	return &synonym, nil
}

func (s *SynonymService) Delete(ctx context.Context, collection, id string) error {
	_, err := s.client.Collection(collection).Synonym(id).Delete(ctx)
	return err
}

func toModelSynonym(syn *api.SearchSynonym) model.Synonym {
	synonym := model.Synonym{Synonyms: syn.Synonyms}
	if syn.Id != nil {
		synonym.ID = *syn.Id
	}
	if syn.Root != nil {
		synonym.Root = *syn.Root
	}
	return synonym
}
