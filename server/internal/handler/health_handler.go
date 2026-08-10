package handler

import (
	"log/slog"
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/middleware"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/service"
)

type HealthHandler struct {
	svc *service.HealthService
}

func NewHealthHandler(svc *service.HealthService) *HealthHandler {
	return &HealthHandler{svc: svc}
}

func (h *HealthHandler) Health(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.CheckHealth(r.Context())
	if err != nil {
		slog.WarnContext(r.Context(), "health check failed",
			"error", err,
			"request_id", middleware.RequestIDFromContext(r.Context()),
		)
		writeJSON(w, http.StatusServiceUnavailable, resp)
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *HealthHandler) Stats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.svc.GetStats(r.Context())
	if err != nil {
		writeServerError(w, r, http.StatusInternalServerError, "failed to retrieve stats", err)
		return
	}
	writeJSON(w, http.StatusOK, stats)
}

func (h *HealthHandler) Metrics(w http.ResponseWriter, r *http.Request) {
	metrics, err := h.svc.GetMetrics(r.Context())
	if err != nil {
		writeServerError(w, r, http.StatusInternalServerError, "failed to retrieve metrics", err)
		return
	}
	writeJSON(w, http.StatusOK, metrics)
}

func (h *HealthHandler) Debug(w http.ResponseWriter, r *http.Request) {
	debug, err := h.svc.GetDebug(r.Context())
	if err != nil {
		writeServerError(w, r, http.StatusInternalServerError, "failed to retrieve debug info", err)
		return
	}
	writeJSON(w, http.StatusOK, debug)
}
