package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/service"
)

type OverrideHandler struct {
	svc *service.OverrideService
}

func NewOverrideHandler(svc *service.OverrideService) *OverrideHandler {
	return &OverrideHandler{svc: svc}
}

func (h *OverrideHandler) List(w http.ResponseWriter, r *http.Request) {
	collection := r.PathValue("name")
	if collection == "" {
		writeError(w, http.StatusBadRequest, "collection name is required")
		return
	}

	overrides, err := h.svc.List(r.Context(), collection)
	if err != nil {
		writeUpstreamError(w, r, "failed to retrieve overrides", err)
		return
	}
	writeJSON(w, http.StatusOK, overrides)
}

func (h *OverrideHandler) Get(w http.ResponseWriter, r *http.Request) {
	collection, id := r.PathValue("name"), r.PathValue("id")
	if collection == "" || id == "" {
		writeError(w, http.StatusBadRequest, "collection name and override id are required")
		return
	}

	override, err := h.svc.Get(r.Context(), collection, id)
	if err != nil {
		writeUpstreamError(w, r, "failed to retrieve override", err)
		return
	}
	writeJSON(w, http.StatusOK, override)
}

func (h *OverrideHandler) Upsert(w http.ResponseWriter, r *http.Request) {
	collection, id := r.PathValue("name"), r.PathValue("id")
	if collection == "" || id == "" {
		writeError(w, http.StatusBadRequest, "collection name and override id are required")
		return
	}

	var req model.UpsertOverrideRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body: "+err.Error())
		return
	}
	if req.Rule.Query == "" || req.Rule.Match == "" {
		writeError(w, http.StatusBadRequest, "rule.query and rule.match are required")
		return
	}

	override, err := h.svc.Upsert(r.Context(), collection, id, &req)
	if err != nil {
		writeUpstreamError(w, r, "failed to upsert override", err)
		return
	}
	writeJSON(w, http.StatusOK, override)
}

func (h *OverrideHandler) Delete(w http.ResponseWriter, r *http.Request) {
	collection, id := r.PathValue("name"), r.PathValue("id")
	if collection == "" || id == "" {
		writeError(w, http.StatusBadRequest, "collection name and override id are required")
		return
	}

	if err := h.svc.Delete(r.Context(), collection, id); err != nil {
		writeUpstreamError(w, r, "failed to delete override", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "override deleted successfully"})
}
