package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port           string
	TypesenseHost  string
	TypesensePort  string
	TypesenseAPIKey string
	ClientOrigin   string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:           getEnv("PORT", "8080"),
		TypesenseHost:  getEnv("TYPESENSE_HOST", "typesense"),
		TypesensePort:  getEnv("TYPESENSE_PORT", "8108"),
		TypesenseAPIKey: os.Getenv("TYPESENSE_API_KEY"),
		ClientOrigin:   getEnv("CLIENT_ORIGIN", "http://localhost:5173"),
	}

	if cfg.TypesenseAPIKey == "" {
		return nil, fmt.Errorf("TYPESENSE_API_KEY environment variable is required")
	}

	return cfg, nil
}

func (c *Config) TypesenseURL() string {
	return fmt.Sprintf("http://%s:%s", c.TypesenseHost, c.TypesensePort)
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
