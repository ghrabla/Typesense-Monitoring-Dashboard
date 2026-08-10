package service

import (
	"context"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
	"github.com/typesense/typesense-go/v2/typesense/api"
)

type OverrideService struct {
	client *ts.Client
}

func NewOverrideService(client *ts.Client) *OverrideService {
	return &OverrideService{client: client}
}

func (s *OverrideService) List(ctx context.Context, collection string) ([]model.Override, error) {
	overrides, err := s.client.Collection(collection).Overrides().Retrieve(ctx)
	if err != nil {
		return nil, err
	}
	result := make([]model.Override, 0, len(overrides))
	for _, o := range overrides {
		result = append(result, toModelOverride(o))
	}
	return result, nil
}

func (s *OverrideService) Get(ctx context.Context, collection, id string) (*model.Override, error) {
	o, err := s.client.Collection(collection).Override(id).Retrieve(ctx)
	if err != nil {
		return nil, err
	}
	override := toModelOverride(o)
	return &override, nil
}

func (s *OverrideService) Upsert(ctx context.Context, collection, id string, req *model.UpsertOverrideRequest) (*model.Override, error) {
	schema := &api.SearchOverrideSchema{
		Rule: api.SearchOverrideRule{
			Query: req.Rule.Query,
			Match: api.SearchOverrideRuleMatch(req.Rule.Match),
		},
		FilterBy:            &req.FilterBy,
		RemoveMatchedTokens: &req.RemoveMatchedTokens,
	}
	if len(req.Rule.Tags) > 0 {
		schema.Rule.Tags = &req.Rule.Tags
	}
	if len(req.Includes) > 0 {
		includes := make([]api.SearchOverrideInclude, 0, len(req.Includes))
		for _, i := range req.Includes {
			includes = append(includes, api.SearchOverrideInclude{Id: i.ID, Position: i.Position})
		}
		schema.Includes = &includes
	}
	if len(req.Excludes) > 0 {
		excludes := make([]api.SearchOverrideExclude, 0, len(req.Excludes))
		for _, e := range req.Excludes {
			excludes = append(excludes, api.SearchOverrideExclude{Id: e.ID})
		}
		schema.Excludes = &excludes
	}

	o, err := s.client.Collection(collection).Overrides().Upsert(ctx, id, schema)
	if err != nil {
		return nil, err
	}
	override := toModelOverride(o)
	return &override, nil
}

func (s *OverrideService) Delete(ctx context.Context, collection, id string) error {
	_, err := s.client.Collection(collection).Override(id).Delete(ctx)
	return err
}

func toModelOverride(o *api.SearchOverride) model.Override {
	override := model.Override{
		Rule: model.OverrideRule{
			Query: o.Rule.Query,
			Match: string(o.Rule.Match),
		},
	}
	if o.Id != nil {
		override.ID = *o.Id
	}
	if o.Rule.Tags != nil {
		override.Rule.Tags = *o.Rule.Tags
	}
	if o.FilterBy != nil {
		override.FilterBy = *o.FilterBy
	}
	if o.RemoveMatchedTokens != nil {
		override.RemoveMatchedTokens = *o.RemoveMatchedTokens
	}
	if o.Includes != nil {
		includes := make([]model.OverrideInclude, 0, len(*o.Includes))
		for _, i := range *o.Includes {
			includes = append(includes, model.OverrideInclude{ID: i.Id, Position: i.Position})
		}
		override.Includes = includes
	}
	if o.Excludes != nil {
		excludes := make([]model.OverrideExclude, 0, len(*o.Excludes))
		for _, e := range *o.Excludes {
			excludes = append(excludes, model.OverrideExclude{ID: e.Id})
		}
		override.Excludes = excludes
	}
	return override
}
