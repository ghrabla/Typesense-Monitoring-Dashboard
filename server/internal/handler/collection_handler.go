package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/service"
)

type CollectionHandler struct {
	svc *service.CollectionService
}

func NewCollectionHandler(svc *service.CollectionService) *CollectionHandler {
	return &CollectionHandler{svc: svc}
}

func (h *CollectionHandler) ListCollections(w http.ResponseWriter, r *http.Request) {
	collections, err := h.svc.ListCollections(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to retrieve collections: "+err.Error())
		return
	}
	writeJSON(w, http.StatusOK, collections)
}

func (h *CollectionHandler) GetCollection(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if name == "" {
		writeError(w, http.StatusBadRequest, "collection name is required")
		return
	}

	collection, err := h.svc.GetCollection(r.Context(), name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to retrieve collection: "+err.Error())
		return
	}
	writeJSON(w, http.StatusOK, collection)
}

func (h *CollectionHandler) CreateCollection(w http.ResponseWriter, r *http.Request) {
	var req model.CreateCollectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body: "+err.Error())
		return
	}

	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "collection name is required")
		return
	}

	if len(req.Fields) == 0 {
		writeError(w, http.StatusBadRequest, "at least one field is required")
		return
	}

	collection, err := h.svc.CreateCollection(r.Context(), &req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create collection: "+err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, collection)
}

func (h *CollectionHandler) DeleteCollection(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if name == "" {
		writeError(w, http.StatusBadRequest, "collection name is required")
		return
	}

	if err := h.svc.DeleteCollection(r.Context(), name); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete collection: "+err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"message": "collection deleted successfully",
		"name":    name,
	})
}
