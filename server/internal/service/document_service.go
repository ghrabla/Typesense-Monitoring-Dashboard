package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
	"github.com/typesense/typesense-go/v2/typesense/api"
	"github.com/typesense/typesense-go/v2/typesense/api/pointer"
)

type DocumentService struct {
	client *ts.Client
}

func NewDocumentService(client *ts.Client) *DocumentService {
	return &DocumentService{client: client}
}

func (s *DocumentService) Search(ctx context.Context, collection string, p *model.SearchParams) (*model.SearchResponse, error) {
	params := &api.SearchCollectionParams{Q: pointer.String(p.Q)}
	if p.QueryBy != "" {
		params.QueryBy = pointer.String(p.QueryBy)
	}
	if p.FilterBy != "" {
		params.FilterBy = pointer.String(p.FilterBy)
	}
	if p.SortBy != "" {
		params.SortBy = pointer.String(p.SortBy)
	}
	if p.FacetBy != "" {
		params.FacetBy = pointer.String(p.FacetBy)
	}
	if p.GroupBy != "" {
		params.GroupBy = pointer.String(p.GroupBy)
	}
	if p.GroupLimit > 0 {
		params.GroupLimit = pointer.Int(p.GroupLimit)
	}
	if p.Page > 0 {
		params.Page = pointer.Int(p.Page)
	}
	if p.PerPage > 0 {
		params.PerPage = pointer.Int(p.PerPage)
	}
	if p.Limit > 0 {
		params.Limit = pointer.Int(p.Limit)
	}
	if p.Offset > 0 {
		params.Offset = pointer.Int(p.Offset)
	}
	if p.Prefix != "" {
		params.Prefix = pointer.String(p.Prefix)
	}
	if p.NumTypos != "" {
		params.NumTypos = pointer.String(p.NumTypos)
	}
	if p.IncludeFields != "" {
		params.IncludeFields = pointer.String(p.IncludeFields)
	}
	if p.ExcludeFields != "" {
		params.ExcludeFields = pointer.String(p.ExcludeFields)
	}
	if p.HighlightFields != "" {
		params.HighlightFields = pointer.String(p.HighlightFields)
	}
	if p.UseCache {
		params.UseCache = pointer.True()
	}

	result, err := s.client.Collection(collection).Documents().Search(ctx, params)
	if err != nil {
		return nil, err
	}

	return toSearchResponse(result), nil
}

func toSearchResponse(r *api.SearchResult) *model.SearchResponse {
	resp := &model.SearchResponse{}
	if r.Found != nil {
		resp.Found = *r.Found
	}
	if r.OutOf != nil {
		resp.OutOf = *r.OutOf
	}
	if r.Page != nil {
		resp.Page = *r.Page
	}
	if r.SearchTimeMs != nil {
		resp.SearchTimeMs = *r.SearchTimeMs
	}
	if r.Hits != nil {
		hits := make([]model.SearchHit, 0, len(*r.Hits))
		for _, h := range *r.Hits {
			hit := model.SearchHit{}
			if h.Document != nil {
				hit.Document = *h.Document
			}
			if h.Highlight != nil {
				hit.Highlight = *h.Highlight
			}
			hits = append(hits, hit)
		}
		resp.Hits = hits
	}
	if r.FacetCounts != nil {
		facets := make([]map[string]interface{}, 0, len(*r.FacetCounts))
		for _, f := range *r.FacetCounts {
			raw, err := json.Marshal(f)
			if err != nil {
				continue
			}
			var m map[string]interface{}
			if err := json.Unmarshal(raw, &m); err == nil {
				facets = append(facets, m)
			}
		}
		resp.FacetCounts = facets
	}
	return resp
}

func (s *DocumentService) Get(ctx context.Context, collection, id string) (map[string]interface{}, error) {
	return s.client.Collection(collection).Document(id).Retrieve(ctx)
}

func (s *DocumentService) Create(ctx context.Context, collection string, doc map[string]interface{}) (map[string]interface{}, error) {
	return s.client.Collection(collection).Documents().Create(ctx, doc)
}

func (s *DocumentService) Upsert(ctx context.Context, collection string, doc map[string]interface{}) (map[string]interface{}, error) {
	return s.client.Collection(collection).Documents().Upsert(ctx, doc)
}

func (s *DocumentService) Update(ctx context.Context, collection, id string, fields map[string]interface{}) (map[string]interface{}, error) {
	return s.client.Collection(collection).Document(id).Update(ctx, fields)
}

func (s *DocumentService) Delete(ctx context.Context, collection, id string) (map[string]interface{}, error) {
	return s.client.Collection(collection).Document(id).Delete(ctx)
}

func (s *DocumentService) BulkUpdate(ctx context.Context, collection, filterBy string, fields map[string]interface{}) (*model.BulkUpdateResult, error) {
	if filterBy == "" {
		return nil, fmt.Errorf("filter_by is required for bulk updates")
	}
	numUpdated, err := s.client.Collection(collection).Documents().Update(ctx, fields, &api.UpdateDocumentsParams{FilterBy: &filterBy})
	if err != nil {
		return nil, err
	}
	return &model.BulkUpdateResult{NumUpdated: numUpdated}, nil
}

func (s *DocumentService) BulkDelete(ctx context.Context, collection, filterBy string) (*model.BulkDeleteResult, error) {
	if filterBy == "" {
		return nil, fmt.Errorf("filter_by is required for bulk deletes")
	}
	numDeleted, err := s.client.Collection(collection).Documents().Delete(ctx, &api.DeleteDocumentsParams{FilterBy: &filterBy})
	if err != nil {
		return nil, err
	}
	return &model.BulkDeleteResult{NumDeleted: numDeleted}, nil
}

func (s *DocumentService) Import(ctx context.Context, collection string, req *model.ImportRequest) (*model.ImportSummary, error) {
	if len(req.Documents) == 0 {
		return nil, fmt.Errorf("at least one document is required")
	}

	action := req.Action
	if action == "" {
		action = "create"
	}
	batchSize := req.BatchSize
	if batchSize <= 0 {
		batchSize = 40
	}

	docs := make([]interface{}, 0, len(req.Documents))
	for _, d := range req.Documents {
		docs = append(docs, d)
	}

	results, err := s.client.Collection(collection).Documents().Import(ctx, docs, &api.ImportDocumentsParams{
		Action:    &action,
		BatchSize: &batchSize,
	})
	if err != nil {
		return nil, err
	}

	summary := &model.ImportSummary{Results: make([]model.ImportResult, 0, len(results))}
	for _, r := range results {
		if r == nil {
			continue
		}
		if r.Success {
			summary.NumImported++
		} else {
			summary.NumFailed++
		}
		summary.Results = append(summary.Results, model.ImportResult{
			Success:  r.Success,
			Error:    r.Error,
			Document: r.Document,
		})
	}
	return summary, nil
}

func (s *DocumentService) Export(ctx context.Context, collection string) (io.ReadCloser, error) {
	return s.client.Collection(collection).Documents().Export(ctx)
}
