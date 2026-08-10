package model

type Preset struct {
	Name  string      `json:"name"`
	Value interface{} `json:"value"`
}

type UpsertPresetRequest struct {
	Value interface{} `json:"value"`
}
