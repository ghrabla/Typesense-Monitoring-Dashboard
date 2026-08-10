package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/service"
)

type KeyHandler struct {
	svc *service.KeyService
}

func NewKeyHandler(svc *service.KeyService) *KeyHandler {
	return &KeyHandler{svc: svc}
}

func (h *KeyHandler) List(w http.ResponseWriter, r *http.Request) {
	keys, err := h.svc.List(r.Context())
	if err != nil {
		writeUpstreamError(w, r, "failed to retrieve keys", err)
		return
	}
	writeJSON(w, http.StatusOK, keys)
}

func (h *KeyHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, ok := parseInt64PathValue(w, r, "id")
	if !ok {
		return
	}

	key, err := h.svc.Get(r.Context(), id)
	if err != nil {
		writeUpstreamError(w, r, "failed to retrieve key", err)
		return
	}
	writeJSON(w, http.StatusOK, key)
}

func (h *KeyHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req model.CreateKeyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body: "+err.Error())
		return
	}
	if len(req.Actions) == 0 {
		writeError(w, http.StatusBadRequest, "at least one action is required")
		return
	}
	if len(req.Collections) == 0 {
		writeError(w, http.StatusBadRequest, "at least one collection is required")
		return
	}

	key, err := h.svc.Create(r.Context(), &req)
	if err != nil {
		writeUpstreamError(w, r, "failed to create key", err)
		return
	}
	writeJSON(w, http.StatusCreated, key)
}

func (h *KeyHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, ok := parseInt64PathValue(w, r, "id")
	if !ok {
		return
	}

	if err := h.svc.Delete(r.Context(), id); err != nil {
		writeUpstreamError(w, r, "failed to delete key", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "key deleted successfully"})
}

func parseInt64PathValue(w http.ResponseWriter, r *http.Request, name string) (int64, bool) {
	raw := r.PathValue(name)
	id, err := strconv.ParseInt(raw, 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, name+" must be a valid integer")
		return 0, false
	}
	return id, true
}
