package handler

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/middleware"
	ts "github.com/typesense/typesense-go/v2/typesense"
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

// writeUpstreamError maps errors returned by the Typesense client to an appropriate HTTP status and message.
func writeUpstreamError(w http.ResponseWriter, r *http.Request, fallbackMessage string, err error) {
	var httpErr *ts.HTTPError
	if errors.As(err, &httpErr) {
		status := httpErr.Status
		if status < 400 || status > 599 {
			status = http.StatusBadGateway
		}
		message := parseUpstreamMessage(httpErr.Body)
		slog.WarnContext(r.Context(), fallbackMessage,
			"error", err,
			"upstream_status", httpErr.Status,
			"request_id", middleware.RequestIDFromContext(r.Context()),
		)
		writeError(w, status, message)
		return
	}
	writeServerError(w, r, http.StatusInternalServerError, fallbackMessage, err)
}

func parseUpstreamMessage(body []byte) string {
	var payload struct {
		Message string `json:"message"`
	}
	if err := json.Unmarshal(body, &payload); err == nil && payload.Message != "" {
		return payload.Message
	}
	if len(body) > 0 {
		return string(body)
	}
	return "typesense request failed"
}
