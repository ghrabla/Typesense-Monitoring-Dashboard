package service

import (
	"context"
	"encoding/json"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
	"github.com/typesense/typesense-go/v2/typesense/api"
)

type PresetService struct {
	client *ts.Client
}

func NewPresetService(client *ts.Client) *PresetService {
	return &PresetService{client: client}
}

func (s *PresetService) List(ctx context.Context) ([]model.Preset, error) {
	presets, err := s.client.Presets().Retrieve(ctx)
	if err != nil {
		return nil, err
	}
	result := make([]model.Preset, 0, len(presets))
	for _, p := range presets {
		preset, err := toModelPreset(p)
		if err != nil {
			return nil, err
		}
		result = append(result, preset)
	}
	return result, nil
}

func (s *PresetService) Get(ctx context.Context, name string) (*model.Preset, error) {
	p, err := s.client.Preset(name).Retrieve(ctx)
	if err != nil {
		return nil, err
	}
	preset, err := toModelPreset(p)
	if err != nil {
		return nil, err
	}
	return &preset, nil
}

func (s *PresetService) Upsert(ctx context.Context, name string, req *model.UpsertPresetRequest) (*model.Preset, error) {
	valueBytes, err := json.Marshal(req.Value)
	if err != nil {
		return nil, err
	}

	var upsertValue api.PresetUpsertSchema_Value
	if err := upsertValue.UnmarshalJSON(valueBytes); err != nil {
		return nil, err
	}

	p, err := s.client.Presets().Upsert(ctx, name, &api.PresetUpsertSchema{Value: upsertValue})
	if err != nil {
		return nil, err
	}
	preset, err := toModelPreset(p)
	if err != nil {
		return nil, err
	}
	return &preset, nil
}

func (s *PresetService) Delete(ctx context.Context, name string) error {
	_, err := s.client.Preset(name).Delete(ctx)
	return err
}

func toModelPreset(p *api.PresetSchema) (model.Preset, error) {
	valueBytes, err := p.Value.MarshalJSON()
	if err != nil {
		return model.Preset{}, err
	}
	var value interface{}
	if err := json.Unmarshal(valueBytes, &value); err != nil {
		return model.Preset{}, err
	}
	return model.Preset{Name: p.Name, Value: value}, nil
}
