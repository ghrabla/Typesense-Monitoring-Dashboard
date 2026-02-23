package typesense

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/config"
	"github.com/typesense/typesense-go/v2/typesense"
)

type Client struct {
	*typesense.Client
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

func NewClient(cfg *config.Config) *Client {
	tsClient := typesense.NewClient(
		typesense.WithServer(cfg.TypesenseURL()),
		typesense.WithAPIKey(cfg.TypesenseAPIKey),
	)
	return &Client{
		Client:     tsClient,
		baseURL:    cfg.TypesenseURL(),
		apiKey:     cfg.TypesenseAPIKey,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (c *Client) GetStats(ctx context.Context) (map[string]interface{}, error) {
	return c.getRawJSON(ctx, "/stats.json")
}

func (c *Client) GetMetrics(ctx context.Context) (map[string]interface{}, error) {
	return c.getRawJSON(ctx, "/metrics.json")
}

func (c *Client) getRawJSON(ctx context.Context, path string) (map[string]interface{}, error) {
	url := c.baseURL + path
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("X-TYPESENSE-API-KEY", c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("typesense returned status %d: %s", resp.StatusCode, string(body))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decoding response: %w", err)
	}
	return result, nil
}
