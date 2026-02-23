package handler

import (
	"net/http"

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
