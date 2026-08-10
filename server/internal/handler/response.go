package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/middleware"
)

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func writeServerError(w http.ResponseWriter, r *http.Request, status int, message string, err error) {
	slog.ErrorContext(r.Context(), message,
		"error", err,
		"request_id", middleware.RequestIDFromContext(r.Context()),
	)
	writeError(w, status, message+": "+err.Error())
}
