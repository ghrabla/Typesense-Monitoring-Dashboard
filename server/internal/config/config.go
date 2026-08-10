package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port              string
	TypesenseHost     string
	TypesensePort     string
	TypesenseProtocol string
	TypesenseAPIKey   string
	ClientOrigin      string
	LogLevel          string
	LogFormat         string
	ShutdownTimeout   time.Duration
	TypesenseTimeout  time.Duration
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:              getEnv("PORT", "8080"),
		TypesenseHost:     getEnv("TYPESENSE_HOST", "typesense"),
		TypesensePort:     getEnv("TYPESENSE_PORT", "8108"),
		TypesenseProtocol: getEnv("TYPESENSE_PROTOCOL", "http"),
		TypesenseAPIKey:   os.Getenv("TYPESENSE_API_KEY"),
		ClientOrigin:      getEnv("CLIENT_ORIGIN", "http://localhost:5173"),
		LogLevel:          getEnv("LOG_LEVEL", "info"),
		LogFormat:         getEnv("LOG_FORMAT", "json"),
		ShutdownTimeout:   getEnvDuration("SHUTDOWN_TIMEOUT_SECONDS", 10*time.Second),
		TypesenseTimeout:  getEnvDuration("TYPESENSE_TIMEOUT_SECONDS", 15*time.Second),
	}

	if cfg.TypesenseAPIKey == "" {
		return nil, fmt.Errorf("TYPESENSE_API_KEY environment variable is required")
	}

	if cfg.TypesenseProtocol != "http" && cfg.TypesenseProtocol != "https" {
		return nil, fmt.Errorf("TYPESENSE_PROTOCOL must be 'http' or 'https', got %q", cfg.TypesenseProtocol)
	}

	return cfg, nil
}

func (c *Config) TypesenseURL() string {
	return fmt.Sprintf("%s://%s:%s", c.TypesenseProtocol, c.TypesenseHost, c.TypesensePort)
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	value, ok := os.LookupEnv(key)
	if !ok {
		return fallback
	}
	seconds, err := strconv.Atoi(value)
	if err != nil || seconds <= 0 {
		return fallback
	}
	return time.Duration(seconds) * time.Second
}
