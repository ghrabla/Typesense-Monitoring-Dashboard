package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/service"
)

type OperationHandler struct {
	svc *service.OperationService
}

func NewOperationHandler(svc *service.OperationService) *OperationHandler {
	return &OperationHandler{svc: svc}
}

func (h *OperationHandler) Snapshot(w http.ResponseWriter, r *http.Request) {
	snapshotPath := r.URL.Query().Get("snapshot_path")
	if snapshotPath == "" {
		var body struct {
			SnapshotPath string `json:"snapshot_path"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		snapshotPath = body.SnapshotPath
	}
	if snapshotPath == "" {
		writeError(w, http.StatusBadRequest, "snapshot_path is required")
		return
	}

	result, err := h.svc.Snapshot(r.Context(), snapshotPath)
	if err != nil {
		writeUpstreamError(w, r, "failed to trigger snapshot", err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *OperationHandler) Vote(w http.ResponseWriter, r *http.Request) {
	result, err := h.svc.Vote(r.Context())
	if err != nil {
		writeUpstreamError(w, r, "failed to trigger vote", err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}
