package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/service"
)

type DocumentHandler struct {
	svc *service.DocumentService
}

func NewDocumentHandler(svc *service.DocumentService) *DocumentHandler {
	return &DocumentHandler{svc: svc}
}

func (h *DocumentHandler) Search(w http.ResponseWriter, r *http.Request) {
	collection := r.PathValue("name")
	if collection == "" {
		writeError(w, http.StatusBadRequest, "collection name is required")
		return
	}

	q := r.URL.Query()
	params := &model.SearchParams{
		Q:               q.Get("q"),
		QueryBy:         q.Get("query_by"),
		FilterBy:        q.Get("filter_by"),
		SortBy:          q.Get("sort_by"),
		FacetBy:         q.Get("facet_by"),
		GroupBy:         q.Get("group_by"),
		Prefix:          q.Get("prefix"),
		NumTypos:        q.Get("num_typos"),
		IncludeFields:   q.Get("include_fields"),
		ExcludeFields:   q.Get("exclude_fields"),
		HighlightFields: q.Get("highlight_fields"),
		UseCache:        q.Get("use_cache") == "true",
	}
	if params.Q == "" {
		params.Q = "*"
	}
	if params.QueryBy == "" && params.Q != "*" {
		writeError(w, http.StatusBadRequest, "query_by is required when q is set")
		return
	}

	var err error
	if params.GroupLimit, err = intQueryParam(q, "group_limit"); err != nil {
		writeError(w, http.StatusBadRequest, "invalid group_limit: "+err.Error())
		return
	}
	if params.Page, err = intQueryParam(q, "page"); err != nil {
		writeError(w, http.StatusBadRequest, "invalid page: "+err.Error())
		return
	}
	if params.PerPage, err = intQueryParam(q, "per_page"); err != nil {
		writeError(w, http.StatusBadRequest, "invalid per_page: "+err.Error())
		return
	}
	if params.Limit, err = intQueryParam(q, "limit"); err != nil {
		writeError(w, http.StatusBadRequest, "invalid limit: "+err.Error())
		return
	}
	if params.Offset, err = intQueryParam(q, "offset"); err != nil {
		writeError(w, http.StatusBadRequest, "invalid offset: "+err.Error())
		return
	}

	result, err := h.svc.Search(r.Context(), collection, params)
	if err != nil {
		writeUpstreamError(w, r, "failed to search documents", err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *DocumentHandler) Get(w http.ResponseWriter, r *http.Request) {
	collection, id := r.PathValue("name"), r.PathValue("id")
	if collection == "" || id == "" {
		writeError(w, http.StatusBadRequest, "collection name and document id are required")
		return
	}

	doc, err := h.svc.Get(r.Context(), collection, id)
	if err != nil {
		writeUpstreamError(w, r, "failed to retrieve document", err)
		return
	}
	writeJSON(w, http.StatusOK, doc)
}

func (h *DocumentHandler) Create(w http.ResponseWriter, r *http.Request) {
	collection := r.PathValue("name")
	if collection == "" {
		writeError(w, http.StatusBadRequest, "collection name is required")
		return
	}

	doc, ok := decodeDocumentBody(w, r)
	if !ok {
		return
	}

	upsert := r.URL.Query().Get("upsert") == "true"
	var (
		result map[string]interface{}
		err    error
	)
	if upsert {
		result, err = h.svc.Upsert(r.Context(), collection, doc)
	} else {
		result, err = h.svc.Create(r.Context(), collection, doc)
	}
	if err != nil {
		writeUpstreamError(w, r, "failed to create document", err)
		return
	}
	writeJSON(w, http.StatusCreated, result)
}

func (h *DocumentHandler) Update(w http.ResponseWriter, r *http.Request) {
	collection, id := r.PathValue("name"), r.PathValue("id")
	if collection == "" || id == "" {
		writeError(w, http.StatusBadRequest, "collection name and document id are required")
		return
	}

	fields, ok := decodeDocumentBody(w, r)
	if !ok {
		return
	}

	doc, err := h.svc.Update(r.Context(), collection, id, fields)
	if err != nil {
		writeUpstreamError(w, r, "failed to update document", err)
		return
	}
	writeJSON(w, http.StatusOK, doc)
}

func (h *DocumentHandler) Delete(w http.ResponseWriter, r *http.Request) {
	collection, id := r.PathValue("name"), r.PathValue("id")
	if collection == "" || id == "" {
		writeError(w, http.StatusBadRequest, "collection name and document id are required")
		return
	}

	doc, err := h.svc.Delete(r.Context(), collection, id)
	if err != nil {
		writeUpstreamError(w, r, "failed to delete document", err)
		return
	}
	writeJSON(w, http.StatusOK, doc)
}

func (h *DocumentHandler) BulkUpdate(w http.ResponseWriter, r *http.Request) {
	collection := r.PathValue("name")
	if collection == "" {
		writeError(w, http.StatusBadRequest, "collection name is required")
		return
	}

	filterBy := r.URL.Query().Get("filter_by")
	if filterBy == "" {
		writeError(w, http.StatusBadRequest, "filter_by query parameter is required")
		return
	}

	fields, ok := decodeDocumentBody(w, r)
	if !ok {
		return
	}

	result, err := h.svc.BulkUpdate(r.Context(), collection, filterBy, fields)
	if err != nil {
		writeUpstreamError(w, r, "failed to bulk update documents", err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *DocumentHandler) BulkDelete(w http.ResponseWriter, r *http.Request) {
	collection := r.PathValue("name")
	if collection == "" {
		writeError(w, http.StatusBadRequest, "collection name is required")
		return
	}

	filterBy := r.URL.Query().Get("filter_by")
	if filterBy == "" {
		writeError(w, http.StatusBadRequest, "filter_by query parameter is required")
		return
	}

	result, err := h.svc.BulkDelete(r.Context(), collection, filterBy)
	if err != nil {
		writeUpstreamError(w, r, "failed to bulk delete documents", err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *DocumentHandler) Import(w http.ResponseWriter, r *http.Request) {
	collection := r.PathValue("name")
	if collection == "" {
		writeError(w, http.StatusBadRequest, "collection name is required")
		return
	}

	var req model.ImportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body: "+err.Error())
		return
	}
	if len(req.Documents) == 0 {
		writeError(w, http.StatusBadRequest, "at least one document is required")
		return
	}

	summary, err := h.svc.Import(r.Context(), collection, &req)
	if err != nil {
		writeUpstreamError(w, r, "failed to import documents", err)
		return
	}
	writeJSON(w, http.StatusOK, summary)
}

func (h *DocumentHandler) Export(w http.ResponseWriter, r *http.Request) {
	collection := r.PathValue("name")
	if collection == "" {
		writeError(w, http.StatusBadRequest, "collection name is required")
		return
	}

	stream, err := h.svc.Export(r.Context(), collection)
	if err != nil {
		writeUpstreamError(w, r, "failed to export documents", err)
		return
	}
	defer stream.Close()

	w.Header().Set("Content-Type", "application/x-ndjson")
	w.Header().Set("Content-Disposition", "attachment; filename=\""+collection+".jsonl\"")
	w.WriteHeader(http.StatusOK)
	_, _ = io.Copy(w, stream)
}

func decodeDocumentBody(w http.ResponseWriter, r *http.Request) (map[string]interface{}, bool) {
	var doc map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&doc); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body: "+err.Error())
		return nil, false
	}
	return doc, true
}

func intQueryParam(q map[string][]string, key string) (int, error) {
	values, ok := q[key]
	if !ok || len(values) == 0 || values[0] == "" {
		return 0, nil
	}
	return strconv.Atoi(values[0])
}
