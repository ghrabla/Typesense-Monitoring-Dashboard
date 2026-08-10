package model

type SnapshotRequest struct {
	SnapshotPath string `json:"snapshot_path"`
}

type OperationResult struct {
	Success bool `json:"success"`
}
