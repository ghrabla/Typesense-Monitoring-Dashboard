package service

import (
	"context"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
	"github.com/typesense/typesense-go/v2/typesense/api"
)

type KeyService struct {
	client *ts.Client
}

func NewKeyService(client *ts.Client) *KeyService {
	return &KeyService{client: client}
}

func (s *KeyService) List(ctx context.Context) ([]model.Key, error) {
	keys, err := s.client.Keys().Retrieve(ctx)
	if err != nil {
		return nil, err
	}
	result := make([]model.Key, 0, len(keys))
	for _, k := range keys {
		result = append(result, toModelKey(k))
	}
	return result, nil
}

func (s *KeyService) Get(ctx context.Context, id int64) (*model.Key, error) {
	k, err := s.client.Key(id).Retrieve(ctx)
	if err != nil {
		return nil, err
	}
	key := toModelKey(k)
	return &key, nil
}

func (s *KeyService) Create(ctx context.Context, req *model.CreateKeyRequest) (*model.Key, error) {
	schema := &api.ApiKeySchema{
		Actions:     req.Actions,
		Collections: req.Collections,
		Description: req.Description,
		ExpiresAt:   req.ExpiresAt,
	}
	k, err := s.client.Keys().Create(ctx, schema)
	if err != nil {
		return nil, err
	}
	key := toModelKey(k)
	return &key, nil
}

func (s *KeyService) Delete(ctx context.Context, id int64) error {
	_, err := s.client.Key(id).Delete(ctx)
	return err
}

func toModelKey(k *api.ApiKey) model.Key {
	key := model.Key{
		Actions:     k.Actions,
		Collections: k.Collections,
		Description: k.Description,
	}
	if k.Id != nil {
		key.ID = *k.Id
	}
	if k.ExpiresAt != nil {
		key.ExpiresAt = *k.ExpiresAt
	}
	if k.Value != nil {
		key.Value = *k.Value
	}
	if k.ValuePrefix != nil {
		key.ValuePrefix = *k.ValuePrefix
	}
	return key
}
