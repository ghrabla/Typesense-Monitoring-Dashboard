package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/service"
)

type PresetHandler struct {
	svc *service.PresetService
}

func NewPresetHandler(svc *service.PresetService) *PresetHandler {
	return &PresetHandler{svc: svc}
}

func (h *PresetHandler) List(w http.ResponseWriter, r *http.Request) {
	presets, err := h.svc.List(r.Context())
	if err != nil {
		writeUpstreamError(w, r, "failed to retrieve presets", err)
		return
	}
	writeJSON(w, http.StatusOK, presets)
}

func (h *PresetHandler) Get(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if name == "" {
		writeError(w, http.StatusBadRequest, "preset name is required")
		return
	}

	preset, err := h.svc.Get(r.Context(), name)
	if err != nil {
		writeUpstreamError(w, r, "failed to retrieve preset", err)
		return
	}
	writeJSON(w, http.StatusOK, preset)
}

func (h *PresetHandler) Upsert(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if name == "" {
		writeError(w, http.StatusBadRequest, "preset name is required")
		return
	}

	var req model.UpsertPresetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body: "+err.Error())
		return
	}
	if req.Value == nil {
		writeError(w, http.StatusBadRequest, "value is required")
		return
	}

	preset, err := h.svc.Upsert(r.Context(), name, &req)
	if err != nil {
		writeUpstreamError(w, r, "failed to upsert preset", err)
		return
	}
	writeJSON(w, http.StatusOK, preset)
}

func (h *PresetHandler) Delete(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if name == "" {
		writeError(w, http.StatusBadRequest, "preset name is required")
		return
	}

	if err := h.svc.Delete(r.Context(), name); err != nil {
		writeUpstreamError(w, r, "failed to delete preset", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "preset deleted successfully"})
}
